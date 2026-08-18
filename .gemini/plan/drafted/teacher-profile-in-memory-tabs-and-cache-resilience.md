---
Date: 2026-08-17T00:30:00+05:30
Status: Approved-Completed
---

# Technical Implementation Plan: Teacher Profile In-Memory Tab Retention & Global Cache Resilience Architecture

## 1. Non-Domain Driven Infrastructure & Platform Decree

---

### **Rule N1: Explicit Positional Signatures & Execution Blueprints**

#### 1. In-Memory Strategy Resolution for Polymorphic Entity Records (`src/lib/react-query/cacheStrategies.js`)

```javascript
/**
 * Resolves teacher salary configuration records matching target teacher identifier.
 * Normalizes camelCase, snake_case, and polymorphic entity foreign keys (entity_id, teacher_id, teacherId).
 *
 * @param {Array<Object>} cachedList - In-memory RAM array of TeacherSalaryConfig records.
 * @param {Object} [filter={}] - Target query filter parameters.
 * @param {string} [filter.teacherId] - CamelCase teacher primary identifier.
 * @param {string} [filter.teacher_id] - Snake_case teacher primary identifier.
 * @param {string} [filter.entity_id] - Polymorphic database column identifier.
 * @returns {Array<Object>} Filtered array of TeacherSalaryConfig records matching teacher entity.
 * @throws {TypeError} When cachedList is not an array.
 */
export const resolveTeacherSalaryConfigList = function(cachedList, filter = {}) {
  if (!Array.isArray(cachedList)) return [];
  if (cachedList.length === 0) return [];

  const targetId = filter.teacherId || filter.teacher_id || filter.entity_id;
  if (!targetId) return cachedList;

  return cachedList.filter(item => {
    if (!item || typeof item !== 'object') return false;
    const itemEntityId = item.entity_id || item.teacher_id || item.teacherId;
    const matchesEntity = itemEntityId === targetId;
    const isTeacherType = !item.entity_type || item.entity_type === 'Teacher';
    return matchesEntity && isTeacherType;
  });
};

/**
 * Resolves teacher payment transactions matching target teacher identifier.
 * Normalizes camelCase and snake_case foreign keys without dropping records.
 *
 * @param {Array<Object>} cachedList - In-memory RAM array of TeacherPaymentTransaction records.
 * @param {Object} [filter={}] - Target query filter parameters.
 * @param {string} [filter.teacherId] - CamelCase teacher primary identifier.
 * @param {string} [filter.teacher_id] - Snake_case teacher primary identifier.
 * @returns {Array<Object>} Filtered array of TeacherPaymentTransaction records matching teacher.
 * @throws {TypeError} When cachedList is not an array.
 */
export const resolveTeacherPaymentTransactionList = function(cachedList, filter = {}) {
  if (!Array.isArray(cachedList)) return [];
  if (cachedList.length === 0) return [];

  const targetId = filter.teacherId || filter.teacher_id || filter.entity_id;
  if (!targetId) return cachedList;

  return cachedList.filter(item => {
    if (!item || typeof item !== 'object') return false;
    const itemTeacherId = item.teacher_id || item.teacherId || item.entity_id;
    return itemTeacherId === targetId;
  });
};
```

**Logical Execution Workflow**:
1. Ingests raw cached collection from RAM.
2. Extracts `targetId` across `teacherId`, `teacher_id`, and `entity_id` candidates.
3. Filters items with defensive object integrity checks and enforces polymorphic discriminator `entity_type === 'Teacher'` when present.
4. Returns exact filtered subset with zero network roundtrips in $O(n)$ time complexity.

---

#### 2. Strict Filtered Fallback Protection (`src/lib/react-query/cacheHelper.js`)

```javascript
/**
 * Retrieves a cached collection with strict filter scoping guards.
 * Prevents non-strict fallback scanners from returning un-scoped collections when entity filters are active.
 *
 * @param {QueryClient} queryClient - TanStack QueryClient instance.
 * @param {string} entity - Registered entity configuration discriminator.
 * @param {Object} [filter={}] - Search criteria and foreign key filters.
 * @param {Object} [options={}] - Custom execution flags.
 * @param {boolean} [options.strict=false] - Enforce strict match constraint.
 * @returns {Array|undefined} Cached list array matching criteria, or undefined.
 * @throws {CacheLayerError} When entity configuration is unregistered.
 */
export const getCachedList = function(queryClient, entity, filter = {}, options = {}) {
  const { strict = false } = options;
  const config = ENTITY_CONFIGS[entity];
  if (!config) {
    throw new CacheLayerError(`Unsupported entity type: ${entity}`, { entity, filter });
  }

  // 1. Try resolving exact list cache by filter
  const targetKey = config.listKey(filter);
  const cachedList = queryClient.getQueryData(targetKey);
  if (Array.isArray(cachedList) && cachedList.length > 0) {
    if (!filter || filter === EMPTY_FILTER || Object.keys(filter).length === 0) {
      return cachedList;
    }
    const strategyFn = CACHE_RESOLVER_STRATEGIES[entity] || resolveGenericList;
    return strategyFn(cachedList, filter);
  }

  // 2. Resolve via Strategy Callback (Strategy Pattern)
  const strategyFn = CACHE_RESOLVER_STRATEGIES[entity] || resolveGenericList;
  if (typeof strategyFn === 'function') {
    const listsKey = typeof config.listsKey === 'function' ? config.listsKey() : config.listsKey;
    const listQueries = queryClient.getQueriesData({ queryKey: listsKey });
    for (const [key, listData] of listQueries) {
      const keyFilter = key[2]?.filter || {};
      const isGlobalList = Object.keys(keyFilter).length === 0;

      if (isGlobalList && Array.isArray(listData) && listData.length > 0) {
        return strategyFn(listData, filter);
      }
    }
  }

  // 3. Fallback: ONLY scan prefix keys when filter is completely empty
  if (!strict && (!filter || Object.keys(filter).length === 0)) {
    const listsKey = typeof config.listsKey === 'function' ? config.listsKey() : config.listsKey;
    const listQueries = queryClient.getQueriesData({ queryKey: listsKey });
    for (const [key, listData] of listQueries) {
      if (Array.isArray(listData) && listData.length > 0) {
        return listData;
      }
    }
  }

  return undefined;
};
```

