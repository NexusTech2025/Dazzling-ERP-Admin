import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore.js';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys.js';
import { getCachedList, resolveList } from '../../../lib/react-query/cacheHelper.js';
import { hydrateRecord } from '../../../lib/react-query/hydrate.js';
import { resolveEnrollmentList } from '../../../lib/react-query/cacheStrategies.js';
import { fetchEnrollments } from '../api/student.api.js';

/**
 * Custom TanStack Query hook to load dynamic nested enrollment records.
 * Integrates with standard cache handlers resolveList and getCachedList.
 * 
 * @function useEnrollmentsQuery
 * @param {object} [filter=EMPTY_FILTER] - Query matching criteria.
 * @param {object} [options={}] - Query and pagination modifiers.
 * @param {number} [options.limit=3] - Pagination limit.
 * @param {number} [options.offset=0] - Pagination offset.
 * @param {boolean} [options.enabled=true] - Switch to enable/disable the query.
 * @returns {object} React query result object containing enrollment data list.
 */
export const useEnrollmentsQuery = (filter = EMPTY_FILTER, options = {}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { enabled = true } = options;

  return useQuery({
    // 🔒 Stable queryKey without dynamic filter to prevent cache fragmentation
    queryKey: queryKeys.enrollment.list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      // 🚀 resolveList checks cache via getCachedList + strategy, or fetches network if missing
      return resolveList(
        queryClient,
        'enrollment',
        filter,
        async () => {
          const response = await fetchEnrollments(token, EMPTY_FILTER, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch enrollments');
          }
          return response.data?.data || [];
        }
      );
    },
    select: (data) => {
      // 1. Relational hydration & schema validation
      const hydrated = hydrateRecord('enrollment', data, queryClient);
      // 2. Filter dataset using strategy callback if filter is provided
      if (!filter || filter === EMPTY_FILTER || Object.keys(filter).length === 0) {
        return hydrated;
      }
      return resolveEnrollmentList(hydrated, filter);
    },
    enabled: !!token && enabled,
    initialData: () => getCachedList(queryClient, 'enrollment', filter),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.enrollment.list(EMPTY_FILTER))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 5, // 5 minutes cache stale window
    refetchOnWindowFocus: false
  });
};
