# Handoff & Audit Report — Canonical Query Keys & RAM Filtering Architecture

**Agent**: Project Orchestrator  
**Working Directory**: `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\.agents\orchestrator`  
**Target Reference Guide**: `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\.gemini\docs\canonical_querykeys_and_ram_filtering_guide.md`  
**Timestamp**: 2026-08-06T02:50:00+05:30  

---

## Executive Summary

A comprehensive, repository-wide, read-only architectural audit was conducted across all core infrastructure files (`src/lib/react-query/`), feature query hooks (`src/features/**/hooks/`), standalone hooks (`src/hooks/`), UI pages (`src/pages/`), UI components (`src/components/`), and modal views. Zero source code modifications were performed.

### Key Audit Metrics
- **Rule 1 Violations (Dynamic Filter Objects in `queryKeys`)**: 23 instances
- **Rule 2 Violations (Missing `refetchOnMount: false` or 60-min `staleTime`)**: 26 instances
- **Rule 3 Violations (Raw inline `useQuery` or Bypassing `resolveList`)**: 18 instances
- **Rule 4 Violations (Entities Missing in `ENTITY_CONFIGS` in `cacheHelper.js`)**: 16 missing entities + 5 malformed `listKey` definitions

---

## 1. Comprehensive Audit Findings by Category

### Item 1: Entities Missing in `ENTITY_CONFIGS` (`cacheHelper.js`) (Rule 4)
Law 3 specifies: *All entities used across the ERP system MUST be registered in `ENTITY_CONFIGS` in `cacheHelper.js`, and their `listKey` MUST evaluate to canonical `queryKeys.[entity].list(EMPTY_FILTER)`*.

Currently, `ENTITY_CONFIGS` (`src/lib/react-query/cacheHelper.js` L19–168) registers only **21 entity types**:
`student`, `teacher`, `batch`, `course`, `package`, `teacherSalaryConfig`, `teacherPaymentTransaction`, `courseType`, `batchAllocation`, `batchAttendance`, `enrollment`, `user`, `lead`, `branch`, `staff`, `installment`, `overdue`, `transaction`, `category`, `test`, `testMarks`.

#### 16 Missing Entity Types Identified:
1. **`packageItem`**
   - **File & Line**: `src/hooks/useErpHydration.js` L55, `src/lib/react-query/hydrate.js` L205, `Schema/Academic/PackageItem.json`
   - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
2. **`packagePerk`**
   - **File & Line**: `src/hooks/useErpHydration.js` L56, `src/lib/react-query/hydrate.js` L212, `Schema/Academic/PackagePerk.json`
   - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
3. **`teacherSubject`**
   - **File & Line**: `src/hooks/useErpHydration.js` L59, `src/features/teacher/hooks/useTeacherQueries.js` L278, `Schema/Staff/TeacherSubject.json`
   - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
4. **`studentAttendance`**
   - **File & Line**: `src/features/batch/hooks/useAttendanceQueries.js`, `Schema/Attendance/StudentAttendance.json`
   - **Violation**: Missing from `ENTITY_CONFIGS` (only `batchAttendance` registered).
5. **`teacherAttendance`**
   - **File & Line**: `src/features/teacher/hooks/useTeacherQueries.js` L84, L118, `Schema/Attendance/TeacherAttendance.json`
   - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
6. **`payment`**
   - **File & Line**: `src/lib/react-query/queryKeys.js` L117, `src/features/finance/hooks/useFinanceQueries.js`, `Schema/Finance/Payment.json`
   - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
7. **`studentFeeAccount` / `feeAccount`**
   - **File & Line**: `src/lib/react-query/hydrate.js` L294, L449, L461, `Schema/Finance/StudentFeeAccount.json`
   - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
8. **`feeAdjustment`**
   - **File & Line**: `Schema/Finance/FeeAdjustment.json`
   - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
9. **`feePlan`**
   - **File & Line**: `Schema/Finance/FeePlan.json`
   - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
10. **`promoCode`**
    - **File & Line**: `Schema/Core/PromoCode.json`
    - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
