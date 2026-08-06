import test from 'node:test';
import assert from 'node:assert';
import { queryMerger, buildBatchPayloadFromTargets, getCategoryForTable, CATEGORY_TO_TABLES_MAP } from '../services/queryMerger.js';

test('QueryMerger Strategy Unit & Integration Test', async (t) => {

  await t.test('1. Verify CATEGORY_TO_TABLES_MAP and getCategoryForTable exception handling', async () => {
    // Check registered category counts
    const totalCategories = Object.keys(CATEGORY_TO_TABLES_MAP).length;
    assert.strictEqual(totalCategories, 8, 'Should have 8 domain categories');

    let totalTables = 0;
    Object.values(CATEGORY_TO_TABLES_MAP).forEach(tables => {
      totalTables += tables.length;
    });
    assert.strictEqual(totalTables, 35, 'Should map exactly 35 database table schemas');

    // Test valid category resolution
    assert.strictEqual(getCategoryForTable('Course'), 'Academic');
    assert.strictEqual(getCategoryForTable('Student'), 'Students');
    assert.strictEqual(getCategoryForTable('Teacher'), 'Staff');
    assert.strictEqual(getCategoryForTable('Branch'), 'Core');
    assert.strictEqual(getCategoryForTable('MoneyTransaction'), 'Finance');

    // Test explicit developer error on unregistered tables
    assert.throws(
      () => getCategoryForTable('NonExistentFakeTable'),
      /Developer Error: Unregistered schema table 'NonExistentFakeTable'/
    );
  });

  await t.test('2. Verify buildBatchPayloadFromTargets groups tables correctly', async () => {
    const targetTables = ['Course', 'Batch', 'Student', 'Teacher', 'Branch'];
    const payload = buildBatchPayloadFromTargets(targetTables);

    assert.strictEqual(payload.length, 4, 'Should group into 4 domain categories');

    const academicGroup = payload.find(p => p.spreadsheetId === 'Academic');
    assert.deepStrictEqual(academicGroup.sheets, ['Course', 'Batch']);

    const studentGroup = payload.find(p => p.spreadsheetId === 'Students');
    assert.deepStrictEqual(studentGroup.sheets, ['Student']);

    const staffGroup = payload.find(p => p.spreadsheetId === 'Staff');
    assert.deepStrictEqual(staffGroup.sheets, ['Teacher']);

    const coreGroup = payload.find(p => p.spreadsheetId === 'Core');
    assert.deepStrictEqual(coreGroup.sheets, ['Branch']);
  });

  await t.test('3. Verify DATA_QUERY_TO_BATCH_MERGER Matcher logic', async () => {
    const strategyName = 'DATA_QUERY_TO_BATCH_MERGER';

    // Eligible: Empty include
    assert.strictEqual(
      queryMerger.findMatchingStrategy('data_query', { target: 'Course' }),
      strategyName,
      'data_query without include should match'
    );

    assert.strictEqual(
      queryMerger.findMatchingStrategy('data_query', { target: 'Course', include: {} }),
      strategyName,
      'data_query with empty include object should match'
    );

    // Ineligible: Non-empty include parameter (requires relational joins)
    assert.strictEqual(
      queryMerger.findMatchingStrategy('data_query', { target: 'Student', include: { address: {} } }),
      null,
      'data_query with non-empty include MUST NOT match strategy'
    );

    // Ineligible: Non-data_query action
    assert.strictEqual(
      queryMerger.findMatchingStrategy('user_login', { username: 'admin' }),
      null,
      'user_login action MUST NOT match'
    );
  });
});
