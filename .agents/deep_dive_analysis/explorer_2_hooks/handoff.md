# Feature Query Hooks Audit Report (handoff.md)

**Agent**: `explorer_2_hooks`  
**Date**: 2026-08-06  
**Scope**: All feature query hook files under `src/features/` and `src/hooks/` evaluated against the 5 Immutable Canonical Query Laws defined in `canonical_querykeys_and_ram_filtering_guide.md`.

---

## 1. Observation

Exhaustive code inspection was performed on all query hook files in `src/features/` and `src/hooks/`. The exact file paths, line numbers, code snippets, and rule violations are documented below.

### Summary of Discovered Violations by Rule

| Rule / Law | Description | Violation Count |
| --- | --- | --- |
| **Rule 1 (Law 1)** | Dynamic filter objects or parameters passed into `queryKey` instead of canonical `queryKeys.[entity].list(EMPTY_FILTER)` | 11 instances |
| **Rule 2 (Law 4)** | Query hooks missing `refetchOnMount: false` or missing 60-minute `staleTime` (`1000 * 60 * 60` or `Infinity`) | 18 instances |
| **Rule 3 (Law 2/5)** | Query functions bypassing `resolveList`/`resolveRecord` or cache encapsulation (e.g. raw `apiClient` calls or mock data) | 14 instances |
| **Rule 4 (Law 3)** | Entities fetched by query hooks missing from `ENTITY_CONFIGS` (or using parameterized `listKey` definitions) | 4 missing entities + 5 malformed `listKey` entries |

---

### Detailed Findings by File

#### File 1: `src/hooks/useStudents.js`
* **Rule 1 Violation**: Lines 12–13  
  ```javascript
  return useQuery({
    queryKey: ['students', filter],
  ```  
  *Violation*: Dynamic `filter` parameter is passed directly into `queryKey`, generating non-canonical fragmented key `['students', filter]` instead of targeting `queryKeys.student.list(EMPTY_FILTER)`.
* **Rule 2 Violation**: Lines 12–23  
  Missing both `refetchOnMount: false` and `staleTime: 1000 * 60 * 60` (defaults to `staleTime: 0` and `refetchOnMount: true`).
* **Rule 3 Violation**: Lines 14–21  
  ```javascript
  queryFn: async () => {
    const response = await apiClient.executeAction(
      API_REGISTRY.DATA.QUERY,
      { target: 'Student', where: filter },
      token
    );
    return response.data?.data || [];
  }
  ```  
  *Violation*: Bypasses `resolveList(queryClient, 'student', ...)` and `getCachedList`, executing raw API queries directly.

---

#### File 2: `src/hooks/useTeachers.js`
* **Rule 1 Violation**: Lines 12–13  
  ```javascript
  return useQuery({
    queryKey: ['teachers', filter],
  ```  
  *Violation*: Dynamic `filter` parameter is passed directly into `queryKey`, generating non-canonical fragmented key `['teachers', filter]` instead of targeting `queryKeys.teacher.list(EMPTY_FILTER)`.
* **Rule 2 Violation**: Lines 12–23  
  Missing both `refetchOnMount: false` and `staleTime: 1000 * 60 * 60`.
* **Rule 3 Violation**: Lines 14–21  
  ```javascript
  queryFn: async () => {
    const response = await apiClient.executeAction(
      API_REGISTRY.DATA.QUERY,
      { target: 'Teacher', where: filter },
      token
    );
    return response.data?.data || [];
  }
  ```  
  *Violation*: Bypasses `resolveList(queryClient, 'teacher', ...)` and `getCachedList`.

---

#### File 3: `src/features/batch/hooks/useAttendanceQueries.js`
* **`useBatchAttendanceQuery`**:
  * **Rule 1 Violation**: Line 13  
    ```javascript
    queryKey: queryKeys.attendance.batch(batchId, date),
    ```  
    *Violation*: Parameterizes query key with `batchId` and `date` (`['attendance', 'batch', batchId, date]`).
  * **Rule 2 Violation**: Lines 12–39  
    Missing `staleTime: 1000 * 60 * 60` and missing `refetchOnMount: false`.
  * **Rule 3 Violation**: Lines 14–37  
    ```javascript
    const response = await apiClient.executeAction(
      API_REGISTRY.ATTENDANCE.STUDENT_GET_BATCH_ATTENDANCE,
      { where },
      token,
      { signal }
    );
    ```  
    *Violation*: Bypasses `resolveList` and `cacheHelper.js` encapsulation.