11. **`teacherDocument`**
    - **File & Line**: `src/features/teacher/hooks/useTeacherQueries.js` L396, `Schema/Staff/TeacherDocument.json`
    - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
12. **`address`**
    - **File & Line**: `src/lib/react-query/hydrate.js` L384, L394, `Schema/Students/Address.json`
    - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
13. **`contactInfo`**
    - **File & Line**: `src/lib/react-query/hydrate.js` L384, L395, `Schema/Students/ContactInfo.json`
    - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
14. **`education`**
    - **File & Line**: `src/lib/react-query/hydrate.js` L384, L396, `Schema/Students/Education.json`
    - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
15. **`testPaper`**
    - **File & Line**: `Schema/Test/TestPaper.json`
    - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.
16. **`session`**
    - **File & Line**: `Schema/Auth/Session.json`
    - **Violation**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

#### 5 Malformed `listKey` Definitions in `cacheHelper.js`:
- `teacherSalaryConfig` (`cacheHelper.js` L57): `listKey: (filter) => [...queryKeys.teacher.detail(filter.teacherId), 'salaryConfigs']`
- `teacherPaymentTransaction` (`cacheHelper.js` L64): `listKey: (filter) => [...queryKeys.teacher.detail(filter.teacherId), 'paymentTransactions']`
- `batchAttendance` (`cacheHelper.js` L86): `listKey: (filter) => queryKeys.attendance.batch(filter.batchId, filter.date || 'all')`
- `test` (`cacheHelper.js` L156): `listKey: (filter = {}) => queryKeys.test.byBatch(filter.batch_id || filter.batchId)`
- `testMarks` (`cacheHelper.js` L163): `listKey: (filter = {}) => queryKeys.test.marks(filter.test_id || filter.testId)`

*Violation*: Taking mandatory dynamic parameters in `listKey` breaks uniform canonical cache lookup across `getCachedList` and `resolveList`.

---

### Item 2: Dynamic Filter Objects Passed into `queryKeys` (Rule 1)
Law 1 specifies: *All list queries MUST target the un-parameterized canonical key `queryKeys.[entity].list(EMPTY_FILTER)` => `[entity, "list", { filter: {} }]`. NEVER pass dynamic filter objects or parameters into `queryKey` arrays!*

#### Instances Identified (23 Total):

1. **`src/lib/react-query/queryKeys.js`**
   - **L116**: `overdue: (filter = EMPTY_FILTER) => ['finance', 'overdue', { filter }]` (Allows dynamic filter parameterization)
   - **L117**: `payments: (filter = EMPTY_FILTER) => ['finance', 'payments', { filter }]` (Allows dynamic filter parameterization)
   - **L49, L58, L62**: `course.type.list()`, `packageItem.list()`, `packagePerk.list()` return `['course-type', 'list']`, etc., missing canonical `{ filter: {} }` tuple element.

2. **`src/hooks/useStudents.js`**
   - **L12–13**: `queryKey: ['students', filter]` (Passes dynamic `filter` into queryKey array)

3. **`src/hooks/useTeachers.js`**
   - **L12–13**: `queryKey: ['teachers', filter]` (Passes dynamic `filter` into queryKey array)

4. **`src/features/batch/hooks/useAttendanceQueries.js`**
   - **L13**: `queryKey: queryKeys.attendance.batch(batchId, date)` (Parameterizes key with `batchId` and `date`)
   - **L45**: `queryKey: queryKeys.attendance.matrix(batchId, days)` (Parameterizes key with `batchId` and `days`)

5. **`src/features/batch/hooks/useBatchQueries.js`**
   - **L126**: `initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.batch.list(filter))?.dataUpdatedAt` (Passes dynamic `filter` to `getQueryState`)
   - **L189**: `queryKey: queryKeys.batch.student(id)` (Parameterizes key with batch `id`)
   - **L329**: `queryClient.getQueryState(queryKeys.batch_allocation.list(filter))` (Passes dynamic `filter` to `getQueryState`)
   - **L346**: `queryKey: queryKeys.batch.schedule(batchId)` (Parameterizes key with `batchId`)
   - **L374**: `queryKey: queryKeys.batch.master(day)` (Parameterizes key with `day`)

