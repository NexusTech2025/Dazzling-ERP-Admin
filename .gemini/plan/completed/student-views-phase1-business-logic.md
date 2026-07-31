---
Title: Student Data Views Optimization - Phase 1: Business Logic & Schema Refactoring Plan (Refined)
Date: 2026-07-30T21:35:00+05:30
Status: Approved-Completed
---

# Student Data Views Optimization - Phase 1: Business Logic & Schema Refactoring Plan (Refined)

> [!IMPORTANT]
> **Refined Architectural Directives**:
> - **UI Filter Decoupling**: Ephemeral UI filters (search, batch, course, status) are **strictly excluded** from TanStack Query keys. `useStudentsQuery()` will fetch and cache **all** student records under `queryKeys.student.list(EMPTY_FILTER)`.
> - **In-Memory Client-Side Filtering**: Filtering strategy executes entirely in memory within `useFilteredStudents` using `aq(initialStudents)` from `queryEngine.js`.
> - **Two-Phase Scope**:
>   - **Phase 1 (THIS PLAN)**: Business logic, schema property alignment, in-memory filtering engine, and cache normalization (`resolveList` / `hydrateRecord`).
>   - **Phase 2 (SUBSEQUENT PHASE)**: Mobile & Desktop UI layout redesign.

---

## 🏛️ Executive Summary & Key Objectives

1. **Query Key Standardization & Cache Decoupling**: Ensure `useStudentsQuery` fetches the full student list under `queryKeys.student.list(EMPTY_FILTER)` without embedding ephemeral UI filter parameters in the query key array, preventing cache fragmentation.
2. **In-Memory Data Wrangling (`queryEngine.js`)**: Perform all client-side search matching (name, ID, phone, email, father name) and dropdown option extraction dynamically over the cached dataset using `aq(initialStudents)`.
3. **Schema Property Normalization**: Align key names with official JSON database schemas (`student_id`, `student_name`, `email`, `phone`, `father_name`, `mother_name`, `current_batch`, `current_course`).
4. **Cache & Hydration Layer Integration**: Wrap list fetching inside `resolveList(queryClient, 'student', ...)` to guarantee write-time normalization (`normalizeStudent`) and read-time hydration (`hydrateStudent`).

---

## 🔍 Absolute Background Base Knowledge Traceability (Rule N2)

- **Referenced Schemas**:
  - `[Student.json](file:///e:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Students/Student.json)` (`student_id`, `student_name`, `email`, `phone`, `gender`, `dob`, `mother_name`, `father_name`, `avatarUrl`, `status`)
  - `[Enrollment.json](file:///e:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Academic/Enrollment.json)` (`enrollment_id`, `student_id`, `enrollment_type`, `item_id`, `status`)
  - `[BatchAllocation.json](file:///e:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Academic/BatchAllocation.json)` (`allocation_id`, `student_id`, `enrollment_id`, `course_id`, `batch_id`, `status`)
- **Referenced Core Infrastructure Modules**:
  - `[useFilteredStudents.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useFilteredStudents.js)`
  - `[useStudentQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentQueries.js)`
  - `[hydrate.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/hydrate.js)`
  - `[cacheHelper.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)`
  - `[queryEngine.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/queryEngine.js)`

---

## 📌 Fact vs. Assumption Boundaries (Rule N3)

### Verified Facts
1. Query key rules in `queryKeys.js` state that entity list keys take `(filter = EMPTY_FILTER)`. Passing ephemeral UI filters into query keys breaks cache invalidation and causes redundant backend requests.
2. The JSON database schema for Student enforces `primaryKey: "student_id"` and column `"student_name"`. Properties `student.name` and `student.id` do not exist.
3. Client-side filtering via `queryEngine.js` (`aq`) provides high-performance O(n) array wrangling in memory.

### System Assumptions
1. Students may have multiple enrollments or batch allocations. Primary batch/course attributes (`student.current_batch` / `student.current_course`) serve as the default list parameters.

---

## 🛠️ Execution Blueprints (Rule N1)

### Blueprint 1: Unified Query Cache Hook (`src/features/student/hooks/useStudentQueries.js`)

```javascript
/**
 * Hook for fetching all students with zero query key fragmentation.
 * Ephemeral filters are excluded from queryKey; all student records are cached under EMPTY_FILTER
 * and filtered in-memory by downstream hooks.
 * 
 * @returns {UseQueryResult} TanStack Query result containing the master student array.
 */
export const useStudentsQuery = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.student.list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      return resolveList(
        queryClient,
        'student',
        EMPTY_FILTER,
        async () => {
          const response = await fetchStudents(token, EMPTY_FILTER, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch students');
          }
          return response.data?.data || [];
        }
      );
    },
    enabled: !!token,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
```

---

### Blueprint 2: In-Memory Filtering Strategy (`src/hooks/useFilteredStudents.js`)