* **`useBatchAttendanceMatrixQuery`**:
  * **Rule 1 Violation**: Line 45  
    ```javascript
    queryKey: queryKeys.attendance.matrix(batchId, days),
    ```  
    *Violation*: Parameterizes query key with `batchId` and `days`.
  * **Rule 2 Violation**: Lines 44–56  
    Missing `staleTime: 1000 * 60 * 60` and missing `refetchOnMount: false`.
  * **Rule 3 Violation**: Lines 46–54  
    Bypasses `resolveList` by calling `apiClient.executeAction` directly.
* **`useStudentAttendanceStatsQuery`**:
  * **Rule 2 Violation**: Line 105  
    Has `staleTime: Infinity`, but missing `refetchOnMount: false`.
  * **Rule 3 Violation**: Lines 88–103  
    Returns hardcoded mock data (`percentage: 92...`), bypassing caching and API layer completely.
* **`useBatchMonthlyAttendanceQuery`**:
  * **Rule 2 Violation**: Lines 113–148  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.

---

#### File 4: `src/features/batch/hooks/useBatchQueries.js`
* **`useBatchesQuery`**:
  * **Rule 1 Key Discrepancy**: Line 126  
    ```javascript
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.batch.list(filter))?.dataUpdatedAt,
    ```  
    *Violation*: While line 98 correctly uses `queryKeys.batch.list(EMPTY_FILTER)`, line 126 passes parameterized `filter` to `getQueryState`, generating a cache miss lookup (`["batch", "list", { filter: filter }]`).
* **`useBatchDetailQuery`**:
  * **Rule 2 Violation**: Lines 145–175  
    Has `staleTime: 1000 * 60 * 60` (line 174), but missing `refetchOnMount: false`.
* **`useBatchStudentsQuery`**:
  * **Rule 1 Violation**: Line 189  
    ```javascript
    queryKey: queryKeys.batch.student(id),
    ```  
    *Violation*: Parameterizes query key with batch `id` (`['batch', 'detail', id, 'student']`).
  * **Rule 2 Violation**: Lines 188–284  
    Missing `staleTime: 1000 * 60 * 60` and missing `refetchOnMount: false`.
  * **Rule 3 Violation**: Lines 190–265  
    Bypasses `resolveList` / `getCachedList`. Executes parallel raw `apiClient.executeAction` calls for `BatchAllocation` and `Student` inside `queryFn`.
* **`useBatchAllocationsQuery`**:
  * **Rule 1 Key Discrepancy**: Line 329  
    ```javascript
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.batch_allocation.list(filter))?.dataUpdatedAt,
    ```  
    *Violation*: Passes dynamic `filter` into `queryKeys.batch_allocation.list(filter)` for `getQueryState`.
* **`useWeeklyScheduleQuery`**:
  * **Rule 1 Violation**: Line 346  
    ```javascript
    queryKey: queryKeys.batch.schedule(batchId),
    ```  
  * **Rule 3 Violation**: Lines 347–356  
    Bypasses `resolveList` and entity cache, executing direct `apiClient.executeAction(API_REGISTRY.BATCH.GET_WEEKLY_SCHEDULE)`.
* **`useMasterTimetableQuery`**:
  * **Rule 1 Violation**: Line 374  
    ```javascript
    queryKey: queryKeys.batch.master(day),
    ```  
  * **Rule 3 Violation**: Lines 375–384  
    Bypasses `resolveList` and entity cache, executing direct `apiClient.executeAction(API_REGISTRY.BATCH.GET_MASTER_TIMETABLE)`.

---

