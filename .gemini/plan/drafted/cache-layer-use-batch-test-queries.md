---
Date: 2026-07-27T12:27:00+05:30
Status: Proposed
---

# Cache Layer Integration Implementation Plan: `useBatchTestQueries.js` & `cacheHelper.js`

This document details the architectural plan to integrate the progressive caching engine ([cacheHelper.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)) into the Test Management hooks layer ([useBatchTestQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchTestQueries.js)).

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Schemas:**
  * `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Test\Test.json`
  * `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Test\TestMarks.json`
* **Referenced Core Modules:**
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\lib\react-query\cacheHelper.js`
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\lib\react-query\queryKeys.js`
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\lib\react-query\hydrate.js`
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\lib\react-query\validationEngine.js`
* **Design Runbooks:**
  * `E:\NAST\Dazzling\GAS\DazzlingDB\REST-api-doc.md` (Target actions: `DATA.QUERY`, `DATA.INSERT`, `DATA.UPDATE`, `DATA.DELETE`)

---

## **2. Fact vs. Assumption Boundary Declaration (Rule N3)**

### Actual Verified Facts
1. `useBatchTestsQuery` and `useTestMarksQuery` currently bypass `cacheHelper.js` and call `apiClient.executeAction` directly inside `queryFn`.
2. `ENTITY_CONFIGS` in `cacheHelper.js` contains entity definitions for `student`, `teacher`, `batch`, `course`, `package`, `batchAllocation`, `batchAttendance`, `enrollment`, and `user`, but **does NOT** contain entries for `test` or `testMarks`.
3. `resolveList` in `cacheHelper.js` provides automatic request deduplication, `normalizeRecord` transformations, `validateRecordSchema` checks, and seeds individual detail cache items.
4. `getCachedList` provides synchronous, zero-latency cache hydration for components mounted before network calls return.

### System Assumptions
1. Backend response payloads for `target: 'Test'` match the schema keys defined in `Test.json` (`id`, `title`, `batch_id`, `test_date`, `total_marks`, `passing_marks`, `status`, `remarks`).
2. Backend response payloads for `target: 'TestMarks'` match `TestMarks.json` (`id`, `test_id`, `student_id`, `obtained_marks`, `is_absent`, `remarks`).

---

## **3. Technical Legacy Caution Isolation (Rule N6)**

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [useBatchTestQueries.js:L17-L73](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchTestQueries.js#L17-L73)
> * **Core Technical Debt Risk:** Direct `apiClient` calls bypass the schema normalization engine (`hydrate.js`), schema validation (`validationEngine.js`), deduplication of concurrent fetches (`activeRequests`), and instant tab hydration (`initialData` / `getCachedList`).
> * **Remediation Option:** Register `test` and `testMarks` inside `ENTITY_CONFIGS` in `cacheHelper.js` and wrap query calls with `resolveList` and `getCachedList`.

---

## **4. GAS Execution Boundary & Round-Trip Safeguards (Rule N4)**

* All client-side bulk mark calculations (`calculateTestReport`) run entirely in RAM using `queryEngine.js` (`aq`).
* Saving student marks (`useSaveBulkMarksMutation`) groups all student records into a single bulk array payload submitted in **1 single locked API round-trip request** using `API_REGISTRY.DATA.INSERT` / `UPDATE_BATCH`. No nested API loops.

---

## **5. Performance Benchmarks & Assertions (Rule N5)**

* **Target Performance Constraint:** $T(n) = O(1)$ network API calls. Cache resolution time $< 1\text{ ms}$.
* **Timing Assertions:** `console.time('[CacheHelper:ListHit]')` triggers on cache re-hydration during tab switches.

---

## **6. Positional Signatures & Execution Blueprints (Rule N1)**

### A. Updating `ENTITY_CONFIGS` ([cacheHelper.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js))

```javascript
/**
 * Config mapping for Test and TestMarks entities in the progressive cache engine.
 */
export const ENTITY_CONFIGS = {
  // ... existing configs
  test: {
    primaryKey: 'id',
    listKey: (filter = {}) => queryKeys.test.byBatch(filter.batch_id || filter.batchId),
    listsKey: () => queryKeys.test.all,
    detailKey: (id) => queryKeys.test.detail(id),
    isValidDetail: (data) => data && typeof data === 'object' && ('title' in data || 'id' in data)
  },
  testMarks: {
    primaryKey: 'id',
    listKey: (filter = {}) => queryKeys.test.marks(filter.test_id || filter.testId),
    listsKey: () => ['test', 'marks'],
    detailKey: (id) => [...queryKeys.test.all, 'marks', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && ('student_id' in data || 'id' in data)
  }
};
```

### B. Refactored `useBatchTestsQuery` ([useBatchTestQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchTestQueries.js))

```javascript
/**
 * Fetches all tests associated with a batch with progressive cache hydration.
 * @param {string} batchId - Target batch ID.
 * @param {Object} [options={}] - Optional query execution options & callbacks.
 * @returns {Object} TanStack Query result containing array of tests.
 * @throws {CacheLayerError|Error} If query or cache resolution fails.
 */
export function useBatchTestsQuery(batchId, options = {}) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const filter = useMemo(() => ({ batch_id: batchId }), [batchId]);

  return useQuery({
    queryKey: queryKeys.test.byBatch(batchId),
    queryFn: async ({ signal }) => {
      if (!batchId) return [];
      return resolveList(
        queryClient,
        'test',
        filter,
        async () => {
          const response = await apiClient.executeAction(
            API_REGISTRY.DATA.QUERY,
            {
              target: 'Test',
              where: { batch_id: batchId }
            },
            token,
            { signal }
          );

          if (!response.success) {
            throw new Error(response.message || 'Failed to fetch batch tests');
          }

          return response.data?.data || response.data || [];
        },
        options
      );
    },
    enabled: Boolean(token) && Boolean(batchId),
    initialData: () => getCachedList(queryClient, 'test', filter, { strict: true }),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.test.byBatch(batchId))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 2.5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
```

### C. Refactored `useTestMarksQuery` ([useBatchTestQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchTestQueries.js))

```javascript
/**
 * Fetches student marks for a specific test with progressive cache hydration.
 * @param {string} testId - Target test ID.
 * @param {Object} [options={}] - Optional query execution options & callbacks.
 * @returns {Object} TanStack Query result containing array of TestMarks.
 * @throws {CacheLayerError|Error} If query or cache resolution fails.
 */
export function useTestMarksQuery(testId, options = {}) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const filter = useMemo(() => ({ test_id: testId }), [testId]);

  return useQuery({
    queryKey: queryKeys.test.marks(testId),
    queryFn: async ({ signal }) => {
      if (!testId) return [];
      return resolveList(
        queryClient,
        'testMarks',
        filter,
        async () => {
          const response = await apiClient.executeAction(
            API_REGISTRY.DATA.QUERY,
            {
              target: 'TestMarks',
              where: { test_id: testId }
            },
            token,
            { signal }
          );

          if (!response.success) {
            throw new Error(response.message || 'Failed to fetch test marks');
          }

          return response.data?.data || response.data || [];
        },
        options
      );
    },
    enabled: Boolean(token) && Boolean(testId),
    initialData: () => getCachedList(queryClient, 'testMarks', filter, { strict: true }),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.test.marks(testId))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 2.5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
```
