import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCourseTypesQuery } from './useCourseQueries';
import { usePackagesQuery, useDeletePackageMutation } from './usePackageQueries';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import useSelection from '../../../hooks/useSelection';
import useDeleteManyMutation from '../../../hooks/useDeleteManyMutation';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { usePackageFilter } from './usePackageFilter';

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
 * @returns {string} return.statusFilter - Selected package status filter.
 * @returns {Function} return.setStatusFilter - State updater for statusFilter.
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

  const {
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
  } = usePackageFilter(packages, courseTypes);

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
    statusFilter,
    setStatusFilter,
    deleteModal,
    setDeleteModal,
    handleOpenDelete,
    handleCloseDelete,
    isLoading: isLoadingPackages,
    isFetching: isFetchingPackages,
    error: packagesError || typesError,
    filteredPackages,
    segmentOptions,
    boardOptions,
    classOptions,
    languageOptions,
    statusOptions,
    isAcademicFilterActive,
    resetFilters,
    selection,
    deletePackageMutation,
    deleteManyPackagesMutation,
    queryClient
  };
};
