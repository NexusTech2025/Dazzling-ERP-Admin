import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { queryKeys } from '../../../lib/react-query/queryKeys';

export const useBatchAttendanceQuery = (batchId, date) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.attendance.batch(batchId, date),
    queryFn: async ({ signal }) => {
      const where = { attendance_date: date };
      if (batchId && batchId !== 'all') {
        where.batch_id = batchId;
      }
      const response = await apiClient.executeAction(
        API_REGISTRY.ATTENDANCE.GET_BATCH_REGISTRY,
        { where },
        token,
        { signal }
      );
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },
    enabled: !!token && !!batchId && !!date,
  });
};

export const useBatchAttendanceMatrixQuery = (batchId, days = 15) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.attendance.matrix(batchId, days),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.ATTENDANCE.GET_MATRIX,
        { where: { batch_id: batchId } },
        token,
        { signal }
      );
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },
    enabled: !!token && !!batchId,
  });
};

export const useMarkAttendanceMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      apiClient.executeAction(API_REGISTRY.ATTENDANCE.MARK_BULK, payload, token),
    onSuccess: (response, variables) => {
      const batchId = variables.batch_id || variables.batchId;
      const date = variables.attendance_date || variables.date;
      if (batchId && date) {
        queryClient.invalidateQueries({ queryKey: queryKeys.attendance.batch(batchId, date) });
      }
      queryClient.invalidateQueries({ queryKey: ['attendance', 'matrix'] });
      
      if (variables.records) {
        variables.records.forEach(rec => {
          queryClient.invalidateQueries({ queryKey: queryKeys.attendance.student(rec.student_id) });
        });
      }
    }
  });
};

export const useStudentAttendanceStatsQuery = (studentId) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.attendance.student(studentId),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.ATTENDANCE.GET_STUDENT_STATS,
        { studentId },
        token,
        { signal }
      );
      if (!response.success) throw new Error(response.message);
      return response.data?.data;
    },
    enabled: !!token && !!studentId,
  });
};
