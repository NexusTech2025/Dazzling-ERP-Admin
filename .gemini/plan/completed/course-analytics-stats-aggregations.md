---
Date: 2026-07-06T01:21:00+05:30
Status: Approved-Completed
---

# Refined Implementation Plan - Courses Analytics Stats Aggregations

This plan details retrieving pre-cached Batch, Package, PackageItem, and Student records synchronously from the TanStack Query Cache using `queryClient.getQueryData` to compute course analytics metrics with zero extra network requests or refetch overhead.

---

## 1. Non-Domain Driven Infrastructure Rules

### Rule N1: Explicit Positional Signatures & Execution Blueprints

#### Component: In-Memory Mappings & Aggregations
* **Path Reference:** `src/features/course/hooks/useCourseWorkspaceState.js`
```javascript
/**
 * Custom hook managing course workspace filtering and synchronous in-memory stats mappings.
 * Fetches batches, packages, packageItems, and student caches directly from the query store.
 * @returns {Object} Hydrated course list and mutation parameters.
 */
export const useCourseWorkspaceState = () => {
  // Sync lookup queryClient...
  // Retrieve static cache records:
  // - Batches: queryKeys.batch.list(EMPTY_FILTER)
  // - PackageItems: queryKeys.course.packageItem.list(EMPTY_FILTER)
  // - Students: queryKeys.student.list(EMPTY_FILTER)
  // Process O(n) stitching loop in RAM...
}
```

---

### Rule N2: Absolute Background Base Knowledge Traceability

* **Referenced runbooks:**
  * [course_stats.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/temp/courses/course_stats.md)
  * [useErpHydration.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useErpHydration.js)
  * [useCourseWorkspaceState.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseWorkspaceState.js)

---

### Rule N3: Explicit Fact vs. Assumption Boundary Declaration

#### Actual Verified Facts:
1. `useErpHydration.js` pre-seeds `Course`, `Batch`, `Package`, `PackageItem`, and `Student` lists into the Query Client cache upon application startup.
2. Invalidate calls or background refreshes to these namespaces update the cache client automatically.

#### System Assumptions:
1. Reading from `queryClient.getQueryData` is synchronous and does not trigger React rendering cycles unless the returned data references change.

---

### Rule N4: GAS Execution Boundary & Round-Trip Round Up

> [!NOTE]
> Synchronous cache queries utilize in-memory lookups only, completely eliminating remote round-trips or execution boundaries.

---

### Rule N5: Performance Regression & Benchmark Assertions

We will assert that cache extraction and array filters complete in under `2ms`.
```javascript
const t0 = performance.now();
const batches = queryClient.getQueryData(queryKeys.batch.list(EMPTY_FILTER)) || [];
// mapping calculations...
const t1 = performance.now();
console.log(`[Workspace] Cached stats synced in ${(t1 - t0).toFixed(2)}ms`);
```

---

### Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation

> [!CAUTION]
> **SYNCHRONOUS CACHE STABILITY:**
>
> * **Technical Path Endpoint:** `useCourseWorkspaceState.js`
> * **Core Risk:** If the parent components render before `useErpHydration` finishes seeding, the returned cached arrays will be empty (`[]`).
> * **Remediation Option:** Provide fallback value guards (`|| []`) to prevent undefined exceptions during initialization ticks.

---

## Proposed Changes

### Workspace Hook Hydration

---

#### [MODIFY] [useCourseWorkspaceState.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseWorkspaceState.js)
* Import `EMPTY_FILTER` from `../../../lib/react-query/queryKeys`.
* Retrieve current cached collections synchronously:
  * Batches: `queryClient.getQueryData(queryKeys.batch.list(EMPTY_FILTER)) || []`
  * PackageItems: `queryClient.getQueryData(queryKeys.course.packageItem.list(EMPTY_FILTER)) || []`
  * Students: `queryClient.getQueryData(queryKeys.student.list(EMPTY_FILTER)) || []`
* Map and hydrate the filtered courses list, calculating:
  * `batches_count`: filter batches where `course_id === c.course_id`
  * `packages_count`: filter packageItems where `entity_id === c.course_id && entity_type === entityType`
  * `total_students`: scan `student.enrollments` where `item_id === c.course_id && enrollment_type === entityType`
* Return the hydrated courses.
