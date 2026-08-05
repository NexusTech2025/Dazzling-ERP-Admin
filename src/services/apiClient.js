/**
 * @file src/services/apiClient.js
 * @module ApiClient
 * @description Production-grade single-flight sequential queue & HTTP fetch client for Google Apps Script Web Apps.
 * Features 15s request timeout guards, 3-attempt exponential backoff retries (2x300ms delay), JSON error envelope parsing, and pluggable query merger integration.
 */

import { API_REGISTRY } from './apiRegistry.js';
import { ApiError } from './ApiError.js';
import { getFriendlyErrorMessage } from './errorMapper.js';
import { queryMerger } from './queryMerger.js';

const isTestMode = (typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true')) ||
  typeof import.meta === 'undefined' ||
  !import.meta.env;

const BASE_URL = isTestMode
  ? 'https://script.google.com/macros/s/AKfycbzRTfHXmgWDuCQoW7AgBan74hzM-EXVXZ8FyQxHEaeudC6ldkwmNuYgiy9QFfX95oEdYg/exec'
  : (import.meta.env.DEV
    ? '/api/gs/exec'
    : `${import.meta.env.VITE_API_BASE_URL}/exec`);
// AKfycbzMIJEcOdSG7FxsF3qIYFNnNBu7pR6nDFuHrhWNMkHwW1xhxFoWpAf_zNjS3I-9vhSL
/**
 * Centralized Semantic Timeout Profiles
 */
export const TIMEOUT_PROFILES = {
  FAST: 15000,            // Auth checks, fast point lookups (15s)
  STANDARD: 30000,        // Standard single-table read queries (30s)
  SHEET_BATCH: 45000,     // Multi-file batch queries (sheet_batch_read) (45s)
  HYDRATED_QUERY: 70000,  // Deep relational joins with 3+ includes (70s)
  DATA_MUTATION: 90000    // All write operations (Create, Update, Delete, Record) (90s)
};

/**
 * Single-Flight Sequential Queue Manager
 * Guarantees max 1 active HTTP request to Google Apps Script at any time to prevent V8 cold-start locks.
 */
class SequentialRequestQueue {
  constructor(staggerMs = 400) {
    this.staggerMs = staggerMs;
    this.isProcessing = false;
    this.queue = [];
    this.totalExecuted = 0;
    this.totalAborted = 0;
  }

  async enqueue(fn, signal) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        this.totalAborted++;
        return reject(new DOMException('Request aborted', 'AbortError'));
      }

      const task = async () => {
        if (signal?.aborted) {
          this.totalAborted++;
          return reject(new DOMException('Request aborted', 'AbortError'));
        }
        try {
          const result = await fn();
          this.totalExecuted++;
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };

      if (signal) {
        const onAbort = () => {
          const idx = this.queue.indexOf(task);
          if (idx !== -1) {
            this.queue.splice(idx, 1);
            this.totalAborted++;
            console.log(`📥 [SequentialRequestQueue] Task purged from queue due to AbortSignal. (Remaining Depth: ${this.queue.length})`);
            reject(new DOMException('Request aborted', 'AbortError'));
          }
        };
        signal.addEventListener('abort', onAbort, { once: true });
      }

      this.queue.push(task);
      console.log(`📥 [SequentialRequestQueue] Task Enqueued. (Current Queue Depth: ${this.queue.length})`);
      this._processQueue();
    });
  }

  async _processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const task = this.queue.shift();
    console.log(`📤 [SequentialRequestQueue] Dequeued Task for execution. (Remaining Queue Depth: ${this.queue.length})`);

    try {
      await task();
    } finally {
      this.isProcessing = false;
      if (this.staggerMs > 0 && this.queue.length > 0) {
        console.log(`⏱️ [SequentialRequestQueue] Applying ${this.staggerMs}ms stagger cooldown before next task...`);
        setTimeout(() => this._processQueue(), this.staggerMs);
      } else {
        this._processQueue();
      }
    }
  }

  getStats() {
    return {
      queueDepth: this.queue.length,
      isProcessing: this.isProcessing,
      totalExecuted: this.totalExecuted,
      totalAborted: this.totalAborted
    };
  }
}

const apiQueue = new SequentialRequestQueue(400);

/**
 * Resolves dot-notation action path strings to backend action identifiers.
 * 
 * @param {string} actionPath - Action identifier or dot-notation path (e.g. 'STUDENT.REGISTER' or 'data_query')
 * @returns {string|null} Resolved backend action key.
 */
function resolveBackendAction(actionPath) {
  if (!actionPath) return null;
  if (actionPath.includes('.')) {
    const [domain, actionName] = actionPath.split('.');
    return API_REGISTRY[domain]?.[actionName] || null;
  }
  return actionPath;
}

/**
 * Checks whether an error is retriable (transient network drops, 15s timeouts, or server 500s).
 * @param {Error} error - Error object to analyze.
 * @returns {boolean} True if retriable.
 */
function isRetriableError(error) {
  if (!error) return false;
  // Caller-initiated aborts (e.g. React component unmount/tab switch) should NEVER be retried
  if (error.name === 'AbortError' && !error.message?.includes('timed out') && !error.message?.includes('timeout')) {
    return false;
  }
  if (error.message?.includes('timeout') || error.message?.includes('Network')) {
    return true;
  }
  if (error instanceof ApiError) {
    // Retry 500, 502, 503, 504 server errors, but do not retry 400 validation or 401 auth errors
    return error.statusCode >= 500 || error.statusCode === null;
  }
  return true;
}