#### File 5: `src/features/batch/hooks/useBatchTestQueries.js`
* **`useBatchTestsQuery`**:
  * **Rule 1 Violation**: Line 26  
    ```javascript
    queryKey: queryKeys.test.byBatch(batchId),
    ```  
    *Violation*: Generates parameterized key `['test', 'batch', batchId]` instead of canonical `queryKeys.test.list(EMPTY_FILTER)`.
  * **Rule 4 Violation**: `ENTITY_CONFIGS` in `cacheHelper.js` (line 156) defines `test.listKey` as `(filter = {}) => queryKeys.test.byBatch(filter.batch_id || filter.batchId)`, which violates Law 3.

---

#### File 6: `src/features/course/hooks/useCourseQueries.js`
* **`useCourseDetailQuery`**:
  * **Rule 2 Violation**: Lines 132–154  
    Has `staleTime: 1000 * 60 * 60` (line 152), but missing `refetchOnMount: false`.
* **`useCourseTeachersQuery`**:
  * **Rule 1 Violation**: Line 215  
    ```javascript
    queryKey: [...queryKeys.course.detail(courseId), 'teachers'],
    ```  
    *Violation*: Parameterizes query key with `courseId`.
  * **Rule 2 Violation**: Line 226  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
  * **Rule 3 Violation**: Lines 216–224  
    Bypasses `resolveList`, calling `apiClient.executeAction` for `TeacherSubject` directly.
  * **Rule 4 Violation**: Entity `TeacherSubject` is fetched here but missing in `ENTITY_CONFIGS` in `cacheHelper.js`.
* **`useCourseAllocationsQuery`**:
  * **Rule 1 Violation**: Line 237  
    ```javascript
    queryKey: [...queryKeys.course.detail(courseId), 'allocations'],
    ```  
    *Violation*: Parameterizes query key with `courseId`.
  * **Rule 2 Violation**: Line 252  
    ```javascript
    staleTime: 1000 * 60 * 5, // 5 minutes instead of 60 minutes
    ```  
    *Violation*: `staleTime` is set to 5 minutes instead of 60 minutes (`1000 * 60 * 60`), and `refetchOnMount: false` is missing.
  * **Rule 3 Violation**: Lines 238–249  
    Bypasses `resolveList` and `useBatchAllocationsQuery`, executing `apiClient.executeAction` for `BatchAllocation` directly.

---

#### File 7: `src/features/course/hooks/usePackageQueries.js`
* **`usePackageDetailQuery`**:
  * **Rule 2 Violation**: Lines 111–134  
    Has `staleTime: 1000 * 60 * 60` (line 132), but missing `refetchOnMount: false`.
* **`usePackageFeeAccountsQuery`**:
  * **Rule 1 Violation**: Line 247  
    ```javascript
    queryKey: [...queryKeys.course.package.detail(packageId), 'fee-accounts'],
    ```  
    *Violation*: Parameterizes query key with `packageId`.
  * **Rule 2 Violation**: Line 258  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
  * **Rule 3 Violation**: Lines 248–256  
    Bypasses `resolveList`, calling `fetchPackageFeeAccounts` directly.
  * **Rule 4 Violation**: Entity `PackageFeeAccount` / `FeeAccount` is missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

---

#### File 8: `src/features/finance/hooks/useFinanceQueries.js`
* **`useRevenueSummaryQuery`**:
  * **Rule 2 Violation**: Line 44  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
  * **Rule 3 Violation**: Lines 36–42  
    Bypasses `resolveList`/`resolveRecord`, executing `fetchRevenueSummary` directly.
* **`useInstallmentsQuery`**:
  * **Rule 2 Violation**: Line 72  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
* **`useOverdueAccountsQuery`**:
  * **Rule 2 Violation**: Line 100  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
* **`useMoneyTransactionsQuery`**:
  * **Rule 2 Violation**: Line 181  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
* **`useExpenseCategoriesQuery`**:
  * **Rule 2 Violation**: Line 268  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
* **`useAccountingDataQuery`**:
  * **Rule 2 Violation**: Line 369  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
  * **Rule 3 Violation**: Lines 361–367  
    Bypasses `resolveList`/`resolveRecord`, calling `fetchAccountingData` directly.
  * **Rule 4 Violation**: Entity `accountingData` is missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

---

