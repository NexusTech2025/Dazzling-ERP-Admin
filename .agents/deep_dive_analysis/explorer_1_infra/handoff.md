# Handoff Report — Core Infrastructure & ENTITY_CONFIGS Audit

## 1. Observation

### Core Infra Files Audited
- `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\lib\react-query\cacheHelper.js`
- `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\lib\react-query\queryKeys.js`
- `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\lib\react-query\hydrate.js`
- `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\lib\queryEngine.js`
- `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\hooks\useErpHydration.js`
- `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\App.jsx`
- Database Schema Directory: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\`

---

### Audit Item 1: Rule 4 Compliance (Universal Entity Registration in `ENTITY_CONFIGS`)
Currently, `ENTITY_CONFIGS` in `cacheHelper.js` (lines 19–168) registers **21 entity types**:
`student`, `teacher`, `batch`, `course`, `package`, `teacherSalaryConfig`, `teacherPaymentTransaction`, `courseType`, `batchAllocation`, `batchAttendance`, `enrollment`, `user`, `lead`, `branch`, `staff`, `installment`, `overdue`, `transaction`, `category`, `test`, `testMarks`.

**Direct Observations of Missing Entities:**
The codebase and backend schema contain **16 active entity types** that are **MISSING from `ENTITY_CONFIGS`**:

1. **`packageItem`**
   - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Academic\PackageItem.json`
   - **Usage**: `useErpHydration.js` line 55 (`'PackageItem'`), `hydrate.js` line 205 (`queryKeys.course.packageItem.list()`), `schemaRegistry.js` line 19 (`packageitem`).
   - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

2. **`packagePerk`**
   - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Academic\PackagePerk.json`
   - **Usage**: `useErpHydration.js` line 56 (`'PackagePerk'`), `hydrate.js` line 212 (`queryKeys.course.packagePerk.list()`), `schemaRegistry.js` line 20 (`packageperk`).
   - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

3. **`teacherSubject`**
   - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Staff\TeacherSubject.json`
   - **Usage**: `useErpHydration.js` line 59 (`'TeacherSubject'`).
   - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

4. **`studentAttendance`**
   - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Attendance\StudentAttendance.json`
   - **Usage**: `useAttendance.js`, `useAttendanceQueries.js`.
   - **Status**: Missing from `ENTITY_CONFIGS` (only `batchAttendance` is registered).

5. **`teacherAttendance`**
   - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Attendance\TeacherAttendance.json`
   - **Usage**: `useTeacherAttendance.js`.
   - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

6. **`payment`**
   - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Finance\Payment.json`
   - **Usage**: `queryKeys.js` line 117 (`queryKeys.finance.payments`), `useFinanceQueries.js`.
   - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

7. **`studentFeeAccount` / `feeAccount`**
   - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Finance\StudentFeeAccount.json`
   - **Usage**: `hydrate.js` lines 294, 449, 461 (`studentfeeaccounts`), `useFinanceQueries.js`.
   - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

8. **`feeAdjustment`**
   - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Finance\FeeAdjustment.json`
   - **Usage**: Finance transactional accounting batch data API.
   - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

9. **`feePlan`**
   - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Finance\FeePlan.json`
   - **Usage**: `useFeePlanWizard.js`.
   - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

10. **`promoCode`**
    - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Core\PromoCode.json`
    - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

11. **`teacherDocument`**
    - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Staff\TeacherDocument.json`
    - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

12. **`address`**
    - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Students\Address.json`
    - **Usage**: `hydrateStudentProfile` in `hydrate.js` lines 384, 394.
    - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

13. **`contactInfo`**
    - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Students\ContactInfo.json`
    - **Usage**: `hydrateStudentProfile` in `hydrate.js` lines 384, 395.
    - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

14. **`education`**
    - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Students\Education.json`
    - **Usage**: `hydrateStudentProfile` in `hydrate.js` lines 384, 396.
    - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

15. **`testPaper`**
    - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Test\TestPaper.json`
    - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