6. **`src/features/batch/hooks/useBatchTestQueries.js`**
   - **L26**: `queryKey: queryKeys.test.byBatch(batchId)` (Parameterizes key with `batchId`)

7. **`src/features/course/hooks/useCourseQueries.js`**
   - **L215**: `queryKey: [...queryKeys.course.detail(courseId), 'teachers']` (Parameterizes key with `courseId`)
   - **L237**: `queryKey: [...queryKeys.course.detail(courseId), 'allocations']` (Parameterizes key with `courseId`)

8. **`src/features/course/hooks/usePackageQueries.js`**
   - **L247**: `queryKey: [...queryKeys.course.package.detail(packageId), 'fee-accounts']` (Parameterizes key with `packageId`)

9. **`src/features/teacher/hooks/useTeacherQueries.js`**
   - **L84**: `queryKey: queryKeys.teacher.attendanceProfile(teacherId, 'all')` (Parameterizes key with `teacherId`)
   - **L118**: `queryKey: queryKeys.teacher.attendanceDaily(date, 'all')` (Parameterizes key with `date`)
   - **L277**: `queryKey: [...queryKeys.teacher.detail(teacherId), 'subjects']` (Parameterizes key with `teacherId`)
   - **L395**: `queryKey: [...queryKeys.teacher.detail(teacherId), 'documents']` (Parameterizes key with `teacherId`)

10. **`src/features/finance/transactions/components/MoneyTransactionForm.jsx`**
    - **L30–34**: Passes `queryParams = { status: 'active' }` into `useUsersQuery`, `useStudentsQuery`, `useTeachersQuery`, `useStaffMembersQuery` inside form modal.

11. **`src/features/course/CourseDetails.jsx`**
    - **L85**: Passes `{ course_id: id }` into `useBatchesQuery` in page view.

12. **`src/features/student/components/profile/StudentFeeTab.jsx`**
    - **L20–23**: Passes `{ student_id: studentId }` into `useEnrollmentsQuery` in profile tab.

13. **`src/features/teacher/components/profile/TeacherAssignedClasses.jsx`**
    - **L11–14**: Passes `{ teacher_id: teacherId }` into `useBatchesQuery` in profile tab.

14. **`src/features/batch/components/profile/BatchStudentRoster.jsx`**
    - **L18**: Passes dynamic text input search parameter `searchQuery` into `useBatchStudentsQuery(batchId, searchQuery)`.

15. **`src/pages/admin/Branches.jsx`**
    - **L164, L182**: Calls `queryClient.invalidateQueries({ queryKey: ['branches'] })` using non-canonical raw string array.

16. **`src/pages/admin/Students2.jsx` & `src/pages/admin/Teachers2.jsx`**
    - **`Students2.jsx` L36, L101**: Uses `setQueryData(['students', {}])` and invalidates `['students']`.
    - **`Teachers2.jsx` L33, L92**: Uses `setQueryData(['teachers', {}])` and invalidates `['teachers']`.

17. **`src/pages/admin/ResolveDeleteConflictView.jsx` & `src/components/ui/ResolveDeleteConflict.jsx`**
    - **`ResolveDeleteConflictView.jsx` L139–193, L390**: Crawls cache via `getQueriesData` with raw string keys `['student', 'list']`, `['course', 'list']`, etc., and calls un-parameterized `queryClient.invalidateQueries()`.
    - **`ResolveDeleteConflict.jsx` L92–107, L238**: Crawls cache via `getQueryData` with raw string keys `['enrollment', 'list']`, `['batch', 'list']`, etc.

---

### Item 3: Missing `refetchOnMount: false` or 60-Minute `staleTime` (Rule 2)
Law 4 specifies: *List queries MUST define `staleTime: 1000 * 60 * 60` (60 minutes or `Infinity`) AND `refetchOnMount: false` to prevent component mounting from triggering background refetches.*

