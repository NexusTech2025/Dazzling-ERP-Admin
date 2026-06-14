import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { getCachedRecord, resolveRecord } from '../../../lib/react-query/cacheHelper';
import {
  fetchStudents,
  modifyStudent,
  removeStudent,
  registerStudentTransaction,
  createStudent,
  createStudentLead
} from '../api/student.api';

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
 * Hook for fetching a single student detail
 */
export const useStudentDetailQuery = (studentId) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.student.detail(studentId),
    queryFn: async ({ signal }) => {
      return resolveRecord(
        queryClient,
        'student',
        studentId,
        async () => {
          const response = await fetchStudents(token, { student_id: studentId }, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch student details');
          }
          const list = response.data?.data || [];
          return list[0] || null;
        }
      );
    },
    enabled: !!token && !!studentId,
    initialData: () => getCachedRecord(queryClient, 'student', studentId),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.student.detail(studentId))?.dataUpdatedAt,
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
        queryClient.invalidateQueries({ queryKey: queryKeys.student.profile(id) });
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
    mutationFn: async ({ id, options }) => {
      if (!id) {
        throw new Error('Student ID is required for deletion.');
      }
      
      console.log('[useDeleteStudentMutation] Initiating deletion for Student ID:', id);
      
      try {
        const response = await removeStudent(token, id, options);
        console.log('[useDeleteStudentMutation] API Response:', response);
        
        if (!response) {
          throw new Error('No response received from the server.');
        }
        
        if (response.success === false || !response.success) {
          const errorMessage = response.error?.message || response.message || `Failed to delete student with ID: ${id} on the database.`;
          throw new Error(errorMessage);
        }
        
        return response;
      } catch (error) {
        const finalMessage = error.response?.data?.error?.message 
          || error.response?.data?.message 
          || error.message 
          || `Failed to delete student with ID: ${id} due to a network or server issue.`;
        
        console.error('[useDeleteStudentMutation] Error caught in mutationFn:', error);
        throw new Error(finalMessage);
      }
    },
    onSuccess: (response, variables) => {
      console.log(`[useDeleteStudentMutation] Student ${variables.id} deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
    },
    onError: (err, variables) => {
      console.error(`[useDeleteStudentMutation] Failure deleting student ${variables.id}:`, err);
    }
  });
};
