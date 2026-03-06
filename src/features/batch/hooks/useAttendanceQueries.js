import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { 
  fetchBatchAttendance, 
  getBatchAttendanceMatrix, 
  markAttendance, 
  fetchStudentAttendanceStats 
} from '../api/attendance.mockApi';

export const attendanceKeys = {
  all: ['attendance'],
  batch: (batchId, date) => ['attendance', 'batch', batchId, date],
  matrix: (batchId, days) => ['attendance', 'matrix', batchId, days],
  student: (studentId) => ['attendance', 'student', studentId]
};

export const useBatchAttendanceQuery = (batchId, date) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: attendanceKeys.batch(batchId, date),
    queryFn: async ({ signal }) => {
      const response = await fetchBatchAttendance(token, batchId, date, { signal });
      if (!response.success) throw new Error(response.message);
      return response.data?.data || [];
    },
    enabled: !!token && !!batchId && !!date,
  });
};

export const useBatchAttendanceMatrixQuery = (batchId, days = 15) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: attendanceKeys.matrix(batchId, days),
    queryFn: async ({ signal }) => {
      const response = await getBatchAttendanceMatrix(token, batchId, days, { signal });
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
    mutationFn: (payload) => markAttendance(token, payload),
    onSuccess: (response, variables) => {
      if (response.success) {
        // Invalidate the specific batch/date registry
        queryClient.invalidateQueries({ queryKey: attendanceKeys.batch(variables.batchId, variables.date) });
        // Invalidate matrix
        queryClient.invalidateQueries({ queryKey: ['attendance', 'matrix', variables.batchId] });
        // Also invalidate the specific student's stats
        queryClient.invalidateQueries({ queryKey: attendanceKeys.student(variables.studentId) });
      }
    }
  });
};

export const useStudentAttendanceStatsQuery = (studentId) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: attendanceKeys.student(studentId),
    queryFn: async ({ signal }) => {
      const response = await fetchStudentAttendanceStats(token, studentId, { signal });
      if (!response.success) throw new Error(response.message);
      return response.data?.data;
    },
    enabled: !!token && !!studentId,
  });
};
