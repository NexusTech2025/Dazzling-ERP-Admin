import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';

/**
 * Custom hook to manage client-side filtering for teachers
 * @param {Array} initialTeachers - The raw array of teachers from the server
 */
export const useFilteredTeachers = (initialTeachers = []) => {
  // UI State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Debounce the search query by 300ms
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Derived state: The filtered list
  const filteredTeachers = useMemo(() => {
    return initialTeachers.filter((teacher) => {
      // 1. Search Filter (matches name, email, employee_id, or id)
      const searchLower = debouncedSearchQuery.toLowerCase();
      const matchesSearch = 
        !debouncedSearchQuery || 
        teacher.name?.toLowerCase().includes(searchLower) ||
        teacher.email?.toLowerCase().includes(searchLower) ||
        teacher.employee_id?.toLowerCase().includes(searchLower) ||
        teacher.id?.toLowerCase().includes(searchLower);

      // 2. Department Filter
      const teacherDepartment = teacher.department || teacher.subject_code; // Handle schema variations
      const matchesDepartment = departmentFilter === 'All' || teacherDepartment === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [initialTeachers, debouncedSearchQuery, departmentFilter]);

  // Extract unique options for dropdowns dynamically
  const availableDepartments = useMemo(() => {
    const departments = new Set(initialTeachers.map(t => t.department || t.subject_code).filter(Boolean));
    return ['All', ...Array.from(departments).sort()];
  }, [initialTeachers]);

  return {
    searchQuery,
    setSearchQuery,
    departmentFilter,
    setDepartmentFilter,
    filteredTeachers,
    availableDepartments
  };
};