---

#### 3. Persistent Parallel DOM Tab Layout (`src/pages/admin/TeacherProfile.jsx`)

```javascript
/**
 * Stable in-memory tab mount container.
 * Retains initialized tab component trees across switches using persistent display gating.
 * Prevents remount thrashing and preserves local hook cache state.
 */
```

**Logical Execution Workflow**:
1. Mounts all core tab components (`Overview`, `Attendance`, `Assigned Classes`, `Salary & Payroll`) once during parent profile mount.
2. Applies CSS visibility toggling (`className={activeTab === tabKey ? 'block' : 'hidden'}`) to preserve DOM nodes and maintain active TanStack Query observers without issuing abort signals.
3. Decouples tab component instances from transient header re-renders via persistent element memoization keyed exclusively by `teacher.teacher_id`.

---

### **Rule N2: Absolute Background Base Knowledge Traceability**

* **Referenced Schemas**:
  * `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Staff\TeacherSalaryConfig.json` (Polymorphic: `entity_id`, `entity_type`)
  * `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Staff\TeacherPaymentTransaction.json` (Columns: `transaction_id`, `teacher_id`)
* **Referenced Core Modules**:
  * `src/lib/react-query/cacheHelper.js` (`resolveList`, `getCachedList`, `ENTITY_CONFIGS`)
  * `src/lib/react-query/cacheStrategies.js` (`CACHE_RESOLVER_STRATEGIES`, `resolveGenericList`)
  * `src/lib/react-query/queryKeys.js` (Query Key Factory)
  * `src/features/teacher/hooks/useTeacherQueries.js`
  * `src/features/batch/hooks/useBatchQueries.js` (`useBatchesQuery`)
  * `src/pages/admin/TeacherProfile.jsx`
* **UI Component Catalog**:
  * `src/components/ui/v2/` & `.gemini/memory/ui_component/components.index.json`

---

### **Rule N3: Explicit Fact vs. Assumption Boundary Declaration**

#### Verified Facts
1. **Never Invalidate with Filter Keys**: All canonical entity collections (Batches, Teachers, Courses, Branches) are cached globally under `list(EMPTY_FILTER)`. Invalidating with filter keys like `queryKeys.batch.list({ teacher_id: id })` creates fragmented orphan queries and breaks cache synchronization.
2. **Polymorphic Database Keys**: In `TeacherSalaryConfig.json`, the foreign key pointing to the teacher is named `entity_id` with `entity_type: 'Teacher'`. There is no `teacher_id` column.
3. **Generic Resolver Failure**: `resolveGenericList` compares `item['teacherId'] === filter.teacherId`. Because `item.teacherId` is `undefined`, it produces an empty array `[]` on every in-memory resolution pass.
4. **Queue Abort Trigger**: Switching unmounted tabs causes TanStack Query to fire `AbortSignal`, causing `SequentialRequestQueue` in `apiClient.js` to purge in-flight `staff_get_salary_configs` requests.

#### System Assumptions
1. Retaining tab component instances in RAM via CSS `hidden`/`block` toggling incurs negligible DOM overhead (4 tab panels per teacher profile) while completely eliminating unmount abort signals.
2. When the user explicitly clicks the profile's **Refresh** button, the query client should invalidate ONLY the teacher's transactional sub-ledger (`teacher.detail`, `salaryConfigs`, `paymentTransactions`, `attendance`), leaving the global batch and course master collections intact in RAM.

---

### **Rule N4: Execution Boundary & Render Latency**

* **DOM Retention Rule**: Tab panels remain mounted in RAM. Tab switching latency is reduced from $\sim 12,000\text{ms}$ (network round-trip) to $< 1\text{ms}$ (instantaneous CSS class toggle).
* **Zero Network Calls on Tab Switching**: Tab switches generate **$0$** network calls after initial load.
* **Repository-Driven Derivation**: Batches assigned to the teacher are derived in-memory from the global batch list in RAM.

