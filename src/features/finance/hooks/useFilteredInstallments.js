import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';

/**
 * Custom hook to manage client-side filtering for installments
 * @param {Array} initialInstallments - The raw array of installments from the server
 */
export const useFilteredInstallments = (initialInstallments = []) => {
  // UI State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState(''); // Placeholder for future Date Range Picker

  // Debounce the search query by 300ms
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Derived state: The filtered list
  const filteredInstallments = useMemo(() => {
    return initialInstallments.filter((installment) => {
      // 1. Search Filter (matches student name or installment id)
      const searchLower = debouncedSearchQuery.toLowerCase();
      const matchesSearch = 
        !debouncedSearchQuery || 
        installment.student_name?.toLowerCase().includes(searchLower) ||
        installment.installment_id?.toLowerCase().includes(searchLower);

      // 2. Status Filter
      const matchesStatus = statusFilter === 'All' || installment.status === statusFilter;

      // 3. Date Range Filter (Placeholder logic - currently just passes everything)
      const matchesDate = true; 

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [initialInstallments, debouncedSearchQuery, statusFilter, dateRange]);

  // Extract unique options for status dropdown dynamically
  const availableStatuses = useMemo(() => {
    const statuses = new Set(initialInstallments.map(i => i.status).filter(Boolean));
    return ['All', ...Array.from(statuses).sort()];
  }, [initialInstallments]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    filteredInstallments,
    availableStatuses
  };
};
