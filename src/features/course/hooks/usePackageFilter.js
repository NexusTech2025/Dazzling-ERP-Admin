import { useState, useMemo, useCallback } from 'react';

/**
 * Custom React hook to maintain filter states and compute filtered course packages.
 *
 * @function usePackageFilter
 * @param {Array<Object>} [packages=[]] - The list of course packages retrieved from database query.
 * @param {Array<Object>} [courseTypes=[]] - The course segment / type definitions list.
 * @returns {Object} State values, update setters, option lists, and computed results.
 * @returns {string} return.searchQuery - Active package search keyword.
 * @returns {Function} return.setSearchQuery - Updater for searchQuery state.
 * @returns {string} return.segmentFilter - Active segment constraint.
 * @returns {Function} return.setSegmentFilter - Updater for segmentFilter state.
 * @returns {string} return.boardFilter - Active board constraint (CBSE, RBSE, etc.).
 * @returns {Function} return.setBoardFilter - Updater for boardFilter state.
 * @returns {string} return.classFilter - Active target class level limit.
 * @returns {Function} return.setClassFilter - Updater for classFilter state.
 * @returns {string} return.languageFilter - Active medium of instruction constraint.
 * @returns {Function} return.setLanguageFilter - Updater for languageFilter state.
 * @returns {string} return.statusFilter - Active operational status (active, inactive, draft).
 * @returns {Function} return.setStatusFilter - Updater for statusFilter state.
 * @returns {Array<Object>} return.filteredPackages - Memoized sub-array of packages matching all filters.
 * @returns {boolean} return.isAcademicFilterActive - Flag stating if the selected segment has academic criteria.
 * @returns {Function} return.resetFilters - Clears all filter states back to their default values.
 * @returns {Array<Object>} return.segmentOptions - Formatted segment options with icons.
 * @returns {Array<Object>} return.boardOptions - Formatted board options.
 * @returns {Array<Object>} return.classOptions - Formatted class level options.
 * @returns {Array<Object>} return.languageOptions - Formatted language medium options.
 * @returns {Array<Object>} return.statusOptions - Formatted status options.
 */
export const usePackageFilter = (packages = [], courseTypes = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Find currently selected segment type metadata
  const selectedType = useMemo(() => {
    return courseTypes.find(t => t.segment_id === segmentFilter);
  }, [courseTypes, segmentFilter]);

  // For packages, academic filters (board, class, medium) should always be active/visible
  const isAcademicFilterActive = true;

  // Client-side filtering logic
  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      // 1. Matches Search query
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.package_id.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Matches Segment type filter
      const isAcademic = !!(p.board || p.target_class);
      const matchesSegment = !segmentFilter ||
        (isAcademicFilterActive && isAcademic) ||
        (!isAcademicFilterActive && !isAcademic);

      // 3. Matches Board filter
      const matchesBoard = !boardFilter || p.board === boardFilter;

      // 4. Matches Target Class level filter
      const matchesClass = !classFilter || String(p.target_class) === classFilter;

      // 5. Matches Language Medium filter (inferred from name pattern matches)
      const matchesLanguage = !languageFilter ||
        (languageFilter === 'Hindi' && p.name.toLowerCase().includes('hindi')) ||
        (languageFilter === 'English' && (p.name.toLowerCase().includes('english') || p.name.toLowerCase().includes('cbse')));

      // 6. Matches Operational Status filter
      const matchesStatus = !statusFilter || p.status === statusFilter;

      return matchesSearch && matchesSegment && matchesBoard && matchesClass && matchesLanguage && matchesStatus;
    });
  }, [packages, searchQuery, segmentFilter, isAcademicFilterActive, boardFilter, classFilter, languageFilter, statusFilter]);

  // Segment Selector list construction
  const segmentOptions = useMemo(() => {
    const typesList = Array.isArray(courseTypes) ? courseTypes : [];
    return [
      { label: 'All', value: '', icon: 'apps' },
      ...typesList.map(type => {
        let icon = 'school';
        const nameLower = type.segment_name?.toLowerCase() || '';
        if (nameLower.includes('computer')) icon = 'computer';
        else if (nameLower.includes('foundation')) icon = 'star';
        else if (nameLower.includes('academic') || type.entity_label === 'Subject') icon = 'menu_book';
        
        return {
          label: type.segment_name,
          value: type.segment_id,
          icon: icon
        };
      })
    ];
  }, [courseTypes]);

  // Static options mappings
  const boardOptions = useMemo(() => [
    { label: 'ALL', value: '' },
    { label: 'CBSE', value: 'CBSE' },
    { label: 'RBSE', value: 'RBSE' },
    { label: 'ICSE', value: 'ICSE' },
    { label: 'IB', value: 'IB' }
  ], []);

  const classOptions = useMemo(() => [...Array(12)].map((_, i) => ({
    label: `Class ${i + 1}`,
    value: String(i + 1)
  })), []);

  const languageOptions = useMemo(() => [
    { label: 'ALL', value: '' },
    { label: 'HINDI', value: 'Hindi' },
    { label: 'ENGLISH', value: 'English' }
  ], []);

  const statusOptions = useMemo(() => [
    { label: 'ALL STATUS', value: '' },
    { label: 'ACTIVE', value: 'active' },
    { label: 'INACTIVE', value: 'inactive' },
    { label: 'DRAFT', value: 'draft' }
  ], []);

  // Action callback to clear all filter criteria to default states
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSegmentFilter('');
    setBoardFilter('');
    setClassFilter('');
    setLanguageFilter('');
    setStatusFilter('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    segmentFilter,
    setSegmentFilter,
    boardFilter,
    setBoardFilter,
    classFilter,
    setClassFilter,
    languageFilter,
    setLanguageFilter,
    statusFilter,
    setStatusFilter,
    filteredPackages,
    isAcademicFilterActive,
    resetFilters,
    segmentOptions,
    boardOptions,
    classOptions,
    languageOptions,
    statusOptions
  };
};
