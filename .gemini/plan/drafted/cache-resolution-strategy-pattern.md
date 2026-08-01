---
Title: Entity Record Cache Resolution Strategy Pattern - Implementation Plan
Date: 2026-07-30T23:49:30+05:30
Status: Proposed
---

# Entity Record Cache Resolution Strategy Pattern - Implementation Plan

This technical implementation plan details the architectural refactoring of the cache resolution layer (`cacheStrategies.js` and `cacheHelper.js`) to introduce a pluggable **Strategy Pattern** for resolving single entity records by ID.

---

## 🏛️ Executive Summary & Core Objectives

1. **Decoupled Resolution Strategies**: Replace the monolithic single-algorithm lookup in `resolveRecord` with pluggable, entity-assigned Strategy classes/functions (`ListFirstStrategy`, `CacheFirstStrategy`, `NetworkFirstStrategy`).
2. **Zero-Latency List-to-Detail Transition for Students**: Enable the `student` entity to leverage `ListFirstStrategy`, resolving basic student demographic data from `queryKeys.student.list(EMPTY_FILTER)` in RAM (**`< 1ms`**) without triggering unnecessary network calls for basic student info.
3. **Pluggable Entity Registry (`ENTITY_CONFIGS`)**: Extend `ENTITY_CONFIGS` to declare an explicit `strategy` property for each entity type, fulfilling the **SOLID Open-Closed Principle**.

---

## 🔍 Absolute Background Base Knowledge Traceability (Rule N2)

- **Referenced Schemas**:
  - `[Student.json](file:///e:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Students/Student.json)` (`student_id`, `student_name`, `email`, `phone`, `status`)
  - `[Teacher.json](file:///e:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Staff/Teacher.json)` (`teacher_id`, `teacher_name`, `email`)
  - `[Batch.json](file:///e:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Academic/Batch.json)` (`batch_id`, `batch_name`, `course_id`)
- **Referenced Core Infrastructure Modules**:
  - `[cacheStrategies.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheStrategies.js)`
  - `[cacheHelper.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)`
  - `[queryKeys.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/queryKeys.js)`
- **Knowledge Graph Reference**:
  - `[student_data_profile_architecture.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/memory/K-Graphs/student_data_profile_architecture.md)`

---

## 📌 Fact vs. Assumption Boundaries (Rule N3)

### Actual Verified Facts
1. `resolveRecord` currently checks if the specific detail query cache key (`queryKeys.student.detail(id)`) exists. If `query` is `undefined` (which is true on initial detail navigation), `isStale` evaluates to `true`, causing `resolveRecord` to bypass `getCachedRecord` and issue a network fetch.
2. `getCachedRecord` is already capable of scanning active list queries (`listQueries`) to retrieve records previously fetched by `useStudentsQuery`.
3. Entity types (`student`, `teacher`, `batch`, `course`) have different volatility profiles: `student` basic info rarely changes between list and detail views, whereas real-time data like `batchAttendance` requires fresh network verification.

### System Assumptions
1. When `ListFirstStrategy` locates a valid, normalized record in the list query cache, it can populate the specific detail cache key (`queryKeys.student.detail(id)`) synchronously, returning data immediately to the caller.

---

## 🛠️ Execution Blueprints (Rule N1)

### Blueprint 1: Strategy Registry Implementation (`src/lib/react-query/cacheStrategies.js`)

```javascript
/**
 * Resolves an entity record using the List-First strategy.
 * Checks detail cache first, then scans master list query cache in RAM.
 * Updates detail query data synchronously on list hit; fetches from network ONLY on cache miss.
 * 
 * @param {QueryClient} queryClient - TanStack Query Client instance.
 * @param {string} entity - Entity configuration key (e.g. 'student').
 * @param {string|number} id - Record primary key identifier.
 * @param {Function} fetchFn - Async network fetch callback.
 * @param {Object} config - Entity configuration object from ENTITY_CONFIGS.
 * @returns {Promise<Object>} Resolved entity record.
 * @throws {CacheLayerError} Network or schema validation error.
 */
export async function resolveListFirstStrategy(queryClient, entity, id, fetchFn, config) {
  if (!id) throw new Error(`[CacheStrategy:ListFirst] Primary key ID is required for ${entity}`);

  // 1. Scan List Queries & Detail Cache in RAM
  const cachedItem = getCachedRecord(queryClient, entity, id);
  if (cachedItem && config.isValidDetail(cachedItem)) {
    console.log(`[CacheStrategy:ListFirst] Resolved from RAM cache.`, { entity, id });
    
    // Synchronously populate specific detail query key if missing
    const detailKey = config.detailKey(id);
    if (!queryClient.getQueryData(detailKey)) {
      queryClient.setQueryData(detailKey, cachedItem);
    }
    return cachedItem;
  }

  // 2. Cache Miss -> Fallback to Network
  console.log(`[CacheStrategy:ListFirst] Cache miss for ${entity} (${id}). Fetching from network...`);
  const rawData = await fetchFn();
  if (!rawData) {
    throw new Error(`[CacheStrategy:ListFirst] Received null response for ${entity} ID ${id}`);
  }

  const normalized = normalizeRecord(entity, rawData);
  const detailKey = config.detailKey(id);
  queryClient.setQueryData(detailKey, normalized);
  return normalized;
}

/**
 * Resolves an entity record using the Cache-First strategy.
 * Checks detail cache first, then list cache, then network fetch.
 * 
 * @param {QueryClient} queryClient - TanStack Query Client instance.
 * @param {string} entity - Entity configuration key.
 * @param {string|number} id - Record primary key identifier.
 * @param {Function} fetchFn - Async network fetch callback.
 * @param {Object} config - Entity configuration object.
 * @returns {Promise<Object>} Resolved entity record.
 */
export async function resolveCacheFirstStrategy(queryClient, entity, id, fetchFn, config) {
  const cachedItem = getCachedRecord(queryClient, entity, id);
  if (cachedItem && config.isValidDetail(cachedItem)) {
    return cachedItem;
  }

  const rawData = await fetchFn();
  const normalized = normalizeRecord(entity, rawData);
  queryClient.setQueryData(config.detailKey(id), normalized);
  return normalized;
}

/**
 * Resolves an entity record using the Network-First strategy.
 * Always executes network fetch to guarantee fresh real-time payload.
 * 
 * @param {QueryClient} queryClient - TanStack Query Client instance.
 * @param {string} entity - Entity configuration key.
 * @param {string|number} id - Record primary key identifier.
 * @param {Function} fetchFn - Async network fetch callback.
 * @param {Object} config - Entity configuration object.
 * @returns {Promise<Object>} Resolved entity record.
 */
export async function resolveNetworkFirstStrategy(queryClient, entity, id, fetchFn, config) {
  const rawData = await fetchFn();
  const normalized = normalizeRecord(entity, rawData);
  queryClient.setQueryData(config.detailKey(id), normalized);
  return normalized;
}

/**
 * Strategy Registry mapping strategy strategy keys to concrete resolution implementations.
 * @type {Object.<string, Function>}
 */
export const RECORD_RESOLVER_STRATEGIES = {
  listFirst: resolveListFirstStrategy,
  cacheFirst: resolveCacheFirstStrategy,
  networkFirst: resolveNetworkFirstStrategy
};
```

