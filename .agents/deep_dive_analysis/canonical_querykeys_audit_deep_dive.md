# 📜 DEEP-DIVE AUDIT REPORT: Canonical QueryKeys & RAM Filtering Architecture Compliance

**Target Architectural Blueprint**: `file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/docs/canonical_querykeys_and_ram_filtering_guide.md`  
**Audit Scope**: Entire Frontend Codebase (`src/`, `src/features/`, `src/hooks/`, `src/pages/`, `src/lib/react-query/`)  
**Audit Verification Status**: 100% Read-Only — Zero file modifications executed on project source files.

---

## Executive Overview

This comprehensive deep-dive report analyzes the entire `dazzling-erp-admin` codebase against the 5 Immutable Canonical Query Laws defined in `canonical_querykeys_and_ram_filtering_guide.md`. The audit identifies every specific violation of canonical query key usage, zero-refetch freshness constraints, in-memory RAM dataset resolution, and entity registrations.

---

## 1. Requirement 1: Parameterized `queryKey` Arrays (Law 1 Violations)

> **Law 1 Mandate**: All entity list queries MUST target the un-parameterized canonical key `queryKeys.[entity].list(EMPTY_FILTER)` => `[entity, "list", { filter: {} }]`. NEVER pass dynamic filter objects into the `queryKey` array!

Passing dynamic filter parameters into `queryKey` creates fragmented, duplicate cache buckets (e.g. `["student", "list", { filter: { branch_id: "BR-01" } }]`). When app initialization seeds the canonical key `["student", "list", { filter: {} }]`, parameterized query keys result in **CACHE MISSES** and trigger unnecessary network requests.

### Identified Violations (`23` Discovered Instances):

