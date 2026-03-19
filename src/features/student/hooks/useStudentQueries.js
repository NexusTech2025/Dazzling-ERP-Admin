import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys } from '../../../lib/react-query/queryKeys';
// IMPORT FROM MOCK API FOR DEVELOPMENT
import { fetchStudents, createStudent, modifyStudent, removeStudent, registerStudentTransaction } from '../api/student.mockApi';

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
 * Hook for the full 5-step registration wizard transaction
 */
export const useRegisterStudentMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registrationData) => 
      registerStudentTransaction(token, registrationData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      }
    }
  });
};

/**
 * Hook for creating a new student (simple profile)
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
 * Hook for updating an existing student
 */
export const useUpdateStudentMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, options }) => modifyStudent(token, id, data, options),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(id) });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      }
    }
  });
};