/**
 * Decoupled Worker Function: Executes a single HTTP network attempt with 15s timeout guard and JSON envelope parsing.
 * 
 * @async
 * @function performSingleHttpFetch
 * @param {Object} params - Execution parameters.
 * @param {string} params.actionPath - Original action path string.
 * @param {string} params.backendActionString - Resolved action key string sent to backend.
 * @param {Object} [params.payload={}] - Request data payload object.
 * @param {string|null} [params.token=null] - User authorization token.
 * @param {Object} [params.options={}] - HTTP fetch configuration options.
 * @param {number} [params.timeoutMs=15000] - Hard request timeout window in milliseconds.
 * @returns {Promise<Object>} Backend JSON response envelope.
 * @throws {ApiError} Structured error object containing HTTP status, message, and backend diagnostics.
 */
async function performSingleHttpFetch({ actionPath, backendActionString, payload = {}, token = null, options = {}, timeoutMs = 15000 }) {

  const requestUrl = `${BASE_URL}`;

  const requestBody = {
    action: backendActionString,
    payload: payload
  };

  if (token) requestBody.token = token;
  if (options.actionOptions) requestBody.options = options.actionOptions;

  // 15-Second Per-Request Timeout Controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort(new DOMException(`Request timed out after ${timeoutMs}ms`, 'AbortError'));
  }, timeoutMs);

  // Combine caller signal with timeout controller signal
  const combinedSignal = options.signal
    ? (options.signal.addEventListener('abort', () => timeoutController.abort()), timeoutController.signal)
    : timeoutController.signal;

  console.groupCollapsed(`🚀 API Request: [${actionPath}] -> ${backendActionString}`);
  console.log('Payload:', payload);
  console.log('Full Request Body:', requestBody);
  console.groupEnd();

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(requestBody),
      redirect: 'follow',
      signal: combinedSignal
    });

    clearTimeout(timeoutId);

    // 1. Check for hard HTTP server failures (500, 503)
    if (!response.ok) {
      throw new ApiError(`Network or server connection failed (${response.status}).`, response.status);
    }

    // 2. Parse response JSON envelope
    const rawText = await response.text();
    let data;

    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error(`[apiClient] Invalid JSON response for [${actionPath}]:`, rawText.substring(0, 300));
      throw new ApiError("Server returned an invalid JSON response.", response.status, rawText);
    }

    console.groupCollapsed(`✅ API Response: [${actionPath}]`);
    console.log('Status:', response.status);
    console.log('Data:', data);
    console.groupEnd();

    // 3. Catch logical backend error envelopes ({ success: false, error: { ... } })
    if (data.success === false || data.status === 'error') {
      const rawError = data.error || data.message;
      const friendlyMessage = getFriendlyErrorMessage(rawError, actionPath);
      throw new ApiError(friendlyMessage, response.status, rawError);
    }

    return data;

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError' || error.name === 'CanceledError' || error.message === 'canceled') {
      throw error;
    }

    console.error(`Unexpected API Call Failure [${actionPath}]:`, error);
    throw new ApiError("Unable to reach the server. Please check your internet connection.", null, error.message);
  }
}

/**
 * Exponential Backoff Retry Engine.
 * Retries transient failures up to 3 times with 2x300ms delay scaling (300ms -> 600ms -> 1200ms).
 */
async function executeWithRetry(fetchFn, maxRetries = 3, initialDelayMs = 300) {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      return await fetchFn(attempt);
    } catch (err) {
      const retriable = isRetriableError(err);
      if (attempt >= maxRetries || !retriable) {
        throw err;
      }
      const backoffDelay = initialDelayMs * Math.pow(2, attempt - 1); // 300ms -> 600ms -> 1200ms
      console.warn(`⚠️ [apiClient] Request attempt ${attempt} failed (${err.message}). Retrying in ${backoffDelay}ms...`);
      await new Promise(r => setTimeout(r, backoffDelay));
    }
  }
}

/**
 * Standardized API Client Export.
 * Intercepts requests via Query Merger, enqueues execution via Sequential Queue, and wraps fetches in Retry Engine.
 * 
 * @async
 * @function executeAction
 * @param {string} actionPath - Target API action path.
 * @param {Object} [payload={}] - Request payload object.
 * @param {string|null} [token=null] - Authorization session token.
 * @param {Object} [options={}] - Request modifier options.
 * @returns {Promise<Object>} Standardized response envelope.
 */
export const executeAction = async (actionPath, payload = {}, token = null, options = {}) => {
  const backendActionString = resolveBackendAction(actionPath);

  if (!backendActionString) {
    throw new ApiError(`Developer Error: Unregistered API Action: ${actionPath}`);
  }

  // Resolve timeout via caller options: options.timeoutMs > TIMEOUT_PROFILES[options.timeout] > STANDARD (30s)
  const timeoutMs = options.timeoutMs || TIMEOUT_PROFILES[options.timeout] || TIMEOUT_PROFILES.STANDARD;

  // Enforce Single-Attempt NO-RETRY Policy for Mutations to protect data integrity
  const isMutation = options.timeout === 'DATA_MUTATION' || options.noRetry === true;
  const maxRetries = isMutation ? 1 : (options.maxRetries || 3);

  // Define execution handler
  const runAction = async () => {
    return apiQueue.enqueue(
      () => executeWithRetry(
        (attempt) => performSingleHttpFetch({
          actionPath,
          backendActionString,
          payload,
          token,
          options,
          timeoutMs
        }),
        maxRetries
      ),
      options.signal
    );
  };

  // Pass through queryMerger interceptor shell
  return queryMerger.intercept(actionPath, payload, token, runAction, executeAction);
};

export const apiClient = {
  executeAction,
  getQueueStats: () => apiQueue.getStats()
};
