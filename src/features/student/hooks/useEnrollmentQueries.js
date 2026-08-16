import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore.js';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys.js';
import { getCachedList, resolveList } from '../../../lib/react-query/cacheHelper.js';
import { hydrateRecord } from '../../../lib/react-query/hydrate.js';
import { resolveEnrollmentList } from '../../../lib/react-query/cacheStrategies.js';
import { fetchEnrollments, updateEnrollment, discardEnrollment, migrateEnrollment } from '../api/student.api.js';
import { enrollmentRepo } from '../utils/enrollmentCacheHelper.js';

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
  const { enabled = true, delayMs = 0 } = options;

  return useQuery({
    // 🔒 Stable queryKey without dynamic filter to prevent cache fragmentation
    queryKey: queryKeys.enrollment.list(EMPTY_FILTER),
    queryFn: async () => {
      // ⏳ Stagger delay to prevent V8 container collisions on app startup
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      // 🚀 resolveList checks cache via getCachedList + strategy, or fetches network if missing
      return resolveList(
        queryClient,
        'enrollment',
        filter,
        async () => {
          const response = await fetchEnrollments(token, EMPTY_FILTER);
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

      // 2. Prime O(1) Hashmaps in enrollmentRepo
      enrollmentRepo.normalize(hydrated);

      // 3. Filter dataset using strategy callback if filter is provided
      if (!filter || filter === EMPTY_FILTER || Object.keys(filter).length === 0) {
        return hydrated;
      }
      return resolveEnrollmentList(hydrated, filter);
    },
    enabled: !!token && enabled,
    initialData: () => getCachedList(queryClient, 'enrollment', filter),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.enrollment.list(EMPTY_FILTER))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 60, // 60 minutes cache stale window
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
};

/**
 * Custom TanStack Query mutation hook to update enrollment details and batch seating allocations.
 * Updates local RAM cache via enrollmentRepo before invalidating query lists.
 * 
 * @function useUpdateEnrollmentMutation
 * @returns {object} React Query mutation result object.
 */
export const useUpdateEnrollmentMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateEnrollment(token, payload),
    onSuccess: (response, variables) => {
      console.log('[useUpdateEnrollmentMutation] API Response:', response);
      const resData = response.data?.data || {};
      const updatedEnr = resData.enrollment || variables;
      const updatedAllocations = resData.allocations || variables.allocations;
      const feeAccountUpdate = resData.fee_account || null;

      if (variables?.enrollment_id) {
        enrollmentRepo.updateEnrollmentCache(
          queryClient,
          variables.enrollment_id,
          updatedEnr,
          updatedAllocations,
          feeAccountUpdate
        );
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.enrollment.list(EMPTY_FILTER) });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['batch_allocations'] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
    onError: (err) => {
      console.error('[useUpdateEnrollmentMutation] API Error:', err);
    }
  });
};

/**
 * Custom TanStack Query mutation hook to discard an enrollment contract and settle financial account.
 * Updates local RAM cache via enrollmentRepo before invalidating query lists.
 * 
 * @function useDiscardEnrollmentMutation
 * @returns {object} React Query mutation result object.
 */
export const useDiscardEnrollmentMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => discardEnrollment(token, payload),
    onSuccess: (response, variables) => {
      console.log('[useDiscardEnrollmentMutation] API Response:', response);
      if (variables?.enrollment_id) {
        enrollmentRepo.discardEnrollmentCache(queryClient, variables.enrollment_id, variables.discard_mode);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollment.list(EMPTY_FILTER) });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (err) => {
      console.error('[useDiscardEnrollmentMutation] API Error:', err);
    }
  });
};

/**
 * Custom TanStack Query mutation hook to migrate an enrollment contract to a new course/package.
 * Updates local RAM cache via enrollmentRepo before invalidating query lists.
 * 
 * @function useMigrateEnrollmentMutation
 * @returns {object} React Query mutation result object.
 */
export const useMigrateEnrollmentMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => migrateEnrollment(token, payload),
    onSuccess: (response, variables) => {
      console.log('[useMigrateEnrollmentMutation] API Response:', response);
      const newContract = response.data?.data?.new_contract;
      if (variables?.enrollment_id) {
        enrollmentRepo.migrateEnrollmentCache(queryClient, variables.enrollment_id, newContract);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollment.list(EMPTY_FILTER) });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['batch_allocations'] });
    },
    onError: (err) => {
      console.error('[useMigrateEnrollmentMutation] API Error:', err);
    }
  });
};
