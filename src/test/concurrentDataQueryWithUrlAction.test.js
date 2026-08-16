import test from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'https://script.google.com/macros/s/AKfycbzRTfHXmgWDuCQoW7AgBan74hzM-EXVXZ8FyQxHEaeudC6ldkwmNuYgiy9QFfX95oEdYg/exec';

// Active User Token provided for tests
const SESSION_TOKEN = '4e67a626-e7e1-48ad-be41-276caf3760ee';

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

test('Extreme Concurrency Stress Test WITH URL Action Parameters (30 Parallel Requests via Promise.all)', async (t) => {
  await t.test('1. Fire 30 concurrent data_query requests simultaneously WITH ?action= in URL and capture outputs', async () => {
    console.log(`🔑 Using Session Token: ${SESSION_TOKEN}`);
    console.log(`📡 Base Target URL WITH ?action= param: ${BASE_URL}?action=data_query`);
    console.log(`⚡ Firing 30 concurrent requests simultaneously via Promise.all...`);

    const startTime = Date.now();

    const requestPromises = TARGET_TABLES_30.map(async (item, index) => {
      const actionName = 'data_query';
      // URL WITH action query parameter
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
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(requestBody),
          redirect: 'follow'
        });

        const rawText = await response.text();
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
            dataCount: null,
            error: isJson ? (parsedJson.error || parsedJson.message) : 'HTML/Non-JSON Response',
            rawText: rawText
          };
        }
      } catch (err) {
        return {
          index: index + 1,
          batchSet: item.batchSet,
          table: item.table,
          httpStatus: null,
          success: false,
          dataCount: null,
          error: err.message,
          rawText: err.stack || err.message
        };
      }
    });

    const results = await Promise.all(requestPromises);
    const duration = Date.now() - startTime;

    console.log(`\n⏱️ Executed 30 concurrent requests in ${duration}ms.\n`);
    console.log('=== 30 CONCURRENT REQUEST RESULTS SUMMARY (WITH URL ACTION PARAM) ===');

    let successCount = 0;
    let failureCount = 0;
    let missingActionErrorCount = 0;
    let htmlErrorCount = 0;

    const failedResults = [];

    results.forEach((res) => {
      if (res.success) {
        successCount++;
        console.log(`  ✅ [Req #${String(res.index).padStart(2, '0')}] Set ${res.batchSet} | Table: ${res.table.padEnd(18)} | HTTP ${res.httpStatus} | Records: ${res.dataCount}`);
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

        console.log(`  ❌ [Req #${String(res.index).padStart(2, '0')}] Set ${res.batchSet} | Table: ${res.table.padEnd(18)} | HTTP ${res.httpStatus || 'FAIL'} | Error: ${errorStr}`);
      }
    });

    console.log('\n=== STATISTICAL SUMMARY ===');
    console.log(`  Total Requests Sent      : ${results.length}`);
    console.log(`  Successful Requests      : ${successCount}`);
    console.log(`  Failed Requests          : ${failureCount}`);
    console.log(`  'No action' Param Errors : ${missingActionErrorCount}`);
    console.log(`  HTML/Gateway Page Errors : ${htmlErrorCount}`);
    console.log('===========================\n');

    if (failedResults.length > 0) {
      console.log('\n======================================================');
      console.log(`🚨 DETAILED CAPTURED ERROR RESPONSES (${failedResults.length} FAILS)`);
      console.log('======================================================\n');

      failedResults.forEach((f, idx) => {
        console.log(`------------------------------------------------------`);
        console.log(`❌ FAILURE #${idx + 1} -> Request #${f.index} (Set ${f.batchSet}, Table: ${f.table})`);
        console.log(`HTTP Status: ${f.httpStatus}`);
        console.log(`Error Summary: ${typeof f.error === 'object' ? JSON.stringify(f.error, null, 2) : f.error}`);
        console.log(`RAW RESPONSE BODY (First 1500 chars):`);
        console.log(f.rawText ? f.rawText.substring(0, 1500) : 'NO BODY RECEIVED');
        console.log(`------------------------------------------------------\n`);
      });
    } else {
      console.log('🎉 All 30 concurrent requests completed with 100% success!');
    }

    assert.strictEqual(results.length, 30, 'All 30 requests should complete execution');
  });
});
