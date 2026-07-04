import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { useAuth } from '../../../context/AuthContextCore';
import { ensureBatchRelations } from './useBatchQueries';
import { resolveList } from '../../../lib/react-query/cacheHelper';
import { normalizeRecord } from '../../../lib/react-query/hydrate';

/**
 * Hook to manage client-side relational joins and multi-stage filter transformations for student attendance.
 * Performs memory-efficient map joins across Student, Batch, and BatchAllocation caches.
 * 
 * @param {Object} filters - Selection criteria.
 * @param {string} [filters.selectedBatchId] - Active batch identifier.
 * @param {string} [filters.classFilter] - Digit string for the target class (e.g., '12').
 * @param {string} [filters.segmentFilter] - High-level toggle segment (Academy, Computer, etc.).
 * @returns {Object} Orchestration payload including students grid list and filters menus.
 */
export function useAttendanceOrchestration(filters = {}) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { selectedBatchId, classFilter, segmentFilter } = filters;

  // 1. Fetch raw datasets from global query cache (with network queryFn fallback)
  const studentsQuery = useQuery({
    queryKey: queryKeys.student.list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      const res = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'Student' },
        token,
        { signal }
      );
      if (!res.success) throw new Error(res.message || 'Failed to fetch students');
      return res.data?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const batchesQuery = useQuery({
    queryKey: queryKeys.batch.list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      await ensureBatchRelations(queryClient, token);
      return resolveList(
        queryClient,
        'batch',
        EMPTY_FILTER,
        async () => {
          const response = await apiClient.executeAction(
            API_REGISTRY.DATA.QUERY,
            { target: 'Batch', where: EMPTY_FILTER },
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
    staleTime: 1000 * 60 * 5,
  });

  // Pull allocations data (Fetch from network if cache is cold)
  const allocationsQuery = useQuery({
    queryKey: ['batchAllocation', 'list'],
    queryFn: async ({ signal }) => {
      const res = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'BatchAllocation' },
        token,
        { signal }
      );
      if (!res.success) throw new Error(res.message || 'Failed to fetch batch allocations');
      return res.data?.data || [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5-minute cache
  });

  // Pull raw datasets safely with array fallbacks
  const rawStudents = studentsQuery.data?.data || studentsQuery.data || [];
  const rawBatches = batchesQuery.data?.data || batchesQuery.data || [];
  const rawAllocations = allocationsQuery.data?.data || allocationsQuery.data || [];

  // 2. Perform Client-Side Data Denormalization & Multi-Stage Transformations (Memoized to prevent reference loops)
  const result = useMemo(() => {
    // Stage A: Aggregate active allocations per batch to count student body sizes
    const batchSizeMap = {};
    rawAllocations.forEach((alloc) => {
      if (alloc.status === 'active') {
        batchSizeMap[alloc.batch_id] = (batchSizeMap[alloc.batch_id] || 0) + 1;
      }
    });

    // Stage B: Filter to batches that have active enrollment size > 1
    const activeBatchesMenu = rawBatches.filter(
      (b) => b.status === 'active' && (batchSizeMap[b.batch_id] || 0) > 1
    );

    // Stage C: Extract class levels and sort descending
    const classFilterMenu = Array.from(
      new Set(
        rawBatches
          .map((b) => b.batch_name?.match(/\d+/)?.[0])
          .filter(Boolean)
      )
    ).sort((a, b) => Number(b) - Number(a));

    // Stage D: Map and join Student details against active Allocations
    let studentMatrix = rawAllocations
      .filter((alloc) => alloc.status === 'active')
      .map((alloc) => {
        const student = rawStudents.find((s) => s.student_id === alloc.student_id);
        const batch = rawBatches.find((b) => b.batch_id === alloc.batch_id);
        return {
          ...student,
          allocation_id: alloc.allocation_id,
          batch_id: alloc.batch_id,
          batch_name: batch?.batch_name || 'Unassigned Batch',
          batch_type: batch?.batch_type || 'Unknown Segment',
          class_level: batch?.batch_name?.match(/\d+/)?.[0] || null,
        };
      })
      .filter((record) => record.student_id && record.batch_id);

    // Stage E: Apply Runtime Selection Filters
    if (selectedBatchId && selectedBatchId !== 'all') {
      studentMatrix = studentMatrix.filter((r) => r.batch_id === selectedBatchId);
    }
    if (classFilter) {
      studentMatrix = studentMatrix.filter((r) => r.class_level === classFilter);
    }
    if (segmentFilter) {
      studentMatrix = studentMatrix.filter((r) => r.batch_type === segmentFilter);
    }

    return {
      studentsGrid: studentMatrix,
      menus: {
        batches: activeBatchesMenu,
        classes: classFilterMenu,
        segments: ['Academy', 'Computer', 'Foundation', 'Competitive'],
      },
    };
  }, [rawStudents, rawBatches, rawAllocations, selectedBatchId, classFilter, segmentFilter]);

  return {
    students: result.studentsGrid,
    menus: result.menus,
    isLoading: studentsQuery.isLoading || batchesQuery.isLoading || allocationsQuery.isLoading,
  };
}
