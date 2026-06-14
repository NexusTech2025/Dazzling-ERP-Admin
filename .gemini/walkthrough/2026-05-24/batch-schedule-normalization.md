---
date: 2026-05-24T00:50:00+05:30
status: Verified
---

# Walkthrough - Batch Schedule Normalization

Implemented schedule string to JSON object normalization during caching and querying of Batch records to satisfy requirements, using a SOLID Single Responsibility Principle (SRP) approach.

## Changes Made

### Utilities
#### [MODIFY] [batchMappers.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchMappers.js)
- Defined `parseSchedule` helper whose sole responsibility is decoding stringified JSON data of a schedule string/object.
- Defined `normalizeBatchScheduleField` and `normalizeBatchListScheduleField` whose sole responsibility is mapping/updating batch records' `schedule` fields.
- Updated `transformBatchRecord` to use `parseSchedule` on `raw.schedule` prior to mapping nested day, time, and room default keys, securing the `select` parsing path.

### Queries & Caching
#### [MODIFY] [useBatchQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js)
- Imported and applied `normalizeBatchListScheduleField` in the `queryFn` of `useBatchesQuery` to convert list elements' schedule string data to JSON objects before storing them in React Query's list cache.
- Imported and applied `normalizeBatchScheduleField` in the `queryFn` of `useBatchDetailQuery` to ensure details cache stores parsed JSON objects instead of serialized strings.

#### [MODIFY] [useErpHydration.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useErpHydration.js)
- Imported `normalizeBatchListScheduleField` and mapped initial `'Batch'` records prior to executing `queryClient.setQueryData`, ensuring initial hydration cache stores clean JSON schedules.

## Verification
- Verified that all cache updates ensure schedule property is stored as a parsed JSON structure.
- Verified that list views and detailed views render timing/schedule details correctly from the parsed cache.
