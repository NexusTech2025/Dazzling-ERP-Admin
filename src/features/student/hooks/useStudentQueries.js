import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { getCachedRecord, resolveRecord, resolveList } from '../../../lib/react-query/cacheHelper';
import {
  fetchStudents,
  modifyStudent,
  updateStudentProfile,
  removeStudent,
  registerStudentTransaction,
  createStudent,
  createStudentLead
} from '../api/student.api';

/**
 * Hook for fetching all students with zero query key fragmentation.
 * Ephemeral filters are excluded from queryKey; all student records are cached under EMPTY_FILTER
 * and resolved via resolveList with normalizeStudent.
 *
 * @param {Object} [filter=EMPTY_FILTER] - Ephemeral filter for server-side narrowing (not encoded in queryKey).
 * @param {Object} [options={}] - Additional hook configuration options.
 * @param {Function} [options.onSuccess] - Callback invoked with data after a successful fetch.
 * @param {Function} [options.onError] - Callback invoked with error after a failed fetch.
 * @param {boolean} [options.strictSearch=false] - When true, passes the filter for server-side strict matching.
 * @param {boolean} [options.forceRefetch=false] - When true, overrides staleTime to force a fresh network fetch.
 */
export const useStudentsQuery = (filter = EMPTY_FILTER, options = {}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { onSuccess, onError, strictSearch = false, forceRefetch = false } = options;

  const activeFilter = strictSearch ? filter : EMPTY_FILTER;

  const query = useQuery({
    queryKey: queryKeys.student.list(EMPTY_FILTER),
    queryFn: async () => {
      return resolveList(
        queryClient,
        'student',
        activeFilter,
        async () => {
          const response = await fetchStudents(token, activeFilter);
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch students');
          }
          return response.data?.data || [];
        },
        { forceRefetch }
      );
    },
    enabled: !!token,
    staleTime: forceRefetch ? 0 : Infinity,
    refetchOnMount: forceRefetch ? 'always' : false,
    refetchOnWindowFocus: false,
  });

  // Invoke lifecycle callbacks when query state settles
  if (query.isSuccess && onSuccess) {
    onSuccess(query.data);
  }
  if (query.isError && onError) {
    onError(query.error);
  }

  return query;
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
 * Hook for composite student profile updates (student_update_profile)
 */
export const useUpdateStudentProfileMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, options }) => updateStudentProfile(token, payload, options),
    onSuccess: (response, variables) => {
      const studentId = variables.payload?.student_id;
      if (response.success && studentId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.student.detail(studentId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.student.profile(studentId) });
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
        return response;
      } catch (error) {
        console.error('[useDeleteStudentMutation] Error caught in mutationFn:', error);
        throw error;
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
