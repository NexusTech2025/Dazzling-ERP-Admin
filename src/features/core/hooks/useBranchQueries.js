import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { resolveList } from '../../../lib/react-query/cacheHelper';

/**
 * Hook for fetching all branches from Real API
 * Note: data_query still uses 'target' as per existing project pattern 
 * or check if it should also be 'table'. For now keeping consistency with existing Query logic.
 */
export const useBranchesQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.branch.list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      return resolveList(
        queryClient,
        'branch',
        filter,
        async () => {
          const response = await apiClient.executeAction(
            API_REGISTRY.DATA.QUERY,
            { target: 'Branch', where: filter },
            token,
            { timeout: 'STANDARD', signal }
          );
          return response.data?.data || [];
        }
      );
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 60 Minute Grace Window
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for creating a new branch
 * Payload Aligned with global_crud_api_docs.md
 */
export const useCreateBranchMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branchData) =>
      apiClient.executeAction(
        API_REGISTRY.DATA.CREATE,
        { 
          table: 'Branch', 
          data: branchData 
        },
        token,
        { timeout: 'DATA_MUTATION' }
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.branch.all });
      }
    }
  });
};

/**
 * Hook for updating an existing branch
 * Payload Aligned with global_crud_api_docs.md
 */
export const useUpdateBranchMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      apiClient.executeAction(
        API_REGISTRY.DATA.UPDATE,
        { 
          table: 'Branch', 
          id: id, 
          data 
        },
        token,
        { timeout: 'DATA_MUTATION' }
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.branch.all });
      }
    }
  });
};

/**
 * Hook for deleting a branch
 * Payload Aligned with global_crud_api_docs.md
 */
export const useDeleteBranchMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      apiClient.executeAction(
        API_REGISTRY.DATA.DELETE,
        { 
          table: 'Branch', 
          id: id 
        },
        token,
        { timeout: 'DATA_MUTATION' }
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.branch.all });
      }
    }
  });
};
