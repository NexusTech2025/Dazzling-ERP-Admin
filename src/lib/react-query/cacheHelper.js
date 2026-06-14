import { queryKeys } from './queryKeys.js';

// Config mapping for each supported entity type
export const ENTITY_CONFIGS = {
  student: {
    primaryKey: 'student_id',
    detailKey: (id) => queryKeys.student.detail(id),
    listsKey: () => queryKeys.student.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && ('student_name' in data || 'email' in data)
  },
  teacher: {
    primaryKey: 'teacher_id',
    detailKey: (id) => queryKeys.teacher.detail(id),
    listsKey: () => queryKeys.teacher.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && ('full_name' in data || 'mobile_number' in data)
  },
  batch: {
    primaryKey: 'batch_id',
    detailKey: (id) => queryKeys.batch.detail(id),
    listsKey: () => queryKeys.batch.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && 'batch_name' in data
  },
  course: {
    primaryKey: 'course_id',
    detailKey: (id) => queryKeys.course.detail(id),
    listsKey: () => queryKeys.course.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && 'name' in data
  },
  package: {
    primaryKey: 'package_id',
    detailKey: (id) => queryKeys.course.package.detail(id),
    listsKey: () => queryKeys.course.package.all,
    isValidDetail: (data) => data && typeof data === 'object' && 'package_fee' in data
  }
};

/**
 * Synchronous lookup of a record in the cache.
 * Checks the detail cache first, then scans all queries matching the lists key prefix.
 */
export function getCachedRecord(queryClient, entity, id) {
  if (!id) return undefined;
  const config = ENTITY_CONFIGS[entity];
  if (!config) {
    throw new Error(`[CacheHelper] Unsupported entity type: ${entity}`);
  }

  // 1. Check direct detail cache
  const detailKey = config.detailKey(id);
  const cachedDetail = queryClient.getQueryData(detailKey);
  if (cachedDetail && config.isValidDetail(cachedDetail)) {
    return cachedDetail;
  }

  // 2. Fallback: Scan list queries
  const listsKey = typeof config.listsKey === 'function' ? config.listsKey() : config.listsKey;
  const listQueries = queryClient.getQueriesData({ queryKey: listsKey });
  
  for (const [_, listData] of listQueries) {
    if (Array.isArray(listData)) {
      const item = listData.find(e => e && e[config.primaryKey] === id);
      if (item && config.isValidDetail(item)) {
        return item;
      }
    }
  }

  return undefined;
}

// Local request deduplicator map
const activeRequests = new Map();

/**
 * Resolves a record asynchronously.
 * 1. Checks cache first (via getCachedRecord).
 * 2. If missed, triggers fetchFn, deduplicates concurrent fetches, validates output, updates cache, and handles logging/callbacks.
 */
export async function resolveRecord(queryClient, entity, id, fetchFn, options = {}) {
  const { onSuccess, onFailure } = options;
  const config = ENTITY_CONFIGS[entity];

  if (!config) {
    const error = new Error(`[CacheHelper] Unsupported entity type: ${entity}`);
    console.error(`[CacheHelper:Error] Config resolution failed.`, { entity, id, error });
    if (onFailure) onFailure(error);
    throw error;
  }

  // 1. Try cache first
  try {
    const cachedData = getCachedRecord(queryClient, entity, id);
    if (cachedData) {
      console.log(`[CacheHelper:Success] Resolved from Cache.`, {
        entity,
        id,
        timestamp: new Date().toISOString()
      });
      if (onSuccess) onSuccess(cachedData);
      return cachedData;
    }
  } catch (cacheError) {
    console.warn(`[CacheHelper:Warning] Cache lookup error (continuing to network fetch):`, {
      entity,
      id,
      error: cacheError.message
    });
  }

  // 2. Fetch from Network (with concurrent request deduplication)
  const reqKey = `${entity}:${id}`;
  if (activeRequests.has(reqKey)) {
    console.log(`[CacheHelper:Deduplication] Reusing active fetch request.`, { entity, id });
    return activeRequests.get(reqKey);
  }

  console.log(`[CacheHelper:CacheMiss] Fetching from network...`, { entity, id });
  const fetchPromise = (async () => {
    try {
      const data = await fetchFn();
      if (!data) {
        throw new Error(`Received empty or null response for ${entity} with ID ${id}`);
      }

      // Update detailed cache
      const detailKey = config.detailKey(id);
      queryClient.setQueryData(detailKey, data);

      console.log(`[CacheHelper:Success] Resolved from Network. Cache updated.`, {
        entity,
        id,
        timestamp: new Date().toISOString()
      });

      if (onSuccess) onSuccess(data);
      return data;
    } catch (fetchError) {
      const contextError = new Error(`[CacheHelper:Error] Failed resolving ${entity} (${id}): ${fetchError.message}`);
      contextError.originalError = fetchError;

      console.error(`[CacheHelper:Error] Network fetch or cache update failed.`, {
        entity,
        id,
        error: fetchError.message || fetchError,
        stack: fetchError.stack
      });

      if (onFailure) onFailure(contextError);
      throw contextError;
    } finally {
      activeRequests.delete(reqKey);
    }
  })();

  activeRequests.set(reqKey, fetchPromise);
  return fetchPromise;
}
