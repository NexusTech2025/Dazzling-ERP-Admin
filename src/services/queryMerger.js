/**
 * @file src/services/queryMerger.js
 * @module QueryMerger
 * @description Decoupled Pluggable Query Merger for Dazzling ERP Admin.
 * Intercepts incoming API action requests before queue dispatching to batch compatible queries.
 */

import { API_REGISTRY } from './apiRegistry.js';

/**
 * Master Domain Category to Tables Mapping Engine
 * Organizes all 35 schemas into their respective domain categories.
 */
export const CATEGORY_TO_TABLES_MAP = {
  Academic: ['Course', 'Batch', 'CourseType', 'Package', 'PackageItem', 'PackagePerk', 'BatchAllocation', 'Enrollment'],
  Students: ['Student', 'Address', 'ContactInfo', 'Education', 'StudentLead'],
  Staff: ['Teacher', 'StaffMember', 'TeacherDocument', 'TeacherPaymentTransaction', 'TeacherSalaryConfig', 'TeacherSubject'],
  Core: ['Branch', 'PromoCode'],
  Finance: ['ExpenseCategory', 'FeeAdjustment', 'FeePlan', 'Installment', 'MoneyTransaction', 'Payment', 'StudentFeeAccount'],
  Attendance: ['StudentAttendance', 'TeacherAttendance'],
  Auth: ['User', 'Session'],
  Test: ['Test', 'TestMarks', 'TestPaper']
};

/**
 * Resolves domain category string for a target table name.
 * Throws an explicit error if the table is not registered to prevent silent misrouting.
 * 
 * @param {string} tableName - Target table name (e.g. 'Course').
 * @returns {string} Domain category name.
 * @throws {Error} If table is not registered in CATEGORY_TO_TABLES_MAP.
 */
export function getCategoryForTable(tableName) {
  for (const [category, tables] of Object.entries(CATEGORY_TO_TABLES_MAP)) {
    if (tables.includes(tableName)) return category;
  }
  throw new Error(`Developer Error: Unregistered schema table '${tableName}' in CATEGORY_TO_TABLES_MAP.`);
}

/**
 * Transforms an array of target table names into a grouped sheet_batch_read payload array.
 * 
 * @param {string[]} targetTables - Array of table names (e.g. ['Course', 'Student', 'Branch']).
 * @returns {Array<{spreadsheetId: string, sheets: string[]}>} Structured sheet_batch_read payload.
 */
export function buildBatchPayloadFromTargets(targetTables) {
  const grouped = {};
  targetTables.forEach(tableName => {
    const category = getCategoryForTable(tableName);
    if (!grouped[category]) grouped[category] = new Set();
    grouped[category].add(tableName);
  });

  return Object.entries(grouped).map(([spreadsheetId, sheetsSet]) => ({
    spreadsheetId,
    sheets: Array.from(sheetsSet)
  }));
}

class QueryMergerRegistry {
  constructor() {
    /** @private */
    this.strategies = new Map();
  }

  /**
   * Registers a pluggable merging strategy.
   * 
   * @param {string} name - Strategy identifier name (e.g. 'DATA_QUERY_TO_BATCH_MERGER').
   * @param {Object} config - Merger configuration.
   * @param {Function} config.matcher - Function (actionPath, payload) returning true if request can be merged.
   * @param {Function} config.merger - Handler function executing merged request.
   */
  registerStrategy(name, config) {
    if (!name || typeof config.matcher !== 'function' || typeof config.merger !== 'function') {
      console.warn(`[QueryMerger] Invalid strategy registration for '${name}'.`);
      return;
    }
    this.strategies.set(name, config);
    console.log(`[QueryMerger] Registered pluggable strategy: '${name}'`);
  }

  /**
   * Evaluates incoming request parameters against active strategies.
   * 
   * @param {string} actionPath - Target action path string.
   * @param {Object} payload - Data payload object.
   * @returns {string|null} Name of matching strategy or null.
   */
  findMatchingStrategy(actionPath, payload) {
    for (const [name, config] of this.strategies.entries()) {
      try {
        if (config.matcher(actionPath, payload)) {
          return name;
        }
      } catch (err) {
        console.error(`[QueryMerger] Matcher error in strategy '${name}':`, err);
      }
    }
    return null;
  }

