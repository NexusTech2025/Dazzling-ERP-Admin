---
Title: 🏗️ Refactoring Plan: Reliable Network Refetch & Cache Invalidation in `resolveList`
Date: 2026-07-31T14:44:00+05:30
Status: Approved-Completed
---

# 🏗️ Refactoring Plan: Reliable Network Refetch & Cache Invalidation in `resolveList`

This technical implementation plan addresses the exact architectural bottleneck where `resolveList` returns flat cached data instead of executing a network request during profile hydration refetches.

---

## 🔍 Root Cause Analysis

From the DevTools console log:
```
🔄 [useStudentById] Incomplete hydration detected — triggering imperative refetch
cacheHelper.js:349 🌊 [resolveList] Resolving STUDENT
cacheHelper.js:350 🎯 Target QueryKey: ["student","list",{"filter":{}}]
cacheHelper.js:351 📊 Cache state -> exists: true | isStale: false | forceRefetch: false
cacheHelper.js:283 [CacheHelper:ListHit] Found exact list in cache for student.
cacheHelper.js:358 ✅ [resolveList] Resolved student from CACHE (6 items).
```

### Why Network Fetch Was Bypassed:

1. **`staleTime: Infinity` Cache Lock**: `useErpHydration` seeds `queryKeys.student.list(EMPTY_FILTER)` on app startup and sets `staleTime: Infinity`. Therefore, `query.isStale()` evaluates to `false`.
2. **Imperative `refetch()` Stale Options Closure**: Calling `refetch()` inside an effect before React re-renders invokes the query function closed over `forceRefetch = false`.
3. **Cache Interception in `resolveList`**: Inside `resolveList`:
   ```javascript
   if (!forceRefetch && !isStale) {
     const cachedData = getCachedList(queryClient, entity, filter, options);
     if (cachedData) return cachedData; // 🛑 CACHE HIT INTERCEPTION
   }
   ```
   Since `forceRefetch` is `false` and `isStale` is `false`, `resolveList` intercepts the execution and immediately returns the flat ERP cached list without ever invoking `fetchStudents()`.

---

## 📌 Fact vs. Assumption Boundaries (Rule N3)

### Actual Verified Facts
1. `useErpHydration` seeds `queryKeys.student.list(EMPTY_FILTER)` with flat student rows and `staleTime: Infinity`.
2. `resolveList` checks `if (!forceRefetch && !isStale)` before initiating network calls.
3. If `forceRefetch` is `false` and `isStale` is `false`, `resolveList` returns cached data without calling `fetchFn`.

### System Assumptions
1. When a component explicitly requests a forced refetch due to incomplete data, `resolveList` MUST bypass cache lookup and execute `fetchStudents()`.

---

## 🛠️ Complete Refactoring Blueprint

### 1. `src/lib/react-query/cacheHelper.js` (`resolveList`)

Ensure `resolveList` bypasses cache whenever `forceRefetch` is `true` OR when explicit invalidation has marked the query as stale.

```javascript
/**
 * Resolves a list of records.
 * Checks cache first (unless forceRefetch is true or query is stale),
 * executes network fetch, writes normalized list to cache, and seeds detail keys.
 */
export async function resolveList(queryClient, entity, filter = {}, fetchFn, options = {}) {
  const { onSuccess, onFailure, forceRefetch = false } = options;
  const config = ENTITY_CONFIGS[entity];

  if (!config) {
    const error = new CacheLayerError(`Unsupported entity type: ${entity}`, { entity, filter });
    if (onFailure) onFailure(error);
    throw error;
  }

  const targetKey = config.listKey(filter);
  const query = queryClient.getQueryCache().find({ queryKey: targetKey });
  const isStale = query ? query.isStale() : true;

  console.groupCollapsed(`🌊 [resolveList] Resolving ${entity.toUpperCase()}`);
  console.log('🎯 Target QueryKey:', JSON.stringify(targetKey));
  console.log('📊 Cache state -> exists:', !!query, '| isStale:', isStale, '| forceRefetch:', forceRefetch);

  // 1. Check cache first ONLY if forceRefetch is FALSE and query is NOT stale
  if (!forceRefetch && !isStale) {
    try {
      const cachedData = getCachedList(queryClient, entity, filter, options);
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
        console.log(`✅ [resolveList] Resolved ${entity} from CACHE (${cachedData.length} items).`);
        console.groupEnd();
        if (onSuccess) onSuccess(cachedData);
        return cachedData;
      }
    } catch (cacheError) {
      console.warn(`⚠️ [resolveList] Cache lookup warning for ${entity}:`, cacheError.message);
    }
  }

  // 2. Fetch from Network
  console.log(`🌐 [resolveList] Bypassing cache -> Fetching ${entity} from NETWORK...`);
  const filterKeyStr = JSON.stringify(filter);
  const reqKey = `${entity}:list:${filterKeyStr}`;

  if (activeRequests.has(reqKey)) {
    console.log(`🔁 [resolveList] Reusing active fetch request for ${entity}.`);
    console.groupEnd();
    return activeRequests.get(reqKey);
  }

  const fetchPromise = (async () => {
    try {
      const rawData = await fetchFn();
      if (!Array.isArray(rawData)) {
        throw new Error(`Expected array payload, got: ${typeof rawData}`);
      }

      console.log(`📡 [resolveList] Network payload received for ${entity}:`, rawData.length, 'records.');

      // Normalize records while preserving child table arrays (Address, ContactInfo, Education, BatchAllocation)
      const data = normalizeRecord(entity, rawData);

      // Save normalized records to centralized list cache key
      queryClient.setQueryData(targetKey, data);
      queryClient.setQueryDefaults(targetKey, {
        staleTime: Infinity,
        gcTime: Infinity
      });

      // Seed individual detail records
      if (typeof config.detailKey === 'function') {
        data.forEach(record => {
          if (record && typeof record === 'object') {
            const recordId = record[config.primaryKey];
            if (recordId) {
              const detailKey = config.detailKey(recordId);
              queryClient.setQueryData(detailKey, record);
              queryClient.setQueryDefaults(detailKey, {
                staleTime: Infinity,
                gcTime: Infinity
              });
            }
          }
        });
      }

      console.log(`💾 [resolveList] Saved ${data.length} ${entity} records to RAM cache.`);
      console.groupEnd();

      if (onSuccess) onSuccess(data);
      return data;
    } catch (fetchError) {
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
        console.warn(`🛑 [resolveList] Fetch aborted for ${entity}.`);
        console.groupEnd();
        return getCachedList(queryClient, entity, filter) || [];
      }
      console.error(`❌ [resolveList] Network fetch failed for ${entity}:`, fetchError.message);
      console.groupEnd();
      throw fetchError;
    } finally {
      activeRequests.delete(reqKey);
    }
  })();

  activeRequests.set(reqKey, fetchPromise);
  return fetchPromise;
}
```

