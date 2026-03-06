import { useState, useMemo } from 'react';

/**
 * Hook to manage complex filtering logic for batches.
 * Extracted from component to keep the UI layer clean and testable.
 * 
 * @param {Array} initialBatches - The raw array of batch objects from the API.
 */
export const useFilteredBatches = (initialBatches = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredBatches = useMemo(() => {
    return initialBatches.filter(batch => {
      // 1. Search across multiple fields
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        (batch.batch_name && batch.batch_name.toLowerCase().includes(query)) ||
        (batch.course_name && batch.course_name.toLowerCase().includes(query)) ||
        (batch.teacher_name && batch.teacher_name.toLowerCase().includes(query));

      // 2. Exact match filters
      const matchesCourse = courseFilter === '' || batch.course_name === courseFilter;
      const matchesStatus = statusFilter === '' || batch.status === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [initialBatches, searchQuery, courseFilter, statusFilter]);

  // Derived state for dropdown options
  const availableCourses = useMemo(() => {
    const courses = new Set(initialBatches.map(b => b.course_name).filter(Boolean));
    return Array.from(courses).sort();
  }, [initialBatches]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set(initialBatches.map(b => b.status).filter(Boolean));
    return Array.from(statuses).sort();
  }, [initialBatches]);

  return {
    searchQuery,
    setSearchQuery,
    courseFilter,
    setCourseFilter,
    statusFilter,
    setStatusFilter,
    filteredBatches,
    availableCourses,
    availableStatuses
  };
};
