import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';

/**
 * Custom hook to manage client-side filtering for students
 * @param {Array} initialStudents - The raw array of students from the server
 */
export const useFilteredStudents = (initialStudents = []) => {
  // UI State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');

  // Debounce the search query by 300ms to avoid excessive recalculations
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Derived state: The filtered list
  const filteredStudents = useMemo(() => {
    return initialStudents.filter((student) => {
      // 1. Search Filter (matches name, email, or enrollment_no/id)
      const searchLower = debouncedSearchQuery.toLowerCase();
      const matchesSearch = 
        !debouncedSearchQuery || 
        student.name?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower) ||
        student.enrollment_no?.toLowerCase().includes(searchLower) ||
        student.id?.toLowerCase().includes(searchLower);

      // 2. Batch Filter
      const studentBatch = student.batch || student.grade || student.class; // Handle schema variations
      const matchesBatch = batchFilter === 'All' || studentBatch === batchFilter;

      // 3. Course Filter
      const studentCourse = student.course || student.class || student.grade; // Handle schema variations
      const matchesCourse = courseFilter === 'All' || studentCourse === courseFilter;

      return matchesSearch && matchesBatch && matchesCourse;
    });
  }, [initialStudents, debouncedSearchQuery, batchFilter, courseFilter]);

  // Extract unique options for dropdowns dynamically
  const availableBatches = useMemo(() => {
    const batches = new Set(initialStudents.map(s => s.batch || s.grade || s.class).filter(Boolean));
    return ['All', ...Array.from(batches).sort()];
  }, [initialStudents]);

  const availableCourses = useMemo(() => {
    const courses = new Set(initialStudents.map(s => s.course || s.class || s.grade).filter(Boolean));
    return ['All', ...Array.from(courses).sort()];
  }, [initialStudents]);

  return {
    searchQuery,
    setSearchQuery,
    batchFilter,
    setBatchFilter,
    courseFilter,
    setCourseFilter,
    filteredStudents,
    availableBatches,
    availableCourses
  };
};
