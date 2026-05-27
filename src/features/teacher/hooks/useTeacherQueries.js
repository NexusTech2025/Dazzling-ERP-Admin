import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';

/**
 * Hook for fetching all teachers
 */
export const useTeachersQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.teacher.list(filter),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'Teacher', where: filter },
        token,
        { signal }
      );
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
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        {
          target: 'Teacher',
          where: { teacher_id: id },
          pagination: { limit: 1 }
        },
        token,
        { signal }
      );
      return response.data?.data?.[0] || null;
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
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'TeacherAttendance', where: { teacher_id: teacherId } },
        token,
        { signal }
      );
      return response.data?.data || [];
    },
    enabled: !!token && !!teacherId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for updating teacher attendance
 */
export const useUpdateTeacherAttendanceMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, date, data, options }) =>
      apiClient.executeAction(
        API_REGISTRY.STAFF.MARK_ATTENDANCE,
        { teacherId, date, ...data },
        token,
        options
      ),
    onSuccess: (response, { teacherId }) => {
      if (response.success) {
        queryClient.refetchQueries({ queryKey: [...queryKeys.teacher.detail(teacherId), 'attendance'] });
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
    mutationFn: (payload) =>
      apiClient.executeAction(
        API_REGISTRY.STAFF.ONBOARD_TEACHER,
        payload,
        token
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.refetchQueries({ queryKey: queryKeys.teacher.list({}) });
      }
    }
  });
};

/**
 * Hook for updating a teacher
 */
export const useUpdateTeacherMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, options }) =>
      apiClient.executeAction(
        API_REGISTRY.STAFF.UPDATE_TEACHER,
        { teacher_id: id, data },
        token,
        options
      ),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.detail(id) });
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(id), 'subjects'] });
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(id), 'salaryConfig'] });
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
    mutationFn: ({ id, options }) =>
      apiClient.executeAction(
        API_REGISTRY.DATA.DELETE,
        { table: "Teacher", id },
        token,
        options
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.refetchQueries({ queryKey: queryKeys.teacher.all });
      }
    }
  });
};

/**
 * Hook for querying assigned teacher subjects
 */
export const useTeacherSubjectsQuery = (teacherId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.teacher.detail(teacherId), 'subjects'],
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'TeacherSubject', where: { teacher_id: teacherId } },
        token,
        { signal }
      );
      return response.data?.data || [];
    },
    enabled: !!token && !!teacherId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for querying teacher salary configuration
 */
export const useTeacherSalaryConfigQuery = (teacherId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.teacher.detail(teacherId), 'salaryConfig'],
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'TeacherSalaryConfig', where: { teacher_id: teacherId } },
        token,
        { signal }
      );
      return response.data?.data?.[0] || null;
    },
    enabled: !!token && !!teacherId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for querying teacher document attachments
 */
export const useTeacherDocumentsQuery = (teacherId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.teacher.detail(teacherId), 'documents'],
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'TeacherDocument', where: { teacher_id: teacherId } },
        token,
        { signal }
      );
      return response.data?.data || [];
    },
    enabled: !!token && !!teacherId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for assigning subjects/courses to a teacher
 */
export const useAssignTeacherSubjectsMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, subjectIds, options }) =>
      apiClient.executeAction(
        API_REGISTRY.STAFF.ASSIGN_SUBJECTS,
        { teacher_id: teacherId, subject_ids: subjectIds },
        token,
        options
      ),
    onSuccess: (response, { teacherId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(teacherId), 'subjects'] });
      }
    }
  });
};

/**
 * Hook for setting teacher salary configuration
 */
export const useSetTeacherSalaryConfigMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, salaryType, baseAmount, effectiveFrom, options }) =>
      apiClient.executeAction(
        API_REGISTRY.STAFF.SET_SALARY_CONFIG,
        { 
          teacher_id: teacherId, 
          salary_type: salaryType, 
          base_amount: baseAmount, 
          effective_from: effectiveFrom 
        },
        token,
        options
      ),
    onSuccess: (response, { teacherId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(teacherId), 'salaryConfig'] });
      }
    }
  });
};
