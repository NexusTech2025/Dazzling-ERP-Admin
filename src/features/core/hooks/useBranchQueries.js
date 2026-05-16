import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys } from '../../../lib/react-query/queryKeys';
// IMPORT FROM MOCK API FOR DEVELOPMENT
import { fetchBranches } from '../api/branch.mockApi';

/**
 * Hook for fetching all branches
 */
export const useBranchesQuery = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.branch.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchBranches(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch branches');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
  });
};
