import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
// IMPORT FROM MOCK API FOR DEVELOPMENT
import { fetchStudents, modifyStudent, removeStudent, registerStudentTransaction } from '../api/student.mockApi';
import { createStudent, createStudentLead } from '../api/student.api';

/**
 * Hook for fetching all students with optional filtering
 */
export const useStudentsQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.student.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchStudents(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch students');
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
        queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
      }
    }
  });
};

/**
 * Hook for creating a new student lead/prospect (Quick Add)
 */
export const useCreateStudentLeadMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadData, options }) => 
      createStudentLead(token, leadData, options),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.student.detail(id) });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
      }
    }
  });
};
