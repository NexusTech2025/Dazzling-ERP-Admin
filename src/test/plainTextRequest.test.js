import test from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'https://script.google.com/macros/s/AKfycbzRTfHXmgWDuCQoW7AgBan74hzM-EXVXZ8FyQxHEaeudC6ldkwmNuYgiy9QFfX95oEdYg/exec';

test('Plain-Text CORS Preflight Bypass & Data Query Integration Test', async (t) => {
  let sessionToken = null;

  // Step 1: Login into the system using text/plain header and ?action=user_login URL query param
  await t.test('1. should execute user_login via text/plain request and return a valid session token', async () => {
    const actionName = 'user_login';
    const requestUrl = `${BASE_URL}?action=${encodeURIComponent(actionName)}`;

    const loginRequestBody = {
      action: actionName,
      payload: {
        username: 'admin_moni',
        password: 'manish123'
      }
    };

    console.log(`📡 Sending [${actionName}] via text/plain to: ${requestUrl}`);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(loginRequestBody),
      redirect: 'follow'
    });

    assert.strictEqual(response.ok, true, `HTTP Status should be 200 OK (received ${response.status})`);

    const json = await response.json();
    console.log('🔑 Login Response Envelope:', JSON.stringify(json, null, 2));

    assert.strictEqual(json.success, true, `Login request should return success: true. Error: ${json.error?.message || json.message}`);
    assert.ok(json.data, 'Login response should contain data object');

    sessionToken = json.data.token;
    assert.ok(sessionToken, 'Login response data must contain a valid session token');
    console.log(`✅ Authentication Successful! Obtained session token: ${sessionToken}`);
  });

  // Step 2: Execute data_query action using the token and text/plain headers
  await t.test('2. should execute data_query via text/plain request using session token and return batch data', async () => {
    assert.ok(sessionToken, 'Session token is required for data_query request');

    const actionName = 'data_query';
    const requestUrl = `${BASE_URL}?action=${encodeURIComponent(actionName)}`;

    const queryRequestBody = {
      action: actionName,
      token: sessionToken,
      payload: {
        target: 'Batch'
      }
    };

    console.log(`📡 Sending [${actionName}] via text/plain to: ${requestUrl}`);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(queryRequestBody),
      redirect: 'follow'
    });

    assert.strictEqual(response.ok, true, `HTTP Status should be 200 OK (received ${response.status})`);

    const json = await response.json();
    console.log('📊 Query Response Envelope:', JSON.stringify(json, null, 2));

    assert.strictEqual(json.success, true, `data_query request should return success: true. Error: ${json.error?.message || json.message}`);
    assert.ok(json.data, 'Query response should contain data payload');
    assert.ok(Array.isArray(json.data.data), 'Query response data.data must be an array of records');

    console.log(`✅ data_query executed successfully via text/plain request! Retrieved ${json.data.data.length} records.`);
  });
});