#### Infrastructure Defaults Violations:
1. **`src/App.jsx` L10–17**: Global `QueryClient` defaults set `staleTime: 1000 * 60 * 5` (5 minutes instead of 60 minutes) and omit `refetchOnMount: false`.
2. **`src/hooks/useErpHydration.js` L157–159**: Sets `staleTime: Infinity` but omits `refetchOnMount: false`.
3. **`src/lib/react-query/cacheHelper.js` L516–519**: `setQueryDefaults` configures `staleTime: Infinity` but omits `refetchOnMount: false`.

#### Query Hook Violations (23 Files / Hooks Identified):
1. **`src/hooks/useStudents.js` L12–23**: Missing both `refetchOnMount: false` and `staleTime: 60m`.
2. **`src/hooks/useTeachers.js` L12–23**: Missing both `refetchOnMount: false` and `staleTime: 60m`.
3. **`src/features/batch/hooks/useAttendanceQueries.js`**:
   - `useBatchAttendanceQuery` (L12–39): Missing `staleTime: 60m` and `refetchOnMount: false`.
   - `useBatchAttendanceMatrixQuery` (L44–56): Missing `staleTime: 60m` and `refetchOnMount: false`.
   - `useStudentAttendanceStatsQuery` (L105): Missing `refetchOnMount: false`.
   - `useBatchMonthlyAttendanceQuery` (L113–148): Missing `refetchOnMount: false`.
4. **`src/features/batch/hooks/useBatchQueries.js`**:
   - `useBatchDetailQuery` (L145–175): Missing `refetchOnMount: false`.
   - `useBatchStudentsQuery` (L188–284): Missing `staleTime: 60m` and `refetchOnMount: false`.
5. **`src/features/course/hooks/useCourseQueries.js`**:
   - `useCourseDetailQuery` (L132–154): Missing `refetchOnMount: false`.
   - `useCourseTeachersQuery` (L226): Missing `refetchOnMount: false`.
   - `useCourseAllocationsQuery` (L252): Configures `staleTime: 1000 * 60 * 5` (5 min instead of 60 min) and omits `refetchOnMount: false`.
6. **`src/features/course/hooks/usePackageQueries.js`**:
   - `usePackageDetailQuery` (L111–134): Missing `refetchOnMount: false`.
   - `usePackageFeeAccountsQuery` (L258): Missing `refetchOnMount: false`.
7. **`src/features/finance/hooks/useFinanceQueries.js`**:
   - `useRevenueSummaryQuery` (L44): Missing `refetchOnMount: false`.
   - `useInstallmentsQuery` (L72): Missing `refetchOnMount: false`.
   - `useOverdueAccountsQuery` (L100): Missing `refetchOnMount: false`.
   - `useMoneyTransactionsQuery` (L181): Missing `refetchOnMount: false`.
   - `useExpenseCategoriesQuery` (L268): Missing `refetchOnMount: false`.
   - `useAccountingDataQuery` (L369): Missing `refetchOnMount: false`.
8. **`src/features/student/hooks/useEnrollmentQueries.js`**:
   - `useEnrollmentsQuery` (L66–67): Missing `refetchOnMount: false`.
9. **`src/features/teacher/hooks/useTeacherQueries.js`**:
   - `useTeacherDetailQuery` (L73): Missing `refetchOnMount: false`.
   - `useTeacherAttendanceQuery` (L106): Missing `refetchOnMount: false`.
   - `useTeacherAttendanceListQuery` (L140): Missing `refetchOnMount: false`.
   - `useTeacherSubjectsQuery` (L288): Missing `refetchOnMount: false`.
   - `useTeacherDocumentsQuery` (L407): Missing `refetchOnMount: false`.
10. **`src/features/finance/FinanceDashboard.jsx` (L40, L49)**: Missing `staleTime: 60m` and `refetchOnMount: false`.
11. **`src/features/finance/Installments.jsx` (L44)**: Missing `staleTime: 60m` and `refetchOnMount: false`.

---

