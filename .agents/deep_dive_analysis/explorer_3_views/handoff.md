# Handoff Report: UI Views, Pages & Modals Query Audit

**Agent ID**: `explorer_3_views`  
**Working Directory**: `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\.agents\explorer_3_views`  
**Timestamp**: 2026-08-06T02:49:00+05:30  
**Target Scope**: `src/pages/`, `src/components/`, `src/features/` (UI Component Files & Views)

---

## 1. Observation

Direct observations from systematic static analysis and grep indexing across all UI views, pages, modals, and presentational components in `src/pages/`, `src/components/`, and `src/features/`:

### Summary Table of Audit Violations

| Violation ID | File Path | Line Range | Rule/Law Violated | Primary Cause & Code Pattern |
|:---|:---|:---|:---|:---|
| **V-VIEW-01** | `src/features/finance/FinanceDashboard.jsx` | L40-47, L49-56 | Law 5 (Rule 3), Law 1 (Rule 1), Law 4 (Rule 2) | Raw inline `useQuery` calls fetching `Enrollment` and `BatchAllocation` directly via `executeAction`. Parameterizes ad-hoc string keys `['finance', 'dashboard-enrollments']` & `['finance', 'dashboard-allocations']`. Lacks `staleTime: 60m` & `refetchOnMount: false`. |
| **V-VIEW-02** | `src/features/finance/Installments.jsx` | L44-51 | Law 5 (Rule 3), Law 1 (Rule 1), Law 4 (Rule 2) | Raw inline `useQuery` call fetching `Enrollment` directly via `executeAction`. Uses ad-hoc string key `['finance', 'installments-enrollments']`. Lacks `staleTime: 60m` & `refetchOnMount: false`. |
| **V-VIEW-03** | `src/pages/admin/Students2.jsx` | L6, L17, L36, L101 | Law 5 (Rule 3), Law 1 (Rule 1) | Consumes legacy `useStudents()` wrapper hook. Uses non-canonical key `['students', {}]` in `setQueryData` and invalidates `['students']` on retry. |
| **V-VIEW-04** | `src/pages/admin/Teachers2.jsx` | L6, L17, L33, L92 | Law 5 (Rule 3), Law 1 (Rule 1) | Consumes legacy `useTeachers()` wrapper hook. Uses non-canonical key `['teachers', {}]` in `setQueryData` and invalidates `['teachers']` on retry. |
| **V-VIEW-05** | `src/hooks/useStudents.js` (consumed by `Students2.jsx`) | L12-23 | Law 5 (Rule 3), Law 1 (Rule 1), Law 4 (Rule 2) | Raw inline `useQuery` hook bypassing `useStudentsQuery` & `resolveList`. Passes dynamic `filter` into `queryKey: ['students', filter]`. Lacks `staleTime: 60m` & `refetchOnMount: false`. |
| **V-VIEW-06** | `src/hooks/useTeachers.js` (consumed by `Teachers2.jsx`) | L12-23 | Law 5 (Rule 3), Law 1 (Rule 1), Law 4 (Rule 2) | Raw inline `useQuery` hook bypassing `useTeachersQuery` & `resolveList`. Passes dynamic `filter` into `queryKey: ['teachers', filter]`. Lacks `staleTime: 60m` & `refetchOnMount: false`. |
| **V-VIEW-07** | `src/features/finance/transactions/components/MoneyTransactionForm.jsx` | L30-34 | Law 1 (Rule 1), Law 2 | Passes dynamic filter object `{ status: 'active' }` into `useUsersQuery`, `useStudentsQuery`, `useTeachersQuery`, and `useStaffMembersQuery` inside modal component instead of consuming canonical un-parameterized list (`EMPTY_FILTER`). |
| **V-VIEW-08** | `src/features/course/CourseDetails.jsx` | L85 | Law 1 (Rule 1), Law 2 | Passes dynamic filter `{ course_id: id }` into `useBatchesQuery` in page view instead of consuming un-parameterized list query and filtering in RAM. |
| **V-VIEW-09** | `src/features/student/components/profile/StudentFeeTab.jsx` | L20-23 | Law 1 (Rule 1), Law 2 | Passes dynamic filter `{ student_id: studentId }` into `useEnrollmentsQuery` in profile tab UI view. |
| **V-VIEW-10** | `src/features/teacher/components/profile/TeacherAssignedClasses.jsx` | L11-14 | Law 1 (Rule 1), Law 2 | Passes dynamic filter `{ teacher_id: teacherId }` into `useBatchesQuery` in profile tab UI view. |
| **V-VIEW-11** | `src/features/batch/components/profile/BatchStudentRoster.jsx` | L18 | Law 1 (Rule 1), Law 2 | Passes dynamic UI text search parameter `searchQuery` directly into `useBatchStudentsQuery(batchId, searchQuery)` instead of filtering in RAM. |
| **V-VIEW-12** | `src/pages/admin/Branches.jsx` | L164, L182 | Law 1 (Rule 1) | Invalidates raw string key array `['branches']` in refresh button & retry handlers instead of canonical key `queryKeys.branch.list(EMPTY_FILTER)`. |
| **V-VIEW-13** | `src/pages/admin/ResolveDeleteConflictView.jsx` | L139, L148, L157, L166, L176, L184, L193, L254, L390 | Law 1 (Rule 1) | Inspects cache via `getQueriesData` using raw partial key arrays (`['student', 'list']`, `['course', 'list']`, etc.). Calls un-parameterized global `queryClient.invalidateQueries()`. |
| **V-VIEW-14** | `src/components/ui/ResolveDeleteConflict.jsx` | L92, L97, L102, L107, L238 | Law 1 (Rule 1) | Crawls cache via `getQueryData` using raw string arrays (`['enrollment', 'list']`, `['batch', 'list']`, etc.). Calls un-parameterized global `queryClient.invalidateQueries()`. |