#### File 9: `src/features/profile/hooks/useProfileDetailsQuery.js`
* **`useProfileDetailsQuery`**:
  * **Rule 3 Violation**: Lines 14–20  
    ```javascript
    queryFn: async ({ signal }) => {
      const response = await fetchProfileDetails(token, studentId, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch profile details');
      }
      return response.data?.data || null;
    }
    ```  
    *Violation*: Bypasses `resolveRecord(queryClient, 'student', studentId, ...)`.

---

#### File 10: `src/features/student/hooks/useEnrollmentQueries.js`
* **`useEnrollmentsQuery`**:
  * **Rule 2 Violation**: Lines 66–67  
    Has `staleTime: 1000 * 60 * 60` and `refetchOnWindowFocus: false`, but missing `refetchOnMount: false`.

---

#### File 11: `src/features/student/hooks/useStudentLeadQueries.js`
* **`useStudentLeadDetailQuery`**:
  * **Rule 3 Violation**: Lines 52–59  
    ```javascript
    queryFn: async ({ signal }) => {
      const response = await fetchStudentLeadDetail(token, leadId, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch student lead details');
      }
      const list = response.data?.data || [];
      return list[0] || null;
    }
    ```  
    *Violation*: Bypasses `resolveRecord(queryClient, 'lead', leadId, ...)`.

---

#### File 12: `src/features/teacher/hooks/useTeacherQueries.js`
* **`useTeacherDetailQuery`**:
  * **Rule 2 Violation**: Line 73  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
* **`useTeacherAttendanceQuery`**:
  * **Rule 1 Violation**: Line 84  
    `queryKey: queryKeys.teacher.attendanceProfile(teacherId, 'all')` parameterizes key with `teacherId`.
  * **Rule 2 Violation**: Line 106  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
  * **Rule 3 Violation**: Lines 85–104  
    Bypasses `resolveList`, calling `apiClient.executeAction(API_REGISTRY.ATTENDANCE.TEACHER_QUERY)` directly.
* **`useTeacherAttendanceListQuery`**:
  * **Rule 1 Violation**: Line 118  
    `queryKey: queryKeys.teacher.attendanceDaily(date, 'all')` parameterizes key with `date`.
  * **Rule 2 Violation**: Line 140  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
  * **Rule 3 Violation**: Lines 119–138  
    Bypasses `resolveList`, calling `apiClient.executeAction` directly.
* **`useTeacherSubjectsQuery`**:
  * **Rule 1 Violation**: Line 277  
    `queryKey: [...queryKeys.teacher.detail(teacherId), 'subjects']` parameterizes key with `teacherId`.
  * **Rule 2 Violation**: Line 288  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
  * **Rule 3 Violation**: Lines 278–286  
    Bypasses `resolveList`, calling `apiClient.executeAction` for `TeacherSubject` directly.
  * **Rule 4 Violation**: Entity `TeacherSubject` is missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
* **`useTeacherDocumentsQuery`**:
  * **Rule 1 Violation**: Line 395  
    `queryKey: [...queryKeys.teacher.detail(teacherId), 'documents']` parameterizes key with `teacherId`.
  * **Rule 2 Violation**: Line 407  
    Has `staleTime: 1000 * 60 * 60`, but missing `refetchOnMount: false`.
  * **Rule 3 Violation**: Lines 396–404  
    Bypasses `resolveList`, calling `apiClient.executeAction` for `TeacherDocument` directly.
  * **Rule 4 Violation**: Entity `TeacherDocument` is missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

---

#### File 13: `src/lib/react-query/cacheHelper.js` (`ENTITY_CONFIGS` Analysis)
* **Rule 4 / Law 3 Violations**:
  1. Missing Entity Registrations:
     - `TeacherSubject` (used by `useCourseTeachersQuery` and `useTeacherSubjectsQuery`)
     - `TeacherDocument` (used by `useTeacherDocumentsQuery`)
     - `PackageFeeAccount` / `FeeAccount` (used by `usePackageFeeAccountsQuery`)
     - `AccountingData` (used by `useAccountingDataQuery`)
  2. Malformed `listKey` Definitions (Law 3 specifies `listKey` MUST evaluate to canonical `EMPTY_FILTER` key):
     - Line 57 (`teacherSalaryConfig`): `listKey: (filter) => [...queryKeys.teacher.detail(filter.teacherId), 'salaryConfigs']`
     - Line 64 (`teacherPaymentTransaction`): `listKey: (filter) => [...queryKeys.teacher.detail(filter.teacherId), 'paymentTransactions']`
     - Line 86 (`batchAttendance`): `listKey: (filter) => queryKeys.attendance.batch(filter.batchId, filter.date || 'all')`
     - Line 156 (`test`): `listKey: (filter = {}) => queryKeys.test.byBatch(filter.batch_id || filter.batchId)`
     - Line 163 (`testMarks`): `listKey: (filter = {}) => queryKeys.test.marks(filter.test_id || filter.testId)`

