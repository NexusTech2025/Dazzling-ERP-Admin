import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { getCachedRecord, resolveRecord, getCachedList, resolveList } from '../../../lib/react-query/cacheHelper';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';

import {
  fetchCourses,
  fetchPackages,
  fetchPackageDetail,
  fetchPackageEnrollments,
  fetchPackageFeeAccounts,
  createPackage,
  updatePackage,
  deletePackage
} from '../api/course.api';

// --- PACKAGES ---

/**
/**
 * Ensures relation catalogs (Courses) are loaded in the query client cache.
 * 
 * @async
 * @function ensurePackageRelations
 * @param {QueryClient} queryClient - The active TanStack QueryClient instance.
 * @param {string} token - Authorization token.
 * @returns {Promise<void>}
 */
export const ensurePackageRelations = async (queryClient, token) => {
  await Promise.all([
    resolveList(queryClient, 'course', EMPTY_FILTER, async () => {
      const res = await fetchCourses(token, EMPTY_FILTER);
      if (!res.success) throw new Error(res.message || 'Failed to fetch courses');
      return res.data?.data || [];
    })
  ]);
};

import { hydrateRecord } from '../../../lib/react-query/hydrate.js';

/**
 * Hook for fetching all course packages with local cache resolution.
 * 
 * @function usePackagesQuery
 * @param {object} [filter=EMPTY_FILTER] - Filtering conditions.
 * @returns {object} React Query result containing package items.
 */
export const usePackagesQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.course.package.list(filter),
    queryFn: async ({ signal }) => {
      await ensurePackageRelations(queryClient, token);
      return resolveList(
        queryClient,
        'package',
        filter,
        async () => {
          const response = await fetchPackages(token, filter, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch packages');
          }
          return response.data?.data || [];
        }
      );
    },
    enabled: !!token,
    select: (data) => {
      const hydrated = hydrateRecord('package', data, queryClient);
      console.log('[usePackagesQuery] Loaded and Hydrated Packages:', hydrated);
      return hydrated;
    },
    initialData: () => {
      const cached = getCachedList(queryClient, 'package', filter);
      if (!cached) return undefined;

      // Ensure caching dependencies for packages exist.
      // If they have been garbage-collected, bypass initialData to force refetch.
      const hasCourses = queryClient.getQueryData(queryKeys.course.list(EMPTY_FILTER)) !== undefined;

      if (!hasCourses) {
        console.warn('[usePackagesQuery] Relation dependencies were garbage collected. Bypassing initialData.');
        return undefined;
      }
      return cached;
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.course.package.list(filter))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 2.5, // 2.5 Minute Grace Window
    refetchOnMount: true,       // Background revalidation once stale
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching details of a single package by its ID.
 * 
 * @function usePackageDetailQuery
 * @param {string} id - The package identifier.
 * @returns {object} React Query result containing the package details.
 */
export const usePackageDetailQuery = (id) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.course.package.detail(id),
    queryFn: async ({ signal }) => {
      await ensurePackageRelations(queryClient, token);
      return resolveRecord(
        queryClient,
        'package',
        id,
        async () => {
          const response = await fetchPackageDetail(token, id, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch package details');
          }
          return response.data?.data?.[0] || null;
        }
      );
    },
    enabled: !!token && !!id,
    initialData: () => getCachedRecord(queryClient, 'package', id),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.course.package.detail(id))?.dataUpdatedAt,
    select: (data) => hydrateRecord('package', data, queryClient),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for creating a new course package.
 * 
 * @function useCreatePackageMutation
 * @returns {object} React Query mutation properties.
 */
export const useCreatePackageMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, options }) => createPackage(token, data, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.course.package.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.packageItem.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.packagePerk.all });
      }
    }
  });
};

/**
 * Hook for updating course package details.
 * 
 * @function useUpdatePackageMutation
 * @returns {object} React Query mutation properties.
 */
export const useUpdatePackageMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, options }) => updatePackage(token, id, data, options),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.course.package.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.package.detail(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.packageItem.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.packagePerk.all });
      }
    }
  });
};

/**
 * Hook for deleting a package with cascading logic.
 * 
 * @function useDeletePackageMutation
 * @returns {object} React Query mutation properties.
 */
export const useDeletePackageMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }) => {
      console.log('[useDeletePackageMutation] Deleting Package ID:', id);
      return deletePackage(token, id, options);
    },
    onSuccess: (response) => {
      console.log('[useDeletePackageMutation] API Response:', response);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.course.package.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.packageItem.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.course.packagePerk.all });
      }
    },
    onError: (err) => {
      console.error('[useDeletePackageMutation] API Error:', err);
    }
  });
};


/**
 * Hook for fetching all student enrollments for a specific package.
 * Returns enrollment records with the nested student relation hydrated.
 *
 * @function usePackageEnrollmentsQuery
 * @param {string} packageId - The package identifier to scope the enrollment query.
 * @returns {object} React Query result containing enrollment records.
 */
export const usePackageEnrollmentsQuery = (packageId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.course.package.detail(packageId), 'enrollments'],
    queryFn: async ({ signal }) => {
      console.log('[usePackageEnrollmentsQuery] Fetching enrollments for package:', packageId);
      const response = await fetchPackageEnrollments(token, packageId, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch package enrollments');
      }
      console.log('[usePackageEnrollmentsQuery] API Response:', response);
      return response.data?.data || [];
    },
    enabled: !!token && !!packageId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching all StudentFeeAccount records scoped to a specific package,
 * with nested installments included for revenue ledger rendering.
 *
 * @function usePackageFeeAccountsQuery
 * @param {string} packageId - The package identifier to scope the fee account query.
 * @returns {object} React Query result containing fee account records with installments.
 */
export const usePackageFeeAccountsQuery = (packageId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.course.package.detail(packageId), 'fee-accounts'],
    queryFn: async ({ signal }) => {
      console.log('[usePackageFeeAccountsQuery] Fetching fee accounts for package:', packageId);
      const response = await fetchPackageFeeAccounts(token, packageId, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch package fee accounts');
      }
      console.log('[usePackageFeeAccountsQuery] API Response:', response);
      return response.data?.data || [];
    },
    enabled: !!token && !!packageId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
