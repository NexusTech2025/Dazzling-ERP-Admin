import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { transformBatchList, transformBatchRecord } from '../utils/batchMappers';

export const useBatchesQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.batch.list(filter),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY, 
        { 
          target: 'Batch', 
          where: filter 
        }, 
        token,
        { signal }
      );
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch batches');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
    select: transformBatchList,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useBatchDetailQuery = (id) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.batch.detail(id),
    queryFn: async ({ signal }) => {
      // Using generic query with limit 1 for details
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY, 
        { 
          target: 'Batch', 
          where: { batch_id: id },
          pagination: { limit: 1 }
        }, 
        token,
        { signal }
      );
      if (!response.success) throw new Error(response.message);
      return response.data?.data?.[0] || null;
    },
    enabled: !!token && !!id,
    select: transformBatchRecord,
  });
};

export const useBatchStudentsQuery = (id) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.batch.student(id),
    queryFn: async ({ signal }) => {
      // Query Enrollment table and include Student details
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY, 
        { 
          target: 'Enrollment', 
          where: { batch_id: id },
          include: ['student']
        }, 
        token,
        { signal }
      );
      if (!response.success) throw new Error(response.message);
      return response.data?.data || [];
    },
    enabled: !!token && !!id,
  });
};

export const useWeeklyScheduleQuery = (batchId) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.batch.schedule(batchId),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.BATCH.GET_WEEKLY_SCHEDULE, 
        { batchId }, 
        token,
        { signal }
      );
      if (!response.success) throw new Error(response.message);
      return response.data?.data || [];
    },
    enabled: !!token && !!batchId,
  });
};

export const useMasterTimetableQuery = (day) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.batch.master(day),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.BATCH.GET_MASTER_TIMETABLE, 
        { day }, 
        token,
        { signal }
      );
      if (!response.success) throw new Error(response.message);
      return response.data?.data;
    },
    enabled: !!token && !!day,
  });
};

export const useCreateBatchMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, options }) => 
      apiClient.executeAction(API_REGISTRY.BATCH.CREATE, data, token, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.batch.all });
      }
    }
  });
};

export const useUpdateBatchMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, options }) => 
      apiClient.executeAction(
        API_REGISTRY.DATA.UPDATE, 
        { 
          target: 'Batch', 
          where: { batch_id: id }, 
          data 
        }, 
        token, 
        options
      ),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.batch.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.batch.detail(id) });
      }
    }
  });
};

export const useBulkUpdateBatchesMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, data, options }) => 
      apiClient.executeAction(
        API_REGISTRY.BATCH.UPDATE_BULK, 
        { ids, ...data }, 
        token, 
        options
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.batch.all });
      }
    }
  });
};

export const useDeleteBatchMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }) => 
      apiClient.executeAction(
        API_REGISTRY.DATA.DELETE, 
        { 
          target: 'Batch', 
          where: { batch_id: id } 
        }, 
        token, 
        options
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.batch.all });
      }
    }
  });
};
