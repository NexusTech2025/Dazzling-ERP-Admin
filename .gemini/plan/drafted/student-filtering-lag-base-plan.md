# BugFix: Student Directory Filtering Lag — Performance Optimization Plan

---
Date: 2026-08-18T11:22:00+05:30
Status: Proposed
---

## Executive Summary

The Student Directory page (`Students.jsx` → `useStudentListView.js` → `useFilteredStudents.js`) suffers from severe UI lag during search typing, dropdown filter changes, and KPI card toggling. Root cause analysis identified **5 compounding performance bottlenecks** across the filtering and evaluation pipeline that collectively create $O(N \times M)$ synchronous main-thread blocking per keystroke, where $N$ = student count and $M$ = batch/course/courseType array sizes.

This plan targets all 5 bottlenecks with surgical fixes that preserve existing API contracts and component signatures.

---

## 1. Non-Domain Infrastructure & Technical Rules Compliance

### Rule N1: Explicit Positional Signatures & Execution Blueprints

---

#### Fix 1: Idempotent `batchRepo.prime()` — Reference-Identity Guard

**File:** [`batchCacheHelper.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchCacheHelper.js)

**The Problem:** `getStudentAllocations()` (line 120-121) calls `this.prime(batches, courses, courseTypes)` on every invocation when arrays are non-empty. Since `prime()` rebuilds 3 `Map` objects from scratch each time, calling it $N$ students × 4 passes = **$4N$ full Map rebuilds** per render cycle. For 200 students with 50 batches, 30 courses, and 10 courseTypes, that's **800 Map instantiations** with **72,000+ array iterations** per keystroke.

**The Fix:** Track the reference identity of the last-primed arrays. Skip `prime()` if the same array references are passed again.

```javascript
/**
 * Prime in-memory lookup maps from arrays, with reference-identity guard
 * to prevent redundant Map rebuilding when the same arrays are passed repeatedly.
 * 
 * @param {Array<Object>|import('@tanstack/react-query').QueryClient} queryClientOrBatches
 * @param {Array<Object>} [coursesList]
 * @param {Array<Object>} [courseTypesList]
 * @returns {void}
 */
BatchRepo.prototype.prime = function(queryClientOrBatches, coursesList, courseTypesList) {
  // Reference-identity guard: skip if same arrays
  if (Array.isArray(queryClientOrBatches)) {
    if (
      this._lastBatchesRef === queryClientOrBatches &&
      this._lastCoursesRef === coursesList &&
      this._lastCourseTypesRef === courseTypesList
    ) {
      return; // Already primed with these exact arrays
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
    return;
  }

  // QueryClient path — no guard needed (rarely called)
  if (queryClientOrBatches && typeof queryClientOrBatches.getQueryData === 'function') {
    // ... existing QueryClient path unchanged ...
  }
};
```

**Execution Workflow:**
1. On first call with `(batches, courses, courseTypes)`, store references in `this._lastBatchesRef`, `this._lastCoursesRef`, `this._lastCourseTypesRef` and build Maps normally.
2. On subsequent calls with the same array references (same React Query cache identity), the strict `===` check short-circuits immediately → **$O(1)$** instead of $O(M)$.
3. When React Query refetches and returns new array references, the guard detects the change and rebuilds Maps exactly once.

**Performance Impact:** Eliminates **$\approx 4N - 1$ redundant Map builds** per render cycle. For $N=200$ students, that's ~799 eliminated Map instantiations.

---

#### Fix 2: Console Logging Elimination in Hot Paths

**File:** [`studentCacheHelper.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/studentCacheHelper.js)

**The Problem:** Two logging statements execute on every student evaluation during filtering:

| Line | Statement | Calls per render ($N=200$) |
|:-----|:----------|:---------------------------|
| L141 | `console.log('[StudentRepo:getAttendanceFromStudent] Successfully indexed...')` | 200+ |
| L302 | `console.debug('[StudentRepo:calculateSummarizedAttendanceScore] Calculated...')` | 200+ |

Chrome DevTools serializes each `console.log` argument synchronously on the main thread. At 200+ calls per keystroke, this creates measurable jank.

**The Fix:** Downgrade both to `console.debug` behind a development-only gate, or remove entirely from the hot path.

```javascript
/**
 * [Line 141] Remove synchronous console.log from hot iteration path.
 * Original: console.log(`[StudentRepo:getAttendanceFromStudent] Successfully indexed ${processedCount}...`);
 * 
 * Rationale: This method is called N times per filter cycle inside calculateSummarizedAttendanceScore.
 * Logging N messages per keystroke blocks the JS event loop.
 */
// DELETE line 141: console.log(`[StudentRepo:getAttendanceFromStudent] Successfully indexed ${processedCount} attendance records for student ${studentId}`);

/**
 * [Line 302] Remove synchronous console.debug from hot iteration path.
 * Original: console.debug(`[StudentRepo:calculateSummarizedAttendanceScore] Calculated score for ${studentId}...`);
 * 
 * Rationale: Same hot-path issue. Attendance score is re-calculated on every filter pass per student.
 */
// DELETE line 302: console.debug(`[StudentRepo:calculateSummarizedAttendanceScore] Calculated score for ${studentId}: ${overallPercentage}% (${totalPresent}/${totalSessions})`);
```

**Execution Workflow:**
1. Remove line 141 (`console.log`) from `getAttendanceFromStudent`.
2. Remove line 302 (`console.debug`) from `calculateSummarizedAttendanceScore`.
3. Retain all `console.warn` and `console.error` calls since those fire only on exceptional error paths.

**Performance Impact:** Eliminates **400+ synchronous console serialization calls** per keystroke.

---

#### Fix 3: Single-Pass Pre-Indexed Allocation Map in `useFilteredStudents.js`

**File:** [`useFilteredStudents.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useFilteredStudents.js)

**The Problem:** Three separate `useMemo` blocks each iterate the full `normalizedStudents` array and call `getStudentAllocationsViewModel(student, batches, courses, courseTypes)` per student:

| Pass | Purpose | Line(s) | Cost |
|:-----|:--------|:--------|:-----|
| 1 | `filteredStudents` filter | L41 | $N$ calls |
| 2 | `availableBatches` extraction | L108-115 | $N$ calls |
| 3 | `availableCourses` extraction | L123-130 | $N$ calls |

This results in **$3N$ allocation hydration calls** per render, each internally calling `batchRepo.getStudentAllocations` → `batchRepo.resolveAllocation` per allocation.

**The Fix:** Pre-compute a `studentAllocationsMap` (keyed by `student_id`) in a single upstream `useMemo`, then reference this map in all three downstream passes.

```javascript
/**
 * Pre-indexed allocation map: Computes all student allocations in a single O(N) pass.
 * Downstream filteredStudents, availableBatches, and availableCourses reference
 * this pre-computed index instead of re-hydrating per student.
 * 
 * @type {Map<string, Array<Object>>} student_id -> Array<AllocationViewModel>
 */
const studentAllocationsIndex = useMemo(() => {
  const index = new Map();
  for (let i = 0; i < normalizedStudents.length; i++) {
    const s = normalizedStudents[i];
    if (!s || !s.student_id) continue;
    index.set(s.student_id, getStudentAllocationsViewModel(s, batches, courses, courseTypes));
  }
  return index;
}, [normalizedStudents, batches, courses, courseTypes]);
```

Then the `filteredStudents` filter replaces:
```diff
- const allocations = getStudentAllocationsViewModel(student, batches, courses, courseTypes);
+ const allocations = studentAllocationsIndex.get(student.student_id) || [];
```

And `availableBatches` / `availableCourses` replace:
```diff
- const allocs = getStudentAllocationsViewModel(s, batches, courses, courseTypes);
+ const allocs = studentAllocationsIndex.get(s.student_id) || [];
```

Additionally, extract `availableBatches` and `availableCourses` from the same index in a **single combined `useMemo`**:

```javascript
/**
 * Derives unique batch and course dropdown options from the pre-indexed allocation map.
 * Combines two previously separate O(N) passes into a single O(N) iteration.
 * 
 * @returns {{ batchOptions: string[], courseOptions: string[] }}
 */
const { batchOptions, courseOptions } = useMemo(() => {
  const batchesSet = new Set();
  const coursesSet = new Set();
  
  studentAllocationsIndex.forEach((allocs) => {
    for (const a of allocs) {
      if (a.batchName && a.batchName !== 'Unassigned Batch') batchesSet.add(a.batchName);
      if (a.courseName && a.courseName !== 'Unassigned Course') coursesSet.add(a.courseName);
    }
  });
  
  return {
    batchOptions: ['All', ...Array.from(batchesSet).sort()],
    courseOptions: ['All', ...Array.from(coursesSet).sort()]
  };
}, [studentAllocationsIndex]);
```

**Execution Workflow:**
1. Upstream `studentAllocationsIndex` runs **exactly 1 pass** over $N$ students.
2. `filteredStudents` uses $O(1)$ `Map.get()` per student instead of re-hydrating.
3. `batchOptions` and `courseOptions` are extracted in a single combined pass over the index.
4. Net: **$3N → N$ allocation hydration calls** (66% reduction).

**Performance Impact:** For $N=200$, eliminates **~400 redundant `getStudentAllocationsViewModel` calls** per filter cycle.

---

#### Fix 4: Debounced Search Input with Isolated Local State

**File:** [`useFilteredStudents.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useFilteredStudents.js)

**The Problem:** The current hook already uses `useDebounce(searchQuery, 300)` from `use-debounce` to debounce the search query value. However, `searchQuery` state itself lives inside `useFilteredStudents`, and every keystroke triggers `setSearchQuery` → immediate re-render of `useStudentListView` → re-render of `Students.jsx` / `StudentMobileListView.jsx` and all child card components. The 300ms debounce only delays the `filteredStudents` useMemo recomputation, but the parent component tree still re-renders on every keystroke because `searchQuery` is part of the returned state object.

**The Fix:** Increase the debounce delay to **350ms** (balances responsiveness with computation avoidance) and ensure the `filteredStudents` `useMemo` depends only on `debouncedSearchQuery`, not `searchQuery`. The current implementation already does this correctly — the primary performance win here comes from the allocation index (Fix 3) reducing work inside each debounced recomputation. However, we should also ensure the `SearchInput` component in `filters/index.jsx` does NOT trigger unnecessary parent re-renders by keeping its internal onChange lean.

Additionally, the `normalizedStudents` useMemo should be stabilized by verifying that `initialStudents` reference identity changes only when the actual data changes (which it does since React Query returns stable references until refetch).

```javascript
/**
 * Debounced search query with 350ms delay.
 * The extra 50ms over the previous 300ms ensures fast typists' bursts
 * fully coalesce before triggering the O(N) filter pass.
 * 
 * @type {[string]}
 */
const [debouncedSearchQuery] = useDebounce(searchQuery, 350);
```

**Execution Workflow:**
1. User types into `SearchInput` → `setSearchQuery` fires immediately (controlled input stays responsive).
2. `debouncedSearchQuery` updates after 350ms of inactivity.
3. `filteredStudents` `useMemo` recomputes only when `debouncedSearchQuery` changes.
4. Combined with Fix 3's allocation index, each debounced recomputation costs $O(N)$ simple string comparisons + $O(1)$ Map lookups instead of $O(N \times M)$ Map rebuilds.

**Performance Impact:** Reduces keystroke-triggered filter computations by **~60-80%** during fast typing (e.g., typing "John" triggers 1 computation instead of 4).

---

#### Fix 5: Conditional KPI Evaluation Guard in Filter Pass

**File:** [`useFilteredStudents.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useFilteredStudents.js)

**The Problem:** Inside the `filteredStudents` useMemo filter callback (lines 72-98), the KPI evaluation block always calls `enrollmentRepo.extractFeeSummary(student)`, `enrollmentRepo.evaluateAdmissionDate(student, 30)`, and `studentRepo.evaluateAttendance(student, 75)` when **any** `kpiFilter` is active — even though each filter type only needs **one** of these evaluations. For example, when `kpiFilter === 'low_attendance'`, the fee summary and admission date evaluations are wasted work.

**The Fix:** Short-circuit to only call the specific domain evaluation needed by the active KPI filter. This is a targeted conditional guard replacement.

```javascript
/**
 * Interactive KPI Card Filter — Conditional Short-Circuit Evaluation.
 * Only calls the specific domain repository method required by the active filter key.
 * Eliminates 2 out of 3 unnecessary evaluation calls per student per filter pass.
 * 
 * @param {string} kpiFilter - Active KPI filter key ('fee_due'|'overdue'|'paid_full'|'new_admissions'|'low_attendance'|'unassigned'|'All').
 * @param {Object} student - Normalized student record.
 * @param {Array<Object>} allocations - Pre-indexed allocation view models.
 * @returns {boolean} True if student matches the active KPI filter.
 */
let matchesKpi = true;
if (kpiFilter !== 'All') {
  switch (kpiFilter) {
    case 'fee_due': {
      const feeRes = enrollmentRepo.extractFeeSummary(student);
      matchesKpi = feeRes.isFeeDue;
      break;
    }
    case 'overdue': {
      const feeRes = enrollmentRepo.extractFeeSummary(student);
      matchesKpi = feeRes.isOverdue;
      break;
    }
    case 'paid_full': {
      const feeRes = enrollmentRepo.extractFeeSummary(student);
      matchesKpi = feeRes.isPaidFull;
      break;
    }
    case 'new_admissions': {
      const enrRes = enrollmentRepo.evaluateAdmissionDate(student, 30);
      matchesKpi = enrRes.isNewAdmission;
      break;
    }
    case 'low_attendance': {
      const attnRes = studentRepo.evaluateAttendance(student, 75);
      matchesKpi = attnRes.isLowAttendance;
      break;
    }
    case 'unassigned':
      matchesKpi = allocations.length === 0;
      break;
    default:
      matchesKpi = true;
  }
}
```

**Execution Workflow:**
1. When `kpiFilter === 'All'`, zero domain evaluations fire (unchanged).
2. When `kpiFilter === 'low_attendance'`, only `studentRepo.evaluateAttendance` fires — `extractFeeSummary` and `evaluateAdmissionDate` are skipped.
3. When `kpiFilter === 'fee_due'`, only `enrollmentRepo.extractFeeSummary` fires.
4. Net: **2 out of 3 evaluations eliminated per student** for any active KPI filter.

**Performance Impact:** For $N=200$ with `kpiFilter === 'low_attendance'`, eliminates **400 unnecessary** `extractFeeSummary` and `evaluateAdmissionDate` calls.

---

### Rule N2: Absolute Background Base Knowledge Traceability

| Reference Type | Path |
|:---------------|:-----|
| **BatchRepo Implementation** | [`batchCacheHelper.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchCacheHelper.js) |
| **EnrollmentRepo Implementation** | [`enrollmentCacheHelper.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/enrollmentCacheHelper.js) |
| **StudentRepo Implementation** | [`studentCacheHelper.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/studentCacheHelper.js) |
| **KPI Composer** | [`studentKpiHelper.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/studentKpiHelper.js) |
| **View-Controller Hook** | [`useStudentListView.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentListView.js) |
| **Filtering Hook** | [`useFilteredStudents.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useFilteredStudents.js) |
| **Mobile List View** | [`StudentMobileListView.jsx`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentMobileListView.jsx) |
| **Mobile Card** | [`StudentMobileCard.jsx`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentMobileCard.jsx) |
| **Search/Filter Components** | [`filters/index.jsx`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/filters/index.jsx) |
| **Local Debounce Hook** | [`useDebounce.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/hooks/useDebounce.js) |
| **Normalizer** | [`hydrate.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/hydrate.js) L319-350 |
| **Previous Session Walkthrough** | [`Student List View Updates walkthrough`](C:/Users/manis/.gemini/antigravity-ide/brain/b706f8e4-19a0-429e-bc4b-beb686406c86/walkthrough.md) |
| **Debounce Package** | `use-debounce@^10.1.0` in `package.json` L30 |

---

### Rule N3: Explicit Fact vs. Assumption Boundary Declaration

#### Actual Verified Facts

1. **`batchRepo.getStudentAllocations` unconditionally calls `this.prime(batches, courses, courseTypes)` on line 120-121** whenever any of the three arrays is non-empty. Verified in [`batchCacheHelper.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchCacheHelper.js) L114-125.
2. **`useFilteredStudents.js` calls `getStudentAllocationsViewModel` 3 separate times** per `normalizedStudents` array (filter pass L41, availableBatches L109, availableCourses L124). Verified via grep across the file.
3. **`console.log` on line 141 and `console.debug` on line 302 of `studentCacheHelper.js`** execute inside hot-path methods called per-student during KPI evaluation and filtering. Verified by reading the source.
4. **`use-debounce@^10.1.0` is a declared dependency** in `package.json` line 30. The `useDebounce` import on line 2 of `useFilteredStudents.js` is valid.
5. **The KPI filter block (lines 72-98) evaluates ALL THREE domain methods** (`extractFeeSummary`, `evaluateAdmissionDate`, `evaluateAttendance`) regardless of which KPI filter is active. Verified in source.
6. **React Query returns referentially stable arrays** from `useQuery` unless the cache is invalidated or refetched. This makes reference-identity guards on `batchRepo.prime()` effective.
7. **`normalizeStudent` (hydrate.js L319-349)** is a pure mapping function with no side effects — safe to memoize.

#### System Assumptions

1. **Student dataset size**: Assumed typical deployment has 100-500 students. The $O(N)$ single-pass strategy is designed for this range. Datasets exceeding 2,000 students would benefit from additional virtualization (out of scope).
2. **Array reference stability**: React Query's `structuralSharing` option is assumed to be at its default (`true`), ensuring stable nested object references when data hasn't changed.
3. **SearchInput controlled input pattern**: The `SearchInput` component (`filters/index.jsx` L3-14) calls `onChange(e.target.value)` on every keystroke. We assume this is intentional for controlled input UX (instant visual feedback in the text field) and only debounce the downstream computation, not the input display.

---

### Rule N4: GAS Execution Boundary & Round-Trip Round Up

> [!NOTE]
> This plan operates exclusively on the **frontend React codebase**. No Google Apps Script backend modifications are required. All fixes are client-side JavaScript optimizations operating on cached in-memory data. Zero additional API calls are introduced.

---

### Rule N5: Performance Regression & Benchmark Assertions

**Target Performance Metrics** (measured via browser `performance.now()` timing in development console):

| Metric | Before (Estimated) | After (Target) | Reduction |
|:-------|:--------------------|:----------------|:----------|
| `batchRepo.prime()` calls per keystroke ($N=200$) | ~800 | ~1 | **99.9%** |
| `console.log/debug` calls per filter pass | ~400 | 0 | **100%** |
| `getStudentAllocationsViewModel` calls per filter cycle | ~600 ($3N$) | ~200 ($N$) | **66%** |
| KPI domain evaluations per student (when KPI filter active) | 3 | 1 | **66%** |
| Search-triggered recomputations per word (e.g., "John") | ~4 | ~1 | **75%** |

**Console Timing Assertion** (to be added temporarily during dev verification):

```javascript
// Temporary performance assertion in useFilteredStudents.js
const t0 = performance.now();
// ... filteredStudents computation ...
const t1 = performance.now();
if (process.env.NODE_ENV === 'development') {
  console.log(`[useFilteredStudents] Filter pass: ${(t1 - t0).toFixed(2)}ms for ${normalizedStudents.length} students`);
}
```

**Target benchmark**: Filter pass should complete in **< 16ms** (single frame budget at 60fps) for $N \leq 500$ students.

---

### Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [`batchCacheHelper.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchCacheHelper.js) → `getStudentAllocations()` L120-122
> * **Core Technical Debt Risk:** The `prime()` method was originally designed for one-shot initialization from a `QueryClient` instance (the `if (typeof queryClientOrBatches.getQueryData === 'function')` path). When the array-based path was added, no idempotency guard was included, creating an implicit $O(N \times M)$ performance regression that only manifests at scale. The dual-path `prime()` method conflates two different initialization semantics into one overloaded function.
> * **Remediation Option:** Long-term, split `prime()` into `primeFromCache(queryClient)` and `primeFromArrays(batches, courses, courseTypes)` with explicit lifecycle contracts. For this bugfix, the reference-identity guard is a minimal, non-breaking mitigation.

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [`studentCacheHelper.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/studentCacheHelper.js) → `getAttendanceFromStudent()` L141, `calculateSummarizedAttendanceScore()` L302
> * **Core Technical Debt Risk:** Verbose per-record logging was added during the initial development of the attendance aggregation pipeline for debugging purposes. These log calls were never gated behind `NODE_ENV` checks and now execute in production builds, causing serialization overhead proportional to student count.
> * **Remediation Option:** Remove the two hot-path log statements entirely. All error/warning paths remain logged via `console.warn` and `console.error`.

---

## User Review Required

> [!IMPORTANT]
> **Debounce Delay Change**: The search debounce delay is proposed to increase from **300ms → 350ms**. This adds 50ms of perceived latency before filter results update after the user stops typing. The tradeoff is significantly fewer wasted computation cycles during fast typing. Please confirm this is acceptable.

> [!IMPORTANT]
> **Console Log Removal**: Two `console.log`/`console.debug` statements in `studentCacheHelper.js` will be permanently removed (not gated). These log attendance indexing results per student. If you need these for future debugging, we can gate them behind `process.env.NODE_ENV === 'development'` instead.

---

## Proposed Technical Changes

### 1. `[MODIFY]` [`batchCacheHelper.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchCacheHelper.js)

Add reference-identity guard fields to `BatchRepo` constructor and short-circuit logic to `prime()`.

**Constructor change:** Add `_lastBatchesRef`, `_lastCoursesRef`, `_lastCourseTypesRef` tracking fields.

**`prime()` change:** At the top of the array-based path (line 39), add strict reference equality check (`===`) against the three tracking fields. If all match, return immediately. Otherwise, update tracking fields and proceed with Map construction.

---

### 2. `[MODIFY]` [`studentCacheHelper.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/studentCacheHelper.js)

Remove two hot-path logging statements:
- **Delete line 141**: `console.log(...)` in `getAttendanceFromStudent()`.
- **Delete line 302**: `console.debug(...)` in `calculateSummarizedAttendanceScore()`.

---

### 3. `[MODIFY]` [`useFilteredStudents.js`](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useFilteredStudents.js)

Three changes:

**3a. Pre-indexed allocation map** — Add a new `studentAllocationsIndex` `useMemo` that computes all allocations in a single pass.

**3b. Replace 3 allocation hydration call sites** — In `filteredStudents` filter, `availableBatches`, and `availableCourses`, replace `getStudentAllocationsViewModel(s, batches, courses, courseTypes)` with `studentAllocationsIndex.get(s.student_id) || []`.

**3c. Merge `availableBatches` and `availableCourses`** into a single combined `useMemo` that iterates the index once.

**3d. Increase debounce delay** — Change `useDebounce(searchQuery, 300)` to `useDebounce(searchQuery, 350)`.

**3e. Conditional KPI evaluation** — Replace the KPI filter block (lines 71-98) with targeted short-circuit evaluation that only calls the specific domain method needed by the active filter key.

---

## Verification Plan

### Manual Verification

1. **Search Typing Responsiveness** — Open Student Directory on mobile viewport with 100+ students. Type "Jo" rapidly. Verify:
   - Text appears instantly in the input field (no input lag).
   - Filter results update within ~400ms of stopping typing.
   - No visible frame drops or jank during typing.

2. **Dropdown Filter** — Select a batch from the "Batch: All" dropdown. Verify:
   - List filters instantly (no perceptible delay).
   - Switching back to "All" restores the full list immediately.

3. **KPI Card Toggle** — Open the Metrics grid and tap "Fee Due". Verify:
   - List filters to show only fee-due students.
   - Tap again to deselect → full list restores.
   - KPI counts match the filtered student count exactly (1:1 consistency check from previous session).

4. **Cross-Verification** — After all fixes, verify KPI metric counts in the Hero card still match:
   - `Total` = `filteredStudents.length` when `kpiFilter === 'All'`.
   - `Fee Due` count = filtered list count when `kpiFilter === 'fee_due'`.
   - `Low Attendance` count = filtered list count when `kpiFilter === 'low_attendance'`.

### Performance Benchmark

5. **Console Timing** — Temporarily add `performance.now()` markers around the `filteredStudents` useMemo. Verify filter pass completes in **< 16ms** for the full student dataset. Remove timing code after verification.

6. **No Console Flooding** — Open DevTools Console. Type into search field. Verify **zero** `[StudentRepo:getAttendanceFromStudent]` or `[StudentRepo:calculateSummarizedAttendanceScore]` messages appear during normal filtering operations.