---

### Verbatim Code Evidence & Detailed Findings

#### 1. `src/features/finance/FinanceDashboard.jsx` (Lines 3, 40-56)
```javascript
// Line 3
import { useQuery } from '@tanstack/react-query';

// Lines 40-47
const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useQuery({
  queryKey: ['finance', 'dashboard-enrollments'],
  queryFn: async () => {
    const res = await executeAction('data_query', { target: 'Enrollment' }, token);
    return res.data?.data || [];
  },
  enabled: !!token
});

// Lines 49-56
const { data: batchAllocations = [], isLoading: isAllocationsLoading } = useQuery({
  queryKey: ['finance', 'dashboard-allocations'],
  queryFn: async () => {
    const res = await executeAction('data_query', { target: 'BatchAllocation' }, token);
    return res.data?.data || [];
  },
  enabled: !!token
});
```
- **Analysis**: `FinanceDashboard.jsx` directly imports `useQuery` and executes two separate HTTP requests for `Enrollment` and `BatchAllocation` using custom string query keys.
- **Law Violations**:
  - **Law 5 (Rule 3)**: Ad-hoc inline `useQuery` bypassing feature hooks (`useEnrollmentsQuery`, `useBatchAllocationsQuery`) and `resolveList`.
  - **Law 1 (Rule 1)**: Parameterizes custom string arrays `['finance', 'dashboard-enrollments']` and `['finance', 'dashboard-allocations']` instead of canonical `EMPTY_FILTER` list keys.
  - **Law 4 (Rule 2)**: Missing `staleTime: 1000 * 60 * 60` and `refetchOnMount: false`.

#### 2. `src/features/finance/Installments.jsx` (Lines 16, 44-51)
```javascript
// Line 16
import { useQueryClient, useQuery } from '@tanstack/react-query';

// Lines 44-51
const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useQuery({
  queryKey: ['finance', 'installments-enrollments'],
  queryFn: async () => {
    const res = await executeAction('data_query', { target: 'Enrollment' }, token);
    return res.data?.data || [];
  },
  enabled: !!token
});
```
- **Analysis**: `Installments.jsx` uses an inline `useQuery` call to fetch enrollments for relation mapping.
- **Law Violations**:
  - **Law 5 (Rule 3)**: Inline `useQuery` in UI view bypassing `useEnrollmentsQuery` and `resolveList`.
  - **Law 1 (Rule 1)**: Custom key `['finance', 'installments-enrollments']` instead of canonical key.
  - **Law 4 (Rule 2)**: Missing `staleTime: 1000 * 60 * 60` and `refetchOnMount: false`.

