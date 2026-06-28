/**
 * @file useBatchQueries.js
 * @module BatchQueries
 * @description React Query hooks layer for Batch management features.
 * Connects UI views to Google Apps Script (GAS) API services using structured query keys.
 * 
 * ### Queries
 * - {@link useBatchesQuery} - Fetches filtered list of batches with cache fallbacks.
 * - {@link useBatchDetailQuery} - Retrieves details for a single batch, utilizing cache scanning.
 * - {@link useBatchStudentsQuery} - Retrieves student enrollment records associated with a batch.
 * - {@link useWeeklyScheduleQuery} - Fetches weekly timetables.
 * - {@link useMasterTimetableQuery} - Retrieves global day-wise timetable schedules.
 * 
 * ### Mutations
 * - {@link useCreateBatchMutation} - Registers new batches.
 * - {@link useUpdateBatchMutation} - Modifies existing batch details.
 * - {@link useBulkUpdateBatchesMutation} - Applies changes to multiple batches.
 * - {@link useDeleteBatchMutation} - Removes batches from the database.
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { getCachedRecord, resolveRecord, getCachedList, resolveList } from '../../../lib/react-query/cacheHelper';
import { normalizeRecord, hydrateRecord } from '../../../lib/react-query/hydrate.js';

/**
 * Ensures Course, Teacher, and Branch datasets are loaded in the React Query cache.
 * Fetches from the network if they are missing or stale.
 * 
 * @async
 * @function ensureBatchRelations
 * @param {QueryClient} queryClient - The active TanStack QueryClient instance.
 * @param {string} token - Authorization token.
 * @returns {Promise<void>}
 */
export const ensureBatchRelations = async (queryClient, token) => {
  await Promise.all([
    queryClient.ensureQueryData({
      queryKey: queryKeys.course.list(EMPTY_FILTER),
      queryFn: async () => {
        const res = await apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Course' }, token);
        if (!res.success) throw new Error(res.message || 'Failed to fetch courses');
        return res.data?.data || [];
      }
    }),
    queryClient.ensureQueryData({
      queryKey: queryKeys.teacher.list(EMPTY_FILTER),
      queryFn: async () => {
        const res = await apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Teacher' }, token);
        if (!res.success) throw new Error(res.message || 'Failed to fetch teachers');
        return res.data?.data || [];
      }
    }),
    queryClient.ensureQueryData({
      queryKey: queryKeys.branch.list(EMPTY_FILTER),
      queryFn: async () => {
        const res = await apiClient.executeAction(API_REGISTRY.DATA.QUERY, { target: 'Branch' }, token);
        if (!res.success) throw new Error(res.message || 'Failed to fetch branches');
        return res.data?.data || [];
      }
    })
  ]);
};

/**
 * Hook for fetching a list of batches with optional filtering.
 * Automatically resolves relations (courses, teachers, branches) using cached data to reduce network overhead.
 * Implements a list-wide query cache scan as a fallback before issuing API calls.
 * 
 * @function useBatchesQuery
 * @param {object} [filter=EMPTY_FILTER] - Database column filter conditions.
 * @returns {object} React Query result containing normalized and hydrated batch records.
 */