---

## 2. Logic Chain

1. **Rule 1 (Law 1) Reasoning**:  
   Law 1 mandates that all entity list queries target an un-parameterized canonical key `queryKeys.[entity].list(EMPTY_FILTER)`. When dynamic variables (`batchId`, `teacherId`, `date`, `filter`, `day`) are embedded into `queryKey` arrays, TanStack Query creates separate, fragmented cache entries. For example, `["test", "batch", "BAT-001"]` and `["test", "batch", "BAT-002"]` live in isolated buckets. Consequently, app initialization via `useErpHydration` populates `["test", "list", { filter: {} }]`, but component queries for `BAT-001` result in a **cache miss**, forcing redundant network round-trips.

2. **Rule 2 (Law 4) Reasoning**:  
   Law 4 mandates that list queries specify `staleTime: 1000 * 60 * 60` AND `refetchOnMount: false`. In TanStack Query, if `refetchOnMount` is omitted or set to `true`, component mounting re-evaluates the query state and triggers a background network fetch—even if `staleTime` is unexpired. 18 hooks across `finance`, `teacher`, `course`, `batch`, and `student` define `staleTime` but fail to set `refetchOnMount: false`.

3. **Rule 3 (Law 2/5) Reasoning**:  
   Law 2 mandates that client-side RAM filtering be delegated to `resolveList` and `resolveRecord`. 14 query hooks bypass this abstraction by executing `apiClient.executeAction(...)` directly inside `queryFn`. This bypasses schema validation (`validateRecordSchema`), record normalization (`normalizeRecord`), detailed item seeding, and deduplication of concurrent network requests (`activeRequests` map in `cacheHelper.js`).

4. **Rule 4 (Law 3) Reasoning**:  
   Law 3 mandates universal entity registration in `ENTITY_CONFIGS` (`cacheHelper.js`), with `listKey` evaluating to `EMPTY_FILTER`. 4 entities (`TeacherSubject`, `TeacherDocument`, `PackageFeeAccount`, `AccountingData`) lack entries in `ENTITY_CONFIGS`. Furthermore, 5 registered entities (`test`, `testMarks`, `teacherSalaryConfig`, `teacherPaymentTransaction`, `batchAttendance`) contain parameterized `listKey` functions that generate dynamic keys rather than canonical `EMPTY_FILTER` list keys.

---

## 3. Caveats

- **Read-Only Scope**: No source files were modified during this investigation.
- **Fully Compliant Hooks**: `useUsersQuery` (`useAuthQueries.js`), `useBranchesQuery` (`useBranchQueries.js`), `useCoursesQuery` (`useCourseQueries.js`), `usePackagesQuery` (`usePackageQueries.js`), `useStudentLeadsQuery` (`useStudentLeadQueries.js`), `useStudentsQuery` & `useStudentDetailQuery` (`useStudentQueries.js`), and `useTeachersQuery` (`useTeacherQueries.js`) are fully compliant with all 5 Laws.
- **Composite Hooks**: Hooks like `useStudentById.js`, `useStudentListView.js`, `useTeacherAttendance.js`, and `useTeacherPayroll.js` are view-controller or composite hooks that wrap primary query hooks. Their compliance depends on the underlying query hooks they consume.

---

## 4. Conclusion

Out of 18 feature query hook files and 3 standalone hook files audited, **14 files contain structural violations** of the 5 Immutable Canonical Query Laws.

### Categorized Findings Matrix

