/**
 * cacheStrategies.js
 *
 * -----------------------------------------------------------------------------
 * Cache Resolution Strategy Registry
 * -----------------------------------------------------------------------------
 *
 * This module provides a collection of reusable utilities for resolving cached
 * data collections without requiring additional API requests.
 *
 * The primary objective of this module is to perform lightweight, in-memory
 * filtering of previously fetched datasets. Rather than requesting filtered
 * data from the server every time the user changes a filter, the application
 * can retrieve the complete dataset once, cache it locally, and then use these
 * strategies to efficiently derive filtered subsets.
 *
 * The filtering pipeline is intentionally divided into three independent stages:
 *
 *   1. prepareFilters()
 *      Cleans and normalizes the incoming filter object by removing empty or
 *      inactive filter values.
 *
 *   2. matchesFilter()
 *      Determines whether a single cached record satisfies all active filter
 *      conditions.
 *
 *   3. filterCollection()
 *      Iterates through an entire cached collection and returns only those
 *      records that satisfy the filtering criteria.
 *
 * This separation follows the Single Responsibility Principle (SRP), making
 * every function independently reusable, testable, and maintainable.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 *                 Raw Filter Object
 *                        │
 *                        ▼
 *               prepareFilters(filter)
 *                        │
 *                        ▼
 *                Active Filter Entries
 *                        │
 *                        ▼
 *          filterCollection(cachedList, filters)
 *                        │
 *                        ▼
 *        matchesFilter(item, activeFilters)
 *                        │
 *                        ▼
 *                Filtered Cached Result
 *
 * Benefits
 * -----------------------------------------------------------------------------
 *
 * ✓ Generic filtering implementation
 * ✓ No hardcoded entity fields
 * ✓ Reusable across every cache resolver
 * ✓ Easy to extend with advanced comparison operators
 * ✓ Efficient in-memory filtering
 * ✓ Small, testable functions
 *
 * Typical Usage
 * -----------------------------------------------------------------------------
 *
 * const result = CACHE_RESOLVER_STRATEGIES.batch(
 *     cachedBatchList,
 *     {
 *         course_id: "COURSE001",
 *         status: "Active"
 *     }
 * );
 *
 * -----------------------------------------------------------------------------
 */



/**
 * Removes empty filter values so they don't participate in comparisons.
 *
 * @param {object} filter - Raw filter object.
 * @returns {Array<[string, any]>} Active filter entries.
 */
export function prepareFilters(filter) {
  if (!filter) return [];

  return Object.entries(filter).filter(
    ([, value]) => value !== undefined &&
      value !== null &&
      value !== ""
  );
}

/**
 * Determines whether an object satisfies all active filters.
 *
 * @param {object} item - Object being evaluated.
 * @param {Array<[string, any]>} activeFilters - Prepared filter entries.
 * @returns {boolean}
 */
export function matchesFilter(item, activeFilters) {
  for (const [field, value] of activeFilters) {
    if (item[field] !== value) {
      return false;
    }
  }

  return true;
}

/**
 * Filters a cached collection using prepared filters.
 *
 * @param {Array<object>} cachedList - Cached data collection.
 * @param {Array<[string, any]>} activeFilters - Prepared filter entries.
 * @returns {Array<object>}
 */
export function filterCollection(cachedList, activeFilters) {
  if (activeFilters.length === 0) {
    return cachedList;
  }

  return cachedList.filter(item =>
    matchesFilter(item, activeFilters)
  );
}

/**
 * Batch list resolver.
 *
 * @param {Array<object>} cachedList
 * @param {object} filter
 * @returns {Array<object>}
 */
export function resolveBatchList(cachedList, filter) {
  const activeFilters = prepareFilters(filter);

  return filterCollection(cachedList, activeFilters);
}

/**
 * Registry mapping entities to their respective resolution strategy callbacks.
 * @type {Object.<string, Function>}
 */
export const CACHE_RESOLVER_STRATEGIES = {
  batch: resolveBatchList
};
