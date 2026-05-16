/**
 * src/services/apiClient.js
 */
import { API_REGISTRY } from './apiRegistry';
import { ApiError } from './ApiError';
import { getFriendlyErrorMessage } from './errorMapper';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const executeAction = async (actionPath, payload = {}, token = null, options = {}) => {
  let backendActionString;

  // 1. Resolve the backend action string
  if (actionPath.includes('.')) {
    const [domain, actionName] = actionPath.split('.');
    backendActionString = API_REGISTRY[domain]?.[actionName];
  } else {
    // If no dot, assume it's already the resolved action string (e.g. from API_REGISTRY constants)
    backendActionString = actionPath;
  }

  if (!backendActionString) {
    throw new ApiError(`Developer Error: Unregistered API Action: ${actionPath}`);
  }

  const requestBody = {
    action: backendActionString,
    payload: payload 
  };

  if (token) requestBody.token = token;

  // --- Centralized Request Logger ---
  console.groupCollapsed(`🚀 API Request: [${actionPath}] -> ${backendActionString}`);
  console.log('Payload:', payload);
  console.log('Full Request Body:', requestBody);
  console.groupEnd();
  // ----------------------------------

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(requestBody),
      signal: options.signal
    });

    // 1. Check for hard network/server crashes (500s, 404s)
    if (!response.ok) {
      throw new ApiError("Network or server connection failed.", response.status);
    }

    // 2. Parse the JSON Envelope
    const data = await response.json();

    // --- Centralized Response Logger ---
    console.groupCollapsed(`✅ API Response: [${actionPath}]`);
    console.log('Status:', response.status);
    console.log('Data:', data);
    console.groupEnd();
    // ----------------------------------

    // 3. Catch logical backend errors (Assuming GAS returns { success: false, error: "..." })
    if (data.success === false || data.status === 'error') {
      const rawError = data.error || data.message;
      const friendlyMessage = getFriendlyErrorMessage(rawError, actionPath);
      
      throw new ApiError(friendlyMessage, response.status, rawError);
    }

    return data;

  } catch (error) {
    // If it's already our custom error, just pass it up
    if (error instanceof ApiError) throw error;
    
    // Otherwise, wrap standard JS/Network errors
    console.error(`Unexpected API Call Failure [${actionPath}]:`, error);
    throw new ApiError("Unable to reach the server. Please check your internet connection.", null, error.message);
  }
};

/**
 * Standardized API Client Export
 */
export const apiClient = {
  executeAction
};
