/**
 * @file useAttendanceOrchestration.js
 * @description Thin coordination hook for the Student Attendance Manager.
 * Delegates data fetching to domain-specific query hooks and business logic
 * to `useBatchFilters`. This hook owns only wiring — no queryFn, no useMemo.
 *
 * @function useAttendanceOrchestration
 * @param {Object} [filters={}] - Active selection criteria from the UI.
 * @param {string} [filters.selectedBatchId] - Active batch identifier filter.
 * @param {string} [filters.classFilter] - Class level value from course.metadata.class.
 * @param {string} [filters.boardFilter] - Board value from course.metadata.board.
 * @param {string} [filters.segmentFilter] - Batch type segment (e.g. 'Academy').
 * @returns {{
 *   students: Array<Object>,
 *   menus: { batches: Array, classes: Array, boards: Array, segments: Array },
 *   isLoading: boolean
 * }}
 */
import { useStudentsQuery } from '../../student/hooks/useStudentQueries';
import { useCoursesQuery } from '../../course/hooks/useCourseQueries';
import { useBatchesQuery, useBatchAllocationsQuery } from './useBatchQueries';
import { useBatchFilters } from './useBatchFilters';

export function useAttendanceOrchestration(filters = {}) {
  const { selectedBatchId, classFilter, boardFilter, segmentFilter } = filters;

  // 1. Delegate all data fetching to established, canonical query hooks
  const studentsQuery    = useStudentsQuery();
  const batchesQuery     = useBatchesQuery();
  const allocationsQuery = useBatchAllocationsQuery();
  const coursesQuery     = useCoursesQuery();

  // 2. Delegate all join + filter logic to the dedicated filter hook
  const { studentsGrid, menus } = useBatchFilters(
    {
      students:         studentsQuery.data    || [],
      batches:          batchesQuery.data     || [],
      batchAllocations: allocationsQuery.data || [],
      courses:          coursesQuery.data     || [],
    },
    { selectedBatchId, classFilter, boardFilter, segmentFilter }
  );

  return {
    students:  studentsGrid,
    menus,
    isLoading:
      studentsQuery.isLoading ||
      batchesQuery.isLoading ||
      allocationsQuery.isLoading ||
      coursesQuery.isLoading,
  };
}
