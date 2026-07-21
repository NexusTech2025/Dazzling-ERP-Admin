import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { getCachedList, resolveList } from '../../../lib/react-query/cacheHelper';
import { hydrateRecord } from '../../../lib/react-query/hydrate.js';
import { fetchEnrollments } from '../api/student.api';

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
  const { limit = 3, offset = 0, enabled = true } = options;
  const queryFilter = { ...filter, limit, offset };

  return useQuery({
    queryKey: queryKeys.enrollment.list(queryFilter),
    queryFn: async ({ signal }) => {
      return resolveList(
        queryClient,
        'enrollment',
        queryFilter,
        async () => {
          const response = await fetchEnrollments(token, filter, { limit, offset, signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch enrollments');
          }
          return response.data?.data || [];
        }
      );
    },
    select: (data) => {
      // Runs read-time relational stitching and validates output schema (lazy mode)
      return hydrateRecord('enrollment', data, queryClient);
    },
    enabled: !!token && enabled,
    initialData: () => getCachedList(queryClient, 'enrollment', queryFilter),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.enrollment.list(queryFilter))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 5, // 5 minutes cache stale window
    refetchOnWindowFocus: false
  });
};
