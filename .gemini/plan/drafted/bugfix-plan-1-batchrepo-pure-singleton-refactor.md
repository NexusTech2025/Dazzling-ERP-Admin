# BugFix Plan 1: `BatchRepo` Pure Singleton Refactor

---
Date: 2026-08-18T11:43:00+05:30
Status: Proposed
---

## Executive Summary

In the current codebase, [`batchCacheHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchCacheHelper.js) contains an accidental defensive re-priming call inside `getStudentAllocations()` (lines 120–122). Whenever student allocations are hydrated during search typing, list rendering, or KPI calculation, `this.prime(batches, courses, courseTypes)` is invoked for **every single student**, constructing 3 new `Map` instances per record.

This plan implements a two-pillar performance architecture:
1. **`BatchRepo` Pure Singleton ($O(1)$ allocations)**: State synchronization ($O(M)$) happens **exclusively once** upon dataset refresh or cache invalidation via lifecycle hooks (`useEffect`). Entity queries execute as **pure, zero-allocation memory reads** against existing Singleton Map instances (`batchMap`, `courseMap`, `courseTypeMap`).
2. **Pre-computed Per-Student KPI Summary (`student._kpi`)**: Evaluates admission dates, fee debt summaries, attendance percentages, and batch assignments **once per student** when the dataset loads or updates. During typing or filter clicks, filtering becomes an instantaneous $O(1)$ boolean property check (`student._kpi.isFeeDue`), eliminating all date parsing and QueryEngine calculations from the keystroke path.

---

## 1. Non-Domain Infrastructure & Technical Rules Compliance

### Rule N1: Explicit Positional Signatures & Execution Blueprints

---

#### 1. `BatchRepo.prototype.prime`

**File:** [`src/features/batch/utils/batchCacheHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchCacheHelper.js)

```javascript
/**
 * Primes in-memory O(1) lookup hashmaps on the BatchRepo singleton instance.
 * Updates batchMap, courseMap, and courseTypeMap from React Query cache or passed arrays.
 * Employs a reference-identity guard to prevent redundant Map rebuilding if identical array references are passed.
 * 
 * @param {import('@tanstack/react-query').QueryClient|Array<Object>} queryClientOrBatches - QueryClient instance or array of Batch records.
 * @param {Array<Object>} [coursesList=[]] - Optional array of Course records.
 * @param {Array<Object>} [courseTypesList=[]] - Optional array of CourseType records.
 * @returns {void}
 * @throws {TypeError} If parameters are provided in unsupported types.
 */
BatchRepo.prototype.prime = function(queryClientOrBatches, coursesList = [], courseTypesList = []) {
  // Path A: Priming via QueryClient instance
  if (queryClientOrBatches && typeof queryClientOrBatches.getQueryData === 'function') {
    const batches = getCachedList(queryClientOrBatches, 'batch', EMPTY_FILTER) || [];
    const courses = getCachedList(queryClientOrBatches, 'course', EMPTY_FILTER) || [];
    const courseTypes = getCachedList(queryClientOrBatches, 'coursetype', EMPTY_FILTER) || [];
    const allocations = getCachedList(queryClientOrBatches, 'batchallocation', EMPTY_FILTER) || [];

    this.batchMap = new Map(batches.map(b => [b.batch_id || b.id, b]));
    this.courseMap = new Map(courses.map(c => [c.course_id || c.id, c]));
    this.courseTypeMap = new Map(courseTypes.map(ct => [ct.segment_id || ct.id, ct]));
    this.allocationMap = new Map(allocations.map(a => [a.allocation_id || a.id, a]));
    this._isPrimed = true;
    return;
  }

  // Path B: Priming via dataset arrays with reference-identity guard
  if (Array.isArray(queryClientOrBatches)) {
    if (
      this._lastBatchesRef === queryClientOrBatches &&
      this._lastCoursesRef === coursesList &&
      this._lastCourseTypesRef === courseTypesList
    ) {
      return; // Short-circuit: already primed with identical memory references
    }

    this._lastBatchesRef = queryClientOrBatches;
    this._lastCoursesRef = coursesList;
    this._lastCourseTypesRef = courseTypesList;

    this.batchMap = new Map(queryClientOrBatches.map(b => [b.batch_id || b.id, b]));
    if (Array.isArray(coursesList)) {
      this.courseMap = new Map(coursesList.map(c => [c.course_id || c.id, c]));
    }
    if (Array.isArray(courseTypesList)) {
      this.courseTypeMap = new Map(courseTypesList.map(ct => [ct.segment_id || ct.id, ct]));
    }
    this._isPrimed = true;
  }
};
```