---

### 2. `src/features/student/hooks/useStudentQueries.js` (`useStudentsQuery`)

Ensure `forceRefetch` overrides TanStack Query's internal stale check so `queryFn` executes with `forceRefetch: true`:

```javascript
export const useStudentsQuery = (filter = EMPTY_FILTER, options = {}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { onSuccess, onError, strictSearch = false, forceRefetch = false } = options;

  const activeFilter = strictSearch ? filter : EMPTY_FILTER;

  return useQuery({
    queryKey: queryKeys.student.list(EMPTY_FILTER),
    queryFn: async () => {
      return resolveList(
        queryClient,
        'student',
        activeFilter,
        async () => {
          const response = await fetchStudents(token, activeFilter);
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch students');
          }
          return response.data?.data || [];
        },
        { forceRefetch }
      );
    },
    enabled: !!token,
    staleTime: forceRefetch ? 0 : Infinity,
    refetchOnMount: forceRefetch ? 'always' : false,
    refetchOnWindowFocus: false,
  });
};
```

---

### 3. `src/features/student/hooks/useStudentById.js` (`useStudentById`)

Refactor `useStudentById` to invalidate query cache using `queryClient.invalidateQueries` **AND** update `needsRefetch` state so re-render passes `forceRefetch: true`:

```javascript
export const useStudentById = (studentId) => {
  const queryClient = useQueryClient();
  const [needsRefetch, setNeedsRefetch] = useState(false);
  const hasRefetchedRef = useRef(false);

  // 1. Bind useStudentsQuery with forceRefetch option
  const {
    isLoading: isListLoading,
    isFetching: isListFetching
  } = useStudentsQuery(undefined, { forceRefetch: needsRefetch });

  // 2. Resolve complete profile from RAM query store
  const hydrated = useMemo(() => {
    return hydrateStudentProfile(queryClient, studentId);
  }, [queryClient, studentId, isListLoading, isListFetching]);

  // 3. Detect incomplete hydration and trigger ONE forced refetch
  useEffect(() => {
    if (hasRefetchedRef.current || needsRefetch || isListFetching) return;
    if (!hydrated?.student) return;

    const pd = hydrated.profileData;
    const isIncomplete = (
      !pd ||
      !Array.isArray(pd.allocations) ||
      (pd.allocations.length === 0 && pd.enrollments.length === 0)
    );

    if (isIncomplete) {
      console.log('🔄 [useStudentById] Incomplete hydration detected — invalidating cache and setting forceRefetch = true');
      hasRefetchedRef.current = true;
      
      // Mark query as stale in TanStack Query cache so isStale becomes true
      queryClient.invalidateQueries({ queryKey: queryKeys.student.list(EMPTY_FILTER) });
      
      // Trigger re-render with forceRefetch: true
      setNeedsRefetch(true);
    }
  }, [hydrated, needsRefetch, isListFetching, queryClient]);

  // 4. Reset refetch flag only AFTER network fetch completes
  const wasFetchingRef = useRef(false);

  useEffect(() => {
    if (isListFetching) {
      wasFetchingRef.current = true;
    } else if (needsRefetch && wasFetchingRef.current) {
      console.log('✅ [useStudentById] Forced network refetch completed — resetting forceRefetch state');
      setNeedsRefetch(false);
      wasFetchingRef.current = false;
    }
  }, [needsRefetch, isListFetching]);

  return {
    student: hydrated?.student || null,
    profileData: hydrated?.profileData || null,
    isLoading: (isListLoading || (needsRefetch && isListFetching)) && !hydrated?.student,
    isFetching: isListFetching,
    isRefetching: needsRefetch && isListFetching,
    error: null,
    exists: !!hydrated?.student
  };
};
```

---

## 🧪 Verification Plan

1. Open Student Detailed View (`/admin/students/STU-F120AE5D`).
2. Verify console logs:
   - `🔄 [useStudentById] Incomplete hydration detected...`
   - `🌐 [resolveList] Bypassing cache -> Fetching STUDENT from NETWORK...`
   - `📡 [resolveList] Network payload received for student...`
   - `💾 [resolveList] Saved 6 student records to RAM cache.`
3. Verify that `profileData.allocations` and `profileData.batches` are populated cleanly without `AbortError` or cache hit interception.