#### 3. `src/pages/admin/Students2.jsx` (Lines 6, 17, 36, 101) & `src/hooks/useStudents.js`
```javascript
// Students2.jsx Line 6 & 17
import { useStudents } from '../../hooks/useStudents';
const { data: students = [], isLoading, error } = useStudents();

// Students2.jsx Line 36
queryClient.setQueryData(['students', {}], (old = []) => ...);

// Students2.jsx Line 101
onRetry={() => queryClient.invalidateQueries({ queryKey: ['students'] })}

// useStudents.js Lines 12-23
export const useStudents = (filter = {}) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['students', filter],
    queryFn: async () => { ... },
    enabled: !!token,
  });
};
```
- **Analysis**: `Students2.jsx` imports legacy helper `useStudents()`, which executes an un-cached inline `useQuery` with key `['students', filter]`. Furthermore, `Students2.jsx` updates cache and invalidates using non-canonical `['students', {}]` and `['students']`.
- **Law Violations**:
  - **Law 5 (Rule 3)**: Ad-hoc query wrapper bypassing standard `useStudentsQuery` and `resolveList`.
  - **Law 1 (Rule 1)**: Dynamic filter passed into `queryKey: ['students', filter]`, and invalidations use non-canonical keys.
  - **Law 4 (Rule 2)**: Missing `staleTime: 60m` and `refetchOnMount: false`.

#### 4. `src/pages/admin/Teachers2.jsx` (Lines 6, 17, 33, 92) & `src/hooks/useTeachers.js`
```javascript
// Teachers2.jsx Line 6 & 17
import { useTeachers } from '../../hooks/useTeachers';
const { data: teachers = [], isLoading, error } = useTeachers();

// Teachers2.jsx Line 33
queryClient.setQueryData(['teachers', {}], (old = []) => ...);

// Teachers2.jsx Line 92
onRetry={() => queryClient.invalidateQueries({ queryKey: ['teachers'] })}

// useTeachers.js Lines 12-23
export const useTeachers = (filter = {}) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['teachers', filter],
    queryFn: async () => { ... },
    enabled: !!token,
  });
};
```
- **Analysis**: Same pattern as `Students2.jsx`. Uses legacy wrapper hook `useTeachers()` that executes an inline `useQuery` with key `['teachers', filter]`, bypassing `useTeachersQuery` and `resolveList`.
- **Law Violations**:
  - **Law 5 (Rule 3)**: Ad-hoc query wrapper bypassing `useTeachersQuery` and `resolveList`.
  - **Law 1 (Rule 1)**: Dynamic filter passed into `queryKey: ['teachers', filter]`, and invalidations use non-canonical keys `['teachers']`.
  - **Law 4 (Rule 2)**: Missing `staleTime: 60m` and `refetchOnMount: false`.

#### 5. `src/features/finance/transactions/components/MoneyTransactionForm.jsx` (Lines 30-34)
```javascript
const queryParams = { status: 'active' };
const { data: users = [] } = useUsersQuery(queryParams);
const { data: students = [] } = useStudentsQuery(queryParams);
const { data: teachers = [] } = useTeachersQuery(queryParams);
const { data: staffMembers = [] } = useStaffMembersQuery(queryParams);
```
- **Analysis**: Form modal passes dynamic `{ status: 'active' }` filter object into list queries, creating fragmented cache entries for active items instead of requesting global un-parameterized list (`EMPTY_FILTER`) and filtering in RAM.
- **Law Violations**:
  - **Law 1 (Rule 1)** & **Law 2**: Dynamic filter object passed into query key, causing cache miss and duplicate HTTP flights.

#### 6. `src/features/course/CourseDetails.jsx` (Line 85)
```javascript
const { data: batches = [], isLoading: isBatchesLoading } = useBatchesQuery({ course_id: id });
```
- **Analysis**: Scopes batch query to `{ course_id: id }` inline in page view instead of consuming canonical batch list and filtering in RAM.
- **Law Violations**:
  - **Law 1 (Rule 1)** & **Law 2**: Parameterizes list query key dynamically instead of using `EMPTY_FILTER` and RAM resolver.

#### 7. `src/features/student/components/profile/StudentFeeTab.jsx` (Lines 20-23)
```javascript
const { data: enrollments = [], isLoading, error } = useEnrollmentsQuery(
  studentId ? { student_id: studentId } : null,
  { enabled: !!studentId }
);
```
- **Analysis**: Passes `{ student_id: studentId }` into `useEnrollmentsQuery` in a profile tab component.
- **Law Violations**:
  - **Law 1 (Rule 1)** & **Law 2**: Dynamic filter parameter passed into list query hook.

#### 8. `src/features/teacher/components/profile/TeacherAssignedClasses.jsx` (Lines 11-14)
```javascript
const { data: batches = [], isLoading } = useBatchesQuery(
  { teacher_id: teacherId },
  { enabled: !!teacherId && teacherId !== '' }
);
```
- **Analysis**: Passes `{ teacher_id: teacherId }` into `useBatchesQuery` in a profile tab component.
- **Law Violations**:
  - **Law 1 (Rule 1)** & **Law 2**: Dynamic filter parameter passed into list query hook.