```javascript
import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { aq } from '../lib/queryEngine';
import { normalizeStudent } from '../lib/react-query/hydrate';

/**
 * Custom hook managing client-side search and filtering for Student Directory in memory.
 * Uses queryEngine (aq) to transform and filter cached data without hitting backend endpoints.
 * 
 * @param {Array<Object>} initialStudents - Master student array from useStudentsQuery.
 * @returns {Object} Search/filter state handlers, dynamic dropdown options, and filtered dataset.
 */
export const useFilteredStudents = (initialStudents = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Normalize all raw records once
  const normalizedStudents = useMemo(() => {
    return (initialStudents || []).map(normalizeStudent).filter(Boolean);
  }, [initialStudents]);

  // Derived filtered dataset via queryEngine / in-memory evaluation
  const filteredStudents = useMemo(() => {
    const searchLower = debouncedSearchQuery.trim().toLowerCase();

    return normalizedStudents.filter((student) => {
      // 1. Multi-field Search Matching
      const matchesSearch = !searchLower || (
        (student.student_name && student.student_name.toLowerCase().includes(searchLower)) ||
        (student.student_id && student.student_id.toLowerCase().includes(searchLower)) ||
        (student.email && student.email.toLowerCase().includes(searchLower)) ||
        (student.phone && student.phone.includes(searchLower)) ||
        (student.father_name && student.father_name.toLowerCase().includes(searchLower)) ||
        (student.current_batch && student.current_batch.toLowerCase().includes(searchLower)) ||
        (student.current_course && student.current_course.toLowerCase().includes(searchLower))
      );

      // 2. Batch Filter
      const matchesBatch = batchFilter === 'All' || student.current_batch === batchFilter;

      // 3. Course Filter
      const matchesCourse = courseFilter === 'All' || student.current_course === courseFilter;

      // 4. Status Filter
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter.toLowerCase();

      return matchesSearch && matchesBatch && matchesCourse && matchesStatus;
    });
  }, [normalizedStudents, debouncedSearchQuery, batchFilter, courseFilter, statusFilter]);

  // Extract unique batch options using queryEngine table operations
  const availableBatches = useMemo(() => {
    if (!normalizedStudents.length) return ['All'];
    const batches = aq(normalizedStudents)
      .filter(s => s.current_batch && s.current_batch !== 'Unassigned Batch')
      .groupby('current_batch')
      .objects()
      .map(row => row.current_batch);

    return ['All', ...Array.from(new Set(batches)).sort()];
  }, [normalizedStudents]);

  // Extract unique course options using queryEngine table operations
  const availableCourses = useMemo(() => {
    if (!normalizedStudents.length) return ['All'];
    const courses = aq(normalizedStudents)
      .filter(s => s.current_course && s.current_course !== 'Unassigned Course')
      .groupby('current_course')
      .objects()
      .map(row => row.current_course);

    return ['All', ...Array.from(new Set(courses)).sort()];
  }, [normalizedStudents]);

  return {
    searchQuery,
    setSearchQuery,
    batchFilter,
    setBatchFilter,
    courseFilter,
    setCourseFilter,
    statusFilter,
    setStatusFilter,
    filteredStudents,
    availableBatches,
    availableCourses
  };
};
```

---

### Blueprint 3: Schema Normalizer (`src/lib/react-query/hydrate.js`)

```javascript
/**
 * Normalizes a raw Student record to guarantee canonical schema properties.
 * Maps alias keys (id -> student_id, name -> student_name) and establishes primary defaults.
 * 
 * @param {Object} student - Raw student payload from API or cache.
 * @returns {Object|null} Normalized student record.
 */
export function normalizeStudent(student) {
  if (!student) return null;

  const student_id = student.student_id ?? student.id ?? null;
  const student_name = student.student_name ?? student.name ?? 'Anonymous Student';
  const email = student.email ?? student.contact?.email ?? null;
  const phone = student.phone ?? student.mobile_number ?? student.contact?.mobile_number ?? null;

  const primaryEnrollment = Array.isArray(student.enrollments) ? student.enrollments[0] : null;
  const current_course = student.current_course ?? student.course_name ?? primaryEnrollment?.course_name ?? 'Unassigned Course';
  const current_batch = student.current_batch ?? student.batch_name ?? primaryEnrollment?.batch_name ?? 'Unassigned Batch';

  return {
    ...student,
    id: student_id,
    student_id,
    student_name,
    email,
    phone,
    father_name: student.father_name || null,
    mother_name: student.mother_name || null,
    current_course,
    current_batch,
    status: (student.status || 'active').toLowerCase(),
    is_registered: student.is_registered !== false
  };
}
```

---

## ⚡ Performance Regression & Benchmark Assertions (Rule N5)

- **Target Benchmark**: In-memory filtering of 1,000 student records using `queryEngine.js` (`aq`) executes in **`< 3ms`**.
- **Cache Hit Ratio Assertion**: 100% cache hit ratio on repeated filter changes (no network requests made when user toggles batch/course/search).

---

## 🧪 Phase 1 Verification Plan

### Automated Verification
- Verify `useStudentsQuery` initializes with `queryKeys.student.list(EMPTY_FILTER)`.
- Confirm search and dropdown filter state changes do NOT trigger TanStack Query refetches in DevTools network tab.

### Empirical Data Verification
1. **Search Verification**:
   - Type student name, student ID prefix, or email -> verify instant in-memory filtering.
2. **Filter Dropdown Verification**:
   - Select batch or course filter -> verify in-memory filtering isolates matching student rows.
3. **Completion Handoff**:
   - Once Phase 1 is executed and verified, hand off to Phase 2 (Mobile UI redesign).
