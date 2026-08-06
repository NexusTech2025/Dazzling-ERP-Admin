# 📘 Production-Grade Architectural Guide: Canonical QueryKeys & RAM Filtering Standard

**Target System**: Dazzling ERP Admin  
**State & Data Layer**: TanStack Query (React Query) + Centralized `cacheHelper.js` + `apiClient.js`  
**Core Objective**: Eliminate duplicate network round-trips, prevent cache bucket fragmentation, enforce 100% in-memory dataset filtering, and guarantee instant, silky-smooth UI rendering across all ERP views and modals.

---

## 🎯 Executive Architectural Decrees

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                      THE 5 IMMUTABLE CANONICAL QUERY LAWS                                 │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│ Law 1: Single Canonical Global Cache Bucket                                               │
│         All list queries MUST target the un-parameterized canonical key                   │
│         queryKeys.[entity].list(EMPTY_FILTER) => [entity, "list", { filter: {} }].         │
│         NEVER pass dynamic filter objects into the queryKey array!                        │
│                                                                                           │
│ Law 2: 100% Client-Side In-Memory RAM Filtering                                           │
│         Filtering datasets by teacher_id, branch_id, course_id, status, role, etc.        │
│         MUST be delegated to RAM resolvers (resolveList + getCachedList +                │
│         resolveGenericList). Zero extra network calls when changing filters!              │
│                                                                                           │
│ Law 3: Universal Entity Registration in ENTITY_CONFIGS                                    │
│         Every database table entity MUST be registered in ENTITY_CONFIGS                  │
│         (cacheHelper.js) with listKey: () => queryKeys.[entity].list(EMPTY_FILTER).       │
│                                                                                           │
│ Law 4: Strict Cache Freshness (staleTime: 60m & refetchOnMount: false)                    │
│         List queries MUST define staleTime: 1000 * 60 * 60 (60 minutes) and               │
│         refetchOnMount: false to prevent component mounting from triggering refetches.    │
│                                                                                           │
│ Law 5: Zero Ad-Hoc Inline Query Hooks in Views or Modals                                  │
│         Components MUST NEVER write inline useQuery({ queryKey: ['users', 'list'] }).     │
│         Always consume standard feature hooks (useUsersQuery, useCoursesQuery, etc.).    │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Complete Architecture Pipeline

```
  App Startup (HydrationGuard)
              │
              ▼
   useErpHydration()  ──────►  Fetches all tables via sheet_batch_read in 1 HTTP flight
              │
              ▼
   queryClient.setQueryData(queryKeys.[entity].list(EMPTY_FILTER), records)
              │
              ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │                            TANSTACK QUERY RAM CACHE                                     │
 │  ["student", "list", { filter: {} }]     => Complete Student Array                      │
 │  ["teacher", "list", { filter: {} }]     => Complete Teacher Array                      │
 │  ["batch", "list", { filter: {} }]       => Complete Batch Array                        │
 │  ["course", "list", { filter: {} }]      => Complete Course Array                       │
 │  ["branch", "list", { filter: {} }]      => Complete Branch Array                       │
 │  ["user", "list", { filter: {} }]        => Complete User Array                         │
 │  ["category", "list", { filter: {} }]    => Complete Expense Category Array             │
 └─────────────────────────────────────────────────────────────────────────────────────────┘
              │
              ▼
  UI Component Mounts & Requests Filtered Subset (e.g. { branch_id: 'BR-01' })
              │
              ▼
   use[Entity]sQuery(filter)
              │
              ▼
   resolveList(queryClient, '[entity]', filter, fetchFn)
              │
              ▼
   getCachedList(queryClient, '[entity]', filter)
              │
              ▼
   resolveGenericList(cachedList, filter)  ===> Strict field equality (item[field] === val)
              │
              ▼
   Returns Filtered Subset Instantly from RAM (0 Network Calls! 🚀)
```

---

## 📄 Standard Production Code Templates

### Template 1: Feature Hook Implementation (`src/features/[module]/hooks/use[Entity]Queries.js`)

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { getCachedList, resolveList } from '../../../lib/react-query/cacheHelper';
import { fetch[Entity]s } from '../api/[entity].api';

/**
 * Standardized Canonical List Query Hook.
 * Consumes pre-hydrated RAM cache with strict field equality filtering.
 * 
 * @param {object} [filter=EMPTY_FILTER] - Dynamic filter criteria (e.g., { status: 'active', branch_id: 'BR-01' }).
 * @returns {object} TanStack Query result object.
 */
export const use[Entity]sQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    // 🔒 Law 1: Always target canonical un-parameterized list key
    queryKey: queryKeys.[entity].list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      // 🔒 Law 2: Delegate resolution to cacheHelper strategy pipeline
      return resolveList(
        queryClient,
        '[entity]',
        filter,
        async () => {
          const response = await fetch[Entity]s(token, filter, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch records');
          }
          return response.data?.data || [];
        },
        { signal }
      );
    },
    enabled: !!token,
    // 🔒 Immediate RAM cache display on mount
    initialData: () => getCachedList(queryClient, '[entity]', filter),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.[entity].list(EMPTY_FILTER))?.dataUpdatedAt,
    // 🔒 Law 4: Strict cache freshness constraints
    staleTime: 1000 * 60 * 60, // 60 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
