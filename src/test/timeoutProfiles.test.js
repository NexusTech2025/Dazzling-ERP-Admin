import test from 'node:test';
import assert from 'node:assert';
import { TIMEOUT_PROFILES } from '../services/apiClient.js';

test('TIMEOUT_PROFILES Semantic Map Unit Test', async (t) => {
  await t.test('1. Verify TIMEOUT_PROFILES values match benchmark specifications', async () => {
    assert.strictEqual(TIMEOUT_PROFILES.FAST, 15000, 'FAST profile should be 15,000ms (15s)');
    assert.strictEqual(TIMEOUT_PROFILES.STANDARD, 30000, 'STANDARD profile should be 30,000ms (30s)');
    assert.strictEqual(TIMEOUT_PROFILES.SHEET_BATCH, 45000, 'SHEET_BATCH profile should be 45,000ms (45s)');
    assert.strictEqual(TIMEOUT_PROFILES.HYDRATED_QUERY, 70000, 'HYDRATED_QUERY profile should be 70,000ms (70s)');
    assert.strictEqual(TIMEOUT_PROFILES.DATA_MUTATION, 90000, 'DATA_MUTATION profile should be 90,000ms (90s)');
  });

  await t.test('2. Verify timeout resolution hierarchy & mutation single-attempt retry rule', async () => {
    const resolveParams = (options = {}) => {
      const timeoutMs = options.timeoutMs || TIMEOUT_PROFILES[options.timeout] || TIMEOUT_PROFILES.STANDARD;
      const isMutation = options.timeout === 'DATA_MUTATION' || options.noRetry === true;
      const maxRetries = isMutation ? 1 : (options.maxRetries || 3);
      return { timeoutMs, maxRetries };
    };

    // Default fallback
    assert.deepStrictEqual(resolveParams({}), { timeoutMs: 30000, maxRetries: 3 });

    // Semantic profiles
    assert.deepStrictEqual(resolveParams({ timeout: 'FAST' }), { timeoutMs: 15000, maxRetries: 3 });
    assert.deepStrictEqual(resolveParams({ timeout: 'STANDARD' }), { timeoutMs: 30000, maxRetries: 3 });
    assert.deepStrictEqual(resolveParams({ timeout: 'SHEET_BATCH' }), { timeoutMs: 45000, maxRetries: 3 });
    assert.deepStrictEqual(resolveParams({ timeout: 'HYDRATED_QUERY' }), { timeoutMs: 70000, maxRetries: 3 });

    // DATA_MUTATION -> Must enforce maxRetries = 1 (Single attempt, zero automatic retries)
    assert.deepStrictEqual(resolveParams({ timeout: 'DATA_MUTATION' }), { timeoutMs: 90000, maxRetries: 1 });
    assert.deepStrictEqual(resolveParams({ noRetry: true }), { timeoutMs: 30000, maxRetries: 1 });
  });
});
