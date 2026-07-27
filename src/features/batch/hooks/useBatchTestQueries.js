/**
 * @file useBatchTestQueries.js
 * @module BatchTestQueries
 * @description React Query hooks layer for Test & Marks management in Batches.
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import { getCachedList, resolveList } from '../../../lib/react-query/cacheHelper';

/**
 * Fetches all tests associated with a batch with progressive cache hydration.
 * @param {string} batchId - Target batch ID.
 * @param {Object} [options={}] - Optional query execution options & callbacks.
 */
export function useBatchTestsQuery(batchId, options = {}) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const filter = useMemo(() => ({ batch_id: batchId }), [batchId]);

  return useQuery({
    queryKey: queryKeys.test.byBatch(batchId),
    queryFn: async ({ signal }) => {
      if (!batchId) return [];
      return resolveList(
        queryClient,
        'test',
        filter,
        async () => {
          const response = await apiClient.executeAction(
            API_REGISTRY.DATA.QUERY,
            {
              target: 'Test',
              where: { batch_id: batchId },
              include: ['marks']
            },
            token,
            { signal }
          );

          if (!response.success) {
            throw new Error(response.message || 'Failed to fetch batch tests');
          }

          return response.data?.data || response.data || [];
        },
        options
      );
    },
    enabled: Boolean(token) && Boolean(batchId),
    initialData: () => getCachedList(queryClient, 'test', filter, { strict: true }),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.test.byBatch(batchId))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 2.5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * Selector hook extracting student marks for a specific test directly from the cached batch tests query.
 * Bypasses network request by consuming hydrated `test.marks`.
 * @param {string} batchId - Target batch ID.
 * @param {string} testId - Target test ID.
 * @returns {Array<Object>} List of hydrated TestMarks objects for the target test.
 */
export function useTestMarksQuery(batchId, testId) {
  const { data: tests = [] } = useBatchTestsQuery(batchId);

  return useMemo(() => {
    if (!testId || !tests.length) return [];
    const foundTest = tests.find(t => t.id === testId || t.test_id === testId);
    return foundTest?.marks || [];
  }, [tests, testId]);
}

/**
 * Hook to create a new test.
 */
export function useCreateTestMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testData) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.TEST.CREATE,
        testData,
        token
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to create test');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.test.byBatch(variables.batch_id) });
    }
  });
}

/**
 * Hook to update an existing test.
 */
export function useUpdateTestMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, batch_id, ...updates }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.UPDATE,
        {
          table: 'Test',
          id,
          data: updates
        },
        token
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to update test');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (variables.batch_id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.test.byBatch(variables.batch_id) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.test.detail(variables.id) });
    }
  });
}

/**
 * Hook to delete a test.
 */
export function useDeleteTestMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, batch_id }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.DELETE,
        {
          table: 'Test',
          id
        },
        token
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete test');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (variables.batch_id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.test.byBatch(variables.batch_id) });
      }
    }
  });
}

/**
 * Hook to save or update student marks in bulk using specialized endpoint test_save_marks_bulk.
 */
export function useSaveBulkMarksMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ test_id, marksRecords }) => {
      // Format payload items per REST API documentation
      const records = marksRecords.map(m => ({
        student_id: m.student_id,
        obtained_marks: m.is_absent ? null : (m.obtained_marks === '' ? 0 : Number(m.obtained_marks)),
        is_absent: Boolean(m.is_absent),
        remarks: m.remarks || ''
      }));

      const response = await apiClient.executeAction(
        API_REGISTRY.TEST.SAVE_MARKS_BULK,
        {
          test_id,
          records
        },
        token
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to save marks');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.test.marks(variables.test_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.test.all });
    }
  });
}