```

---

### Template 2: Entity Registration in `ENTITY_CONFIGS` (`src/lib/react-query/cacheHelper.js`)

Every entity registered in `ENTITY_CONFIGS` MUST follow this exact shape:

```javascript
export const ENTITY_CONFIGS = {
  [entity]: {
    primaryKey: '[entity]_id',
    // 🔒 Law 3: listKey MUST evaluate to canonical EMPTY_FILTER key
    listKey: () => queryKeys.[entity].list(EMPTY_FILTER),
    detailKey: (id) => queryKeys.[entity].detail(id),
    listsKey: () => queryKeys.[entity].lists(),
    isValidDetail: (data) => data && typeof data === 'object' && ('[entity]_id' in data || 'id' in data)
  },
};
```

---

## 🚫 Hall of Shame: Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Parameterizing Query Keys
```javascript
// ❌ WRONG: Passing dynamic filter object into queryKey
queryKey: queryKeys.student.list(filter) // Generates ["student", "list", { filter: { branch_id: "BR-01" } }]

// ✅ CORRECT: Always use EMPTY_FILTER for global list query key
queryKey: queryKeys.student.list(EMPTY_FILTER) // Generates ["student", "list", { filter: {} }]
```
*Why it fails*: Causes cache bucket fragmentation. When app startup populates `["student", "list", { filter: {} }]`, searching for `["student", "list", { filter: { branch_id: "BR-01" } }]` results in a **cache miss** and triggers duplicate HTTP requests.

---

### ❌ Anti-Pattern 2: Setting `refetchOnMount: true`
```javascript
// ❌ WRONG: Forcing network revalidation on component mount
staleTime: 1000 * 60 * 60,
refetchOnMount: true, // 🚨 Triggers network fetch every time view opens!

// ✅ CORRECT: Rely on RAM cache and disable mount refetches
staleTime: 1000 * 60 * 60,
refetchOnMount: false,
refetchOnWindowFocus: false,
```
*Why it fails*: Overrides the `staleTime` window and forces TanStack Query to fire a background network request whenever the component mounts.

---

### ❌ Anti-Pattern 3: Raw Ad-Hoc Inline `useQuery` Hooks
```javascript
// ❌ WRONG: Writing inline queries inside forms or modals
const { data: users } = useQuery({
  queryKey: ['users', 'list'], // 🚨 Key mismatch against ['user', 'list', { filter: {} }]
  queryFn: () => apiClient.executeAction(...)
});

// ✅ CORRECT: Consume standardized feature hook
const { data: users } = useUsersQuery({ status: 'active' });
```
*Why it fails*: Creates un-tracked, fragmented query keys that bypass `cacheHelper.js`, causing redundant network fetches and potential state synchronization bugs.

---

### ❌ Anti-Pattern 4: Missing Entity Registration in `ENTITY_CONFIGS`
```javascript
// ❌ WRONG: Calling resolveList for an unregistered entity name
resolveList(queryClient, 'transaction', filter, fetchFn);
```
*Why it fails*: Throws runtime exception: `[CacheLayerError] Configuration lookup failed. Unsupported entity type: transaction`.

---

## 🔬 Diagnostic Checklist for Future Sessions

Whenever a view triggers unexpected network requests or throws cache errors, follow this 4-step diagnostic checklist:

| # | Diagnostic Check | Verification Command / Step | Resolution |
| :--- | :--- | :--- | :--- |
| **1** | Is the entity registered in `ENTITY_CONFIGS`? | Inspect `src/lib/react-query/cacheHelper.js` | Add entity mapping with `primaryKey`, `listKey`, `detailKey`, `listsKey`. |
| **2** | Does `listKey` use `EMPTY_FILTER`? | Check `listKey: () => queryKeys.[entity].list(EMPTY_FILTER)` | Ensure `listKey` does **not** accept dynamic `filter` parameters. |
| **3** | Is `refetchOnMount` set to `false`? | Inspect `use[Entity]sQuery` hook options | Change `refetchOnMount: true` $\rightarrow$ `refetchOnMount: false`. |
| **4** | Is `staleTime` set to 60 minutes (`1000 * 60 * 60`)? | Check `staleTime` in hook options | Set `staleTime: 1000 * 60 * 60` (or `Infinity`). |

---

## 🏆 Summary Checklist for Code Reviews

When reviewing or writing any new query hook or data component:

- [ ] Is `queryKeys.[entity].list(EMPTY_FILTER)` used as the `queryKey`?
- [ ] Is `resolveList(queryClient, '[entity]', filter, fetchFn)` called inside `queryFn`?
- [ ] Is `initialData` set to `() => getCachedList(queryClient, '[entity]', filter)`?
- [ ] Is `staleTime` set to `1000 * 60 * 60` (60 minutes)?
- [ ] Is `refetchOnMount` set to `false`?
- [ ] Is `refetchOnWindowFocus` set to `false`?
- [ ] Is the entity registered in `ENTITY_CONFIGS` in `cacheHelper.js`?
- [ ] Are form dropdowns consuming feature query hooks instead of inline `useQuery` calls?