#### 9. `src/features/batch/components/profile/BatchStudentRoster.jsx` (Line 18)
```javascript
const { data: students = [], isLoading } = useBatchStudentsQuery(batchId, searchQuery);
```
- **Analysis**: Passes UI text input search string (`searchQuery`) down into `useBatchStudentsQuery` hook.
- **Law Violations**:
  - **Law 1 (Rule 1)** & **Law 2**: Dynamic UI filter string parameter passed into list query hook.

#### 10. `src/pages/admin/Branches.jsx` (Lines 164, 182)
```javascript
// Line 164
<RefreshButton onClick={() => queryClient.invalidateQueries({ queryKey: ['branches'] })} isLoading={isLoading} />

// Line 182
onRetry={() => queryClient.invalidateQueries({ queryKey: ['branches'] })}
```
- **Analysis**: Invalidates non-canonical string array `['branches']` instead of canonical key `queryKeys.branch.list(EMPTY_FILTER)`.
- **Law Violations**:
  - **Law 1 (Rule 1)**: Non-canonical query key used in `invalidateQueries`.

#### 11. `src/pages/admin/ResolveDeleteConflictView.jsx` (Lines 139, 148, 157, 166, 176, 184, 193, 254, 390)
```javascript
const cache = queryClient.getQueriesData({ queryKey: ['student', 'list'] });
// ... and ['course', 'list'], ['batch', 'list'], ['course-type', 'list'], ['package', 'list'], ['teacher', 'list'], ['branch', 'list']
queryClient.invalidateQueries();
```
- **Analysis**: Uses hardcoded string key arrays to query cache data and calls un-parameterized `queryClient.invalidateQueries()` upon deletion.
- **Law Violations**:
  - **Law 1 (Rule 1)**: Bypasses canonical query key factory definitions (`queryKeys.[entity].list(EMPTY_FILTER)`).

#### 12. `src/components/ui/ResolveDeleteConflict.jsx` (Lines 92, 97, 102, 107, 238)
```javascript
const enrollments = queryClient.getQueryData(['enrollment', 'list']) || [];
const batches = queryClient.getQueryData(['batch', 'list']) || [];
const courses = queryClient.getQueryData(['course', 'list']) || [];
const packages = queryClient.getQueryData(['packages', 'list']) || [];
queryClient.invalidateQueries();
```
- **Analysis**: Uses hardcoded string arrays for cache reads and calls un-parameterized global cache invalidation.
- **Law Violations**:
  - **Law 1 (Rule 1)**: Bypasses canonical `queryKeys` factory methods and `EMPTY_FILTER`.

---

## 2. Logic Chain

1. **Law 5 (Zero Ad-Hoc Inline Queries) Logic**:
   - In `FinanceDashboard.jsx` (L40-56) and `Installments.jsx` (L44-51), UI pages directly invoke `useQuery` with custom string keys like `['finance', 'dashboard-enrollments']` and `['finance', 'installments-enrollments']`.
   - In `Students2.jsx` and `Teachers2.jsx`, pages import legacy helper hooks `useStudents()` and `useTeachers()` which wrap raw `useQuery({ queryKey: ['students', filter] })` calls.
   - This bypasses `resolveList()` in `cacheHelper.js` and creates un-managed, fragmented cache buckets that never receive app hydration updates.

2. **Law 1 (Single Canonical Global Cache Bucket & No Dynamic Keys) Logic**:
   - In `MoneyTransactionForm.jsx` (L30-34), `CourseDetails.jsx` (L85), `StudentFeeTab.jsx` (L20-23), `TeacherAssignedClasses.jsx` (L11-14), and `BatchStudentRoster.jsx` (L18), components pass dynamic filter objects (`{ status: 'active' }`, `{ course_id: id }`, `{ teacher_id: teacherId }`, `searchQuery`) directly into feature hooks.
   - This breaks the canonical un-parameterized key contract `queryKeys.[entity].list(EMPTY_FILTER)`, producing unique key arrays like `["student", "list", { filter: { status: "active" } }]`.
   - When the app dehydrates/hydrates the canonical `["student", "list", { filter: {} }]` key, the component key evaluates to a cache miss and triggers duplicate HTTP round-trips.
   - In `Branches.jsx`, `Students2.jsx`, `Teachers2.jsx`, `ResolveDeleteConflictView.jsx`, and `ResolveDeleteConflict.jsx`, invalidations and cache lookups use hardcoded string literals like `['branches']`, `['students']`, or `['enrollment', 'list']` instead of referencing `queryKeys.[entity].list(EMPTY_FILTER)`.

