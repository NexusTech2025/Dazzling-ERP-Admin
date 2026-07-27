---
Date: 2026-07-27T14:43:00+05:30
Status: Completed
---

# Walkthrough - API Action Registry Alignment & Bulk Marks Endpoint Integration

We have updated [apiRegistry.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js) and [useBatchTestQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchTestQueries.js) to conform to the official DazzlingDB REST API specification.

---

## 1. Summary of Changes

### A. Registered `TEST` Domain in `apiRegistry.js`
Added the `TEST` action key block to `API_REGISTRY`:
```javascript
TEST: {
  CREATE: 'test_create',
  SAVE_MARKS_BULK: 'test_save_marks_bulk',
  QUERY_REPORT: 'test_query_report'
}
```

---

### B. Updated Test Mutations in `useBatchTestQueries.js`
1. **`useCreateTestMutation`**:
   - Switched action to `API_REGISTRY.TEST.CREATE` (`'test_create'`).
   - Transmits flat `testData` payload object.
2. **`useUpdateTestMutation`**:
   - Switched action to `API_REGISTRY.DATA.UPDATE` (`'data_update'`).
   - Transmits `{ table: 'Test', id, data: updates }` payload structure.
3. **`useDeleteTestMutation`**:
   - Switched action to `API_REGISTRY.DATA.DELETE` (`'data_delete'`).
   - Transmits `{ table: 'Test', id }` payload structure.
4. **`useSaveBulkMarksMutation`**:
   - Switched action to specialized endpoint `API_REGISTRY.TEST.SAVE_MARKS_BULK` (`'test_save_marks_bulk'`).
   - Transmits `{ test_id, records: [{ student_id, obtained_marks, is_absent, remarks }] }` payload format.

---

## 2. Verification Steps

1. **Create Test**:
   - Click **+ Create New Test** -> Fill form -> Submit.
   - Verify network call uses action `'test_create'`.
2. **Bulk Save Marks**:
   - Enter student marks -> Click **Save All Marks**.
   - Verify network call uses action `'test_save_marks_bulk'` with `{ test_id, records }`.