export const useBatchesQuery = (filter = EMPTY_FILTER, options = {}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const enabledParam = options.enabled ?? true;

  const selectFn = useCallback(
    (data) => hydrateRecord('batch', data, queryClient),
    [queryClient]
  );

  console.log("querying batch with options and filters: ",
    {
      "filters": filter,
      "options": options,
      "queryKey": queryKeys.batch.list(filter),
      "enabled": enabledParam
    }
  );
  return useQuery({
    queryKey: queryKeys.batch.list(filter),
    queryFn: async ({ signal }) => {
      await ensureBatchRelations(queryClient, token);
      return resolveList(
        queryClient,
        'batch',
        filter,
        async () => {
          const response = await apiClient.executeAction(
            API_REGISTRY.DATA.QUERY,
            {
              target: 'Batch',
              where: filter
            },
            token,
            { signal }
          );
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch batches');
          }
          return normalizeRecord('batch', response.data?.data || []);
        },
        { strict: true }
      );
    },
    enabled: !!token && enabledParam,
    select: selectFn,
    initialData: () => getCachedList(queryClient, 'batch', filter, { strict: true }),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.batch.list(filter))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 2.5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching a single batch by its identifier.
 * First checks the detail cache key, then falls back to scanning existing list queries before fetching.
 * 
 * @function useBatchDetailQuery
 * @param {string} id - The unique batch identifier (e.g., BAT-xxxxx).
 * @returns {object} React Query result containing the resolved batch record.
 */
export const useBatchDetailQuery = (id) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.batch.detail(id),
    queryFn: async ({ signal }) => {
      await ensureBatchRelations(queryClient, token);
      return resolveRecord(
        queryClient,
        'batch',
        id,
        async () => {
          // Using generic query with limit 1 for details
          const response = await apiClient.executeAction(
            API_REGISTRY.DATA.QUERY,
            {
              target: 'Batch',
              where: { batch_id: id },
              pagination: { limit: 1 }
            },
            token,
            { signal }
          );
          if (!response.success) throw new Error(response.message);
          return normalizeRecord('batch', response.data?.data?.[0] || null);
        }
      );
    },
    enabled: !!token && !!id,
    select: (data) => hydrateRecord('batch', data, queryClient),
    initialData: () => getCachedRecord(queryClient, 'batch', id),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.batch.detail(id))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for retrieving students enrolled in a specific batch.
 * Queries the Enrollment table and performs a backend join inclusion to pull detailed student profile data.
 * 
 * @function useBatchStudentsQuery
 * @param {string} id - Target batch identifier.
 * @returns {object} React Query result containing array of students with mapped names, emails, and phone contacts.
 */
export const useBatchStudentsQuery = (id, searchQuery = '', options = {}) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.batch.student(id),
    queryFn: async ({ signal }) => {
      try {
        console.log('[useBatchStudentsQuery] Submitting Parallel Requests for Batch ID:', id);
        const [allocationsResponse, studentsResponse] = await Promise.all([
          apiClient.executeAction(
            API_REGISTRY.DATA.QUERY,
            {
              target: 'BatchAllocation',
              where: { batch_id: id }
            },
            token,
            { signal }
          ),
          apiClient.executeAction(
            API_REGISTRY.DATA.QUERY,
            {
              target: 'Student',
              where: {}
            },
            token,
            { signal }
          )
        ]);

        if (!allocationsResponse.success) {
          console.error('[useBatchStudentsQuery] Allocations API Failure Response:', allocationsResponse);
          const error = new Error(allocationsResponse.message || 'Failed to fetch batch allocations');
          if (options.onFailure) {
            options.onFailure(error);
          } else if (options.onError) {
            options.onError(error);
          }
          throw error;
        }

        if (!studentsResponse.success) {
          console.error('[useBatchStudentsQuery] Students API Failure Response:', studentsResponse);
          const error = new Error(studentsResponse.message || 'Failed to fetch students');
          if (options.onFailure) {
            options.onFailure(error);
          } else if (options.onError) {
            options.onError(error);
          }
          throw error;
        }

        const allocations = allocationsResponse.data?.data || [];
        const students = studentsResponse.data?.data || [];

        console.log(`[useBatchStudentsQuery] Success. Allocations found: ${allocations.length}, Total Students: ${students.length}`);

        // Stitch student details into allocation records
        const combined = allocations.map(allocation => {
          const student = students.find(s => s.student_id === allocation.student_id);
          return {
            ...allocation,
            student: student || null
          };
        });

        console.log('[useBatchStudentsQuery] Combined Payload:', combined);

        if (options.onSuccess) {
          options.onSuccess(combined);
        }
        return combined;
      } catch (err) {
        console.error('[useBatchStudentsQuery] API Query Error:', err);
        if (options.onFailure) {
          options.onFailure(err);
        } else if (options.onError) {
          options.onError(err);
        }
        throw err;
      }
    },
    enabled: !!token && !!id && (options.enabled ?? true),
    select: (data) => {
      const mapped = (data || []).map(allocation => ({
        ...allocation,
        ...allocation.student,
        enrollment_id: allocation.enrollment_id
      }));

      if (!searchQuery) return mapped;

      const query = searchQuery.toLowerCase();
      return mapped.filter(s =>
        (s.student_name || '').toLowerCase().includes(query) ||
        (s.student_id || '').toLowerCase().includes(query)
      );
    },
    ...options
  });
};