3. **Law 4 (Strict Cache Freshness: staleTime 60m & refetchOnMount: false) Logic**:
   - All inline `useQuery` calls in `FinanceDashboard.jsx`, `Installments.jsx`, `useStudents.js`, and `useTeachers.js` omit `staleTime: 1000 * 60 * 60` and `refetchOnMount: false`.
   - As a result, whenever the user navigates between views, React Query marks the query as stale on mount and fires unnecessary background network fetches.

---

## 3. Caveats

- **Legacy Views**: `Students2.jsx` and `Teachers2.jsx` appear to be V2 test/demo views (`Student Directory V2` / `Faculty Directory V2`). However, they are still present in `src/pages/admin/` and active in the repository codebase.
- **Scope Limit**: As a read-only exploration agent (`explorer_3_views`), zero source code modifications were performed during this audit. All findings are strictly diagnostic.

---

## 4. Conclusion

Out of all UI views, pages, and modals audited in `src/pages/`, `src/components/`, and `src/features/`:
1. **4 files** contain raw inline `useQuery` calls bypassing feature query hooks and `resolveList` (`FinanceDashboard.jsx`, `Installments.jsx`, `Students2.jsx` via `useStudents.js`, `Teachers2.jsx` via `useTeachers.js`).
2. **10 files/components** violate Law 1 by passing dynamic filter objects into `queryKeys` or calling invalidations/lookups with non-canonical string arrays.
3. **4 files** with inline `useQuery` calls lack required `staleTime: 60m` and `refetchOnMount: false` configuration.

All violations have been cataloged with exact line numbers, code snippets, and law citations.

---

## 5. Verification Method

To independently verify these audit findings:

1. **Verify Raw Inline `useQuery` Hooks in Views**:
   - Inspect `src/features/finance/FinanceDashboard.jsx` lines 40 & 49: Confirm `useQuery({ queryKey: ['finance', 'dashboard-enrollments'] })` and `useQuery({ queryKey: ['finance', 'dashboard-allocations'] })`.
   - Inspect `src/features/finance/Installments.jsx` line 44: Confirm `useQuery({ queryKey: ['finance', 'installments-enrollments'] })`.
   - Inspect `src/pages/admin/Students2.jsx` line 17 and `src/hooks/useStudents.js` line 12: Confirm raw `useQuery({ queryKey: ['students', filter] })`.
   - Inspect `src/pages/admin/Teachers2.jsx` line 17 and `src/hooks/useTeachers.js` line 12: Confirm raw `useQuery({ queryKey: ['teachers', filter] })`.

2. **Verify Dynamic Filter Passing into Query Hooks**:
   - Inspect `src/features/finance/transactions/components/MoneyTransactionForm.jsx` lines 30-34: Confirm `queryParams = { status: 'active' }` passed into query hooks.
   - Inspect `src/features/course/CourseDetails.jsx` line 85: Confirm `{ course_id: id }` passed into `useBatchesQuery`.
   - Inspect `src/features/student/components/profile/StudentFeeTab.jsx` line 20: Confirm `{ student_id: studentId }` passed into `useEnrollmentsQuery`.
   - Inspect `src/features/teacher/components/profile/TeacherAssignedClasses.jsx` line 11: Confirm `{ teacher_id: teacherId }` passed into `useBatchesQuery`.
   - Inspect `src/features/batch/components/profile/BatchStudentRoster.jsx` line 18: Confirm `searchQuery` passed into `useBatchStudentsQuery`.

3. **Verify Non-Canonical Invalidations and Cache Lookups**:
   - Inspect `src/pages/admin/Branches.jsx` lines 164 & 182: Confirm `queryKey: ['branches']`.
   - Inspect `src/pages/admin/ResolveDeleteConflictView.jsx` lines 139-193: Confirm `getQueriesData({ queryKey: ['student', 'list'] })` etc.
   - Inspect `src/components/ui/ResolveDeleteConflict.jsx` lines 92-107: Confirm `getQueryData(['enrollment', 'list'])` etc.

4. **Invalidation Condition**:
   - If refactored, all UI views and modals will consume feature query hooks that target `queryKeys.[entity].list(EMPTY_FILTER)`, execute 100% of filtering via RAM resolvers (`resolveList`), and define `staleTime: 60m` and `refetchOnMount: false`.
