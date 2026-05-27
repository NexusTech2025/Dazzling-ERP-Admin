---
date: 2026-05-24T00:44:03+05:30
status: Approved
---

# Implementation Plan - Batch Schedule String to JSON Normalization

Normalize batch schedule data by converting the stringified `schedule` field returned by the backend into a JSON object before caching or parsing. This ensures downstream components and query list selectors can safely consume the schedule structure without crash/undefined issues.

## Proposed Changes

### Batch Feature Utilities

#### [MODIFY] [batchMappers.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchMappers.js)
- Add safe helper functions `parseBatchSchedule` and `parseBatchListSchedule` to decode stringified JSON `schedule` columns.
- Update `transformBatchRecord` to robustly handle stringified `schedule` fields (by parsing them inside the mapper) in case unparsed raw records flow into the `select` hook.

### Batch Feature Hooks

#### [MODIFY] [useBatchQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js)
- Import `parseBatchSchedule` and `parseBatchListSchedule` from mappers.
- Normalize backend query responses inside the `queryFn` for `useBatchesQuery` and `useBatchDetailQuery` before returning them to the React Query cache.

### Core ERP Initialization

#### [MODIFY] [useErpHydration.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useErpHydration.js)
- Import `parseBatchListSchedule` from the batch mapper.
- Normalize the hydrated `'Batch'` cache records when performing `queryClient.setQueryData` during application hydration.

## Verification Plan

### Automated / Manual Verification
- Check batch list view (`/admin/batches`) and detailed view (`/admin/batches/:id`) to verify schedules render correctly (e.g. Days and Timings) without crashing.
- Verify through React Query DevTools or console logs that the cached batch list items contain `schedule` as a parsed JSON object instead of a serialized JSON string.
- Verify that direct page loads on a batch detailed view correctly read from the parsed cache.
