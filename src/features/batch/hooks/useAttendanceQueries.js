import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import { resolveList, getCachedList } from '../../../lib/react-query/cacheHelper';
import { normalizeAttendanceData } from '../utils/attendanceUtils';
import { toLocalDate, formatToKey, toLocalCalendarDate } from '../../../lib/dateUtils';

import { batchAttendanceNormalization } from '../utils/batchCacheHelper';

/**
 * Fetches all historical attendance records for a specific batch (without date filtering)
 * and normalizes them into two-level caches (Month-level & Date-level).
 */
export const useBatchAllAttendanceQuery = (batchId) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.attendance.batchAll(batchId),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.ATTENDANCE.STUDENT_GET_ATTENDANCE,
        {
          where: { batch_id: batchId },
          pagination: { limit: 1000, offset: 0 }
        },
        token,
        { signal }
      );

      const rawList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      batchAttendanceNormalization(queryClient, batchId, rawList);
      return rawList;
    },
    enabled: !!token && !!batchId,
    staleTime: 1000 * 60 * 60,
  });
};

export const useBatchAttendanceQuery = (batchId, date) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.attendance.batch(batchId, date),
    queryFn: async ({ signal }) => {
      // 1. Direct Date-Level Cache Lookup via getCachedList
      const cachedList = getCachedList(queryClient, 'batchAttendance', { batchId, date });
      if (Array.isArray(cachedList) && cachedList.length > 0) {
        return cachedList;
      }

      // 2. Batch-All Cache Fallback via getCachedList
      const cachedBatchAll = getCachedList(queryClient, 'batchAttendance', { batchId, date: 'all' });
      if (Array.isArray(cachedBatchAll) && cachedBatchAll.length > 0) {
        const { dateMap } = batchAttendanceNormalization(queryClient, batchId, cachedBatchAll);
        return dateMap.get(date) || [];
      }

      // 3. Fallback Network Fetch if cache is completely empty
      const where = { attendance_date: date };
      if (batchId && batchId !== 'all') {
        where.batch_id = batchId;
      }
      const response = await apiClient.executeAction(
        API_REGISTRY.ATTENDANCE.STUDENT_GET_BATCH_ATTENDANCE,
        {
          where,
          pagination: { limit: 1000, offset: 0 }
        },
        token,
        { signal }
      );
      const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      return rawData.map(item => {
        if (item.attendance_date) {
          const parsedCal = toLocalCalendarDate(item.attendance_date);
          return {
            ...item,
            attendance_date: parsedCal ? parsedCal.dateKey : String(item.attendance_date).slice(0, 10)
          };
        }
        return item;
      });
    },
    enabled: !!token && !!batchId && !!date,
    staleTime: 1000 * 60 * 60,
  });
};

export const useBatchAttendanceMatrixQuery = (batchId, days = 15) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.attendance.matrix(batchId, days),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.ATTENDANCE.STUDENT_GET_ATTENDANCE,
        {
          where: { batch_id: batchId },
          pagination: { limit: 1000, offset: 0 }
        },
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
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.attendance.student(studentId),
    queryFn: async () => {
      const cached = queryClient.getQueryData(queryKeys.attendance.student(studentId));
      if (cached) return cached;
      return {
        percentage: 92,
        present_count: 110,
        total_sessions: 120,
        history: [
          { date: '2026-07-28', status: 'Present', remarks: 'On time' },
          { date: '2026-07-27', status: 'Present', remarks: 'On time' },
          { date: '2026-07-26', status: 'Absent', remarks: 'Medical leave' },
          { date: '2026-07-25', status: 'Present', remarks: 'On time' },
          { date: '2026-07-24', status: 'Late', remarks: '10 mins late' }
        ]
      };
    },
    enabled: !!studentId,
    staleTime: Infinity,
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
            {
              where: { batch_id: batchId },
              pagination: { limit: 1000, offset: 0 }
            },
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
    staleTime: 1000 * 60 * 60, // 60 minutes cache lifetime
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
      const { batch_id, attendance_date, records = [], delta_updates = [], full_roster_snapshot = [] } = variables;
      const targetDateKey = String(attendance_date).slice(0, 10);
      const targetMonthKey = targetDateKey.slice(0, 7);

      const submittedRecords = full_roster_snapshot.length > 0
        ? full_roster_snapshot
        : (delta_updates.length > 0 ? delta_updates : records);

      if (batch_id && targetDateKey) {
        // 1. Direct Date-Level Cache Update (Instant UI update with 0ms latency)
        queryClient.setQueryData(queryKeys.attendance.batch(batch_id, targetDateKey), (old = []) => {
          const oldMap = new Map((old || []).map(r => [r.student_id, r]));
          for (const update of submittedRecords) {
            const sId = update.student_id;
            const existing = oldMap.get(sId) || {};
            oldMap.set(sId, { ...existing, ...update, attendance_date: targetDateKey, batch_id });
          }
          return Array.from(oldMap.values());
        });

        // 2. Direct Month-Level Cache Update
        queryClient.setQueryData(queryKeys.attendance.batchMonth(batch_id, targetMonthKey), (old = []) => {
          const list = Array.isArray(old) ? old : [];
          const filtered = list.filter(r => String(r.attendance_date).slice(0, 10) !== targetDateKey);
          const updatedDateRecords = queryClient.getQueryData(queryKeys.attendance.batch(batch_id, targetDateKey)) || [];
          return [...filtered, ...updatedDateRecords];
        });
      }

      // Invalidate matrix and individual student metric caches to prevent stale drift
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.matrix(batch_id, 15) });
      if (Array.isArray(submittedRecords)) {
        submittedRecords.forEach(rec => {
          if (rec.student_id) {
            queryClient.invalidateQueries({ queryKey: queryKeys.attendance.student(rec.student_id) });
          }
        });
      }
    }
  });
};
