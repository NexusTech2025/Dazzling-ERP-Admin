import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
// IMPORT FROM MOCK API FOR DEVELOPMENT
import { 
  fetchTeachers, 
  fetchTeacherDetail, 
  fetchTeacherAttendance,
  updateTeacherAttendance,
  createTeacher, 
  updateTeacher, 
  removeTeacher 
} from '../api/teacher.mockApi';

/**
 * Hook for fetching all teachers
 */
export const useTeachersQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.teacher.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchTeachers(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch teachers');
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
 * Hook for fetching a single teacher detail
 */
export const useTeacherDetailQuery = (id) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.teacher.detail(id),
    queryFn: async ({ signal }) => {
      const response = await fetchTeacherDetail(token, id, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch teacher details');
      }
      return response.data?.data || null;
    },
    enabled: !!token && !!id,
    initialData: () => {
      if (!id) return undefined;
      const cachedDetail = queryClient.getQueryData(queryKeys.teacher.detail(id));
      if (cachedDetail) return cachedDetail;

      const listQueries = queryClient.getQueriesData({ queryKey: queryKeys.teacher.lists() });
      for (const [key, listData] of listQueries) {
        if (Array.isArray(listData)) {
          const item = listData.find(t => t.teacher_id === id || t.id === id);
          if (item) return item;
        }
      }
      return undefined;
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.teacher.detail(id))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for fetching teacher attendance
 */
export const useTeacherAttendanceQuery = (teacherId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.teacher.detail(teacherId), 'attendance'],
    queryFn: async ({ signal }) => {
      const response = await fetchTeacherAttendance(token, teacherId, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch attendance');
      }
      return response.data?.data || [];
    },
    enabled: !!token && !!teacherId,
  });
};

/**
 * Hook for updating teacher attendance
 */
export const useUpdateTeacherAttendanceMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, date, data, options }) => updateTeacherAttendance(token, { teacherId, date, data }, options),
    onSuccess: (response, { teacherId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(teacherId), 'attendance'] });
      }
    }
  });
};

/**
 * Hook for creating a new teacher
 */
export const useCreateTeacherMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userData, profileData, options }) => 
      createTeacher(token, userData, profileData, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all });
      }
    }
  });
};

/**
 * Hook for updating a teacher
 */
export const useUpdateTeacherMutation = () => {
  const { token } = useAuth();
  const queryClient = useAuth(); // BUG FIXED IN TURN 3? No, Auth context doesn't have useQueryClient. Wait, useAuth was used.
  const queryClientFixed = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, options }) => updateTeacher(token, id, data, options),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClientFixed.invalidateQueries({ queryKey: queryKeys.teacher.all });
        queryClientFixed.invalidateQueries({ queryKey: queryKeys.teacher.detail(id) });
      }
    }
  });
};

/**
 * Hook for deleting a teacher
 */
export const useDeleteTeacherMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }) => removeTeacher(token, id, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all });
      }
    }
  });
};
