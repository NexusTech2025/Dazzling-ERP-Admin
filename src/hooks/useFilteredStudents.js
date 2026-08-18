import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
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

  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Normalize and enrich all raw records once with pre-computed KPI and allocation metadata
  const enrichedStudents = useMemo(() => {
    if (batches.length > 0 || courses.length > 0 || courseTypes.length > 0) {
      batchRepo.prime(batches, courses, courseTypes);
    }
    return (initialStudents || [])
      .map(normalizeStudent)
      .filter(Boolean)
      .map(enrichStudentWithKpi);
  }, [initialStudents, batches, courses, courseTypes]);

  // Derived filtered dataset via in-memory evaluation with pre-computed allocations and KPI flags
  const filteredStudents = useMemo(() => {
    const searchLower = debouncedSearchQuery.trim().toLowerCase();

    return enrichedStudents.filter((student) => {
      const allocations = student._kpi?.allocations || [];

      // 1. Multi-field Search Matching
      const matchesSearch = !searchLower || (
        (student.student_name && student.student_name.toLowerCase().includes(searchLower)) ||
        (student.student_id && student.student_id.toLowerCase().includes(searchLower)) ||
        (student.email && student.email.toLowerCase().includes(searchLower)) ||
        (student.phone && student.phone.includes(searchLower)) ||
        (student.father_name && student.father_name.toLowerCase().includes(searchLower)) ||
        allocations.some(a => 
          (a.batchName && a.batchName.toLowerCase().includes(searchLower)) ||
          (a.courseName && a.courseName.toLowerCase().includes(searchLower))
        )
      );

      // 2. Hydrated Batch Filter
      const matchesBatch = batchFilter === 'All' || allocations.some(a => 
        a.batchName === batchFilter || a.batchId === batchFilter
      );

      // 3. Hydrated Course Filter
      const matchesCourse = courseFilter === 'All' || allocations.some(a => 
        a.courseName === courseFilter || a.courseId === courseFilter
      );

      // 4. Status Filter
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter.toLowerCase();

      // 5. Interactive KPI Card Filter - Instant O(1) property lookup
      const matchesKpi = 
        kpiFilter === 'All' ? true :
        !student._kpi ? true :
        kpiFilter === 'fee_due' ? student._kpi.isFeeDue :
        kpiFilter === 'overdue' ? student._kpi.isOverdue :
        kpiFilter === 'paid_full' ? student._kpi.isPaidFull :
        kpiFilter === 'new_admissions' ? student._kpi.isNewAdmission :
        kpiFilter === 'low_attendance' ? student._kpi.isLowAttendance :
        kpiFilter === 'unassigned' ? student._kpi.isUnassigned : true;

      return matchesSearch && matchesBatch && matchesCourse && matchesStatus && matchesKpi;
    });
  }, [enrichedStudents, debouncedSearchQuery, batchFilter, courseFilter, statusFilter, kpiFilter]);

  // Extract unique batch options from pre-computed allocations
  const availableBatches = useMemo(() => {
    if (!enrichedStudents.length) return ['All'];
    const batchesSet = new Set();
    enrichedStudents.forEach(s => {
      const allocs = s._kpi?.allocations || [];
      allocs.forEach(a => {
        if (a.batchName && a.batchName !== 'Unassigned Batch') {
          batchesSet.add(a.batchName);
        }
      });
    });
    return ['All', ...Array.from(batchesSet).sort()];
  }, [enrichedStudents]);

  // Extract unique course options from pre-computed allocations
  const availableCourses = useMemo(() => {
    if (!enrichedStudents.length) return ['All'];
    const coursesSet = new Set();
    enrichedStudents.forEach(s => {
      const allocs = s._kpi?.allocations || [];
      allocs.forEach(a => {
        if (a.courseName && a.courseName !== 'Unassigned Course') {
          coursesSet.add(a.courseName);
        }
      });
    });
    return ['All', ...Array.from(coursesSet).sort()];
  }, [enrichedStudents]);

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
