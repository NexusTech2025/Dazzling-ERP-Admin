---
Title: Implementation Plan: Relational `include: ["marks"]` Query Optimization for Batch Tests
Date: 2026-07-27T12:48:00+05:30
Status: Proposed
---

# Implementation Plan: Relational `include: ["marks"]` Query Optimization for Batch Tests

This document details the technical plan to optimize [useBatchTestQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchTestQueries.js) by using the `include` parameter in `DATA.QUERY` to hydrate `TestMarks` directly inside `Test` records, eliminating separate network requests.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Schemas:**
  * `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Test\Test.json` (Relation `marks` -> target `TestMarks`, foreign key `test_id`)
  * `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Test\TestMarks.json`
* **Referenced Core Modules:**
  * `E:\NAST\Dazzling\GAS\DazzlingDB\QueryEngine\Query_DSL_Reference.md` (Section `include` - relational hydration)
  * `E:\NAST\Dazzling\GAS\DazzlingDB\QueryEngine\RelationHydrator.js`
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\lib\react-query\cacheHelper.js`
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\batch\hooks\useBatchTestQueries.js`
* **Design Runbooks:**
  * `E:\NAST\Dazzling\GAS\DazzlingDB\REST-api-doc.md` (Section `data_query`)

---

## **2. Fact vs. Assumption Boundary Declaration (Rule N3)**

### Actual Verified Facts
1. The DazzlingDB Query Engine supports relational hydration via `"include": ["marks"]` as documented in `Query_DSL_Reference.md` line 91.
2. `Test.json` defines relation `"marks"` pointing to `target: "TestMarks"`, foreignKey `"test_id"`.
3. Currently, `useBatchTestsQuery` fetches `target: 'Test'` without `include`, and `useTestMarksQuery` triggers a separate network request to `target: 'TestMarks'` whenever a test is selected.
4. Passing `"include": ["marks"]` in `DATA.QUERY` hydrates all `TestMarks` records into a nested `marks` array on each `Test` object (`test.marks = [...]`) in a single network round-trip.

### System Assumptions
1. Nested `marks` array returned by backend `RelationHydrator` conforms to `TestMarks.json` fields (`student_id`, `obtained_marks`, `is_absent`, `remarks`).

---

## **3. Technical Legacy Caution Isolation (Rule N6)**

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [useTestMarksQuery](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchTestQueries.js#L67-L107)
> * **Core Technical Debt Risk:** Executing a separate `TestMarks` query per selected test creates unnecessary $N+1$ network round-trips and delays rendering when opening mark entry or report views.
> * **Remediation Option:** Pass `"include": ["marks"]` inside `useBatchTestsQuery`. Refactor `useTestMarksQuery` to act as a selector reading from `test.marks`, or consume `selectedTest.marks` directly in `BatchTestsTab`.

---

## **4. GAS Execution Boundary & Round-Trip Safeguards (Rule N4)**

* **Single Query Fetch:** Fetching tests with `"include": ["marks"]` consolidates two separate database queries into **1 single locked API call**, processed in RAM on GAS via `RelationHydrator.js`.
* **RAM Data Wrangling:** Client-side calculations in `testCalculators.js` consume the in-memory hydrated `test.marks` array directly.

---

## **5. Performance Benchmarks & Assertions (Rule N5)**

* **Target Performance Constraint:** $T(n) = O(1)$ network request for all tests & student marks per batch.
* **Network Reduction:** 50% - 75% reduction in total HTTP requests when opening test management views.

---

## **6. Positional Signatures & Execution Blueprints (Rule N1)**

### A. Refactored `useBatchTestsQuery` ([useBatchTestQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchTestQueries.js))

```javascript
/**
 * Fetches all tests associated with a batch, automatically hydrating nested student marks.
 * @param {string} batchId - Target batch ID.
 * @param {Object} [options={}] - Optional query execution options.
 * @returns {Object} TanStack Query result containing array of tests with nested `marks` array.
 * @throws {Error} If network request fails.
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
              where: { batch_id: batchId },
              include: ['marks']
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

### B. Refactored `useTestMarksQuery` Selector Helper ([useBatchTestQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchTestQueries.js))

```javascript
/**
 * Selector hook extracting student marks for a specific test directly from the cached batch tests query.
 * Bypasses network request by consuming hydrated `test.marks`.
 * @param {string} batchId - Target batch ID.
 * @param {string} testId - Target test ID.
 * @returns {Array<Object>} List of hydrated TestMarks objects for the target test.
 */
export function useTestMarksQuery(batchId, testId) {
  const { data: tests = [] } = useBatchTestsQuery(batchId);

  return useMemo(() => {
    if (!testId || !tests.length) return [];
    const foundTest = tests.find(t => t.id === testId || t.test_id === testId);
    return foundTest?.marks || [];
  }, [tests, testId]);
}
```
