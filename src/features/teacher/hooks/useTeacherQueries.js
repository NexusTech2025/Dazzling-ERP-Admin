import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys } from '../../../lib/react-query/queryKeys';
// IMPORT FROM MOCK API FOR DEVELOPMENT
import { fetchTeachers, fetchTeacherDetail, createTeacher, updateTeacher, removeTeacher } from '../api/teacher.mockApi';

/**
 * Hook for fetching all teachers
 */
export const useTeachersQuery = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.teachers.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchTeachers(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch teachers');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
  });
};

/**
 * Hook for fetching a single teacher detail
 */
export const useTeacherDetailQuery = (id) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.teachers.detail(id),
    queryFn: async ({ signal }) => {
      const response = await fetchTeacherDetail(token, id, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch teacher details');
      }
      return response.data?.data || null;
    },
    enabled: !!token && !!id,
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
        queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
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
    mutationFn: ({ id, data, options }) => updateTeacher(token, id, data, options),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.teachers.detail(id) });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      }
    }
  });
};