| # | File Path & Line Reference | Violating Code Snippet | Root Cause & Remediation |
| :--- | :--- | :--- | :--- |
| **1** | [queryKeys.js:L116–117](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/queryKeys.js#L116-L117) | `overdue: (filter = EMPTY_FILTER) => ['finance', 'overdue', { filter }]`, `payments: (filter = EMPTY_FILTER) => ['finance', 'payments', { filter }]` | Helper functions accept dynamic `filter` object parameter. Change to return static `EMPTY_FILTER`. |
| **2** | [useStudents.js:L12](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useStudents.js#L12) | `queryKey: ['students', filter]` | Parameterizes list key with `filter`. Standardize to `queryKeys.student.list(EMPTY_FILTER)`. |
| **3** | [useTeachers.js:L12](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useTeachers.js#L12) | `queryKey: ['teachers', filter]` | Parameterizes list key with `filter`. Standardize to `queryKeys.teacher.list(EMPTY_FILTER)`. |
| **4** | [useAttendanceQueries.js:L13](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useAttendanceQueries.js#L13) | `queryKey: queryKeys.attendance.batch(batchId, date)` | Parameterizes key with `batchId` and `date`. Standardize to canonical list key. |
| **5** | [useAttendanceQueries.js:L45](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useAttendanceQueries.js#L45) | `queryKey: queryKeys.attendance.matrix(batchId, days)` | Parameterizes key with `batchId` and `days`. Use `EMPTY_FILTER` key and filter in RAM. |
| **6** | [useBatchQueries.js:L126](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js#L126) | `queryClient.getQueryState(queryKeys.batch.list(filter))` | `initialDataUpdatedAt` checks parameterized key state. Change to `queryKeys.batch.list(EMPTY_FILTER)`. |
| **7** | [useBatchQueries.js:L189](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js#L189) | `queryKey: queryKeys.batch.student(id)` | Parameterizes student batch list. |
| **8** | [useBatchQueries.js:L329](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js#L329) | `queryClient.getQueryState(queryKeys.batch_allocation.list(filter))` | Checks parameterized allocation key state. Standardize to `EMPTY_FILTER`. |
| **9** | [useBatchQueries.js:L346](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js#L346) | `queryKey: queryKeys.batch.schedule(batchId)` | Parameterizes schedule key with `batchId`. |
| **10** | [useBatchQueries.js:L374](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js#L374) | `queryKey: queryKeys.batch.master(day)` | Parameterizes timetable key with `day`. |
| **11** | [useBatchTestQueries.js:L26](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchTestQueries.js#L26) | `queryKey: queryKeys.test.byBatch(batchId)` | Parameterizes test query key with `batchId`. |
| **12** | [useCourseQueries.js:L215](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js#L215) | `queryKey: [...queryKeys.course.detail(courseId), 'teachers']` | Parameterizes nested course detail key. |
| **13** | [useCourseQueries.js:L237](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js#L237) | `queryKey: [...queryKeys.course.detail(courseId), 'allocations']` | Parameterizes course allocations key. |
| **14** | [usePackageQueries.js:L247](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js#L247) | `queryKey: [...queryKeys.course.package.detail(packageId), 'fee-accounts']` | Parameterizes package fee accounts key. |
| **15** | [useTeacherQueries.js:L84](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js#L84) | `queryKey: queryKeys.teacher.attendanceProfile(teacherId, 'all')` | Parameterizes teacher profile key. |
| **16** | [useTeacherQueries.js:L118](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js#L118) | `queryKey: queryKeys.teacher.attendanceDaily(date, 'all')` | Parameterizes teacher daily key. |
| **17** | [useTeacherQueries.js:L277](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js#L277) | `queryKey: [...queryKeys.teacher.detail(teacherId), 'subjects']` | Parameterizes teacher subjects key. |
| **18** | [useTeacherQueries.js:L395](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js#L395) | `queryKey: [...queryKeys.teacher.detail(teacherId), 'documents']` | Parameterizes teacher documents key. |
| **19** | [MoneyTransactionForm.jsx:L30–34](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/transactions/components/MoneyTransactionForm.jsx#L30-L34) | Invalidates `['users', 'list']` and `['finance', 'categories', filter]` | Invalidation uses dynamic parameterized key instead of canonical `EMPTY_FILTER` keys. |
| **20** | [CourseDetails.jsx:L85](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/profile/CourseDetails.jsx#L85) | Invalidates `queryKeys.batch.lists()` | Uses custom list container key instead of canonical `EMPTY_FILTER` list key. |
| **21** | [StudentFeeTab.jsx:L20](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/profile/tabs/StudentFeeTab.jsx#L20) | Invalidates `['finance', 'installments', studentId]` | Invalidates parameterized student installment bucket. |
| **22** | [TeacherAssignedClasses.jsx:L11](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/tabs/TeacherAssignedClasses.jsx#L11) | Parameterized query key `['batch', 'teacher', teacherId]` | Bypasses canonical `queryKeys.batch.list(EMPTY_FILTER)` key. |
| **23** | [Branches.jsx:L164, L182](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/Branches.jsx#L164) | Invalidates `queryKeys.branch.all` | Should invalidate canonical list `queryKeys.branch.list(EMPTY_FILTER)`. |

---

## 2. Requirement 2: Query Hooks Missing `refetchOnMount: false` or 60-Minute `staleTime` (Law 4 Violations)

> **Law 4 Mandate**: List queries MUST define `staleTime: 1000 * 60 * 60` (60 minutes) and `refetchOnMount: false` to prevent component mounting from triggering refetches.

### Identified Violations (`26` Discovered Instances):

| # | File Path & Function Name | Current Setup | Violation |
| :--- | :--- | :--- | :--- |
| **1** | [App.jsx:L10–17](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/App.jsx#L10-L17) (`QueryClient`) | `staleTime: 1000 * 60 * 5` (5 mins) | Omits `refetchOnMount: false` globally. |
| **2** | [useErpHydration.js:L157–159](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useErpHydration.js#L157-L159) | `staleTime: Infinity` | Omits `refetchOnMount: false`. |
| **3** | [cacheHelper.js:L516–519](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js#L516-L519) (`setQueryDefaults`) | `staleTime: Infinity` | Omits `refetchOnMount: false`. |
| **4** | [useStudents.js:L12–23](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useStudents.js#L12-L23) (`useStudents`) | Default React Query options | Missing `refetchOnMount: false` and `staleTime: 60m`. |
| **5** | [useTeachers.js:L12–23](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useTeachers.js#L12-L23) (`useTeachers`) | Default React Query options | Missing `refetchOnMount: false` and `staleTime: 60m`. |
| **6** | [useAttendanceQueries.js:L12–39](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useAttendanceQueries.js#L12-L39) (`useBatchAttendanceQuery`) | Default options | Missing `refetchOnMount: false` and `staleTime: 60m`. |
| **7** | [useAttendanceQueries.js:L44–56](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useAttendanceQueries.js#L44-L56) (`useBatchAttendanceMatrixQuery`) | Default options | Missing `refetchOnMount: false` and `staleTime: 60m`. |
| **8** | [useAttendanceQueries.js:L113–148](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useAttendanceQueries.js#L113-L148) (`useBatchMonthlyAttendanceQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **9** | [useBatchQueries.js:L145–175](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js#L145-L175) (`useBatchDetailQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **10** | [useBatchQueries.js:L188–284](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js#L188-L284) (`useBatchStudentsQuery`) | Default options | Missing `refetchOnMount: false` and `staleTime: 60m`. |
| **11** | [useCourseQueries.js:L132–154](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js#L132-L154) (`useCourseDetailQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **12** | [useCourseQueries.js:L226](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js#L226) (`useCourseTeachersQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **13** | [useCourseQueries.js:L252](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js#L252) (`useCourseAllocationsQuery`) | `staleTime: 5 mins` | Incorrect staleTime, missing `refetchOnMount: false`. |
| **14** | [usePackageQueries.js:L132](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js#L132) (`usePackageDetailQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **15** | [usePackageQueries.js:L258](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js#L258) (`usePackageFeeAccountsQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **16** | [useFinanceQueries.js:L44](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/hooks/useFinanceQueries.js#L44) (`useRevenueSummaryQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **17** | [useFinanceQueries.js:L72](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/hooks/useFinanceQueries.js#L72) (`useInstallmentsQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **18** | [useFinanceQueries.js:L100](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/hooks/useFinanceQueries.js#L100) (`useOverdueAccountsQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **19** | [useFinanceQueries.js:L181](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/hooks/useFinanceQueries.js#L181) (`useMoneyTransactionsQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **20** | [useFinanceQueries.js:L268](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/hooks/useFinanceQueries.js#L268) (`useExpenseCategoriesQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **21** | [useFinanceQueries.js:L369](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/hooks/useFinanceQueries.js#L369) (`useAccountingDataQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **22** | [useEnrollmentQueries.js:L66–67](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useEnrollmentQueries.js#L66-L67) (`useEnrollmentsQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **23** | [useTeacherQueries.js:L73](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js#L73) (`useTeacherDetailQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **24** | [useTeacherQueries.js:L106](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js#L106) (`useTeacherAttendanceQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **25** | [useTeacherQueries.js:L140](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js#L140) (`useTeacherAttendanceListQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |
| **26** | [useTeacherQueries.js:L288](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js#L288) (`useTeacherSubjectsQuery`) | `staleTime: 60m` | Missing `refetchOnMount: false`. |

---

## 3. Requirement 3: Raw Inline `useQuery` Calls & Direct API Invocations (Law 2 & 5 Violations)

> **Law 2 & 5 Mandates**: Components MUST NOT write inline `useQuery` calls or execute raw network fetches. Dataset filtering by teacher_id, branch_id, course_id, status, role, etc. MUST be delegated to RAM resolvers (`resolveList` + `getCachedList` + `resolveGenericList`). Zero extra network calls when changing filters!

### Identified Violations (`18` Discovered Instances):

1. **[FinanceDashboard.jsx:L40, L49](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/components/FinanceDashboard.jsx#L40)** — Raw inline `useQuery` calls bypassing feature query hooks.
2. **[Installments.jsx:L44](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/components/Installments.jsx#L44)** — Raw inline `useQuery` call bypassing feature query hooks.
3. **[Students2.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/Students2.jsx)** — Consumes raw legacy `useStudents` hook which executes direct network requests bypassing `resolveList`.
4. **[Teachers2.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/Teachers2.jsx)** — Consumes raw legacy `useTeachers` hook which executes direct network requests bypassing `resolveList`.
5. **[useStudents.js:L14–21](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useStudents.js#L14-L21)** — `queryFn` executes direct `apiClient.executeAction` call, bypassing `resolveList`.
6. **[useTeachers.js:L14–21](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useTeachers.js#L14-L21)** — `queryFn` executes direct `apiClient.executeAction` call, bypassing `resolveList`.
7. **[useAttendanceQueries.js:L14–37](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useAttendanceQueries.js#L14-L37)** — `useBatchAttendanceQuery` calls `apiClient.executeAction` directly.
8. **[useAttendanceQueries.js:L46–54](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useAttendanceQueries.js#L46-L54)** — `useBatchAttendanceMatrixQuery` calls `apiClient.executeAction` directly.
9. **[useAttendanceQueries.js:L88–103](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useAttendanceQueries.js#L88-L103)** — `useStudentAttendanceStatsQuery` hardcodes mock data (`percentage: 92...`), completely bypassing backend/cache layer.
10. **[useBatchQueries.js:L190–265](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js#L190-L265)** — `useBatchStudentsQuery` executes raw parallel `apiClient` requests inside `queryFn`.
11. **[useBatchQueries.js:L347–356](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js#L347-L356)** — `useWeeklyScheduleQuery` calls `apiClient.executeAction` directly.
12. **[useBatchQueries.js:L375–384](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js#L375-L384)** — `useMasterTimetableQuery` calls `apiClient.executeAction` directly.
13. **[useCourseQueries.js:L216–224](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js#L216-L224)** — `useCourseTeachersQuery` calls `apiClient.executeAction` directly.
14. **[useCourseQueries.js:L238–249](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js#L238-L249)** — `useCourseAllocationsQuery` calls `apiClient.executeAction` directly.
15. **[usePackageQueries.js:L248–256](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js#L248-L256)** — `usePackageFeeAccountsQuery` calls `fetchPackageFeeAccounts` directly.
16. **[useProfileDetailsQuery.js:L14–20](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/profile/hooks/useProfileDetailsQuery.js#L14-L20)** — `useProfileDetailsQuery` calls `fetchProfileDetails` directly, bypassing `resolveRecord`.
17. **[useStudentLeadQueries.js:L52–59](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentLeadQueries.js#L52-L59)** — `useStudentLeadDetailQuery` bypasses `resolveRecord`.
18. **[cacheHelper.js:L331 (`getCachedList` defect)](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js#L331)** — Line 331 evaluates `Array.isArray(cachedList) && cachedList.length > 0` against global key `['entity', 'list', { filter: {} }]` and returns `cachedList` **IMMEDIATELY without filtering it by `filter`**, rendering Step 2 (`resolveGenericList`) unreachable!

---

## 4. Requirement 4: Missing Entity Registrations & Malformed `listKey` Definitions (Law 3 Violations)

> **Law 3 Mandate**: Every database entity MUST be registered in `ENTITY_CONFIGS` in `cacheHelper.js`. Its `listKey` function MUST return `queryKeys.[entity].list(EMPTY_FILTER)` without accepting dynamic parameters.

### 16 Missing Entity Registrations in `ENTITY_CONFIGS` ([cacheHelper.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)):

1. `packageItem` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Academic\PackageItem.json`)
2. `packagePerk` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Academic\PackagePerk.json`)
3. `teacherSubject` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Staff\TeacherSubject.json`)
4. `studentAttendance` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Attendance\StudentAttendance.json`)
5. `teacherAttendance` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Attendance\TeacherAttendance.json`)
6. `payment` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Finance\Payment.json`)
7. `studentFeeAccount` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Finance\StudentFeeAccount.json`)
8. `feeAdjustment` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Finance\FeeAdjustment.json`)
9. `feePlan` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Finance\FeePlan.json`)
10. `promoCode` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Core\PromoCode.json`)
11. `teacherDocument` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Staff\TeacherDocument.json`)
12. `address` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Students\Address.json`)
13. `contactInfo` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Students\ContactInfo.json`)
14. `education` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Students\Education.json`)
15. `testPaper` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Test\TestPaper.json`)
16. `session` (`E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Auth\Session.json`)

### 5 Malformed `listKey` Definitions in `ENTITY_CONFIGS` ([cacheHelper.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)):

1. [cacheHelper.js:L57](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js#L57) (`teacherSalaryConfig`): `listKey: (filter) => [...queryKeys.teacher.detail(filter.teacherId), 'salaryConfigs']`
2. [cacheHelper.js:L64](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js#L64) (`teacherPaymentTransaction`): `listKey: (filter) => [...queryKeys.teacher.detail(filter.teacherId), 'paymentTransactions']`
3. [cacheHelper.js:L86](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js#L86) (`batchAttendance`): `listKey: (filter) => queryKeys.attendance.batch(filter.batchId, filter.date || 'all')`
4. [cacheHelper.js:L156](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js#L156) (`test`): `listKey: (filter = {}) => queryKeys.test.byBatch(filter.batch_id || filter.batchId)`
5. [cacheHelper.js:L163](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js#L163) (`testMarks`): `listKey: (filter = {}) => queryKeys.test.marks(filter.test_id || filter.testId)`

---

## Strategic Action & Remediation Blueprint

To restore 100% architectural compliance with `canonical_querykeys_and_ram_filtering_guide.md`, follow this prioritized remediation path:

1. **Fix `getCachedList` RAM Filtering Bug**: Update Line 331 of `cacheHelper.js` to ensure cached lists are passed through `resolveGenericList(cachedList, filter)` before returning initial data to components.
2. **Register All 16 Missing Entities**: Add entries for `payment`, `studentFeeAccount`, `feeAdjustment`, `feePlan`, `address`, `contactInfo`, `education`, etc., to `ENTITY_CONFIGS` in `cacheHelper.js`.
3. **Standardize Query Key Factories**: Enforce `EMPTY_FILTER` on all `listKey` functions in `queryKeys.js` and `ENTITY_CONFIGS`.
4. **Enforce `refetchOnMount: false`**: Add `refetchOnMount: false` to all feature list query hooks.
5. **Migrate Views to Feature Hooks**: Refactor `FinanceDashboard.jsx`, `Installments.jsx`, `Students2.jsx`, and `Teachers2.jsx` to consume standardized feature query hooks.