/**
 * Hook for retrieving the weekly timetable schedule of a specific batch.
 * 
 * @function useWeeklyScheduleQuery
 * @param {string} batchId - Target batch identifier.
 * @returns {object} React Query result containing schedule events.
 */
export const useWeeklyScheduleQuery = (batchId) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.batch.schedule(batchId),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.BATCH.GET_WEEKLY_SCHEDULE,
        { batchId },
        token,
        { signal }
      );
      if (!response.success) throw new Error(response.message);
      return response.data?.data || [];
    },
    enabled: !!token && !!batchId,
  });
};

/**
 * Hook for retrieving the global master timetable schedule for a specific day.
 * 
 * @function useMasterTimetableQuery
 * @param {string} day - Target day of the week (e.g., 'Monday', 'Tuesday').
 * @returns {object} React Query result containing the day's class listings.
 */
export const useMasterTimetableQuery = (day) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.batch.master(day),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.BATCH.GET_MASTER_TIMETABLE,
        { day },
        token,
        { signal }
      );
      if (!response.success) throw new Error(response.message);
      return response.data?.data;
    },
    enabled: !!token && !!day,
  });
};

/**
 * Mutation hook for registering/creating a new batch.
 * Automatically invalidates the global batch list cache on successful registration.
 * 
 * @function useCreateBatchMutation
 * @returns {object} React Query mutation trigger function and loading states.
 */
export const useCreateBatchMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, options }) =>
      apiClient.executeAction(API_REGISTRY.BATCH.CREATE, data, token, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.batch.list({}) });
      }
    }
  });
};

/**
 * Mutation hook for modifying batch details.
 * Performs a differential update of changed columns and invalidates both list and detail query keys.
 * Refetch is deferred (refetchType: 'none') to prevent unexpected page transition AbortErrors on unmount.
 * 
 * @function useUpdateBatchMutation
 * @returns {object} React Query mutation trigger function and loading states.
 */
export const useUpdateBatchMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, options }) =>
      apiClient.executeAction(
        API_REGISTRY.DATA.UPDATE,
        {
          table: 'Batch',
          id,
          data
        },
        token,
        options
      ),
    onSuccess: (response, { id }) => {
      if (response.success) {
        // Invalidate lists and detail but skip immediate refetching to avoid AbortError on unmount
        queryClient.invalidateQueries({
          queryKey: queryKeys.batch.lists(),
          refetchType: 'none'
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.batch.detail(id),
          refetchType: 'none'
        });
      }
    }
  });
};

/**
 * Mutation hook for executing bulk column updates across multiple batch identifiers.
 * 
 * @function useBulkUpdateBatchesMutation
 * @returns {object} React Query mutation trigger function and loading states.
 */
export const useBulkUpdateBatchesMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, data, options }) =>
      apiClient.executeAction(
        API_REGISTRY.BATCH.UPDATE_BULK,
        { ids, ...data },
        token,
        options
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.batch.list({}) });
      }
    }
  });
};

/**
 * Mutation hook for deleting an existing batch record.
 * Invalidates listing caches upon successful deletion.
 * 
 * @function useDeleteBatchMutation
 * @returns {object} React Query mutation trigger function and loading states.
 */
export const useDeleteBatchMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }) =>
      apiClient.executeAction(
        API_REGISTRY.DATA.DELETE,
        {
          table: 'Batch',
          id
        },
        token,
        options
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.batch.list({}) });
      }
    }
  });
};
