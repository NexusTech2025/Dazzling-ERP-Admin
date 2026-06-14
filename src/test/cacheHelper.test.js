import test from 'node:test';
import assert from 'node:assert';
import { QueryClient } from '@tanstack/react-query';
import { getCachedRecord, resolveRecord } from '../lib/react-query/cacheHelper.js';
import { queryKeys, EMPTY_FILTER } from '../lib/react-query/queryKeys.js';

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

test('Live Caching & Resolution Pipeline Tests using init_erp', async (t) => {
  let liveData = null;
  let client = null;

  // Setup: Fetch live data from Google Apps Script and inject it into React Query cache
  await t.test('0. Setup: Fetch live data via init_erp and populate QueryClient cache', async () => {
    client = createQueryClient();
    const requestBody = {
      action: "init_erp",
      payload: {
        targets: ["Course", "Teacher", "Student", "Batch", "Branch"]
      }
    };

    console.log('🔗 Fetching live ERP data from:', BASE_URL);
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(requestBody)
    });

    assert.ok(response.ok, `HTTP status should be ok: ${response.status}`);
    const body = await response.json();
    assert.strictEqual(body.success, true, 'API response success field should be true');

    liveData = body.data;
    assert.ok(liveData, 'Response should contain data payload');

    // Dynamically inject fetched datasets into the real React Query Client
    if (liveData.courses?.data) {
      console.log(`💧 Caching ${liveData.courses.data.length} Courses`);
      client.setQueryData(queryKeys.course.list(EMPTY_FILTER), liveData.courses.data);
    }
    if (liveData.teachers?.data) {
      console.log(`💧 Caching ${liveData.teachers.data.length} Teachers`);
      client.setQueryData(queryKeys.teacher.list(EMPTY_FILTER), liveData.teachers.data);
    }
    if (liveData.batches?.data) {
      console.log(`💧 Caching ${liveData.batches.data.length} Batches`);
      client.setQueryData(queryKeys.batch.list(EMPTY_FILTER), liveData.batches.data);
    }
    if (liveData.branchs?.data) {
      console.log(`💧 Caching ${liveData.branchs.data.length} Branches`);
      client.setQueryData(queryKeys.branch.list(EMPTY_FILTER), liveData.branchs.data);
    }
  });

  await t.test('1. should resolve a live Batch ID from the list cache fallback', () => {
    assert.ok(liveData.batches?.data?.length > 0, 'No live batches available in database');
    const firstBatch = liveData.batches.data[0];
    const targetId = firstBatch.batch_id;

    console.log(`🔍 Testing lookup of live Batch ID: ${targetId}`);
    const resolved = getCachedRecord(client, 'batch', targetId);
    assert.ok(resolved, 'Should find the batch in list cache');
    assert.strictEqual(resolved.batch_id, targetId);
    assert.strictEqual(resolved.batch_name, firstBatch.batch_name);
  });

  await t.test('2. should resolve a live Teacher ID from the list cache fallback', () => {
    assert.ok(liveData.teachers?.data?.length > 0, 'No live teachers available in database');
    const firstTeacher = liveData.teachers.data[0];
    const targetId = firstTeacher.teacher_id;

    console.log(`🔍 Testing lookup of live Teacher ID: ${targetId}`);
    const resolved = getCachedRecord(client, 'teacher', targetId);
    assert.ok(resolved, 'Should find the teacher in list cache');
    assert.strictEqual(resolved.teacher_id, targetId);
    assert.strictEqual(resolved.full_name, firstTeacher.full_name);
  });

  await t.test('3. should resolve a live Course ID from the list cache fallback', () => {
    assert.ok(liveData.courses?.data?.length > 0, 'No live courses available in database');
    const firstCourse = liveData.courses.data[0];
    const targetId = firstCourse.course_id;

    console.log(`🔍 Testing lookup of live Course ID: ${targetId}`);
    const resolved = getCachedRecord(client, 'course', targetId);
    assert.ok(resolved, 'Should find the course in list cache');
    assert.strictEqual(resolved.course_id, targetId);
    assert.strictEqual(resolved.name, firstCourse.name);
  });

  await t.test('4. resolveRecord should immediately resolve cached live Batch ID without fetching from network', async () => {
    const firstBatch = liveData.batches.data[0];
    const targetId = firstBatch.batch_id;

    let fetchCalled = false;
    const fetchFn = async () => {
      fetchCalled = true;
      return { batch_id: targetId, batch_name: 'Overridden Network Batch' };
    };

    let successCalled = false;
    const resolved = await resolveRecord(client, 'batch', targetId, fetchFn, {
      onSuccess: (data) => {
        successCalled = true;
        assert.strictEqual(data.batch_id, targetId);
      }
    });

    assert.strictEqual(resolved.batch_id, targetId);
    assert.strictEqual(resolved.batch_name, firstBatch.batch_name);
    assert.strictEqual(fetchCalled, false, 'Network fetch should not have been called');
    assert.strictEqual(successCalled, true);
  });

  await t.test('5. resolveRecord should trigger fetchFn on cache miss (non-existent ID) and update cache', async () => {
    const fakeId = 'BAT-NONEXISTENT';
    const networkBatch = { batch_id: fakeId, batch_name: 'Brand New Dynamic Batch' };

    let fetchCalled = false;
    const fetchFn = async () => {
      fetchCalled = true;
      return networkBatch;
    };

    let successCalled = false;
    const resolved = await resolveRecord(client, 'batch', fakeId, fetchFn, {
      onSuccess: (data) => {
        successCalled = true;
        assert.deepStrictEqual(data, networkBatch);
      }
    });

    assert.deepStrictEqual(resolved, networkBatch);
    assert.strictEqual(fetchCalled, true, 'Network fetch should be called on cache miss');
    assert.strictEqual(successCalled, true);

    // Verify detail cache was populated
    const cachedDetail = client.getQueryData(queryKeys.batch.detail(fakeId));
    assert.deepStrictEqual(cachedDetail, networkBatch);
  });

  await t.test('6. resolveRecord should trigger onFailure callback and propagate errors on network fail', async () => {
    const fakeId = 'CRS-FAILED-ID';
    const networkError = new Error('GAS Script Execution Timeout');

    const fetchFn = async () => {
      throw networkError;
    };

    let failureCalled = false;
    let caughtError = null;

    try {
      await resolveRecord(client, 'course', fakeId, fetchFn, {
        onFailure: (err) => {
          failureCalled = true;
          assert.match(err.message, /Failed resolving course/);
        }
      });
    } catch (err) {
      caughtError = err;
    }

    assert.ok(caughtError);
    assert.match(caughtError.message, /Failed resolving course/);
    assert.strictEqual(failureCalled, true);
  });

  await t.test('7. should deduplicate concurrent requests for the same missing record', async () => {
    const packageId = 'PKG-001';
    const networkPackage = { package_id: packageId, package_fee: 5000 };

    let fetchCount = 0;
    const fetchFn = async () => {
      fetchCount++;
      await new Promise(r => setTimeout(r, 50));
      return networkPackage;
    };

    const [p1, p2] = await Promise.all([
      resolveRecord(client, 'package', packageId, fetchFn),
      resolveRecord(client, 'package', packageId, fetchFn)
    ]);

    assert.deepStrictEqual(p1, networkPackage);
    assert.deepStrictEqual(p2, networkPackage);
    assert.strictEqual(fetchCount, 1);
  });
});