### Item 4: Raw Inline `useQuery` Hooks & Bypassing `resolveList` (Rule 3)
Law 2 & Law 5 specify: *All filtering MUST be delegated to RAM resolvers (`resolveList` + `getCachedList` + `resolveGenericList`). Zero ad-hoc inline `useQuery` calls in UI views or modals!*

#### Critical Infrastructure Defect in `cacheHelper.js`:
- **Premature Unfiltered Cache Return in `getCachedList` (`cacheHelper.js` L329–334)**:
  Line 331 checks `Array.isArray(cachedList) && cachedList.length > 0`. Because global list contains items, it returns `cachedList` **IMMEDIATELY without applying `filter`**! Step 2 (`resolveGenericList` on L337) is **NEVER reached**.
- **Missing Post-Fetch RAM Filtering in `resolveList` (`cacheHelper.js` L514–544)**:
  After receiving raw network records, `resolveList` returns `data` directly to caller without executing `resolveGenericList(data, filter)`.

#### Raw Inline `useQuery` Calls in UI Views & Modals (4 Files):
1. **`src/features/finance/FinanceDashboard.jsx` (L40–47, L49–56)**:
   Raw inline `useQuery` calls fetching `Enrollment` and `BatchAllocation` directly via `executeAction('data_query', ...)` using ad-hoc keys `['finance', 'dashboard-enrollments']` & `['finance', 'dashboard-allocations']`.
2. **`src/features/finance/Installments.jsx` (L44–51)**:
   Raw inline `useQuery` call fetching `Enrollment` directly via `executeAction` using ad-hoc key `['finance', 'installments-enrollments']`.
3. **`src/pages/admin/Students2.jsx` (L6, L17) & `src/hooks/useStudents.js` (L12–23)**:
   UI page imports custom wrapper hook `useStudents()` executing an inline `useQuery` that bypasses `useStudentsQuery` and `resolveList`.
4. **`src/pages/admin/Teachers2.jsx` (L6, L17) & `src/hooks/useTeachers.js` (L12–23)**:
   UI page imports custom wrapper hook `useTeachers()` executing an inline `useQuery` that bypasses `useTeachersQuery` and `resolveList`.

#### Query Hooks Bypassing `resolveList` / `resolveRecord` (14 Hooks):
1. **`src/hooks/useStudents.js` L14–21**: Executes raw `apiClient.executeAction` for `Student`.
2. **`src/hooks/useTeachers.js` L14–21**: Executes raw `apiClient.executeAction` for `Teacher`.
3. **`src/features/batch/hooks/useAttendanceQueries.js` L14–37**: `useBatchAttendanceQuery` calls `executeAction` directly.
4. **`src/features/batch/hooks/useAttendanceQueries.js` L46–54**: `useBatchAttendanceMatrixQuery` calls `executeAction` directly.
5. **`src/features/batch/hooks/useAttendanceQueries.js` L88–103**: `useStudentAttendanceStatsQuery` returns mock data directly.
6. **`src/features/batch/hooks/useBatchQueries.js` L190–265**: `useBatchStudentsQuery` executes parallel raw `executeAction` calls for `BatchAllocation` & `Student`.
7. **`src/features/batch/hooks/useBatchQueries.js` L347–356**: `useWeeklyScheduleQuery` calls `executeAction` directly.
8. **`src/features/batch/hooks/useBatchQueries.js` L375–384**: `useMasterTimetableQuery` calls `executeAction` directly.
9. **`src/features/course/hooks/useCourseQueries.js` L216–224**: `useCourseTeachersQuery` calls `executeAction` directly.
10. **`src/features/course/hooks/useCourseQueries.js` L238–249**: `useCourseAllocationsQuery` calls `executeAction` directly.
11. **`src/features/course/hooks/usePackageQueries.js` L248–256**: `usePackageFeeAccountsQuery` calls `fetchPackageFeeAccounts` directly.
12. **`src/features/finance/hooks/useFinanceQueries.js` L361–367**: `useAccountingDataQuery` calls `fetchAccountingData` directly.
13. **`src/features/profile/hooks/useProfileDetailsQuery.js` L14–20**: Bypasses `resolveRecord(queryClient, 'student', studentId)`.
14. **`src/features/student/hooks/useStudentLeadQueries.js` L52–59**: Bypasses `resolveRecord(queryClient, 'lead', leadId)`.

