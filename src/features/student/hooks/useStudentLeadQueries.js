import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import {
  fetchStudentLeads,
  fetchStudentLeadDetail,
  updateStudentLead,
  deleteStudentLead
} from '../api/studentLead.api';

/**
 * Hook for fetching all student leads with optional filtering.
 */
export const useStudentLeadsQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.lead.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchStudentLeads(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch student leads');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching a single student lead's details.
 * Implements Cache Fallback from general lead list queries.
 */
export const useStudentLeadDetailQuery = (leadId) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.lead.detail(leadId),
    queryFn: async ({ signal }) => {
      const response = await fetchStudentLeadDetail(token, leadId, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch student lead details');
      }
      const list = response.data?.data || [];
      return list[0] || null;
    },
    enabled: !!token && !!leadId,
    initialData: () => {
      if (!leadId) return undefined;

      // 1. Direct Detail Cache Check
      const cachedDetail = queryClient.getQueryData(queryKeys.lead.detail(leadId));
      if (cachedDetail) return cachedDetail;

      // 2. List Cache Scan Fallback
      const listQueries = queryClient.getQueriesData({ queryKey: queryKeys.lead.lists() });
      for (const [key, listData] of listQueries) {
        if (Array.isArray(listData)) {
          const item = listData.find(e => e.lead_id === leadId);
          if (item) return item;
        }
      }
      return undefined;
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.lead.detail(leadId))?.dataUpdatedAt,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for updating an existing student lead.
 */
export const useUpdateStudentLeadMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, options }) => updateStudentLead(token, id, data, options),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.lead.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.lead.detail(id) });
      }
    }
  });
};

/**
 * Hook for deleting a student lead.
 */
export const useDeleteStudentLeadMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, options }) => {
      if (!id) {
        throw new Error('Lead ID is required for deletion.');
      }
      const response = await deleteStudentLead(token, id, options);
      if (!response.success) {
        throw new Error(response.error?.message || response.message || `Failed to delete lead: ${id}`);
      }
      return response;
    },
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lead.all });
    }
  });
};