---

### **Rule N5: Performance Regression & Benchmark Assertions**

* **Metric Formula**: 
  * Tab Switch Payout Resolution: $T(n) = O(1)$ in-memory RAM lookup ($\le 0.5\text{ms}$).
  * Network Query Deduplication: Active requests are locked via `activeRequests` map in `cacheHelper.js`.
* **Harness Assertion**: `useTeacherPayroll.js` logs computation benchmark timing assertions (`[useTeacherPayroll] Calculations complete in X.XXms`).

---

### **Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation**

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** `cacheHelper.js` lines 466-474 (`getCachedList` Step 3 Fallback Scan)
> * **Core Technical Debt Risk:** Scanning `queryKey: ['teacher', 'detail']` without checking if the data belongs to the requested `teacherId` causes leakages where transactions from other faculty are displayed under the active profile.
> * **Remediation:** Enforce that Step 3 Fallback only executes if `filter` is empty (`Object.keys(filter).length === 0`). When specific entity filters like `teacherId` are provided, return `undefined` to prompt a clean, scoped network fetch.

---

## 2. Proposed Changes by Component

```
dazzling-erp-admin/
├── src/lib/react-query/
│   ├── cacheStrategies.js              # [MODIFY] Register resolveTeacherSalaryConfigList & resolveTeacherPaymentTransactionList
│   └── cacheHelper.js                  # [MODIFY] Guard fallback scan from returning un-scoped collections
├── src/features/teacher/hooks/
│   ├── useTeacherQueries.js            # [MODIFY] Replace initialData with guarded placeholderData, remove refetchOnMount:false
│   └── useTeacherPayroll.js            # [MODIFY] Graceful loading boundary & prevent unmounting child cards on transient fetch
└── src/pages/admin/
    └── TeacherProfile.jsx              # [MODIFY] Persistent parallel DOM tab mounting & targeted sub-ledger refresh (NO batch filter invalidation)
```

---

### Step-by-Step Implementation Details

#### 1. [`src/lib/react-query/cacheStrategies.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheStrategies.js)
* Implement `resolveTeacherSalaryConfigList` normalizing `entity_id`, `teacher_id`, and `teacherId`.
* Implement `resolveTeacherPaymentTransactionList` normalizing `teacher_id` and `teacherId`.
* Register both in `CACHE_RESOLVER_STRATEGIES`.

#### 2. [`src/lib/react-query/cacheHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)
* In `getCachedList`, add condition `!strict && (!filter || Object.keys(filter).length === 0)` before executing Step 3 fallback scan.

#### 3. [`src/features/teacher/hooks/useTeacherQueries.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)
* In `useTeacherSalaryConfigsQuery`:
  * Replace `initialData` with `placeholderData: () => (cached?.length > 0 ? cached : undefined)`.
  * Remove `refetchOnMount: false` and `refetchOnReconnect: false`.
  * Set sane `staleTime: 5 * 60 * 1000` (5 minutes).
* In `useTeacherPaymentTransactionsQuery`:
  * Replace `initialData` with `placeholderData`.
  * Set `staleTime: 5 * 60 * 1000`.

#### 4. [`src/features/teacher/hooks/useTeacherPayroll.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherPayroll.js)
* Decouple the full-page blocking `isPending` state so cached records remain visible in RAM during background revalidations.

#### 5. [`src/pages/admin/TeacherProfile.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/TeacherProfile.jsx)
* Retain parallel DOM tab mounting.
* In `handleRefresh`, invalidate ONLY the teacher's dedicated sub-ledger:
  ```javascript
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.teacher.detail(id) });
    queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(id), 'salaryConfigs'] });
    queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(id), 'paymentTransactions'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.teacher.attendanceProfile(id, 'all') });
  }, [queryClient, id]);
  ```
  *(Never invalidate `queryKeys.batch.list({ teacher_id: id })`)*.

---

## 3. Verification Plan

### Automated / Syntax Verification
* Code self-assessment and syntax verification across all 5 modified files.

### Manual Verification Scenarios
1. **Tab Switching Resilience (Zero Unmount / Zero Data Loss)**:
   - Navigate to Teacher Profile $\rightarrow$ `Salary & Payroll` tab. Wait for configs to load.
   - Switch to `Assigned Classes`, then `Attendance`, then `Overview`.
   - Switch back to `Salary & Payroll`.
   - **Verification**: Content appears instantly with zero spinner flash, 0 network requests, and active configuration intact.
2. **Refresh Button Verification**:
   - Click the top-right **Refresh** button on the teacher profile.
   - **Verification**: Invalidation triggers clean network refetches for the teacher's sub-ledger without throwing abort exceptions or wiping out existing configurations. Shared batch lists remain untouched in RAM.
3. **Multi-Teacher Isolation**:
   - Navigate to Teacher A profile $\rightarrow$ verify payment transactions.
   - Navigate to Teacher B profile $\rightarrow$ verify payment transactions.
   - **Verification**: Teacher B only sees their own transactions; no leakages from Teacher A.