---

## 2. Logic Chain

1. **Rule 4 Logic**: `ENTITY_CONFIGS` in `cacheHelper.js` serves as the runtime registry for all cache resolvers (`resolveRecord`, `getCachedRecord`, `getCachedList`, `resolveList`). When a feature attempts to invoke `resolveList(queryClient, 'packageItem', ...)` for any of the 16 unregistered entities, `cacheHelper.js` throws `CacheLayerError: Unsupported entity type: packageItem`.
2. **Rule 1 Logic**: Embedded parameters (`batchId`, `teacherId`, `date`, `filter`) in `queryKey` arrays fragment TanStack Query cache into separate sub-buckets (`["test", "batch", "BAT-001"]`, `["test", "batch", "BAT-002"]`). App pre-hydration via `useErpHydration` populates the canonical bucket `["test", "list", { filter: {} }]`. Dynamic component queries result in immediate **cache misses** and trigger redundant network fetches.
3. **Rule 2 Logic**: Omitting `refetchOnMount: false` causes TanStack Query to treat component mounting as a revalidation trigger, firing background network requests even when data is fresh in memory. Setting `staleTime: 5m` instead of 60 minutes causes early staleness.
4. **Rule 3 Logic**: Bypassing `resolveList` / `resolveRecord` by invoking `apiClient.executeAction` directly skips schema validation, entity normalization, item cache seeding, and concurrent request deduplication (`activeRequests` map in `cacheHelper.js`). Furthermore, the premature return defect in `getCachedList` L331 returns unfiltered global lists directly to UI components.

---

## 3. Caveats

- **Read-Only Audit**: Zero project source files were created, edited, or deleted during this audit.
- **Fully Compliant Hooks**: `useUsersQuery`, `useBranchesQuery`, `useCoursesQuery`, `usePackagesQuery`, `useStudentLeadsQuery`, `useStudentsQuery`, `useStudentDetailQuery`, and `useTeachersQuery` strictly comply with all 5 Laws.

---

## 4. Conclusion & Action Plan Recommendations

The repository contains widespread deviations from the canonical query key and RAM filtering architecture:
- 16 entity types are missing from `ENTITY_CONFIGS`.
- 23 instances pass dynamic parameters into query keys or invalidations.
- 26 instances miss `refetchOnMount: false` or 60-minute `staleTime`.
- 18 instances bypass `resolveList` / `resolveRecord` or use inline `useQuery`.

To bring the codebase into full architectural compliance:
1. Register the 16 missing entity types in `ENTITY_CONFIGS` (`cacheHelper.js`) and standardize all `listKey` functions to return `EMPTY_FILTER` canonical keys.
2. Fix `getCachedList` (L331) and `resolveList` (L514) in `cacheHelper.js` to ensure `resolveGenericList(data, filter)` is executed on cached and network data.
3. Update all feature query hooks to target `queryKeys.[entity].list(EMPTY_FILTER)`, specify `staleTime: 1000 * 60 * 60` & `refetchOnMount: false`, and delegate filtering to RAM resolvers.
4. Replace raw inline `useQuery` calls in `FinanceDashboard.jsx`, `Installments.jsx`, `Students2.jsx`, and `Teachers2.jsx` with canonical feature hooks.

---

## 5. Verification Method

To verify any violation in the codebase:
1. Check `src/lib/react-query/cacheHelper.js` L19–168 for missing entity keys.
2. Search for dynamic filter variables in `queryKey` arrays across `src/features/**/hooks/` and `src/hooks/`.
3. Check `src/App.jsx` L13 and feature hook options for missing `refetchOnMount: false`.
4. Inspect `src/features/finance/FinanceDashboard.jsx` L40 & L49 for raw `useQuery` imports.
