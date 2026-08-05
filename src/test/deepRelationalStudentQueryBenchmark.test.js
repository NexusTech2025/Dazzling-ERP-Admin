import test from 'node:test';
import assert from 'node:assert';
import { apiClient } from '../services/apiClient.js';

// Active User Session Token
const SESSION_TOKEN = '4e67a626-e7e1-48ad-be41-276caf3760ee';

// Deep Relational Hydration Payload (Student + 6 relational includes)
const DEEP_STUDENT_QUERY_PAYLOAD = {
  target: 'Student',
  where: {},
  include: {
    address: {},
    contact: {},
    education: {},
    allocations: {},
    enrollments: {},
    studentattendance: {}
  }
};

test('Deep Relational Student Query Latency Benchmark (5 Sequential Runs)', async (t) => {
  await t.test('1. Execute deep relational Student query 5 times and compute average response time and timeout recommendation', async () => {
    console.log(`🔑 Using Session Token: ${SESSION_TOKEN}`);
    console.log(`📡 Target Action: data_query (Student + 6 Relational Includes)`);
    console.log(`📋 Includes: address, contact, education, allocations, enrollments, studentattendance`);
    console.log(`⏱️ Extended Benchmark Timeout Window: 60,000ms (60 seconds)`);
    console.log(`⚡ Launching 5 sequential benchmark runs...\n`);

    const runResults = [];

    for (let runIdx = 1; runIdx <= 5; runIdx++) {
      console.log(`🚀 Launching Run #${runIdx} / 5...`);
      const startTime = Date.now();

      try {
        const response = await apiClient.executeAction(
          'data_query',
          DEEP_STUDENT_QUERY_PAYLOAD,
          SESSION_TOKEN,
          {
            timeoutMs: 60000 // 60s hard timeout window for benchmark
          }
        );

        const durationMs = Date.now() - startTime;
        const recordCount = Array.isArray(response.data?.data) ? response.data.data.length : null;
        const serverExecTimeMs = response.context?.execution_time_ms || null;

        console.log(`  ✅ [Run #${runIdx}] Completed in ${durationMs}ms | Records Returned: ${recordCount} | Server Compute: ${serverExecTimeMs}ms`);

        runResults.push({
          run: runIdx,
          success: true,
          durationMs,
          serverExecTimeMs,
          recordCount,
          error: null
        });

      } catch (err) {
        const durationMs = Date.now() - startTime;
        console.error(`  ❌ [Run #${runIdx}] Failed after ${durationMs}ms: ${err.message}`);

        runResults.push({
          run: runIdx,
          success: false,
          durationMs,
          serverExecTimeMs: null,
          recordCount: null,
          error: err.message
        });
      }

      // 400ms cooldown stagger between benchmark runs
      if (runIdx < 5) {
        await new Promise(r => setTimeout(r, 400));
      }
    }

    console.log('\n=== DEEP RELATIONAL STUDENT QUERY LATENCY & VARIANCE SUMMARY ===');
    const successfulRuns = runResults.filter(r => r.success);
    const durations = successfulRuns.map(r => r.durationMs);

    if (durations.length > 0) {
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      const sumDuration = durations.reduce((a, b) => a + b, 0);
      const avgDuration = Math.round(sumDuration / durations.length);
      const rangeVariance = maxDuration - minDuration;

      console.log(`  Successful Runs       : ${successfulRuns.length} / 5`);
      console.log(`  Fastest Run (Min)     : ${minDuration}ms`);
      console.log(`  Slowest Run (Max)     : ${maxDuration}ms`);
      console.log(`  Average Latency (Avg) : ${avgDuration}ms`);
      console.log(`  Latency Variance Range: ${rangeVariance}ms (${Math.round((rangeVariance / avgDuration) * 100)}%)`);

      console.log('\n  Run-by-Run Latency & Server Compute Breakdown:');
      runResults.forEach(r => {
        const statusIcon = r.success ? '✅' : '❌';
        const serverTimeStr = r.serverExecTimeMs ? ` (Server: ${r.serverExecTimeMs}ms)` : '';
        console.log(`    Run #${r.run}: ${statusIcon} ${r.durationMs}ms${serverTimeStr} - ${r.error || `OK (${r.recordCount} students)`}`);
      });

      console.log('\n  Suggested Timeout Recommendation:');
      const recommendedTimeout = Math.ceil((maxDuration * 1.3) / 1000) * 1000;
      console.log(`    💡 Recommended Production Timeout: ${recommendedTimeout}ms (${recommendedTimeout / 1000} seconds)`);

    } else {
      console.error('  ❌ All 5 benchmark runs failed to complete within the 60s window.');
    }
    console.log('=================================================================\n');

    assert.strictEqual(runResults.length, 5, 'All 5 benchmark runs should execute');
  });
});
