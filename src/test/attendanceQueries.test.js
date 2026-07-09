import test from 'node:test';
import assert from 'node:assert';
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/react-query/queryKeys.js';

const BASE_URL = 'https://script.google.com/macros/s/AKfycbzKoVnCZ2U9N7mkPZePjYN9S0vGGT9jbLUG-3dkmP1-IoYkhKm4xfh41baGVW9ZI9V8/exec';

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
      staleTime: Infinity,
    }
  }
});

// Original resolver mapping logic from useAttendanceQueries.js line 39
const originalResolver = (responseData) => {
  return Array.isArray(responseData) ? responseData : (responseData?.data || []);
};
// Component destructuring contract verification
const verifyComponentContract = (data) => {
  if (!data) return { ok: false, reason: 'Data is falsy/unresolved' };
  
  if (!Array.isArray(data)) {
    return { ok: false, reason: 'Expected resolved data to be a flat array' };
  }
  
  return { ok: true };
};

// Mimic of useBatchAttendanceMatrixQuery using QueryClient.fetchQuery
const fetchAttendanceMatrixMimic = async (client, batchId, days = 15) => {
  return await client.fetchQuery({
    queryKey: queryKeys.attendance.matrix(batchId, days),
    queryFn: async () => {
      const requestBody = {
        action: "student_query_attendance",
        payload: {
          where: { batch_id: batchId }
        }
      };

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const body = await response.json();
      
      // Format print JSON response payload including nested objects
      console.log('📦 Raw Matrix Response Payload:', JSON.stringify(body, null, 2));

      // Mimic hook mapping logic
      return originalResolver(body);
    }
  });
};

test('Live Attendance Matrix Query Resolution Test via QueryClient', async (t) => {
  let firstBatchId = "BAT-0A4F4A04";
  let client = null;

  // Setup: Fetch live batches to find a valid batch_id using QueryClient
  await t.test('1. Setup: Retrieve a valid batch ID from init_erp database', async () => {
    client = createQueryClient();
    
    const requestBody = {
      action: "init_erp",
      payload: {
        targets: ["Batch"]
      }
    };

    console.log('🔗 Fetching live batches list from:', BASE_URL);
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(requestBody)
    });

    assert.ok(response.ok, `HTTP status should be ok: ${response.status}`);
    const body = await response.json();
    assert.strictEqual(body.success, true, 'API call success should be true');

    const batches = body.data?.batches?.data || [];
    assert.ok(batches.length > 0, 'Should find at least one batch in ERP');
    firstBatchId = batches[0].batch_id;
    console.log(`🎯 Targeted live Batch ID for testing: ${firstBatchId}`);
  });

  // Call the live matrix API mimic using QueryClient
  await t.test('2. Execute fetchQuery and check resolved data shape contract', async () => {
    assert.ok(firstBatchId, 'Requires a valid batch ID');
    assert.ok(client, 'QueryClient instance is required');

    console.log(`🚀 Executing QueryClient fetch query mimic for Batch ID: ${firstBatchId}`);
    
    // Fetch via queryClient fetchQuery mimic
    const resolvedData = await fetchAttendanceMatrixMimic(client, firstBatchId, 15);
    
    console.log('📋 Output resolved by fetchQuery:', JSON.stringify(resolvedData, null, 2));

    // Verify component contract
    const checkResult = verifyComponentContract(resolvedData);
    console.log('🔍 Component contract check results:', checkResult);

    // Assert that the original resolver matches the new component contract (passes)
    assert.strictEqual(
      checkResult.ok, 
      true, 
      'Original resolver should pass component contract validation'
    );
    assert.strictEqual(
      Array.isArray(resolvedData), 
      true, 
      'Resolved data must be an array'
    );
  });
});
