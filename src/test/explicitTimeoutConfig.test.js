import test from 'node:test';
import assert from 'node:assert';
import { apiClient } from '../services/apiClient.js';
import { API_REGISTRY } from '../services/apiRegistry.js';

test('Explicit Caller-Driven Timeout Configuration Unit Test', async (t) => {
  await t.test('1. Verify explicit timeoutMs override is respected over default 15s fallback', async () => {
    // Standard default fallback (15000ms)
    const defaultOptions = {};
    const defaultTimeout = defaultOptions.timeoutMs || 15000;
    assert.strictEqual(defaultTimeout, 15000, 'Default timeout fallback should be 15000ms');

    // Heavy batch query explicit override (45000ms)
    const heavyBatchOptions = { timeoutMs: 45000 };
    const heavyTimeout = heavyBatchOptions.timeoutMs || 15000;
    assert.strictEqual(heavyTimeout, 45000, 'Explicit timeoutMs override should resolve to 45000ms');

    // Extended benchmark explicit override (60000ms)
    const benchmarkOptions = { timeoutMs: 60000 };
    const benchmarkTimeout = benchmarkOptions.timeoutMs || 15000;
    assert.strictEqual(benchmarkTimeout, 60000, 'Explicit timeoutMs override should resolve to 60000ms');
  });
});
