import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { 
  fetchBatches, 
  fetchBatchDetails, 
  fetchBatchStudents, 
  createBatch, 
  updateBatch, 
  updateMultipleBatches,
  deleteBatch, 
  fetchWeeklySchedule,
  fetchMasterTimetable 
} from '../api/batch.mockApi';

export const queryKeys = {
  all: ['batches'],
  list: (filter) => ['batches', { filter }],
  detail: (id) => ['batches', id],
  students: (id) => ['batches', id, 'students'],
  schedule: (id) => ['batches', id, 'schedule'],
  master: (day) => ['batches', 'master-timetable', day]
};

export const useBatchesQuery = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchBatches(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch batches');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
  });
};

export const useBatchDetailQuery = (id) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: async ({ signal }) => {
      const response = await fetchBatchDetails(token, id, { signal });
      if (!response.success) throw new Error(response.message);
      return response.data?.data;
    },
    enabled: !!token && !!id,
  });
};

export const useBatchStudentsQuery = (id) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.students(id),
    queryFn: async ({ signal }) => {
      const response = await fetchBatchStudents(token, id, { signal });
      if (!response.success) throw new Error(response.message);
      return response.data?.data || [];
    },
    enabled: !!token && !!id,
  });
};

export const useWeeklyScheduleQuery = (batchId) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.schedule(batchId),
    queryFn: async ({ signal }) => {
      const response = await fetchWeeklySchedule(token, batchId, { signal });
      if (!response.success) throw new Error(response.message);
      return response.data?.data || [];
    },
    enabled: !!token && !!batchId,
  });
};

export const useMasterTimetableQuery = (day) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.master(day),
    queryFn: async ({ signal }) => {
      const response = await fetchMasterTimetable(token, day, { signal });
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
    mutationFn: ({ data, options }) => createBatch(token, data, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.all });
      }
    }
  });
};

export const useUpdateBatchMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, options }) => updateBatch(token, id, data, options),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
      }
    }
  });
};

export const useBulkUpdateBatchesMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, data, options }) => updateMultipleBatches(token, ids, data, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.all });
      }
    }
  });
};

export const useDeleteBatchMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }) => deleteBatch(token, id, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.all });
      }
    }
  });
};
