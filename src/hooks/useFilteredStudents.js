import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { normalizeStudent } from '../lib/react-query/hydrate';
import { enrollmentRepo, getStudentAllocationsViewModel } from '../features/student/utils/enrollmentCacheHelper';
import { studentRepo } from '../features/student/utils/studentCacheHelper';

/**
 * Custom hook managing client-side search, filtering, and interactive KPI card filtering for Student Directory in memory.
 * Hydrates raw junction records via getStudentAllocationsViewModel for exact relational matching.
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

  // Normalize all raw records once
  const normalizedStudents = useMemo(() => {
    return (initialStudents || []).map(normalizeStudent).filter(Boolean);
  }, [initialStudents]);

  // Derived filtered dataset via in-memory evaluation with hydrated allocations
  const filteredStudents = useMemo(() => {
    const searchLower = debouncedSearchQuery.trim().toLowerCase();

    return normalizedStudents.filter((student) => {
      const allocations = getStudentAllocationsViewModel(student, batches, courses, courseTypes);

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

      // 5. Interactive KPI Card Filter
      let matchesKpi = true;
      if (kpiFilter !== 'All') {
        const feeRes = enrollmentRepo.extractFeeSummary(student);
        const enrRes = enrollmentRepo.evaluateAdmissionDate(student, 30);
        const attnRes = studentRepo.evaluateAttendance(student, 75);

        switch (kpiFilter) {
          case 'fee_due':
            matchesKpi = feeRes.isFeeDue;
            break;
          case 'overdue':
            matchesKpi = feeRes.isOverdue;
            break;
          case 'paid_full':
            matchesKpi = feeRes.isPaidFull;
            break;
          case 'new_admissions':
            matchesKpi = enrRes.isNewAdmission;
            break;
          case 'low_attendance':
            matchesKpi = attnRes.isLowAttendance;
            break;
          case 'unassigned':
            matchesKpi = allocations.length === 0;
            break;
          default:
            matchesKpi = true;
        }
      }

      return matchesSearch && matchesBatch && matchesCourse && matchesStatus && matchesKpi;
    });
  }, [normalizedStudents, debouncedSearchQuery, batchFilter, courseFilter, statusFilter, kpiFilter, batches, courses, courseTypes]);

  // Extract unique batch options from hydrated allocations
  const availableBatches = useMemo(() => {
    if (!normalizedStudents.length) return ['All'];
    const batchesSet = new Set();
    normalizedStudents.forEach(s => {
      const allocs = getStudentAllocationsViewModel(s, batches, courses, courseTypes);
      allocs.forEach(a => {
        if (a.batchName && a.batchName !== 'Unassigned Batch') {
          batchesSet.add(a.batchName);
        }
      });
    });
    return ['All', ...Array.from(batchesSet).sort()];
  }, [normalizedStudents, batches, courses, courseTypes]);

  // Extract unique course options from hydrated allocations
  const availableCourses = useMemo(() => {
    if (!normalizedStudents.length) return ['All'];
    const coursesSet = new Set();
    normalizedStudents.forEach(s => {
      const allocs = getStudentAllocationsViewModel(s, batches, courses, courseTypes);
      allocs.forEach(a => {
        if (a.courseName && a.courseName !== 'Unassigned Course') {
          coursesSet.add(a.courseName);
        }
      });
    });
    return ['All', ...Array.from(coursesSet).sort()];
  }, [normalizedStudents, batches, courses, courseTypes]);

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
