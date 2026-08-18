import { queryKeys, EMPTY_FILTER } from './queryKeys.js';
import { hasSchema, getSchema } from './schemaRegistry.js';
import { validateRecordSchema } from './validationEngine.js';
import { normalizeRecord } from './hydrate.js';
import { alertStore } from './alertStore.js';
import { CACHE_RESOLVER_STRATEGIES, resolveGenericList } from './cacheStrategies.js';


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
    listKey: () => queryKeys.student.list(EMPTY_FILTER),
    detailKey: (id) => queryKeys.student.detail(id),
    listsKey: () => queryKeys.student.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && ('student_name' in data || 'email' in data)
  },
  teacher: {
    primaryKey: 'teacher_id',
    listKey: () => queryKeys.teacher.list(EMPTY_FILTER),
    detailKey: (id) => queryKeys.teacher.detail(id),
    listsKey: () => queryKeys.teacher.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && ('full_name' in data || 'mobile_number' in data)
  },
  batch: {
    primaryKey: 'batch_id',
    listKey: () => queryKeys.batch.list(EMPTY_FILTER),
    detailKey: (id) => queryKeys.batch.detail(id),
    listsKey: () => queryKeys.batch.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && 'batch_name' in data
  },
  course: {
    primaryKey: 'course_id',
    listKey: () => queryKeys.course.list(EMPTY_FILTER),
    detailKey: (id) => queryKeys.course.detail(id),
    listsKey: () => queryKeys.course.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && 'name' in data
  },
  package: {
    primaryKey: 'package_id',
    listKey: () => queryKeys.course.package.list(EMPTY_FILTER),
    detailKey: (id) => queryKeys.course.package.detail(id),
    listsKey: () => queryKeys.course.package.all,
    isValidDetail: (data) => data && typeof data === 'object' && 'package_fee' in data
  },
  teacherSalaryConfig: {
    primaryKey: 'salary_config_id',
    listKey: () => ['teacher', 'salaryConfig', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['teacher', 'detail'],
    detailKey: (id) => ['teacher', 'salaryConfig', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'contract_status' in data
  },
  teacherPaymentTransaction: {
    primaryKey: 'transaction_id',
    listKey: () => ['teacher', 'paymentTransaction', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['teacher', 'detail'],
    detailKey: (id) => ['teacher', 'paymentTransaction', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'transaction_id' in data
  },
  courseType: {
    primaryKey: 'course_type_id',
    listKey: () => queryKeys.course.type.list(),
    listsKey: () => ['course-type'],
    detailKey: (id) => ['course-type', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'type_name' in data
  },
  packageItem: {
    primaryKey: 'item_id',
    listKey: () => ['packageItem', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['packageItem'],
    detailKey: (id) => ['packageItem', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'item_id' in data
  },
  packagePerk: {
    primaryKey: 'perk_id',
    listKey: () => ['packagePerk', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['packagePerk'],
    detailKey: (id) => ['packagePerk', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'perk_id' in data
  },
  teacherSubject: {
    primaryKey: 'teacher_subject_id',
    listKey: () => ['teacherSubject', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['teacherSubject'],
    detailKey: (id) => ['teacherSubject', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'teacher_subject_id' in data
  },
  studentAttendance: {
    primaryKey: 'attendance_id',
    listKey: () => ['studentAttendance', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['studentAttendance'],
    detailKey: (id) => ['studentAttendance', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'attendance_id' in data
  },
  teacherAttendance: {
    primaryKey: 'attendance_id',
    listKey: () => ['teacherAttendance', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['teacherAttendance'],
    detailKey: (id) => ['teacherAttendance', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'attendance_id' in data
  },
  batchAllocation: {
    primaryKey: 'allocation_id',
    listKey: () => queryKeys.batch_allocation.list(EMPTY_FILTER),
    listsKey: () => queryKeys.batch_allocation.all,
    detailKey: (id) => queryKeys.batch_allocation.detail(id),
    isValidDetail: (data) =>
      data && typeof data === 'object' && 'allocation_id' in data && 'student_id' in data
  },
  batchAttendance: {
    primaryKey: 'attendance_id',
    listKey: (filter = EMPTY_FILTER) => {
      if (filter && typeof filter === 'object') {
        if (filter.batchId && filter.date && filter.date !== 'all') {
          return queryKeys.attendance.batch(filter.batchId, filter.date);
        }
        if (filter.batchId) {
          return queryKeys.attendance.batchAll(filter.batchId);
        }
      }
      return queryKeys.attendance.all;
    },
    listsKey: () => queryKeys.attendance.all,
    detailKey: (id) => [...queryKeys.attendance.all, 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && ('attendance_id' in data || 'student_id' in data)
  },
  enrollment: {
    primaryKey: 'enrollment_id',
    listKey: () => queryKeys.enrollment.list(EMPTY_FILTER),
    detailKey: (id) => queryKeys.enrollment.detail(id),
    listsKey: () => queryKeys.enrollment.all,
    isValidDetail: (data) => data && typeof data === 'object' && 'enrollment_id' in data
  },
  user: {
    primaryKey: 'user_id',
    listKey: () => queryKeys.user.list(EMPTY_FILTER),
    detailKey: (id) => queryKeys.user.detail(id),
    listsKey: () => queryKeys.user.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && 'username' in data
  },
  lead: {
    primaryKey: 'lead_id',
    listKey: () => queryKeys.lead.list(EMPTY_FILTER),
    detailKey: (id) => queryKeys.lead.detail(id),
    listsKey: () => queryKeys.lead.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && ('lead_id' in data || 'student_name' in data)
  },
  branch: {
    primaryKey: 'branch_id',
    listKey: () => queryKeys.branch.list(EMPTY_FILTER),
    detailKey: (id) => queryKeys.branch.detail(id),
    listsKey: () => queryKeys.branch.all,
    isValidDetail: (data) => data && typeof data === 'object' && ('branch_id' in data || 'branch_name' in data)
  },
  staff: {
    primaryKey: 'staff_id',
    listKey: () => queryKeys.staff.list(EMPTY_FILTER),
    detailKey: (id) => ['staff', 'detail', id],
    listsKey: () => queryKeys.staff.lists(),
    isValidDetail: (data) => data && typeof data === 'object' && ('staff_id' in data || 'full_name' in data || 'name' in data)
  },
  installment: {
    primaryKey: 'installment_id',
    listKey: () => queryKeys.finance.installment.list(EMPTY_FILTER),
    detailKey: (id) => [...queryKeys.finance.installment.all, 'detail', id],
    listsKey: () => queryKeys.finance.installment.all,
    isValidDetail: (data) => data && typeof data === 'object' && ('installment_id' in data || 'amount' in data)
  },
  payment: {
    primaryKey: 'payment_id',
    listKey: () => queryKeys.finance.payment.list(EMPTY_FILTER),
    detailKey: (id) => [...queryKeys.finance.payment.all, 'detail', id],
    listsKey: () => queryKeys.finance.payment.all,
    isValidDetail: (data) => data && typeof data === 'object' && ('payment_id' in data || 'amount' in data)
  },
  studentFeeAccount: {
    primaryKey: 'fee_account_id',
    listKey: () => ['studentFeeAccount', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['studentFeeAccount'],
    detailKey: (id) => ['studentFeeAccount', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'fee_account_id' in data
  },
  feeAdjustment: {
    primaryKey: 'adjustment_id',
    listKey: () => ['feeAdjustment', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['feeAdjustment'],
    detailKey: (id) => ['feeAdjustment', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'adjustment_id' in data
  },
  feePlan: {
    primaryKey: 'plan_id',
    listKey: () => ['feePlan', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['feePlan'],
    detailKey: (id) => ['feePlan', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'plan_id' in data
  },
  promoCode: {
    primaryKey: 'promo_id',
    listKey: () => ['promoCode', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['promoCode'],
    detailKey: (id) => ['promoCode', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'promo_id' in data
  },
  teacherDocument: {
    primaryKey: 'document_id',
    listKey: () => ['teacherDocument', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['teacherDocument'],
    detailKey: (id) => ['teacherDocument', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'document_id' in data
  },
  address: {
    primaryKey: 'address_id',
    listKey: () => ['address', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['address'],
    detailKey: (id) => ['address', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'address_id' in data
  },
  contactInfo: {
    primaryKey: 'contact_id',
    listKey: () => ['contactInfo', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['contactInfo'],
    detailKey: (id) => ['contactInfo', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'contact_id' in data
  },
  education: {
    primaryKey: 'education_id',
    listKey: () => ['education', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['education'],
    detailKey: (id) => ['education', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'education_id' in data
  },
  testPaper: {
    primaryKey: 'paper_id',
    listKey: () => ['testPaper', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['testPaper'],
    detailKey: (id) => ['testPaper', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'paper_id' in data
  },
  session: {
    primaryKey: 'session_id',
    listKey: () => ['session', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['session'],
    detailKey: (id) => ['session', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'session_id' in data
  },
  overdue: {
    primaryKey: 'installment_id',
    listKey: () => queryKeys.finance.overdue(EMPTY_FILTER),
    detailKey: (id) => [...queryKeys.finance.all, 'overdue', id],
    listsKey: () => queryKeys.finance.all,
    isValidDetail: (data) => data && typeof data === 'object' && ('installment_id' in data || 'student_id' in data)
  },
  transaction: {
    primaryKey: 'transaction_id',
    listKey: () => queryKeys.finance.transaction.list(EMPTY_FILTER),
    detailKey: (id) => [...queryKeys.finance.transaction.all, 'detail', id],
    listsKey: () => queryKeys.finance.transaction.all,
    isValidDetail: (data) => data && typeof data === 'object' && ('transaction_id' in data || 'amount' in data)
  },
  category: {
    primaryKey: 'category_id',
    listKey: () => queryKeys.finance.category.list(EMPTY_FILTER),
    detailKey: (id) => [...queryKeys.finance.category.all, 'detail', id],
    listsKey: () => queryKeys.finance.category.all,
    isValidDetail: (data) => data && typeof data === 'object' && ('category_id' in data || 'category_name' in data || 'name' in data)
  },
  test: {
    primaryKey: 'id',
    listKey: () => queryKeys.test.all,
    listsKey: () => queryKeys.test.all,
    detailKey: (id) => queryKeys.test.detail(id),
    isValidDetail: (data) => data && typeof data === 'object' && ('title' in data || 'id' in data)
  },
  testMarks: {
    primaryKey: 'id',
    listKey: () => ['test', 'marks', 'list', { filter: EMPTY_FILTER }],
    listsKey: () => ['test', 'marks'],
    detailKey: (id) => [...queryKeys.test.all, 'marks', 'detail', id],
    isValidDetail: (data) => data && typeof data === 'object' && ('student_id' in data || 'id' in data)
  }
};

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

  // 2. Fallback: Search in list queries
  const targetKey = config.listKey(EMPTY_FILTER);
  const listData = queryClient.getQueryData(targetKey);
  if (Array.isArray(listData)) {
    const found = listData.find(item => String(item[config.primaryKey]) === String(id));
    if (found) return found;
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
 * @param {object} [options={}] - Cache lookup configuration options.
 * @param {boolean} [options.strict=false] - Enforces exact match or filtered strategy lookup only.
 * @returns {Array|undefined} Cached list array or undefined.
 */
export function getCachedList(queryClient, entity, filter = {}, options = {}) {
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
      console.log(`[CacheHelper:ListHit] Found exact global list in cache for ${entity}.`);
      return cachedList;
    }
    const strategyFn = CACHE_RESOLVER_STRATEGIES[entity] || resolveGenericList;
    const resolved = strategyFn(cachedList, filter);
    console.log(`[CacheHelper:ListHit] Resolved filtered subset from RAM cache for ${entity}.`, { filter, count: resolved.length });
    return resolved;
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
        console.log(`[CacheHelper:ListStrategyFallback] Resolving cache list via strategy callback for ${entity}.`, { filter });
        return strategyFn(listData, filter);
      }
    }
  }

  // 3. Fallback: Scan any lists matching the prefix key (only if not strict AND filter is completely empty)
  if (!strict && (!filter || filter === EMPTY_FILTER || Object.keys(filter).length === 0)) {
    const listsKey = typeof config.listsKey === 'function' ? config.listsKey() : config.listsKey;
    const listQueries = queryClient.getQueriesData({ queryKey: listsKey });
    for (const [key, listData] of listQueries) {
      if (Array.isArray(listData) && listData.length > 0) {
        console.log(`[CacheHelper:ListFallback] Found alternative list in cache for ${entity} under key:`, key);
        return listData;
      }
    }
  } else {
    console.log(`[CacheHelper:ListStrict] Strict cache match enforced or active filter present. Bypassing dirty fallback scan for ${entity}.`, { filter });
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
 * @param {object} [options={}] - Custom execution handlers (onSuccess, onFailure, forceRefetch, strict).
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

  console.groupCollapsed(`🌊 [resolveList] Resolving ${entity.toUpperCase()}`);
  console.log('🎯 Target QueryKey:', JSON.stringify(targetKey));
  console.log('📊 Cache state -> exists:', !!query, '| isStale:', isStale, '| forceRefetch:', forceRefetch);

  // 1. Check cache first (unless forceRefetch is enabled or query is marked as stale)
  if (!forceRefetch && !isStale) {
    try {
      const cachedData = getCachedList(queryClient, entity, filter, options);
      if (cachedData) {
        console.log(`✅ [resolveList] Resolved ${entity} from CACHE (${cachedData.length} items).`);
        if (cachedData.length > 0) {
          console.log('🔑 First item keys in cache:', Object.keys(cachedData[0]));
        }
        console.groupEnd();
        if (onSuccess) onSuccess(cachedData);
        return cachedData;
      }
    } catch (cacheError) {
      console.warn(`⚠️ [resolveList] Cache lookup failed for ${entity}. Failsafe to network fetch.`, cacheError.message);
    }
  }

  // 2. Fetch from Network with request deduplication
  const filterKeyStr = JSON.stringify(filter);
  const reqKey = `${entity}:list:${filterKeyStr}`;
  if (activeRequests.has(reqKey)) {
    console.log(`🔁 [resolveList] Reusing active fetch request for ${entity}.`);
    console.groupEnd();
    return activeRequests.get(reqKey);
  }

  console.log(`🌐 [resolveList] Fetching ${entity} from NETWORK...`);
  const fetchPromise = (async () => {
    try {
      const rawData = await fetchFn();
      if (!Array.isArray(rawData)) {
        throw new Error(`Expected array payload, got: ${typeof rawData}`);
      }

      console.log(`📡 [resolveList] Raw network payload received for ${entity}:`, rawData.length, 'records.');
      if (rawData.length > 0) {
        console.log('🔑 First raw network item keys:', Object.keys(rawData[0]));
        const sample = rawData[0];
        if (entity === 'student') {
          console.log('🔑 Server child tables in raw response:', {
            Address: Array.isArray(sample.Address),
            ContactInfo: Array.isArray(sample.ContactInfo),
            Education: Array.isArray(sample.Education),
            BatchAllocation: Array.isArray(sample.BatchAllocation)
          });
        }
      }

      // Normalize records before validation and cache updates
      const data = normalizeRecord(entity, rawData);

      if (data.length > 0 && entity === 'student') {
        console.log('✨ First normalized student item keys:', Object.keys(data[0]));
        console.log('✨ Preserved child tables in normalized student:', {
          Address: Array.isArray(data[0].Address),
          ContactInfo: Array.isArray(data[0].ContactInfo),
          Education: Array.isArray(data[0].Education),
          BatchAllocation: Array.isArray(data[0].BatchAllocation)
        });
      }

      // For registered entities, execute a batch verification on all items in the list.
      const failedViolationsList = [];
      if (hasSchema(entity)) {
        const schema = getSchema(entity);
        data.forEach(record => {
          validateRecordSchema(entity, record, {
            failMode: 'lazy',
            context: 'read',
            suppressAlert: true
          });

          Object.keys(record).forEach(key => {
            if (!schema.fields[key]) {
              failedViolationsList.push({ field: key, type: 'unknown_field' });
            }
          });

          Object.entries(schema.fields).forEach(([fieldName, rules]) => {
            const value = record[fieldName];
            const isPresent = fieldName in record;

            if (rules.required && (!isPresent || value === null || value === undefined || value === '')) {
              failedViolationsList.push({ field: fieldName, type: 'required' });
            } else if (isPresent && value !== null && value !== undefined) {
              let valid = true;
              if (rules.type === 'string' && typeof value !== 'string') valid = false;
              if (rules.type === 'number' && typeof value !== 'number') valid = false;
              if (!valid) failedViolationsList.push({ field: fieldName, type: 'type_mismatch' });

              if (rules.choices && !rules.choices.includes(value)) {
                failedViolationsList.push({ field: fieldName, type: 'invalid_choice' });
              }
            }
          });
        });
      }

      if (failedViolationsList.length > 0) {
        failedViolationsList.forEach(violation => {
          alertStore.addAlert({
            variant: 'warning',
            title: `Bulk Schema Violation: ${entity.toUpperCase()}`,
            signature: `${entity}:bulk_list_failure`,
            metaField: violation.field,
            metaType: violation.type
          });
        });
      }

      // Update centralized list cache key
      const targetKey = config.listKey(filter);
      queryClient.setQueryData(targetKey, data);
      queryClient.setQueryDefaults(targetKey, {
        staleTime: 1000 * 60 * 60,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
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

      console.log(`💾 [resolveList] Successfully saved ${data.length} ${entity} records into RAM cache. Seeded ${seedCount} detail keys.`);
      console.groupEnd();

      if (onSuccess) onSuccess(data);
      return data;
    } catch (fetchError) {
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
        console.warn(`🛑 [resolveList] Fetch aborted for ${entity} (Query invalidation or unmount signal).`);
        console.groupEnd();
        return getCachedList(queryClient, entity, filter) || [];
      }
      console.error(`❌ [resolveList] Network fetch or cache update failed for ${entity}:`, fetchError.message);
      console.groupEnd();
      const contextError = new CacheLayerError(
        `Failed resolving list for ${entity}: ${fetchError.message}`,
        { entity, filter, originalError: fetchError }
      );
      if (onFailure) onFailure(contextError);
      throw contextError;
    } finally {
      activeRequests.delete(reqKey);
    }
  })();

  activeRequests.set(reqKey, fetchPromise);
  return fetchPromise;
}