16. **`session`**
    - **Schema**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Auth\Session.json`
    - **Status**: Missing from `ENTITY_CONFIGS` in `cacheHelper.js`.

---

### Audit Item 2: Rule 1 Compliance (Single Canonical Global Cache Bucket & Key Factories)
**Law 1 Decrees:**
> All list queries MUST target the un-parameterized canonical key `queryKeys.[entity].list(EMPTY_FILTER)` => `[entity, "list", { filter: {} }]`. NEVER pass dynamic filter objects into the queryKey array!

**Direct Observations of Violations in `queryKeys.js` and `cacheHelper.js`:**

1. **`queryKeys.js` Lines 116 & 117:**
   ```javascript
   116: overdue: (filter = EMPTY_FILTER) => ['finance', 'overdue', { filter }],
   117: payments: (filter = EMPTY_FILTER) => ['finance', 'payments', { filter }],
   ```
   *Violation*: Allows caller to pass dynamic `filter` objects into `queryKeys.finance.overdue(dynamicFilter)` and `queryKeys.finance.payments(dynamicFilter)`, producing parameterized query keys (e.g. `['finance', 'overdue', { filter: { branch_id: 'BR-01' } }]`) that cause cache bucket fragmentation.

2. **`queryKeys.js` Lines 49, 58, 62:**
   ```javascript
   49: list: () => [...queryKeys.course.type.all, 'list'],
   58: list: () => [...queryKeys.course.packageItem.all, 'list'],
   62: list: () => [...queryKeys.course.packagePerk.all, 'list'],
   ```
   *Violation*: Returns `['course-type', 'list']`, `['package-item', 'list']`, and `['package-perk', 'list']` WITHOUT the canonical `{ filter: {} }` tuple element, breaking canonical key structure consistency.

3. **`cacheHelper.js` ENTITY_CONFIGS Violations (Lines 57, 64, 71, 86, 156, 163):**
   - **Line 57 (`teacherSalaryConfig`)**:
     `listKey: (filter) => [...queryKeys.teacher.detail(filter.teacherId), 'salaryConfigs']`
   - **Line 64 (`teacherPaymentTransaction`)**:
     `listKey: (filter) => [...queryKeys.teacher.detail(filter.teacherId), 'paymentTransactions']`
   - **Line 71 (`courseType`)**:
     `listKey: () => queryKeys.course.type.list()` (missing `{ filter: {} }`)
   - **Line 86 (`batchAttendance`)**:
     `listKey: (filter) => queryKeys.attendance.batch(filter.batchId, filter.date || 'all')`
   - **Line 156 (`test`)**:
     `listKey: (filter = {}) => queryKeys.test.byBatch(filter.batch_id || filter.batchId)`
   - **Line 163 (`testMarks`)**:
     `listKey: (filter = {}) => queryKeys.test.marks(filter.test_id || filter.testId)`

   *Violation*: Law 3 states `listKey` MUST evaluate to `queryKeys.[entity].list(EMPTY_FILTER)` without taking mandatory dynamic filter parameters. Taking dynamic filters inside `listKey` breaks uniform cache lookup across `getCachedList` and `resolveList`.

---

### Audit Item 3: Rule 2 Compliance (Strict Cache Freshness & Default Options)
**Law 4 Decrees:**
> List queries MUST define `staleTime: 1000 * 60 * 60` (60 minutes) and `refetchOnMount: false` to prevent component mounting from triggering refetches.

**Direct Observations of Violations in Infrastructure Defaults:**

1. **`App.jsx` Lines 10–17:**
   ```javascript
   10: const queryClient = new QueryClient({
   11:   defaultOptions: {
   12:     queries: {
   13:       staleTime: 1000 * 60 * 5, // 5 minutes
   14:       retry: 1,
   15:     },
   16:   },
   17: });
   ```
   *Violation*: Global `QueryClient` defaults set `staleTime` to 5 minutes (`1000 * 60 * 5`) instead of 60 minutes (`1000 * 60 * 60`) or `Infinity`. Furthermore, `refetchOnMount: false` is omitted from `defaultOptions.queries`.

2. **`useErpHydration.js` Lines 157–159:**
   ```javascript
   157: staleTime: Infinity,
   158: gcTime: Infinity,
   159: refetchOnWindowFocus: false,
   ```
   *Violation*: Omits `refetchOnMount: false`.

3. **`cacheHelper.js` Lines 516–519 (`resolveList` query defaults):**
   ```javascript
   516: queryClient.setQueryDefaults(targetKey, {
   517:   staleTime: Infinity,
   518:   gcTime: Infinity
   519: });
   ```
   *Violation*: `setQueryDefaults` configures `staleTime: Infinity` and `gcTime: Infinity`, but omits `refetchOnMount: false`. When components mount, TanStack Query defaults `refetchOnMount` to true unless explicitly overridden.

---

### Audit Item 4: Rule 3 Compliance (`resolveList` & `getCachedList` RAM Filtering Encapsulation)
**Law 2 Decrees:**
> Filtering datasets by teacher_id, branch_id, course_id, status, role, etc. MUST be delegated to RAM resolvers (`resolveList` + `getCachedList` + `resolveGenericList`). Zero extra network calls when changing filters!

**Direct Observations of Critical Flaws in `cacheHelper.js`:**

1. **Premature Unfiltered Cache Return in `getCachedList` (`cacheHelper.js` Lines 329–334):**
   ```javascript
   329: const targetKey = config.listKey(filter);
   330: const cachedList = queryClient.getQueryData(targetKey);
   331: if (Array.isArray(cachedList) && cachedList.length > 0) {
   332:   console.log(`[CacheHelper:ListHit] Found exact list in cache for ${entity}.`, { filter });
   333:   return cachedList;
   334: }
   ```
   *Critical Flaw*:
   For registered entities (e.g. `student`), `config.listKey(filter)` returns `['student', 'list', { filter: {} }]`.
   `queryClient.getQueryData(targetKey)` returns the global dataset (e.g. all 100 students).
   Line 331 checks `Array.isArray(cachedList) && cachedList.length > 0`. Because the global array contains items, it returns `cachedList` **IMMEDIATELY without filtering it by `filter`**!
   Step 2 (`resolveGenericList` on line 337) is **NEVER reached**. Callers requesting a filtered subset (e.g., `{ branch_id: 'BR-01' }`) receive the full, unfiltered array!

2. **Network Bypass Condition in `resolveList` (`cacheHelper.js` Lines 395–403):**
   ```javascript
   395: const targetKey = config.listKey(filter);
   396: const query = queryClient.getQueryCache().find({ queryKey: targetKey });
   397: const isStale = query ? query.isStale() : true;
   ...
   403: if (!forceRefetch && !isStale) {
   404:   try {
   405:     const cachedData = getCachedList(queryClient, entity, filter, options);
   ...
   ```
   *Critical Flaw*:
   If `query` cache state is undefined (or marked stale), `isStale` evaluates to `true`.
   `resolveList` completely bypasses Step 1 (`getCachedList`), ignoring pre-seeded data in RAM, and triggers a network fetch.

3. **Missing Post-Fetch RAM Filtering in `resolveList` (`cacheHelper.js` Lines 514–544):**
   ```javascript
   514: const targetKey = config.listKey(filter);
   515: queryClient.setQueryData(targetKey, data);
   ...
   544: return data;
   ```
   *Critical Flaw*:
   After receiving raw network records, `resolveList` normalizes them, sets `targetKey` in RAM, and returns `data` directly to the caller. It **NEVER calls `resolveGenericList(data, filter)`**. If `fetchFn` returns all records, `resolveList` returns the unfiltered dataset.

---

## 2. Logic Chain

1. **Rule 4 Logic**:
   - `ENTITY_CONFIGS` is the single source of truth for runtime cache resolution (`resolveRecord`, `getCachedRecord`, `getCachedList`, `resolveList`).
   - Calling `resolveList(queryClient, 'packageItem', ...)` throws `CacheLayerError: Unsupported entity type: packageItem`.
   - Because 16 entity types (`packageItem`, `packagePerk`, `teacherSubject`, `studentAttendance`, `teacherAttendance`, `payment`, `studentFeeAccount`, `feeAdjustment`, `feePlan`, `promoCode`, `teacherDocument`, `address`, `contactInfo`, `education`, `testPaper`, `session`) exist in backend schemas or frontend hydration/query keys but are omitted from `ENTITY_CONFIGS`, any feature attempting to use `cacheHelper.js` for these entities fails at runtime.

2. **Rule 1 Logic**:
   - Law 1 requires all list queries to use `queryKeys.[entity].list(EMPTY_FILTER)` producing `[entity, 'list', { filter: {} }]`.
   - `queryKeys.js` defines `finance.overdue(filter)` and `finance.payments(filter)` which accept dynamic filter parameters.
   - `cacheHelper.js` configures parameterized `listKey` functions for `teacherSalaryConfig`, `teacherPaymentTransaction`, `batchAttendance`, `test`, and `testMarks`.
   - Parameterizing list keys fragments the cache into separate buckets per filter permutation, causing cache misses and redundant network requests.

3. **Rule 2 Logic**:
   - Law 4 mandates `staleTime: 1000 * 60 * 60` (60 minutes) and `refetchOnMount: false`.
   - `App.jsx` sets global default `staleTime: 5 minutes` and omits `refetchOnMount: false`.
   - `useErpHydration.js` and `cacheHelper.js` set `staleTime: Infinity` but omit `refetchOnMount: false` in `setQueryDefaults`.
   - Omitted `refetchOnMount: false` causes TanStack Query to trigger network re-fetches whenever components mount.

4. **Rule 3 Logic**:
   - Law 2 specifies that `getCachedList` and `resolveList` must perform in-memory RAM filtering via `resolveGenericList`.
   - In `getCachedList`, line 331 checks `cachedList.length > 0` against the global key `[entity, 'list', { filter: {} }]` and returns early.
   - Early return bypasses `resolveGenericList`, returning unfiltered data for filtered query requests.
   - In `resolveList`, network fetch results are returned directly without executing `resolveGenericList(data, filter)`.

---

## 3. Caveats

- No caveats. Investigation was conducted via direct read-only analysis of all core infrastructure files and schema definitions. No assumptions were made.

---

## 4. Conclusion

The core React Query infrastructure (`cacheHelper.js`, `queryKeys.js`, `useErpHydration.js`, `App.jsx`) contains systematic violations across all 4 audited rules:
1. **Rule 4 Violation**: 16 entity types are missing from `ENTITY_CONFIGS`.
2. **Rule 1 Violation**: `finance.overdue`, `finance.payments`, `teacherSalaryConfig`, `teacherPaymentTransaction`, `batchAttendance`, `test`, `testMarks`, `courseType`, `packageItem`, and `packagePerk` use non-canonical or parameterized query keys.
3. **Rule 2 Violation**: `App.jsx` defaults `staleTime` to 5 minutes, and `refetchOnMount: false` is missing from `App.jsx`, `useErpHydration.js`, and `cacheHelper.js`.
4. **Rule 3 Violation**: `getCachedList` returns unfiltered global arrays in Step 1, bypassing `resolveGenericList`, and `resolveList` does not execute `resolveGenericList` on network data.

---

## 5. Verification Method

To verify these findings independently:

1. **Check Missing Entities (Rule 4)**:
   - Compare keys in `ENTITY_CONFIGS` (`src/lib/react-query/cacheHelper.js:19-168`) against `HYDRATION_CONFIG` in `src/hooks/useErpHydration.js:47-63` and schemas in `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\`.
   - Observe that `packageItem`, `packagePerk`, `teacherSubject`, etc., are missing from `ENTITY_CONFIGS`.

2. **Check Non-Canonical Query Keys (Rule 1)**:
   - Inspect `src/lib/react-query/queryKeys.js` lines 49, 58, 62, 116, 117.
   - Inspect `src/lib/react-query/cacheHelper.js` lines 57, 64, 71, 86, 156, 163.

3. **Check Stale Time & Refetch Defaults (Rule 2)**:
   - Inspect `src/App.jsx` line 13 (`staleTime: 1000 * 60 * 5`).
   - Inspect `src/hooks/useErpHydration.js` lines 157-159 (absence of `refetchOnMount: false`).
   - Inspect `src/lib/react-query/cacheHelper.js` lines 516-519 (absence of `refetchOnMount: false`).

4. **Check RAM Filtering Defect (Rule 3)**:
   - Trace `getCachedList` in `src/lib/react-query/cacheHelper.js` lines 329-334: observe that line 333 returns `cachedList` directly before reaching `resolveGenericList` at line 337.