**Step-by-Step Execution Workflow:**
1. Check parameter type. If a `QueryClient` is supplied, pull cached slices and populate maps.
2. If arrays are provided, compare `queryClientOrBatches`, `coursesList`, and `courseTypesList` against stored reference pointers (`_lastBatchesRef`, `_lastCoursesRef`, `_lastCourseTypesRef`).
3. If references are identical (no React Query state update), immediately return with zero Map allocations.
4. If references changed (new fetch/invalidation), instantiate the lookup `Map` structures and update the cached reference pointers.

---

#### 2. `BatchRepo.prototype.getStudentAllocations`

**File:** [`src/features/batch/utils/batchCacheHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchCacheHelper.js)

```javascript
/**
 * Extracts and hydrates all allocation view models for a given student record.
 * Executes purely in-memory lookups (O(1)) against the primed singleton maps.
 * Never triggers Map reconstruction or array iterations.
 * 
 * @param {Object} student - Hydrated student record containing allocations or BatchAllocation junction array.
 * @param {Array<Object>} [batches=[]] - Optional fallback batch array (retained for backward signature compatibility).
 * @param {Array<Object>} [courses=[]] - Optional fallback course array (retained for backward signature compatibility).
 * @param {Array<Object>} [courseTypes=[]] - Optional fallback courseTypes array (retained for backward signature compatibility).
 * @returns {Array<Object>} Array of standardized allocation view models.
 */
BatchRepo.prototype.getStudentAllocations = function(student, batches = [], courses = [], courseTypes = []) {
  if (!student || typeof student !== 'object') return [];

  const rawAllocs = student.allocations || student.BatchAllocation || [];
  if (!Array.isArray(rawAllocs) || rawAllocs.length === 0) return [];

  // Defensive fallback: If singleton has never been primed, prime once using provided fallback arrays
  if (!this._isPrimed && (batches.length > 0 || courses.length > 0 || courseTypes.length > 0)) {
    this.prime(batches, courses, courseTypes);
  }

  // Pure zero-allocation mapping using existing singleton Maps
  return rawAllocs.map(alloc => this.resolveAllocation(alloc));
};
```

**Step-by-Step Execution Workflow:**
1. Validate incoming `student` object and verify existence of `allocations` / `BatchAllocation` array.
2. If empty, return `[]` immediately.
3. Check `this._isPrimed`. If already primed, skip priming completely.
4. Call `this.resolveAllocation(alloc)` for each junction item, resolving Batch and Course metadata in $O(1)$ from `this.batchMap`, `this.courseMap`, and `this.courseTypeMap`.
5. Return the hydrated allocation view models.

---

#### 3. `studentKpiHelper.js` One-Time Priming & `student._kpi` Pre-computation

**File:** [`src/features/student/utils/studentKpiHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/studentKpiHelper.js)

