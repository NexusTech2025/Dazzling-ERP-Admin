import test from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'https://script.google.com/macros/s/AKfycbzRTfHXmgWDuCQoW7AgBan74hzM-EXVXZ8FyQxHEaeudC6ldkwmNuYgiy9QFfX95oEdYg/exec';

// Active User Token provided for tests
const SESSION_TOKEN = '4e67a626-e7e1-48ad-be41-276caf3760ee';

/**
 * Single-Flight Sequential Queue Manager
 * Guarantees max 1 active HTTP request to Google Apps Script at any time.
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

// Global Singleton Queue Instance (400ms stagger)
const apiQueue = new SequentialRequestQueue(400);

// 10 distinct target tables
const BASE_TABLES = [
  'Batch',
  'Course',
  'Student',
  'Teacher',
  'Branch',
  'Package',
  'User',
  'StaffMember',
  'ExpenseCategory',
  'MoneyTransaction'
];

// Create 30 target items (3 sets of 10 tables)
const TARGET_TABLES_30 = [
  ...BASE_TABLES.map(t => ({ table: t, batchSet: 1 })),
  ...BASE_TABLES.map(t => ({ table: t, batchSet: 2 })),
  ...BASE_TABLES.map(t => ({ table: t, batchSet: 3 }))
];

test('Extreme Concurrency Stress Test WITH application/json Content-Type & Response Timing (30 Requests)', async (t) => {
  await t.test('1. Fire 30 concurrent data_query requests with application/json header through SequentialRequestQueue', async () => {
    console.log(`🔑 Using Session Token: ${SESSION_TOKEN}`);
    console.log(`📡 Base Target URL (WITH ?action= Dual Injection): ${BASE_URL}?action=data_query`);
    console.log(`📋 Headers: Content-Type: application/json`);
    console.log(`⏱️ Configured Queue Cooldown Stagger: 400ms`);
    console.log(`⚡ Firing 30 concurrent requests simultaneously via Promise.all through SequentialRequestQueue...`);

    const overallStartTime = Date.now();

    const requestPromises = TARGET_TABLES_30.map(async (item, index) => {
      // Enqueue each request through SequentialRequestQueue
      return apiQueue.enqueue(async () => {
        const reqStartTime = Date.now();
        const actionName = 'data_query';
        // Dual Action Injection: URL query param + body payload
        const requestUrl = `${BASE_URL}?action=${encodeURIComponent(actionName)}`;

        const requestBody = {
          action: actionName,
          token: SESSION_TOKEN,
          payload: {
            target: item.table
          }
        };

        try {
          const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            redirect: 'follow'
          });

          const rawText = await response.text();
          const reqDurationMs = Date.now() - reqStartTime;
          let parsedJson = null;
          let isJson = false;

          try {
            parsedJson = JSON.parse(rawText);
            isJson = true;
          } catch (e) {
            isJson = false;
          }

          if (isJson && parsedJson.success) {
            return {
              index: index + 1,
              batchSet: item.batchSet,
              table: item.table,
              httpStatus: response.status,
              success: true,
              responseTimeMs: reqDurationMs,
              dataCount: parsedJson.data?.data?.length ?? null,
              error: null,
              rawText: null
            };
          } else {
            return {
              index: index + 1,
              batchSet: item.batchSet,
              table: item.table,
              httpStatus: response.status,
              success: false,
              responseTimeMs: reqDurationMs,
              dataCount: null,
              error: isJson ? (parsedJson.error || parsedJson.message) : 'HTML/Non-JSON Response',
              rawText: rawText
            };
          }
        } catch (err) {
          const reqDurationMs = Date.now() - reqStartTime;
          return {
            index: index + 1,
            batchSet: item.batchSet,
            table: item.table,
            httpStatus: null,
            success: false,
            responseTimeMs: reqDurationMs,
            dataCount: null,
            error: err.message,
            rawText: err.stack || err.message
          };
        }
      });
    });

    const results = await Promise.all(requestPromises);
    const overallDuration = Date.now() - overallStartTime;

    console.log(`\n⏱️ Executed 30 queued requests sequentially in ${overallDuration}ms.\n`);
    console.log('=== 30 QUEUED REQUEST RESULTS & INDIVIDUAL RESPONSE TIMINGS (application/json) ===');

    let successCount = 0;
    let failureCount = 0;
    let missingActionErrorCount = 0;
    let htmlErrorCount = 0;
    let totalResponseTimeMs = 0;

    const failedResults = [];

    results.forEach((res) => {
      totalResponseTimeMs += res.responseTimeMs;
      const timingStr = `${res.responseTimeMs}ms`.padStart(7);

      if (res.success) {
        successCount++;
        console.log(`  ✅ [Req #${String(res.index).padStart(2, '0')}] Set ${res.batchSet} | Table: ${res.table.padEnd(18)} | HTTP ${res.httpStatus} | Records: ${String(res.dataCount).padStart(3)} | Response Time: ${timingStr}`);
      } else {
        failureCount++;
        failedResults.push(res);
        const errorStr = typeof res.error === 'object' ? JSON.stringify(res.error) : String(res.error);

        if (errorStr.includes("No 'action' parameter") || (res.rawText && res.rawText.includes("No 'action' parameter"))) {
          missingActionErrorCount++;
        }
        if (res.rawText && (res.rawText.includes('<!DOCTYPE') || res.rawText.includes('<html'))) {
          htmlErrorCount++;
        }

        console.log(`  ❌ [Req #${String(res.index).padStart(2, '0')}] Set ${res.batchSet} | Table: ${res.table.padEnd(18)} | HTTP ${res.httpStatus || 'FAIL'} | Response Time: ${timingStr} | Error: ${errorStr}`);
      }
    });

    const avgResponseTimeMs = Math.round(totalResponseTimeMs / results.length);

    console.log('\n=== STATISTICAL SUMMARY & TIMING METRICS ===');
    console.log(`  Total Requests Sent      : ${results.length}`);
    console.log(`  Successful Requests      : ${successCount}`);
    console.log(`  Failed Requests          : ${failureCount}`);
    console.log(`  Average Response Time    : ${avgResponseTimeMs}ms`);
    console.log(`  'No action' Param Errors : ${missingActionErrorCount}`);
    console.log(`  HTML/Gateway Page Errors : ${htmlErrorCount}`);
    console.log(`  Queue Total Executed     : ${apiQueue.getStats().totalExecuted}`);
    console.log('===========================================\n');

    if (failedResults.length > 0) {
      console.log('\n======================================================');
      console.log(`🚨 DETAILED CAPTURED ERROR RESPONSES (${failedResults.length} FAILS)`);
      console.log('======================================================\n');

      failedResults.forEach((f, idx) => {
        console.log(`------------------------------------------------------`);
        console.log(`❌ FAILURE #${idx + 1} -> Request #${f.index} (Set ${f.batchSet}, Table: ${f.table})`);
        console.log(`HTTP Status: ${f.httpStatus}`);
        console.log(`Response Duration: ${f.responseTimeMs}ms`);
        console.log(`Error Summary: ${typeof f.error === 'object' ? JSON.stringify(f.error, null, 2) : f.error}`);
        console.log(`RAW RESPONSE BODY (First 1500 chars):`);
        console.log(f.rawText ? f.rawText.substring(0, 1500) : 'NO BODY RECEIVED');
        console.log(`------------------------------------------------------\n`);
      });
    } else {
      console.log('🎉 All 30 queued requests completed with 100% SUCCESS!');
    }

    assert.strictEqual(results.length, 30, 'All 30 requests should complete execution');
  });
});
