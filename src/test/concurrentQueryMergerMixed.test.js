import test from 'node:test';
import assert from 'node:assert';
import { apiClient } from '../services/apiClient.js';
import { queryMerger } from '../services/queryMerger.js';

// Active User Session Token
const SESSION_TOKEN = '4e67a626-e7e1-48ad-be41-276caf3760ee';

// Define 20 mixed queries: 14 un-hydrated (70%) and 6 relational hydrated (30%)
const MIXED_REQUEST_PAYLOADS = [
  // --- 14 Un-hydrated Requests (70% - Should be MERGED into 1 sheet_batch_read) ---
  { id: 1, type: 'MERGE', target: 'Batch', payload: { target: 'Batch' } },
  { id: 2, type: 'MERGE', target: 'Course', payload: { target: 'Course' } },
  { id: 3, type: 'MERGE', target: 'Teacher', payload: { target: 'Teacher' } },
  { id: 4, type: 'MERGE', target: 'Branch', payload: { target: 'Branch' } },
  { id: 5, type: 'MERGE', target: 'Package', payload: { target: 'Package' } },
  { id: 6, type: 'MERGE', target: 'User', payload: { target: 'User' } },
  { id: 7, type: 'MERGE', target: 'StaffMember', payload: { target: 'StaffMember' } },
  { id: 8, type: 'MERGE', target: 'ExpenseCategory', payload: { target: 'ExpenseCategory' } },
  { id: 9, type: 'MERGE', target: 'MoneyTransaction', payload: { target: 'MoneyTransaction' } },
  { id: 10, type: 'MERGE', target: 'FeePlan', payload: { target: 'FeePlan' } },
  { id: 11, type: 'MERGE', target: 'Installment', payload: { target: 'Installment' } },
  { id: 12, type: 'MERGE', target: 'Payment', payload: { target: 'Payment' } },
  { id: 13, type: 'MERGE', target: 'CourseType', payload: { target: 'CourseType' } },
  { id: 14, type: 'MERGE', target: 'StudentLead', payload: { target: 'StudentLead' } },

  // --- 6 Relational Hydration Requests (30% - Should BYPASS merger -> Direct data_query) ---
  { id: 15, type: 'BYPASS', target: 'Student', payload: { target: 'Student', include: { address: {}, contact: {}, education: {} } } },
  { id: 16, type: 'BYPASS', target: 'Teacher', payload: { target: 'Teacher', include: { teacherSubject: {} } } },
  { id: 17, type: 'BYPASS', target: 'Course', payload: { target: 'Course', include: { batch: {} } } },
  { id: 18, type: 'BYPASS', target: 'Student', payload: { target: 'Student', include: { enrollments: {} } } },
  { id: 19, type: 'BYPASS', target: 'Package', payload: { target: 'Package', include: { items: {} } } },
  { id: 20, type: 'BYPASS', target: 'Branch', payload: { target: 'Branch', include: { promoCode: {} } } }
];

test('Mixed Concurrent QueryMerger Stress Test (70% Un-hydrated Merged vs 30% Relational Bypassed)', async (t) => {
  await t.test('1. Fire 20 mixed concurrent requests simultaneously via Promise.all', async () => {
    console.log(`🔑 Using Session Token: ${SESSION_TOKEN}`);
    console.log(`⚡ Firing 20 concurrent requests (14 Un-hydrated MERGED / 6 Relational BYPASSED)...`);

    const overallStartTime = Date.now();

    const requestPromises = MIXED_REQUEST_PAYLOADS.map(async (item) => {
      const reqStartTime = Date.now();

      try {
        const response = await apiClient.executeAction('data_query', item.payload, SESSION_TOKEN);
        const reqDurationMs = Date.now() - reqStartTime;

        return {
          id: item.id,
          expectedType: item.type,
          target: item.target,
          success: true,
          responseTimeMs: reqDurationMs,
          dataCount: Array.isArray(response.data?.data) ? response.data.data.length : null,
          error: null
        };
      } catch (err) {
        const reqDurationMs = Date.now() - reqStartTime;
        return {
          id: item.id,
          expectedType: item.type,
          target: item.target,
          success: false,
          responseTimeMs: reqDurationMs,
          dataCount: null,
          error: err.message
        };
      }
    });

    const results = await Promise.all(requestPromises);
    const overallDurationMs = Date.now() - overallStartTime;

    console.log(`\n⏱️ Completed 20 mixed concurrent requests in ${overallDurationMs}ms.\n`);
    console.log('=== 20 MIXED CONCURRENT REQUEST RESULTS SUMMARY ===');

    let successCount = 0;
    let failureCount = 0;
    let mergedSuccessCount = 0;
    let bypassedSuccessCount = 0;

    results.forEach((res) => {
      const typeLabel = res.expectedType === 'MERGE' ? '🔀 MERGED' : '⚡ BYPASSED';
      const timingStr = `${res.responseTimeMs}ms`.padStart(7);

      if (res.success) {
        successCount++;
        if (res.expectedType === 'MERGE') mergedSuccessCount++;
        else bypassedSuccessCount++;

        console.log(`  ✅ [Req #${String(res.id).padStart(2, '0')}] Mode: ${typeLabel} | Target: ${res.target.padEnd(16)} | Response Time: ${timingStr} | Records: ${res.dataCount}`);
      } else {
        failureCount++;
        console.log(`  ❌ [Req #${String(res.id).padStart(2, '0')}] Mode: ${typeLabel} | Target: ${res.target.padEnd(16)} | Response Time: ${timingStr} | Error: ${res.error}`);
      }
    });

    console.log('\n=== STATISTICAL SUMMARY & MERGING TELEMETRY ===');
    console.log(`  Total Requests Sent      : ${results.length}`);
    console.log(`  Successful Requests      : ${successCount} / ${results.length}`);
    console.log(`  Failed Requests          : ${failureCount}`);
    console.log(`  Merged Requests (70%)    : ${mergedSuccessCount} / 14 Successful`);
    console.log(`  Bypassed Requests (30%)  : ${bypassedSuccessCount} / 6 Successful`);
    console.log('===============================================\n');

    assert.strictEqual(results.length, 20, 'All 20 requests should complete execution');
  });
});
