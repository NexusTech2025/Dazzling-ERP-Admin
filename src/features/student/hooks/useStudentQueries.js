import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import { fetchStudents, createStudent, removeStudent } from '../api/student.api';

/**
 * Hook for fetching all students with optional filtering
 */
export const useStudentsQuery = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.students.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchStudents(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch students');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
  });
};

/**
 * Hook for creating a new student
 */
export const useCreateStudentMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userData, profileData, options }) => 
      createStudent(token, userData, profileData, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      }
    }
  });
};

/**
 * Hook for deleting a student
 */
export const useDeleteStudentMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }) => removeStudent(token, id, options),
    onSuccess: (response, { id }) => {
      if (response.success) {
        // Optimistic cache update or broad invalidation
        queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      }
    }
  });
};
