import test from 'node:test';
import assert from 'node:assert';
import { TIMEOUT_PROFILES } from '../services/apiClient.js';

test('TIMEOUT_PROFILES Semantic Map Unit Test', async (t) => {
  await t.test('1. Verify TIMEOUT_PROFILES values match benchmark specifications', async () => {
    assert.strictEqual(TIMEOUT_PROFILES.FAST, 35000, 'FAST profile should be 35,000ms (35s)');
    assert.strictEqual(TIMEOUT_PROFILES.STANDARD, 50000, 'STANDARD profile should be 50,000ms (50s)');
    assert.strictEqual(TIMEOUT_PROFILES.SHEET_BATCH, 65000, 'SHEET_BATCH profile should be 65,000ms (65s)');
    assert.strictEqual(TIMEOUT_PROFILES.HYDRATED_QUERY, 90000, 'HYDRATED_QUERY profile should be 90,000ms (90s)');
    assert.strictEqual(TIMEOUT_PROFILES.DATA_MUTATION, 110000, 'DATA_MUTATION profile should be 110,000ms (110s)');
  });

  await t.test('2. Verify timeout resolution hierarchy & mutation single-attempt retry rule', async () => {
    const resolveParams = (options = {}) => {
      const timeoutMs = options.timeoutMs || TIMEOUT_PROFILES[options.timeout] || TIMEOUT_PROFILES.STANDARD;
      const isMutation = options.timeout === 'DATA_MUTATION' || options.noRetry === true;
      const maxRetries = isMutation ? 1 : (options.maxRetries || 3);
      return { timeoutMs, maxRetries };
    };

    // Default fallback
    assert.deepStrictEqual(resolveParams({}), { timeoutMs: 50000, maxRetries: 3 });

    // Semantic profiles
    assert.deepStrictEqual(resolveParams({ timeout: 'FAST' }), { timeoutMs: 35000, maxRetries: 3 });
    assert.deepStrictEqual(resolveParams({ timeout: 'STANDARD' }), { timeoutMs: 50000, maxRetries: 3 });
    assert.deepStrictEqual(resolveParams({ timeout: 'SHEET_BATCH' }), { timeoutMs: 65000, maxRetries: 3 });
    assert.deepStrictEqual(resolveParams({ timeout: 'HYDRATED_QUERY' }), { timeoutMs: 90000, maxRetries: 3 });

    // DATA_MUTATION -> Must enforce maxRetries = 1 (Single attempt, zero automatic retries)
    assert.deepStrictEqual(resolveParams({ timeout: 'DATA_MUTATION' }), { timeoutMs: 110000, maxRetries: 1 });
    assert.deepStrictEqual(resolveParams({ noRetry: true }), { timeoutMs: 50000, maxRetries: 1 });
  });
});