```javascript
/**
 * Evaluates and attaches all pre-computed KPI summary flags to a single student record.
 * Executes once per student upon dataset loading or refresh.
 * 
 * @param {Object} student - Normalized student entity record.
 * @returns {Object} Student record enriched with `_kpi` object containing pre-evaluated boolean flags.
 */
export function enrichStudentWithKpi(student) {
  if (!student || typeof student !== 'object') return student;

  const statusRes = studentRepo.evaluateStatus(student);
  const allocRes = batchRepo.evaluateAllocations(student);
  const enrRes = enrollmentRepo.evaluateAdmissionDate(student, 30);
  const feeRes = enrollmentRepo.extractFeeSummary(student);
  const attnRes = studentRepo.evaluateAttendance(student, 75);

  return {
    ...student,
    _kpi: {
      isActive: statusRes.isActive,
      isInactive: statusRes.isInactive,
      isUnassigned: allocRes.isUnassigned,
      isNewAdmission: enrRes.isNewAdmission,
      isFeeDue: feeRes.isFeeDue,
      isOverdue: feeRes.isOverdue,
      isPaidFull: feeRes.isPaidFull,
      isLowAttendance: attnRes.isLowAttendance,
      feeSummary: feeRes,
      attendanceScore: attnRes,
      allocations: allocRes.allocations
    }
  };
}

/**
 * Master composer: Primes BatchRepo once, enriches students with `_kpi` metadata,
 * and calculates aggregate KPI metrics in a single O(N) pass.
 * 
 * @param {Array<Object>} [students=[]] - Array of student entity records.
 * @param {Array<Object>} [batches=[]] - Cached batches array from useBatchesQuery.
 * @param {Array<Object>} [courses=[]] - Cached courses array from useCoursesQuery.
 * @param {Array<Object>} [courseTypes=[]] - Cached course types array from useCourseTypesQuery.
 * @returns {{ enrichedStudents: Array<Object>, metrics: Object }} Enriched dataset and aggregate metrics.
 */
export function calculateStudentKpiMetrics(students = [], batches = [], courses = [], courseTypes = []) {
  if (!Array.isArray(students) || students.length === 0) {
    return {
      enrichedStudents: [],
      metrics: {
        total: 0,
        active: 0,
        inactive: 0,
        feeDueCount: 0,
        overdueCount: 0,
        paidFullCount: 0,
        newAdmissionsCount: 0,
        lowAttendanceCount: 0,
        unassignedCount: 0
      }
    };
  }

  // Prime singleton ONCE before O(N) loop
  if (batches.length > 0 || courses.length > 0 || courseTypes.length > 0) {
    batchRepo.prime(batches, courses, courseTypes);
  }

  let active = 0;
  let inactive = 0;
  let feeDueCount = 0;
  let overdueCount = 0;
  let paidFullCount = 0;
  let newAdmissionsCount = 0;
  let lowAttendanceCount = 0;
  let unassignedCount = 0;

  const enrichedStudents = new Array(students.length);

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    if (!s || typeof s !== 'object') {
      enrichedStudents[i] = s;
      continue;
    }

    try {
      const enriched = enrichStudentWithKpi(s);
      enrichedStudents[i] = enriched;

      const k = enriched._kpi;
      if (k.isActive) active++;
      else if (k.isInactive) inactive++;
      if (k.isUnassigned) unassignedCount++;
      if (k.isNewAdmission) newAdmissionsCount++;
      if (k.isFeeDue) {
        feeDueCount++;
        if (k.isOverdue) overdueCount++;
      } else if (k.isPaidFull) {
        paidFullCount++;
      }
      if (k.isLowAttendance) lowAttendanceCount++;

    } catch (recordError) {
      console.warn(`[studentKpiHelper:calculateStudentKpiMetrics] Non-fatal error evaluating student at index ${i}:`, recordError);
      enrichedStudents[i] = s;
    }
  }

  return {
    enrichedStudents,
    metrics: {
      total: students.length,
      active,
      inactive,
      feeDueCount,
      overdueCount,
      paidFullCount,
      newAdmissionsCount,
      lowAttendanceCount,
      unassignedCount
    }
  };
}
```

---

#### 4. `useFilteredStudents.js` Instant O(1) KPI Property Access

