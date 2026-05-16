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
      const response = await apiClient.executeAction(
        API_REGISTRY.ATTENDANCE.GET_BATCH_REGISTRY, 
        { batchId, date }, 
        token,
        { signal }
      );
      if (!response.success) throw new Error(response.message);
      return response.data?.data || [];
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
        { batchId, days }, 
        token,
        { signal }
      );
      if (!response.success) throw new Error(response.message);
      return response.data?.data;
    },
    enabled: !!token && !!batchId,
  });
};

export const useMarkAttendanceMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => 
      apiClient.executeAction(API_REGISTRY.ATTENDANCE.MARK, payload, token),
    onSuccess: (response, variables) => {
      if (response.success) {
        // Invalidate the specific batch/date registry
        queryClient.invalidateQueries({ queryKey: queryKeys.attendance.batch(variables.batchId, variables.date) });
        // Invalidate matrix for this batch
        queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all.concat('matrix', variables.batchId) });
        // Also invalidate the specific student's stats
        queryClient.invalidateQueries({ queryKey: queryKeys.attendance.student(variables.studentId) });
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
