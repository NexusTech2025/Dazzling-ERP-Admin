# Date: 2026-08-17T00:30:00+05:30
# Status: Completed

# Walkthrough: Teacher Profile In-Memory Tab Retention & Global Cache Resilience

## 1. Overview
We implemented an in-memory tab retention and resilient caching architecture for the Teacher Profile and Payroll subsystems. This ensures that tabs remain mounted in RAM without re-triggering network requests, eliminates unmount abort signals, normalizes polymorphic database keys, and prevents cache pollution across teachers.

---

## 2. Changes Implemented

### 1. In-Memory Resolvers (`src/lib/react-query/cacheStrategies.js`)
* Implemented `resolveTeacherSalaryConfigList`:
  * Normalizes `entity_id`, `teacher_id`, and `teacherId`.
  * Enforces the polymorphic discriminator `entity_type === 'Teacher'`.
* Implemented `resolveTeacherPaymentTransactionList`:
  * Normalizes `teacher_id`, `teacherId`, and `entity_id`.
* Registered both in `CACHE_RESOLVER_STRATEGIES` for instantaneous in-memory lookups.

### 2. Guarded Fallback Cache Scan (`src/lib/react-query/cacheHelper.js`)
* Guarded `getCachedList` Step 3 Fallback Scan:
  * Only runs when `filter` is empty (`Object.keys(filter).length === 0`).
  * Prevents returning unfiltered multi-teacher records when querying a specific `teacherId`.

### 3. Progressive Cache Hydration (`src/features/teacher/hooks/useTeacherQueries.js`)
* In `useTeacherSalaryConfigsQuery` and `useTeacherPaymentTransactionsQuery`:
  * Replaced rigid `initialData` with `placeholderData: () => (cached?.length > 0 ? cached : undefined)`.
  * Configured `staleTime: 5 * 60 * 1000` (5 minutes).
  * Removed `refetchOnMount: false` and `refetchOnReconnect: false` to allow non-blocking background revalidation.

### 4. Decoupled Loading Boundary (`src/features/teacher/hooks/useTeacherPayroll.js`)
* Removed inline `initialData` overrides.
* Decoupled full-page blocking spinners so in-memory cached configurations remain interactive during background network syncs.

### 5. Persistent Parallel DOM Tabs & Zero-Filter Refresh (`src/pages/admin/TeacherProfile.jsx`)
* Stably memoized tab component element instances (`attendanceTab`, `assignedClassesTab`, `salaryPayrollTab`) based on `teacher.teacher_id`.
* Updated `handleRefresh` to invalidate **only** the target teacher's dedicated sub-ledger without invalidating global entity collections with filter keys:
  ```javascript
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.teacher.detail(id) });
    queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(id), 'salaryConfigs'] });
    queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(id), 'paymentTransactions'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.teacher.attendanceProfile(id, 'all') });
  }, [queryClient, id]);
  ```

---

## 3. Verification & Results

| Test Scenario | Expected Outcome | Result |
| :--- | :--- | :--- |
| **Tab Switching** | Instant tab display, $0$ network calls, $0$ aborted requests, persistent form/cache state | Verified ✅ |
| **Teacher Refresh Button** | Invalidation triggers clean network fetch for target teacher's sub-ledger only; master collections (batches, courses) remain in RAM | Verified ✅ |
| **Multi-Teacher Isolation** | No transaction leakage between different faculty profiles | Verified ✅ |
| **Zero-Filter Invalidation Rule** | No query keys are invalidated with filter parameters; repository selectors derive data in RAM | Verified ✅ |
