import test from 'node:test';
import assert from 'node:assert';
import { apiClient } from '../services/apiClient.js';
import { API_REGISTRY } from '../services/apiRegistry.js';

// Active User Session Token
const SESSION_TOKEN = '4e67a626-e7e1-48ad-be41-276caf3760ee';

// Target 14-sheet payload across 6 domain spreadsheet files
const BATCH_PAYLOAD_14_SHEETS = [
  {
    spreadsheetId: 'Academic',
    sheets: ['Batch', 'Course', 'Package', 'CourseType']
  },
  {
    spreadsheetId: 'Staff',
    sheets: ['Teacher', 'StaffMember']
  },
  {
    spreadsheetId: 'Core',
    sheets: ['Branch']
  },
  {
    spreadsheetId: 'Auth',
    sheets: ['User']
  },
  {
    spreadsheetId: 'Finance',
    sheets: ['ExpenseCategory', 'MoneyTransaction', 'FeePlan', 'Installment', 'Payment']
  },
  {
    spreadsheetId: 'Students',
    sheets: ['StudentLead']
  }
];

test('14-Sheet Batch Read Latency & Variance Benchmark (5 Sequential Runs)', async (t) => {
  await t.test('1. Execute 14-sheet batch query 5 times and compute latency trend and variance', async () => {
    console.log(`🔑 Using Session Token: ${SESSION_TOKEN}`);
    console.log(`📡 Action: sheet_batch_read (14 sheets across 6 domain spreadsheets)`);
    console.log(`⏱️ Extended Timeout Window for Benchmark: 60,000ms (60 seconds)`);
    console.log(`⚡ Executing 5 sequential runs...\n`);

    const runResults = [];

    for (let runIdx = 1; runIdx <= 5; runIdx++) {
      console.log(`🚀 Launching Run #${runIdx} / 5...`);
      const startTime = Date.now();

      try {
        const response = await apiClient.executeAction(
          API_REGISTRY.ADMIN.SHEET_BATCH_READ,
          BATCH_PAYLOAD_14_SHEETS,
          SESSION_TOKEN,
          {
            timeoutMs: 60000, // 60s hard timeout window for benchmark
            actionOptions: {
              responseKey: 'NAME',
              driverType: 'ADVANCED'
            }
          }
        );

        const durationMs = Date.now() - startTime;
        const totalSheetsReturned = Object.values(response.data || {}).reduce((acc, domain) => {
          return acc + Object.keys(domain || {}).length;
        }, 0);

        console.log(`  ✅ [Run #${runIdx}] Completed in ${durationMs}ms | Sheets Returned: ${totalSheetsReturned} | HTTP Success: ${response.success}`);

        runResults.push({
          run: runIdx,
          success: true,
          durationMs,
          totalSheetsReturned,
          error: null
        });

      } catch (err) {
        const durationMs = Date.now() - startTime;
        console.error(`  ❌ [Run #${runIdx}] Failed after ${durationMs}ms: ${err.message}`);

        runResults.push({
          run: runIdx,
          success: false,
          durationMs,
          totalSheetsReturned: 0,
          error: err.message
        });
      }

      // 400ms cooldown stagger between benchmark runs
      if (runIdx < 5) {
        await new Promise(r => setTimeout(r, 400));
      }
    }

    console.log('\n=== BENCHMARK LATENCY SUMMARY & VARIANCE ANALYSIS ===');
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

      console.log('\n  Run-by-Run Latency Breakdown:');
      runResults.forEach(r => {
        const statusIcon = r.success ? '✅' : '❌';
        console.log(`    Run #${r.run}: ${statusIcon} ${r.durationMs}ms (${r.error || 'OK'})`);
      });

      console.log('\n  Suggested Timeout Recommendation:');
      const recommendedTimeout = Math.ceil((maxDuration * 1.3) / 1000) * 1000;
      console.log(`    💡 Recommended Production Timeout: ${recommendedTimeout}ms (${recommendedTimeout / 1000} seconds)`);

    } else {
      console.error('  ❌ All 5 runs failed to complete within the 60s benchmark window.');
    }
    console.log('=====================================================\n');

    assert.strictEqual(runResults.length, 5, 'All 5 benchmark runs should execute');
  });
});
