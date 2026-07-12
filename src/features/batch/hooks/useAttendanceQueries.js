import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import { resolveList } from '../../../lib/react-query/cacheHelper';
import { normalizeAttendanceData } from '../utils/attendanceUtils';

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
        API_REGISTRY.ATTENDANCE.STUDENT_GET_BATCH_ATTENDANCE,
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
        API_REGISTRY.ATTENDANCE.STUDENT_GET_ATTENDANCE,
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
      apiClient.executeAction(API_REGISTRY.ATTENDANCE.STUDENT_MARK_BULK, payload, token),
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
        API_REGISTRY.ATTENDANCE.STUDENT_GET_STATS,
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

export const useBatchMonthlyAttendanceQuery = (batchId) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.attendance.batch(batchId, 'all'),
    queryFn: async () => {
      // 1. Fetch, validate, and cache flat array of records via resolveList
      const flatRecords = await resolveList(
        queryClient,
        'batchAttendance',
        { batchId, date: 'all' },
        async () => {
          const response = await apiClient.executeAction(
            API_REGISTRY.ATTENDANCE.STUDENT_GET_BATCH_ATTENDANCE,
            { where: { batch_id: batchId } },
            token
          );
          return Array.isArray(response.data) ? response.data : (response.data?.data || []);
        }
      );

      // 2. Normalize and split flat records into month-specific and date-specific collections
      const { months, dates } = normalizeAttendanceData(flatRecords);

      // 3. Seed month sub-caches
      Object.entries(months).forEach(([month, records]) => {
        queryClient.setQueryData(queryKeys.attendance.batch(batchId, month), records);
      });

      // 4. Seed date sub-caches
      Object.entries(dates).forEach(([dateStr, records]) => {
        queryClient.setQueryData(queryKeys.attendance.batch(batchId, dateStr), records);
      });

      return { months, dates };
    },
    enabled: !!token && !!batchId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache lifetime
  });
};

export const useOptimizedMarkAttendanceMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => {
      if (!payload.batch_id || !payload.attendance_date || !payload.commit_mode) {
        throw new Error("Validation Exception: Missing core tracking payload metadata bounds.");
      }
      return apiClient.executeAction(API_REGISTRY.ATTENDANCE.STUDENT_MARK_BULK, payload, token);
    },
    onSuccess: (response, variables) => {
      const { batch_id, attendance_date, records } = variables;

      // Invalidate master block to trigger background client-side re-splitting cascades
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.batch(batch_id, 'all') });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.batch(batch_id, attendance_date) });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'matrix'] });

      // Clean individual student metric caches to prevent data stale drift
      if (Array.isArray(records)) {
        records.forEach(rec => {
          queryClient.invalidateQueries({ queryKey: queryKeys.attendance.student(rec.student_id) });
        });
      }
    }
  });
};
