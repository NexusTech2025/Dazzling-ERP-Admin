import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCourseTypesQuery } from './useCourseQueries';
import { usePackagesQuery, useDeletePackageMutation } from './usePackageQueries';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import useSelection from '../../../hooks/useSelection';
import useDeleteManyMutation from '../../../hooks/useDeleteManyMutation';
import { API_REGISTRY } from '../../../services/apiRegistry';

/**
 * @file usePackageWorkspaceState.js
 * @module PackageWorkspaceStateHook
 * @description React custom hook that encapsulates all state, query orchestration, 
 * filtering calculations, multi-select indexes, and delete mutations for the Package Workspace.
 *
 * ### Hook Operation:
 * - Fetches course packages and categories from React Query.
 * - Computes filtered results dynamically on change of search keywords, segment filters, and academic filters.
 * - Orchestrates individual and bulk selection checkboxes.
 * - Coordinates single/bulk confirm deletion popup modals.
 *
 * @function usePackageWorkspaceState
 * @param {void} - This hook accepts no parameters.
 * @returns {object} Workspace state variables, query results, mutation handlers, and queryClient.
 * @returns {string} return.viewMode - Current UI rendering layout mode ('grid' | 'list').
 * @returns {Function} return.setViewMode - State updater for viewMode.
 * @returns {string} return.searchQuery - User search input string.
 * @returns {Function} return.setSearchQuery - State updater for searchQuery.
 * @returns {string} return.segmentFilter - Selected course segment identifier.
 * @returns {Function} return.setSegmentFilter - State updater for segmentFilter.
 * @returns {string} return.boardFilter - Selected academic board constraint (CBSE, RBSE, etc.).
 * @returns {Function} return.setBoardFilter - State updater for boardFilter.
 * @returns {string} return.classFilter - Selected target class identifier.
 * @returns {Function} return.setClassFilter - State updater for classFilter.
 * @returns {string} return.languageFilter - Selected language medium filter.
 * @returns {Function} return.setLanguageFilter - State updater for languageFilter.
 * @returns {object} return.deleteModal - Confirmation modal visibility and status details.
 * @returns {Function} return.setDeleteModal - State updater for deleteModal.
 * @returns {Function} return.handleOpenDelete - Trigger callback to display the delete modal drawer.
 * @returns {Function} return.handleCloseDelete - Callback to hide the delete modal.
 * @returns {boolean} return.isLoading - Loading state checking packages list or course categories.
 * @returns {boolean} return.isFetching - Refresh fetch network query indicator.
 * @returns {object|null} return.error - Exception thrown during queries, if any.
 * @returns {Array<object>} return.filteredPackages - Memoized array of packages matching the active filters.
 * @returns {Array<object>} return.segmentOptions - Computed list of segment options with icons.
 * @returns {boolean} return.isAcademicFilterActive - Flag indicating if segment rules require showing academic filters.
 * @returns {object} return.selection - Hook return containing selected IDs and checkbox handlers.
 * @returns {object} return.deletePackageMutation - Mutation handler executing single package deletions.
 * @returns {object} return.deleteManyPackagesMutation - Mutation handler executing bulk package deletions.
 * @returns {object} return.queryClient - Active QueryClient instance.
 */
export const usePackageWorkspaceState = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: '',
    type: 'package',
    status: 'idle',
    resultMessage: null
  });

  const { data: packages = [], isLoading: isLoadingPackages, isFetching: isFetchingPackages, error: packagesError } = usePackagesQuery();
  const { data: courseTypes = [], error: typesError } = useCourseTypesQuery();
  const deletePackageMutation = useDeletePackageMutation();

  const selection = useSelection();

  const deleteManyPackagesMutation = useDeleteManyMutation(
    'Package',
    [
      queryKeys.course.package.all,
      queryKeys.course.packageItem.all,
      queryKeys.course.packagePerk.all
    ],
    API_REGISTRY.ACADEMIC.DELETE_MANY_PACKAGES
  );

  const selectedType = useMemo(() => {
    return courseTypes.find(t => t.segment_id === segmentFilter);
  }, [courseTypes, segmentFilter]);

  const isAcademicFilterActive = useMemo(() => {
    if (!segmentFilter) return false;
    return selectedType 
      ? (selectedType.entity_label === 'Subject' || selectedType.segment_name?.toLowerCase().includes('academic'))
      : false;
  }, [selectedType, segmentFilter]);

  // Filter Logic - Packages
  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.package_id.toLowerCase().includes(searchQuery.toLowerCase());

      const isAcademic = !!(p.board || p.target_class);
      const matchesSegment = !segmentFilter ||
        (isAcademicFilterActive && isAcademic) ||
        (!isAcademicFilterActive && !isAcademic);

      const matchesBoard = !boardFilter || p.board === boardFilter;
      const matchesClass = !classFilter || String(p.target_class) === classFilter;

      const matchesLanguage = !languageFilter ||
        (languageFilter === 'Hindi' && p.name.includes('Hindi')) ||
        (languageFilter === 'English' && (p.name.includes('English') || p.name.includes('CBSE')));

      return matchesSearch && matchesSegment && matchesBoard && matchesClass && matchesLanguage;
    });
  }, [packages, searchQuery, segmentFilter, isAcademicFilterActive, boardFilter, classFilter, languageFilter]);

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

  /**
   * Triggers the display of the confirmation modal for single or bulk package deletions.
   * 
   * @function handleOpenDelete
   * @param {string|Array<string>} id - The target package ID or array of package IDs for bulk operations.
   * @param {string} name - The display name of the package or bulk description.
   * @param {string} [type='package'] - The target action signature ('package' | 'bulk_package').
   * @returns {void}
   */
  const handleOpenDelete = (id, name, type = 'package') => {
    setDeleteModal({ isOpen: true, id, name, type, status: 'idle', resultMessage: null });
  };

  /**
   * Resets the delete confirmation modal variables, closing the popup drawer.
   * 
   * @function handleCloseDelete
   * @returns {void}
   */
  const handleCloseDelete = () => {
    setDeleteModal({ isOpen: false, id: null, name: '', type: 'package', status: 'idle', resultMessage: null });
  };

  return {
    viewMode,
    setViewMode,
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
    deleteModal,
    setDeleteModal,
    handleOpenDelete,
    handleCloseDelete,
    isLoading: isLoadingPackages,
    isFetching: isFetchingPackages,
    error: packagesError || typesError,
    filteredPackages,
    segmentOptions,
    isAcademicFilterActive,
    selection,
    deletePackageMutation,
    deleteManyPackagesMutation,
    queryClient
  };
};
