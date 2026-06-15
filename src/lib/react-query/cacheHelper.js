import { queryKeys } from './queryKeys.js';
import { hasSchema } from './schemaRegistry.js';
import { validateRecordSchema } from './validationEngine.js';
import { normalizeRecord } from './hydrate.js';

export class CacheLayerError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'CacheLayerError';
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

// Config mapping for each supported entity type
export const ENTITY_CONFIGS = {
  student: {
    primaryKey: 'student_id',
    listKey: (filter) => queryKeys.student.list(filter),
    detailKey: (id) => queryKeys.student.detail(id),
    listsKey: () => queryKeys.student.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && ('student_name' in data || 'email' in data)
  },
  teacher: {
    primaryKey: 'teacher_id',
    listKey: (filter) => queryKeys.teacher.list(filter),
    detailKey: (id) => queryKeys.teacher.detail(id),
    listsKey: () => queryKeys.teacher.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && ('full_name' in data || 'mobile_number' in data)
  },
  batch: {
    primaryKey: 'batch_id',
    listKey: (filter) => queryKeys.batch.list(filter),
    detailKey: (id) => queryKeys.batch.detail(id),
    listsKey: () => queryKeys.batch.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && 'batch_name' in data
  },
  course: {
    primaryKey: 'course_id',
    listKey: (filter) => queryKeys.course.list(filter),
    detailKey: (id) => queryKeys.course.detail(id),
    listsKey: () => queryKeys.course.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && 'name' in data
  },
  package: {
    primaryKey: 'package_id',
    listKey: (filter) => queryKeys.course.package.list(filter),
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

  const detailKey = config.detailKey(id);
  const query = queryClient.getQueryCache().find({ queryKey: detailKey });
  const isStale = query ? query.isStale() : true;

  // 1. Try cache first (unless query is marked as stale)
  if (!isStale) {
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
      const rawData = await fetchFn();
      if (!rawData) {
        throw new Error(`Received empty or null response for ${entity} with ID ${id}`);
      }

      // Normalize record before schema validation and cache updates
      const data = normalizeRecord(entity, rawData);

      // Validate fetched record against the schema engine if registered.
      // failMode is set to 'lazy' to gather and log validation errors to the console
      // without throwing exceptions that would disrupt the user interface, while
      // context is 'read' to ensure read-specific rules are applied.
      if (hasSchema(entity)) {
        validateRecordSchema(entity, data, { failMode: 'lazy', context: 'read' });
      }

      // Update detailed cache
      const detailKey = config.detailKey(id);
      queryClient.setQueryData(detailKey, data);
      queryClient.setQueryDefaults(detailKey, {
        staleTime: Infinity,
        gcTime: Infinity
      });

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

/**
 * Synchronous lookup of a list in the cache.
 * Looks for exact filter matches first, falling back to any existing list under the entity.
 * 
 * @function getCachedList
 * @param {QueryClient} queryClient - The active TanStack QueryClient instance.
 * @param {string} entity - Supported database entity config name (e.g. 'batch', 'course').
 * @param {object} [filter={}] - Database column filter values.
 * @returns {Array|undefined} Cached list array or undefined.
 */
export function getCachedList(queryClient, entity, filter = {}) {
  const config = ENTITY_CONFIGS[entity];
  if (!config) {
    throw new CacheLayerError(`Unsupported entity type: ${entity}`, { entity, filter });
  }

  // 1. Try resolving exact list cache by filter
  const targetKey = config.listKey(filter);
  const cachedList = queryClient.getQueryData(targetKey);
  if (Array.isArray(cachedList) && cachedList.length > 0) {
    console.log(`[CacheHelper:ListHit] Found exact list in cache for ${entity}.`, { filter });
    return cachedList;
  }

  // 2. Fallback: Scan any lists matching the prefix key
  const listsKey = typeof config.listsKey === 'function' ? config.listsKey() : config.listsKey;
  const listQueries = queryClient.getQueriesData({ queryKey: listsKey });
  for (const [key, listData] of listQueries) {
    if (Array.isArray(listData) && listData.length > 0) {
      console.log(`[CacheHelper:ListFallback] Found alternative list in cache for ${entity} under key:`, key);
      return listData;
    }
  }

  return undefined;
}

/**
 * Resolves a list of records.
 * Checks cache first, executes network fetch, writes list back to cache, 
 * and seeds individual detail pages in cache.
 * 
 * @async
 * @function resolveList
 * @param {QueryClient} queryClient - The active TanStack QueryClient instance.
 * @param {string} entity - Supported database entity config name.
 * @param {object} [filter={}] - Database column filter values.
 * @param {Function} fetchFn - Function returning a Promise of the network request.
 * @param {object} [options={}] - Custom execution handlers (onSuccess, onFailure, forceRefetch).
 * @returns {Promise<Array>} Resolved list promise.
 */
export async function resolveList(queryClient, entity, filter = {}, fetchFn, options = {}) {
  const { onSuccess, onFailure, forceRefetch = false } = options;
  const config = ENTITY_CONFIGS[entity];
  
  if (!config) {
    const error = new CacheLayerError(`Unsupported entity type: ${entity}`, { entity, filter });
    console.error(`[CacheLayerError] Configuration lookup failed.`, error);
    if (onFailure) onFailure(error);
    throw error;
  }

  const targetKey = config.listKey(filter);
  const query = queryClient.getQueryCache().find({ queryKey: targetKey });
  const isStale = query ? query.isStale() : true;

  // 1. Check cache first (unless forceRefetch is enabled or query is marked as stale)
  if (!forceRefetch && !isStale) {
    try {
      const cachedData = getCachedList(queryClient, entity, filter);
      if (cachedData) {
        console.log(`[CacheHelper:ListSuccess] Resolved list from Cache.`, {
          entity,
          filter,
          count: cachedData.length,
          timestamp: new Date().toISOString()
        });
        if (onSuccess) onSuccess(cachedData);
        return cachedData;
      }
    } catch (cacheError) {
      console.warn(`[CacheHelper:ListWarning] Cache lookup failed. Failsafe to fetch.`, {
        entity,
        error: cacheError.message
      });
    }
  }

  // 2. Fetch from Network with request deduplication
  const filterKeyStr = JSON.stringify(filter);
  const reqKey = `${entity}:list:${filterKeyStr}`;
  if (activeRequests.has(reqKey)) {
    console.log(`[CacheHelper:Deduplication] Reusing active fetch request for list.`, { entity, filter });
    return activeRequests.get(reqKey);
  }

  console.log(`[CacheHelper:CacheMiss] Fetching list from network...`, { entity, filter });
  const fetchPromise = (async () => {
    try {
      const rawData = await fetchFn();
      if (!Array.isArray(rawData)) {
        throw new Error(`Expected array payload, got: ${typeof rawData}`);
      }

      // Normalize records before validation and cache updates
      const data = normalizeRecord(entity, rawData);

      // For registered entities, execute a batch verification on all items in the list.
      // This validates each record against the schema registry using 'lazy' failMode
      // and 'read' context, which aggregates validation violations to the developer
      // console as non-blocking warnings, preventing a broken application shell.
      if (hasSchema(entity)) {
        data.forEach(record => {
          validateRecordSchema(entity, record, { failMode: 'lazy', context: 'read' });
        });
      }

      // Update centralized list cache key
      const targetKey = config.listKey(filter);
      queryClient.setQueryData(targetKey, data);
      queryClient.setQueryDefaults(targetKey, {
        staleTime: Infinity,
        gcTime: Infinity
      });

      // SEED DETAILED RECORDS: Prime the detail caches to avoid sub-query spinners
      let seedCount = 0;
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
              seedCount++;
            }
          }
        });
      }

      console.log(`[CacheHelper:ListSuccess] Resolved list from Network. Cache updated.`, {
        entity,
        listCount: data.length,
        seededDetails: seedCount,
        timestamp: new Date().toISOString()
      });

      if (onSuccess) onSuccess(data);
      return data;
    } catch (fetchError) {
      const contextError = new CacheLayerError(
        `Failed resolving list for ${entity}: ${fetchError.message}`,
        { entity, filter, originalError: fetchError }
      );

      console.error(`[CacheHelper:ListError] Network fetch or cache update failed.`, {
        entity,
        filter,
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