  /**
   * Intercepts an action request before queue dispatching.
   * 
   * @async
   * @param {string} actionPath - API action path.
   * @param {Object} payload - Request payload.
   * @param {Function} fallbackFn - Execution handler if no strategy matches.
   * @param {Function} executeActionFn - Reference to apiClient.executeAction.
   * @returns {Promise<Object>} Execution response envelope.
   */
  intercept(actionPath, payload, token, fallbackFn, executeActionFn) {
    const matchingStrategyName = this.findMatchingStrategy(actionPath, payload);
    if (!matchingStrategyName) {
      console.log(`⚡ [QueryMerger] BYPASSED batch merger for '${payload?.target || actionPath}' (Has non-empty 'include' or non-data_query action) -> Running direct execution.`);
      return fallbackFn();
    }

    const strategy = this.strategies.get(matchingStrategyName);
    console.log(`🔀 [QueryMerger] MATCHED un-hydrated data_query for '${payload?.target}' -> Buffering into batch merger window.`);
    return strategy.merger(actionPath, payload, token, fallbackFn, executeActionFn);
  }
}

export const queryMerger = new QueryMergerRegistry();

// -----------------------------------------------------------------------------
// 📦 REGISTER DEFAULT STRATEGY: DATA_QUERY_TO_BATCH_MERGER
// -----------------------------------------------------------------------------

let pendingDataQueries = [];
let aggregationTimer = null;

queryMerger.registerStrategy('DATA_QUERY_TO_BATCH_MERGER', {
  /**
   * Matcher: Returns true if action is 'data_query' AND include parameter is missing or empty.
   */
  matcher: (actionPath, payload) => {
    if (actionPath !== 'data_query' || !payload?.target) return false;
    const include = payload.include;
    const hasNonEmptyInclude = include && typeof include === 'object' && Object.keys(include).length > 0;
    return !hasNonEmptyInclude;
  },

  /**
   * Merger: Buffers data_queries for 1000ms and converts them into 1 sheet_batch_read call.
   */
  merger: (actionPath, payload, token, fallbackFn, executeActionFn) => {
    return new Promise((resolve, reject) => {
      pendingDataQueries.push({ actionPath, payload, token, resolve, reject });

      if (!aggregationTimer) {
        aggregationTimer = setTimeout(async () => {
          const batchToProcess = [...pendingDataQueries];
          pendingDataQueries = [];
          aggregationTimer = null;

          // Extract all target table names and build grouped payload
          const targetTables = batchToProcess.map(q => q.payload.target);
          const batchPayload = buildBatchPayloadFromTargets(targetTables);
          const activeToken = batchToProcess.find(q => q.token)?.token || null;

          console.log(`\n📦 [QueryMerger] 1,000ms Aggregation Window Fired!`);
          console.log(`  Target Tables (${targetTables.length}):`, targetTables);
          console.log(`  Combined sheet_batch_read Payload:`, JSON.stringify(batchPayload, null, 2));

          try {
            // Execute single combined sheet_batch_read call
            const response = await executeActionFn(
              API_REGISTRY.ADMIN.SHEET_BATCH_READ,
              batchPayload,
              activeToken,
              {
                timeout: 'SHEET_BATCH', // 45s semantic timeout profile for merged batch queries
                actionOptions: {
                  responseKey: 'NAME',
                  driverType: 'ADVANCED'
                }
              }
            );

            if (!response.success) {
              throw new Error(response.message || 'Batch read query failed.');
            }

            const responseData = response.data || {};

            // Resolve each caller's promise with their specific target data slice
            batchToProcess.forEach(q => {
              const targetName = q.payload.target;
              const category = getCategoryForTable(targetName);
              let tableRecords = responseData[category]?.[targetName] || [];

              // Apply where filter in-memory if specified in the original data_query payload
              if (q.payload?.where && typeof q.payload.where === 'object' && Object.keys(q.payload.where).length > 0) {
                tableRecords = tableRecords.filter(row => {
                  if (!row || typeof row !== 'object') return false;
                  return Object.entries(q.payload.where).every(([key, value]) => {
                    return String(row[key]) === String(value);
                  });
                });
              }

              console.log(`✅ [QueryMerger] Resolving merged data_query for '${targetName}' (${tableRecords.length} records).`);

              q.resolve({
                success: true,
                data: {
                  data: tableRecords
                }
              });
            });

          } catch (err) {
            console.error(`💥 [QueryMerger] Merged batch execution failed:`, err);
            // On batch failure, reject all queued promises
            batchToProcess.forEach(q => q.reject(err));
          }
        }, 1000); // 1-Second Aggregation Window
      }
    });
  }
});
