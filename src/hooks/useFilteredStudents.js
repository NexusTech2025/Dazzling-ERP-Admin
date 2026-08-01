import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { aq } from '../lib/queryEngine';
import { normalizeStudent } from '../lib/react-query/hydrate';

/**
 * Custom hook managing client-side search and filtering for Student Directory in memory.
 * Uses queryEngine (aq) to transform and filter cached data without hitting backend endpoints.
 * 
 * @param {Array<Object>} initialStudents - Master student array from useStudentsQuery.
 * @returns {Object} Search/filter state handlers, dynamic dropdown options, and filtered dataset.
 */
export const useFilteredStudents = (initialStudents = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Normalize all raw records once
  const normalizedStudents = useMemo(() => {
    return (initialStudents || []).map(normalizeStudent).filter(Boolean);
  }, [initialStudents]);

  // Derived filtered dataset via in-memory evaluation
  const filteredStudents = useMemo(() => {
    const searchLower = debouncedSearchQuery.trim().toLowerCase();

    return normalizedStudents.filter((student) => {
      // 1. Multi-field Search Matching (Student Name, Student ID, Email, Phone, Father Name, Allocations, Enrollments)
      const matchesSearch = !searchLower || (
        (student.student_name && student.student_name.toLowerCase().includes(searchLower)) ||
        (student.student_id && student.student_id.toLowerCase().includes(searchLower)) ||
        (student.email && student.email.toLowerCase().includes(searchLower)) ||
        (student.phone && student.phone.includes(searchLower)) ||
        (student.father_name && student.father_name.toLowerCase().includes(searchLower)) ||
        (Array.isArray(student.allocations) && student.allocations.some(a => 
          (a.batch_name && a.batch_name.toLowerCase().includes(searchLower)) ||
          (a.course_name && a.course_name.toLowerCase().includes(searchLower))
        )) ||
        (Array.isArray(student.enrollments) && student.enrollments.some(e => 
          e.enrollment_id && e.enrollment_id.toLowerCase().includes(searchLower)
        ))
      );

      // 2. Batch Filter
      const matchesBatch = batchFilter === 'All' || (
        Array.isArray(student.allocations) && student.allocations.some(a => a.batch_name === batchFilter || a.batch_id === batchFilter)
      );

      // 3. Course Filter
      const matchesCourse = courseFilter === 'All' || (
        Array.isArray(student.allocations) && student.allocations.some(a => a.course_name === courseFilter || a.course_id === courseFilter)
      );

      // 4. Status Filter
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter.toLowerCase();

      return matchesSearch && matchesBatch && matchesCourse && matchesStatus;
    });
  }, [normalizedStudents, debouncedSearchQuery, batchFilter, courseFilter, statusFilter]);

  // Extract unique batch options from student allocations
  const availableBatches = useMemo(() => {
    if (!normalizedStudents.length) return ['All'];
    const batches = [];
    normalizedStudents.forEach(s => {
      if (Array.isArray(s.allocations)) {
        s.allocations.forEach(a => {
          if (a.batch_name && a.batch_name !== 'Unassigned Batch') {
            batches.push(a.batch_name);
          }
        });
      }
    });

    return ['All', ...Array.from(new Set(batches)).sort()];
  }, [normalizedStudents]);

  // Extract unique course options from student allocations
  const availableCourses = useMemo(() => {
    if (!normalizedStudents.length) return ['All'];
    const courses = [];
    normalizedStudents.forEach(s => {
      if (Array.isArray(s.allocations)) {
        s.allocations.forEach(a => {
          if (a.course_name && a.course_name !== 'Unassigned Course') {
            courses.push(a.course_name);
          }
        });
      }
    });

    return ['All', ...Array.from(new Set(courses)).sort()];
  }, [normalizedStudents]);

  return {
    searchQuery,
    setSearchQuery,
    batchFilter,
    setBatchFilter,
    courseFilter,
    setCourseFilter,
    statusFilter,
    setStatusFilter,
    filteredStudents,
    availableBatches,
    availableCourses
  };
};

