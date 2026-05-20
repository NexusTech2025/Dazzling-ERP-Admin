import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';

/**
 * Hook for fetching all branches from Real API
 * Note: data_query still uses 'target' as per existing project pattern 
 * or check if it should also be 'table'. For now keeping consistency with existing Query logic.
 */
export const useBranchesQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.branch.list(filter),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'Branch', where: filter },
        token,
        { signal }
      );
      return response.data?.data || [];
    },
    enabled: !!token,
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
        token
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
        token
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
        token
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.branch.all });
      }
    }
  });
};