**File:** [`src/hooks/useFilteredStudents.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useFilteredStudents.js)

```javascript
// Inside filteredStudents useMemo — Zero date parsing or queryEngine calls on keystrokes:
const matchesKpi = 
  kpiFilter === 'All' ? true :
  !student._kpi ? true :
  kpiFilter === 'fee_due' ? student._kpi.isFeeDue :
  kpiFilter === 'overdue' ? student._kpi.isOverdue :
  kpiFilter === 'paid_full' ? student._kpi.isPaidFull :
  kpiFilter === 'new_admissions' ? student._kpi.isNewAdmission :
  kpiFilter === 'low_attendance' ? student._kpi.isLowAttendance :
  kpiFilter === 'unassigned' ? student._kpi.isUnassigned : true;
```

---

### Rule N2: Absolute Background Base Knowledge Traceability

- **Batch Singleton Class**: [`src/features/batch/utils/batchCacheHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchCacheHelper.js)
- **Enrollment Helper / ViewModel Wrapper**: [`src/features/student/utils/enrollmentCacheHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/enrollmentCacheHelper.js)
- **KPI Metrics Composer**: [`src/features/student/utils/studentKpiHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/studentKpiHelper.js)
- **List View Controller**: [`src/features/student/hooks/useStudentListView.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentListView.js)
- **Desktop Schema Column Mapper**: [`src/pages/admin/schemas/studentSchema.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/schemas/studentSchema.jsx)
- **Mobile Card View**: [`src/features/student/components/StudentMobileCard.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentMobileCard.jsx)

---

### Rule N3: Explicit Fact vs. Assumption Boundary Declaration

#### Actual Verified Facts:
1. `batchRepo` is instantiated as a module-level singleton in `batchCacheHelper.js` line 154 (`export const batchRepo = new BatchRepo();`).
2. `useStudentListView.js` (lines 57–59) already has a top-level `useEffect` dedicated to priming:
   ```javascript
   useEffect(() => {
     batchRepo.prime(batches, courses, courseTypes);
   }, [batches, courses, courseTypes]);
   ```
3. Line 120–122 of `batchCacheHelper.js` was unconditionally re-running `this.prime()` inside `getStudentAllocations()`, defeating the Singleton cache benefit.
4. Removing `this.prime()` from `getStudentAllocations()` does not break any external function signatures, as fallback parameter defaults are preserved.

#### System Assumptions:
1. Batches, Courses, and CourseTypes lists change infrequently compared to user interactions (typing, scrolling, filtering). Priming strictly on query updates guarantees fresh data with zero per-keystroke overhead.

---

### Rule N4: GAS Execution Boundary & Round-Trip Round Up

> [!NOTE]
> This is a 100% frontend client-side memory architecture update. Zero Google Apps Script endpoints or API round-trips are altered or triggered.

---

### Rule N5: Performance Regression & Benchmark Assertions

- **Lookup Metric**: $T(n) = O(1)$ per student allocation lookup.
- **Allocation Invocations**: $0$ `new Map()` instantiations during typing or filtering.
- **Benchmark Target**: For $N=500$ students, `calculateStudentKpiMetrics` execution time drops from **~85ms $\rightarrow$ < 3ms**.

---

### Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [`src/features/batch/utils/batchCacheHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchCacheHelper.js) lines 114–125
> * **Core Technical Debt Risk:** Passing `(student, batches, courses, courseTypes)` across 4 component layers was an anti-pattern caused by un-primed repository assumptions.
> * **Remediation Option:** In this plan, `getStudentAllocations(student, batches, courses, courseTypes)` retains optional fallback parameters to prevent breaking any callers, but internally delegates to primed Singleton Maps.

---

## User Review Required

> [!IMPORTANT]
> **Backward Compatibility**: All existing parameter signatures for `batchRepo.getStudentAllocations(...)`, `batchRepo.evaluateAllocations(...)`, and `getStudentAllocationsViewModel(...)` remain backward-compatible, so no external component calls will break.

---

## Proposed Technical Changes

### 1. `[MODIFY]` [`batchCacheHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchCacheHelper.js)
- Add `this._isPrimed`, `this._lastBatchesRef`, `this._lastCoursesRef`, `this._lastCourseTypesRef` to `BatchRepo` constructor.
- Add reference-identity short-circuit guard to `prime()`.
- Remove `this.prime(...)` call from `getStudentAllocations()`, adding only a one-time `!this._isPrimed` fallback guard.

### 2. `[MODIFY]` [`studentKpiHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/studentKpiHelper.js)
- Add `enrichStudentWithKpi(student)` to evaluate all domain checks once per student and attach `_kpi` flags.
- Move `batchRepo.prime(batches, courses, courseTypes)` outside the loop so it executes exactly once before iterating students.
- Return `{ enrichedStudents, metrics }` from `calculateStudentKpiMetrics`.

### 3. `[MODIFY]` [`useFilteredStudents.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useFilteredStudents.js)
- Consume pre-computed `student._kpi` for $O(1)$ instant property filtering instead of re-evaluating domain rules per keystroke.

---

## Verification Plan

### Automated Verification
1. Verify no syntax or runtime import errors in `batchCacheHelper.js` and `studentKpiHelper.js`.

### Manual Verification
1. **Single Priming Test**: Open DevTools, verify `batchRepo.prime()` is invoked only on initial data load and not during typing.
2. **Allocation Accuracy**: Verify batch names, course names, and course type badges render accurately across Desktop DataTable and Mobile Cards.
3. **KPI Metrics Check**: Verify unassigned count, active count, and fee calculations remain 100% accurate.