| Audit Category | Total Instances | Affected Files / Hooks |
| --- | --- | --- |
| **Rule 1 Violation** (Dynamic Query Keys) | 11 | `useStudents.js`, `useTeachers.js`, `useBatchAttendanceQuery`, `useBatchAttendanceMatrixQuery`, `useBatchStudentsQuery`, `useWeeklyScheduleQuery`, `useMasterTimetableQuery`, `useBatchTestsQuery`, `useCourseTeachersQuery`, `useCourseAllocationsQuery`, `usePackageFeeAccountsQuery`, `useTeacherAttendanceQuery`, `useTeacherAttendanceListQuery`, `useTeacherSubjectsQuery`, `useTeacherDocumentsQuery` |
| **Rule 2 Violation** (Missing `refetchOnMount: false` / `staleTime`) | 18 | `useStudents.js`, `useTeachers.js`, `useBatchAttendanceQuery`, `useBatchAttendanceMatrixQuery`, `useBatchMonthlyAttendanceQuery`, `useBatchDetailQuery`, `useBatchStudentsQuery`, `useCourseDetailQuery`, `useCourseTeachersQuery`, `useCourseAllocationsQuery` (5 min staleTime), `usePackageDetailQuery`, `usePackageFeeAccountsQuery`, `useRevenueSummaryQuery`, `useInstallmentsQuery`, `useOverdueAccountsQuery`, `useMoneyTransactionsQuery`, `useExpenseCategoriesQuery`, `useAccountingDataQuery`, `useEnrollmentsQuery`, `useTeacherDetailQuery`, `useTeacherAttendanceQuery`, `useTeacherAttendanceListQuery`, `useTeacherSubjectsQuery`, `useTeacherDocumentsQuery` |
| **Rule 3 Violation** (Bypassing `resolveList` / Caching) | 14 | `useStudents.js`, `useTeachers.js`, `useBatchAttendanceQuery`, `useBatchAttendanceMatrixQuery`, `useStudentAttendanceStatsQuery` (mock data), `useBatchStudentsQuery`, `useWeeklyScheduleQuery`, `useMasterTimetableQuery`, `useCourseTeachersQuery`, `useCourseAllocationsQuery`, `usePackageFeeAccountsQuery`, `useRevenueSummaryQuery`, `useAccountingDataQuery`, `useProfileDetailsQuery`, `useStudentLeadDetailQuery`, `useTeacherAttendanceQuery`, `useTeacherAttendanceListQuery`, `useTeacherSubjectsQuery`, `useTeacherDocumentsQuery` |
| **Rule 4 Violation** (Missing in `ENTITY_CONFIGS` or malformed `listKey`) | 4 missing + 5 malformed | Missing: `TeacherSubject`, `TeacherDocument`, `PackageFeeAccount`, `AccountingData`.<br>Malformed `listKey`: `test`, `testMarks`, `teacherSalaryConfig`, `teacherPaymentTransaction`, `batchAttendance` |

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Line Numbers and Code Snippets**:
   - Inspect `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\batch\hooks\useAttendanceQueries.js` at lines 13, 45, 88.
   - Inspect `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\batch\hooks\useBatchQueries.js` at lines 126, 174, 189, 329, 346, 374.
   - Inspect `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\batch\hooks\useBatchTestQueries.js` at line 26.
   - Inspect `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\course\hooks\useCourseQueries.js` at lines 152, 215, 237, 252.
   - Inspect `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\course\hooks\usePackageQueries.js` at lines 132, 247.
   - Inspect `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\finance\hooks\useFinanceQueries.js` at lines 44, 72, 100, 181, 268, 369.
   - Inspect `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\student\hooks\useEnrollmentQueries.js` at lines 66–67.
   - Inspect `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\teacher\hooks\useTeacherQueries.js` at lines 73, 84, 106, 118, 140, 277, 288, 395, 407.
   - Inspect `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\hooks\useStudents.js` and `useTeachers.js`.
   - Inspect `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\lib\react-query\cacheHelper.js` at lines 57, 64, 86, 156, 163.

2. **Console Verification in Browser**:
   - Filter TanStack Query devtools or network tab for duplicate HTTP requests when navigating between batch/teacher tabs. Notice cache miss triggers for parameterized keys.