---

### Blueprint 2: Integration into `cacheHelper.js` (`src/lib/react-query/cacheHelper.js`)

```javascript
import { RECORD_RESOLVER_STRATEGIES } from './cacheStrategies.js';

// Entity Configurations with Assigned Strategies
export const ENTITY_CONFIGS = {
  student: {
    primaryKey: 'student_id',
    strategy: 'listFirst', // 👈 ListFirstStrategy resolves basic info instantly from list cache!
    listKey: (filter) => queryKeys.student.list(filter),
    detailKey: (id) => queryKeys.student.detail(id),
    listsKey: () => queryKeys.student.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && ('student_name' in data || 'email' in data)
  },
  teacher: {
    primaryKey: 'teacher_id',
    strategy: 'cacheFirst',
    listKey: (filter) => queryKeys.teacher.list(filter),
    detailKey: (id) => queryKeys.teacher.detail(id),
    listsKey: () => queryKeys.teacher.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && ('full_name' in data || 'mobile_number' in data)
  },
  batch: {
    primaryKey: 'batch_id',
    strategy: 'cacheFirst',
    listKey: (filter) => queryKeys.batch.list(filter),
    detailKey: (id) => queryKeys.batch.detail(id),
    listsKey: () => queryKeys.batch.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && 'batch_name' in data
  }
};

/**
 * Resolves a single record using the entity's designated Strategy Pattern implementation.
 * 
 * @param {QueryClient} queryClient - TanStack Query Client instance.
 * @param {string} entity - Entity configuration key.
 * @param {string|number} id - Record primary key identifier.
 * @param {Function} fetchFn - Network fetch callback.
 * @param {Object} [options={}] - Resolution options (onSuccess, onFailure).
 * @returns {Promise<Object>} Resolved entity payload.
 */
export async function resolveRecord(queryClient, entity, id, fetchFn, options = {}) {
  const config = ENTITY_CONFIGS[entity];
  if (!config) {
    throw new Error(`[CacheHelper] Unsupported entity type: ${entity}`);
  }

  // Resolve strategy (defaults to 'cacheFirst' if unspecified)
  const strategyKey = config.strategy || 'cacheFirst';
  const strategyFn = RECORD_RESOLVER_STRATEGIES[strategyKey];

  if (!strategyFn) {
    throw new Error(`[CacheHelper] Unknown resolution strategy: ${strategyKey}`);
  }

  try {
    const result = await strategyFn(queryClient, entity, id, fetchFn, config);
    if (options.onSuccess) options.onSuccess(result);
    return result;
  } catch (error) {
    if (options.onFailure) options.onFailure(error);
    throw error;
  }
}
```

---

## ⚡ Performance Regression & Benchmark Assertions (Rule N5)

- **Target Execution Benchmark**: `resolveRecord` for `student` entity with cached list in RAM executes in **`< 1ms`** (`T(n) = O(1)` in-memory lookup).
- **Network Reduction Metric**: 100% elimination of redundant basic student HTTP requests when navigating from directory list to detailed view.

---

## 🚩 Legacy Maintenance Mitigation & Red Flag Isolation (Rule N6)

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** `cacheHelper.js` lines 128-148 (`getCachedRecord` list scanning loop).
> * **Core Technical Debt Risk:** Relying on linear `Array.prototype.find` scan across all active list queries has an `O(N)` search overhead if list query cache contains > 5,000 unindexed elements.
> * **Remediation Option:** Map entity primary keys into an internal `WeakMap` or `Map` index inside `resolveList` to enable true `O(1)` ID hash lookup.

---

## 🧪 Verification Plan

### Automated Strategy Diagnostics
- Verify `RECORD_RESOLVER_STRATEGIES.listFirst` returns cached student object instantly without calling `fetchFn`.

### Empirical Navigation Verification
1. Navigate to `/admin/students` -> list data fetched & cached under `EMPTY_FILTER`.
2. Click on a student card -> navigate to `/admin/students/STU-001`.
3. Inspect Chrome DevTools Network Tab -> verify **zero HTTP requests** issued for basic student detail (`student_get_by_id`).
