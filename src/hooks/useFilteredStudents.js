import { useState, useMemo } from 'react';
import { normalizeStudent } from '../lib/react-query/hydrate';
import { enrichStudentWithKpi } from '../features/student/utils/studentKpiHelper';
import { batchRepo } from '../features/batch/utils/batchCacheHelper';

/**
 * Custom hook managing client-side search, filtering, and interactive KPI card filtering for Student Directory in memory.
 * Pre-enriches student records with _kpi metadata once upon dataset updates for instant O(1) keystroke filtering.
 * 
 * @param {Array<Object>} initialStudents - Master student array from useStudentsQuery.
 * @param {Array<Object>} [batches=[]] - Cached batches array from useBatchesQuery.
 * @param {Array<Object>} [courses=[]] - Cached courses array from useCoursesQuery.
 * @param {Array<Object>} [courseTypes=[]] - Cached course types array from useCourseTypesQuery.
 * @returns {Object} Search/filter state handlers, dynamic dropdown options, KPI filter controls, and filtered dataset.
 */
export const useFilteredStudents = (
  initialStudents = [],
  batches = [],
  courses = [],
  courseTypes = []
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [kpiFilter, setKpiFilter] = useState('All');

  // 1. Single-Pass Enrichment Pipeline: Consolidates enrichedStudents, availableBatches, and availableCourses
  const { enrichedStudents, availableBatches, availableCourses } = useMemo(() => {
    if (batches.length > 0 || courses.length > 0 || courseTypes.length > 0) {
      batchRepo.prime(batches, courses, courseTypes);
    }

    const rawList = initialStudents || [];
    const enriched = [];
    const batchNamesSet = new Set();
    const courseNamesSet = new Set();

    for (let i = 0; i < rawList.length; i++) {
      const raw = rawList[i];
      if (!raw) continue;

      const normalized = normalizeStudent(raw);
      if (!normalized) continue;

      const student = enrichStudentWithKpi(normalized);
      const allocs = student._kpi?.allocations || [];

      // Pre-index batch and course sets for instant O(1) matching
      const studentBatchNames = new Set();
      const studentCourseNames = new Set();

      let allocSearchTokens = '';
      for (let j = 0; j < allocs.length; j++) {
        const a = allocs[j];
        if (a.batchName && a.batchName !== 'Unassigned Batch') {
          batchNamesSet.add(a.batchName);
          studentBatchNames.add(a.batchName);
          if (a.batchId) studentBatchNames.add(a.batchId);
        }
        if (a.courseName && a.courseName !== 'Unassigned Course') {
          courseNamesSet.add(a.courseName);
          studentCourseNames.add(a.courseName);
          if (a.courseId) studentCourseNames.add(a.courseId);
        }
        allocSearchTokens += ` ${a.batchName || ''} ${a.courseName || ''}`;
      }

      student._batchNames = studentBatchNames;
      student._courseNames = studentCourseNames;

      // Pre-computed lowercase search index: Eliminates 7+ toLowerCase() calls per filter pass
      student._searchIndex = `${student.student_name || ''} ${student.student_id || ''} ${student.email || ''} ${student.phone || ''} ${student.father_name || ''} ${allocSearchTokens}`.toLowerCase();

      enriched.push(student);
    }

    return {
      enrichedStudents: enriched,
      availableBatches: ['All', ...Array.from(batchNamesSet).sort()],
      availableCourses: ['All', ...Array.from(courseNamesSet).sort()]
    };
  }, [initialStudents, batches, courses, courseTypes]);

  // 2. High-Speed Filter Pipeline with Short-Circuiting Order
  const filteredStudents = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();

    return enrichedStudents.filter((student) => {
      // 1. Status Filter (Fastest string equality check)
      if (statusFilter !== 'All' && student.status !== statusFilter.toLowerCase()) {
        return false;
      }

      // 2. Interactive KPI Card Filter (Instant O(1) boolean property lookup)
      if (kpiFilter !== 'All' && student._kpi) {
        if (kpiFilter === 'fee_due' && !student._kpi.isFeeDue) return false;
        if (kpiFilter === 'overdue' && !student._kpi.isOverdue) return false;
        if (kpiFilter === 'paid_full' && !student._kpi.isPaidFull) return false;
        if (kpiFilter === 'new_admissions' && !student._kpi.isNewAdmission) return false;
        if (kpiFilter === 'low_attendance' && !student._kpi.isLowAttendance) return false;
        if (kpiFilter === 'unassigned' && !student._kpi.isUnassigned) return false;
      }

      // 3. Batch Filter (Instant O(1) Set lookup)
      if (batchFilter !== 'All' && !student._batchNames?.has(batchFilter)) {
        return false;
      }

      // 4. Course Filter (Instant O(1) Set lookup)
      if (courseFilter !== 'All' && !student._courseNames?.has(courseFilter)) {
        return false;
      }

      // 5. Multi-Field Search Matching (Single O(1) substring check on pre-indexed string)
      if (searchLower && !student._searchIndex?.includes(searchLower)) {
        return false;
      }

      return true;
    });
  }, [enrichedStudents, searchQuery, batchFilter, courseFilter, statusFilter, kpiFilter]);

  // Helper toggle function for KPI card clicks
  const toggleKpiFilter = (targetKey) => {
    setKpiFilter(prev => (prev === targetKey ? 'All' : targetKey));
  };

  return {
    searchQuery,
    setSearchQuery,
    batchFilter,
    setBatchFilter,
    courseFilter,
    setCourseFilter,
    statusFilter,
    setStatusFilter,
    kpiFilter,
    setKpiFilter,
    toggleKpiFilter,
    filteredStudents,
    availableBatches,
    availableCourses
  };
};

export default useFilteredStudents;
