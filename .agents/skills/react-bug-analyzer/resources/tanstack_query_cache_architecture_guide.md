# TanStack Query Cache Architecture & Key Factory Reference Guide

This reference guide documents the official architectural standards, caching rules, query key conventions, and anti-patterns for **TanStack Query (React Query)** within the `dazzling-erp-admin` codebase.

---

## 🏛️ Core Architectural Principles

1. **Centralized Query Key Factory (`queryKeys.js`)**: All cache keys **MUST** be generated via the centralized factory functions in `src/lib/react-query/queryKeys.js`. Writing inline string arrays in hooks or mutations is strictly prohibited.
2. **Centralized Cache Helper Layer (`cacheHelper.js`)**: Every custom `use*Query` hook **MUST** route data resolution through `cacheHelper` methods (`resolveList`, `resolveRecord`, `getCachedList`, `getCachedRecord`).
3. **Decoupled Key Depth & Select Filtering**: Keep query keys focused at the collection or parent-entity boundary (`['batches', 'tests', batchId]`). Do not create deeply nested query keys for single sub-items when the dataset can be derived via `select` transformations.
4. **Decouple Ephemeral UI Filters from Query Keys**: Group cache keys must remain stable across UI filter toggles. Perform filtering client-side or inside the `select` data transformer rather than appending filter parameters to the query key array.

---

## 🔑 1. Mandatory `cacheHelper.js` Integration

### **Why it Matters**
`cacheHelper.js` acts as the system's normalization, schema validation, and cache hydration engine. Direct un-normalized storage of raw Apps Script API payloads bypasses relational stitching (`hydrateRecord`) and schema check constraints.

### **Required Helper Functions in Custom Query Hooks**

| Helper Method | Purpose | Usage Example |
| :--- | :--- | :--- |
| `resolveList(queryKey, rawData, options)` | Normalizes, validates, and writes array data to React Query cache. | Used in `queryFn` or `onSuccess` for list queries. |
| `resolveRecord(queryKey, rawData, options)` | Normalizes, validates, and writes a single record to cache. | Used for detail or single entity lookups. |
| `getCachedList(queryKey)` | Synchronously reads list array from cache RAM. | Used for optimistic updates or initial data fallback. |
| `getCachedRecord(queryKey)` | Synchronously reads single record from cache RAM. | Used for immediate modal/drawer population. |

---

## 📐 2. Query Key Granularity & Depth Control

### **The Rule**
Keep React Query keys scoped to the primary entity container or parent boundary. Avoid over-segmenting cache keys by embedding child IDs when the parent collection is already fetched and cached.

### **Good Granularity (Parent Boundary)**
```javascript
// ✅ GOOD: Scoped to parent batch boundary
queryKeys.batch.tests(batchId) 
// Result: ['batches', 'tests', 'BTC-101']
```

### **Anti-Pattern (Overly Deep Granularity)**
```javascript
// ❌ ANTI-PATTERN: Overly deep key causing cache fragmentation
['batches', 'tests', 'BTC-101', 'TST-9002', 'student-405']
```

### **The Solution: Derive Sub-Items via `select` Option**
Instead of creating a new query key for individual test details, leverage React Query's built-in `select` transformer over the cached parent collection:

```javascript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/react-query/queryKeys';
import { resolveList } from 'src/lib/react-query/cacheHelper';

// ✅ CORRECT: Single parent cache key, derived item lookup via select
export function useBatchTestDetailQuery(batchId, testId) {
  return useQuery({
    queryKey: queryKeys.batch.tests(batchId),
    queryFn: async () => {
      const rawData = await fetchBatchTestsFromApi(batchId);
      return resolveList(queryKeys.batch.tests(batchId), rawData, { entityType: 'tests' });
    },
    select: (tests) => tests?.find(test => test.id === testId),
    enabled: !!batchId && !!testId,
  });
}
```

---

## 🎨 3. Decoupling Ephemeral UI Filters from Query Keys

### **The Problem**
If UI filters (e.g. `status='Published'`, `dateRange='this_month'`, `search='Algebra'`) are appended directly into the query key array, every button click or filter toggle generates a completely new query key. This causes **cache misses**, triggers unnecessary network calls, and breaks global invalidations.

### ❌ **Anti-Pattern (Filter Params inside Query Key)**
```javascript
// ❌ ANTI-PATTERN: Filter state inside query key causes cache miss on every filter toggle
export function useBatchTestsQuery(batchId, filters) {
  return useQuery({
    queryKey: ['batches', 'tests', batchId, filters.status, filters.search], // BAD!
    queryFn: () => fetchFilteredTests(batchId, filters),
  });
}
```

### ✅ **Recommended Pattern (Stable Group Key + Client-Side Filtering)**
Keep the query key stable (`queryKeys.batch.tests(batchId)`). Fetch and cache the master collection once, and perform filtering using `queryEngine.js` or the `select` option:

```javascript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/react-query/queryKeys';
import { resolveList } from 'src/lib/react-query/cacheHelper';
import { aq } from 'src/lib/queryEngine';

// ✅ RECOMMENDED: Stable group key + fluent queryEngine filtering inside select
export function useBatchTestsQuery(batchId, filters = {}) {
  return useQuery({
    queryKey: queryKeys.batch.tests(batchId),
    queryFn: async () => {
      const rawData = await fetchBatchTestsFromApi(batchId);
      return resolveList(queryKeys.batch.tests(batchId), rawData, { entityType: 'tests' });
    },
    select: (tests) => {
      if (!Array.isArray(tests)) return [];
      
      let table = aq(tests);
      if (filters.status && filters.status !== 'all') {
        table = table.filter(t => t.status === filters.status);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        table = table.filter(t => t.title.toLowerCase().includes(query));
      }
      return table.objects();
    },
    enabled: !!batchId,
  });
}
```

---

## 🔄 4. Invalidation & Cache Consistency Workflow

By maintaining stable group keys (`queryKeys.batch.tests(batchId)`), invalidating data after a mutation is simple, clean, and guarantees that all open tabs, KPIs, and detail panels instantly receive the updated data:

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/react-query/queryKeys';
import { saveTestMarksApi } from '../api/test.api';

export function useUpsertTestMarksMutation(batchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => saveTestMarksApi(payload),
    onSuccess: (response) => {
      // ✅ Invalidation targets the stable group query key!
      // Instantly updates tests list, KPI cards, and detail panels
      queryClient.invalidateQueries({
        queryKey: queryKeys.batch.tests(batchId),
      });
    },
  });
}
```

---

## ⚡ Summary Matrix: Good vs. Bad Practices

| Architectural Dimension | ❌ Anti-Pattern | ✅ Approved Best Practice |
| :--- | :--- | :--- |
| **Query Key Definition** | Inline string array `['teacher', id]` | Factory call `queryKeys.teacher.detail(id)` |
| **Cache Data Resolution** | Returning raw API JSON directly in `queryFn` | Wrapping response with `resolveList` / `resolveRecord` |
| **Single Item Lookup** | Creating deep key `['batch', batchId, 'test', testId]` | Stable key `queryKeys.batch.tests(batchId)` + `select: (list) => list.find(...)` |
| **UI Filtering** | Adding filter object to query key array | Stable group key + `select` transformer using `queryEngine.js` (`aq`) |
| **Cache Invalidation** | Trying to invalidate multiple granular sub-keys | Invalidate single stable parent key `queryKeys.batch.tests(batchId)` |
