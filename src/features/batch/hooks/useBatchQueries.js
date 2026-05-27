import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { transformBatchList, transformBatchRecord, resolveBatchRelations, normalizeBatch, normalizeBatchList } from '../utils/batchMappers';

export const useBatchesQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

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
      return normalizeBatchList(response.data?.data || []);
    },
    enabled: !!token,
    select: (data) => transformBatchList(data).map(b => resolveBatchRelations(b, queryClient)),
    initialData: () => {
      // 1. Check if the specific filtered list is already in cache
      const cached = queryClient.getQueryData(queryKeys.batch.list(filter));
      if (cached) return cached;

      // 2. Fallback: Search across all batch list queries to find any list data
      const listQueries = queryClient.getQueriesData({ queryKey: queryKeys.batch.lists() });
      for (const [key, listData] of listQueries) {
        if (Array.isArray(listData) && listData.length > 0) {
          return listData;
        }
      }
      return undefined;
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.batch.list(filter))?.dataUpdatedAt,
    staleTime: Infinity,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

export const useBatchDetailQuery = (id) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

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
      return normalizeBatch(response.data?.data?.[0] || null);
    },
    enabled: !!token && !!id,
    select: (data) => resolveBatchRelations(transformBatchRecord(data), queryClient),
    initialData: () => {
      if (!id) return undefined;

      // 1. First look into the specific detail cache
      const cachedDetail = queryClient.getQueryData(queryKeys.batch.detail(id));
      if (cachedDetail) return cachedDetail;

      // 2. Fallback: Look into all cached list data
      // Search across any list query (regardless of filter)
      const listQueries = queryClient.getQueriesData({ queryKey: queryKeys.batch.lists() });
      for (const [key, listData] of listQueries) {
        if (Array.isArray(listData)) {
          const item = listData.find(b => b.batch_id === id || b.id === id);
          if (item) return item;
        }
      }
      return undefined;
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.batch.detail(id))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 5,
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
    select: (data) => (data || []).map(enrollment => ({
      ...enrollment,
      student_name: enrollment.student?.student_name || 'N/A',
      email: enrollment.student?.email || '',
      phone: enrollment.student?.phone || 'N/A'
    }))
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
        queryClient.invalidateQueries({ queryKey: queryKeys.batch.list({}) });
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
          table: 'Batch',
          id,
          data
        },
        token,
        options
      ),
    onSuccess: (response, { id }) => {
      if (response.success) {
        // Invalidate lists and detail but skip immediate refetching to avoid AbortError on unmount
        queryClient.invalidateQueries({
          queryKey: queryKeys.batch.lists(),
          refetchType: 'none'
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.batch.detail(id),
          refetchType: 'none'
        });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.batch.list({}) });
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
          table: 'Batch',
          id
        },
        token,
        options
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.batch.list({}) });
      }
    }
  });
};
