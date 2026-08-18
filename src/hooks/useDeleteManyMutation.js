import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContextCore';
import { executeAction } from '../services/apiClient';
import { API_REGISTRY } from '../services/apiRegistry';

/**
 * useDeleteManyMutation: A generic hook to perform bulk deletions of records in DazzlingDB.
 * 
 * @param {string} tableName - The target table (e.g. 'Package', 'Course', 'Batch')
 * @param {Array<string[]>} invalidationKeys - The react-query cache keys to invalidate on successful delete
 */
export const useDeleteManyMutation = (tableName, invalidationKeys = [], actionPath = API_REGISTRY.DATA.DELETE_MANY) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, dryRun = false }) => {
      console.log(`[useDeleteManyMutation] Bulk Deleting ${ids.length} records in table ${tableName} using action ${actionPath}`);
      const response = await executeAction(
        actionPath,
        {
          table: tableName,
          ids,
          dryRun
        },
        token,
        { timeout: 'DATA_MUTATION' }
      );
      return response;
    },
    onSuccess: (response) => {
      console.log(`[useDeleteManyMutation] Bulk delete response for ${tableName}:`, response);
      if (response.success) {
        // Invalidate all associated query caches to refresh the lists
        invalidationKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
    onError: (err) => {
      console.error(`[useDeleteManyMutation] Bulk delete failed for ${tableName}:`, err);
    }
  });
};

export default useDeleteManyMutation;
