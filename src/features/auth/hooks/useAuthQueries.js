import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { getCachedList, resolveList } from '../../../lib/react-query/cacheHelper';
import { registerUser, fetchUsers, updateUser, deleteUser } from '../api/auth.api';

/**
 * Hook for registering a new user.
 * @returns {object} TanStack Query mutation object.
 */
export const useRegisterUserMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => registerUser(token, userData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      }
    }
  });
};

/**
 * Hook for fetching all users with optional filtering.
 * @param {object} [filter=EMPTY_FILTER] - Filters for role or status.
 * @returns {object} TanStack Query result.
 */
export const useUsersQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.user.list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      return resolveList(
        queryClient,
        'user',
        filter,
        async () => {
          const response = await fetchUsers(token, filter, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch users');
          }
          return response.data?.data || [];
        },
        { signal }
      );
    },
    enabled: !!token,
    initialData: () => getCachedList(queryClient, 'user', filter),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.user.list(EMPTY_FILTER))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 60, // 60 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for updating user accounts (restricted to superadmin).
 * @returns {object} TanStack Query mutation object.
 */
export const useUpdateUserMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }) => updateUser(token, userId, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      }
    }
  });
};

/**
 * Hook for deleting user accounts (restricted to superadmin).
 * @returns {object} TanStack Query mutation object.
 */
export const useDeleteUserMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => deleteUser(token, userId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      }
    }
  });
};
