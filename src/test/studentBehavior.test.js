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

// Helper to execute live requests directly
async function executeLiveAction(action, payload) {
  const requestBody = { action, payload };
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(requestBody)
  });
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(`API Error: ${data.message || JSON.stringify(data.error)}`);
  }
  return data;
}

test('Live Student Directory Caching & Lifecycle (Create/Delete) End-to-End Tests', async (t) => {
  const client = createQueryClient();
  let createdStudentId = null;
  
  const uniqueSuffix = Date.now().toString().slice(-6);
  const testStudentPayload = {
    profile: {
      student_name: 'Test Student Live ' + uniqueSuffix,
      email: 'teststudent_' + uniqueSuffix + '@example.com',
      gender: 'Male',
      dob: '2005-06-15',
      status: 'active'
    },
    address: {
      line1: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pin_code: '123456',
      country: 'India'
    },
    contact: {
      mobile_number: '9876543210',
      emergency_name: 'Emergency Parent',
      emergency_phone: '9876543211',
      emergency_relationship: 'Father'
    }
  };

  // Step 1: Create a live student record using the correct student_register endpoint
  await t.test('1. should successfully create a new student on the live backend database', async () => {
    console.log('📝 Creating test student on live backend:', testStudentPayload.profile.student_name);
    
    const result = await executeLiveAction('student_register', testStudentPayload);
    
    assert.strictEqual(result.success, true, 'Student registration should return success: true');
    assert.ok(result.data, 'Response should contain created student data');
    
    createdStudentId = result.data.student_id;
    assert.ok(createdStudentId, 'Should return a valid student_id');
    console.log(`✅ Live Student created successfully with ID: ${createdStudentId}`);
  });

  // Step 2: Fetch and Cache All Student Records (Simulate user opening directory)
  await t.test('2. should fetch all student records (including the newly created one with relations) via init_erp and populate the cache', async () => {
    console.log('🚀 Executing init_erp with student include target relations...');
    const result = await executeLiveAction('init_erp', {
      targets: [
        {
          target: "Student",
          include: {
            address: {},
            contact: {}
          }
        }
      ]
    });

    assert.strictEqual(result.success, true, 'init_erp should succeed');
    const studentsList = result.data?.students?.data || [];
    console.log(`💧 Retrieved and caching ${studentsList.length} student records`);

    // Inject into the React Query cache list key
    client.setQueryData(queryKeys.student.list(EMPTY_FILTER), studentsList);

    // Verify list query cache holds data
    const cachedList = client.getQueryData(queryKeys.student.list(EMPTY_FILTER));
    assert.ok(Array.isArray(cachedList), 'Cached list should be an array');
    
    // Verify our newly created student is in the cached list
    const foundInList = cachedList.find(s => s.student_id === createdStudentId);
    assert.ok(foundInList, `Newly created student ${createdStudentId} should be present in list cache`);
    assert.strictEqual(foundInList.student_name, testStudentPayload.profile.student_name);
    
    // Verify related fields are also hydrated and present on the cached item
    assert.ok(foundInList.address, 'Cached student should have nested address object');
    assert.strictEqual(foundInList.address.line1, testStudentPayload.address.line1);
    assert.ok(foundInList.contact, 'Cached student should have nested contact object');
    assert.strictEqual(foundInList.contact.emergency_name, testStudentPayload.contact.emergency_name);
    console.log('✅ Directory cache hydrated with relational data (address/contact).');
  });

  // Step 3: Simulate user clicking on student item (Cache-First Lookup)
  await t.test('3. should resolve detailed student record and related fields from cache fallback without firing network fetch', async () => {
    let fetchFnCalled = false;
    const fetchFn = async () => {
      fetchFnCalled = true;
      console.log('⚠️ Network fetch called when it should have hit cache!');
      return { student_id: createdStudentId, student_name: 'Stale Dummy' };
    };

    console.log(`🔍 Resolving student details and related fields for ID: ${createdStudentId}`);
    const resolved = await resolveRecord(client, 'student', createdStudentId, fetchFn);

    assert.ok(resolved, 'Should resolve student record');
    assert.strictEqual(resolved.student_id, createdStudentId, 'Resolved student ID should match');
    assert.strictEqual(resolved.student_name, testStudentPayload.profile.student_name, 'Resolved student name should match');
    
    // Verify related fields resolved from cache
    assert.ok(resolved.address, 'Resolved object should contain address relation');
    assert.strictEqual(resolved.address.line1, testStudentPayload.address.line1);
    assert.ok(resolved.contact, 'Resolved object should contain contact relation');
    assert.strictEqual(resolved.contact.emergency_name, testStudentPayload.contact.emergency_name);

    assert.strictEqual(fetchFnCalled, false, 'Network fetchFn must NOT be executed for cached item');
    console.log('✅ Resolved student and related fields successfully from list cache fallback!');
  });

  // Step 4: Simulate cache miss on non-existent student detail
  await t.test('4. should trigger network fetchFn when detail is requested for non-cached student ID', async () => {
    const nonExistentId = 'STU-99999999';
    let fetchFnCalled = false;
    const fetchFn = async () => {
      fetchFnCalled = true;
      return { student_id: nonExistentId, student_name: 'Fetched Dummy Student' };
    };

    console.log(`🔍 Resolving missing student ID: ${nonExistentId}`);
    const resolved = await resolveRecord(client, 'student', nonExistentId, fetchFn);

    assert.ok(resolved);
    assert.strictEqual(resolved.student_id, nonExistentId);
    assert.strictEqual(fetchFnCalled, true, 'Network fetchFn must be executed for cache miss');
    console.log('✅ Fallback network fetch resolved cache miss successfully');
  });

  // Step 5: Clean up and delete the created student record from live database
  await t.test('5. should successfully delete the created student record from the live database', async () => {
    console.log(`🗑️ Initiating delete request for student ID: ${createdStudentId}`);
    
    // Pass dryRun: false explicitly to ensure deletion on backend
    const result = await executeLiveAction('student_delete', { student_id: createdStudentId, dryRun: false });

    assert.strictEqual(result.success, true, 'Relational deletion should return success: true');
    console.log(`✅ Live Student ${createdStudentId} deleted successfully.`);
  });
});
