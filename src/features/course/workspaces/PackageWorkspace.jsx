import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePackageWorkspaceState } from '../hooks/usePackageWorkspaceState';
import { createPackageColumns } from '../../../pages/admin/schemas/packageSchema';

// UI Components
import ButtonGroupFilter from '../../../components/ui/filters/ButtonGroupFilter';
import SelectGroupFilter from '../../../components/ui/filters/SelectGroupFilter';
import CourseFilters from '../components/CourseFilters';
import PackageCard from '../components/PackageCard';
import DataTable from '../../../components/ui/DataTable';
import SelectionActionBar from '../../../components/ui/v2/SelectionActionBar';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import useSelectableTable from '../../../hooks/useSelectableTable';
import DeleteDependencyModal from '../../../components/ui/DeleteDependencyModal';
import { useState } from 'react';

/**
 * PackageWorkspace - Decoupled sub-workspace component for curriculum packages management.
 * Renders filters, package listings (either in GridCard layout or DataTable layout), 
 * select item tracking, and handles package deletion / bulk deletion modal confirmations.
 *
 * @component
 * @category Components
 * @returns {React.ReactElement} The rendered Package management workspace sheet.
 */
const PackageWorkspace = () => {
  const {
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
    isLoading,
    error,
    filteredPackages,
    segmentOptions,
    isAcademicFilterActive,
    selection,
    deletePackageMutation,
    deleteManyPackagesMutation,
    queryClient
  } = usePackageWorkspaceState();

  const [dependencyModal, setDependencyModal] = useState({ isOpen: false, errorPayload: null, parentId: null, parentName: '' });

  const {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected
  } = selection;

  const renderGridSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-1/3"></div>
            <div className="size-4 rounded bg-slate-200 dark:bg-slate-700/50"></div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-700/50 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700/50 rounded w-1/2"></div>
          </div>
          <div className="h-10 bg-slate-100 dark:bg-[#0d1622] rounded-xl w-full"></div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-1/4"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700/50 rounded-full w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const languageOptions = [
    { label: 'ALL', value: '' },
    { label: 'HINDI', value: 'Hindi' },
    { label: 'ENGLISH', value: 'English' }
  ];

  const boardOptions = [
    { label: 'ALL', value: '' },
    { label: 'CBSE', value: 'CBSE' },
    { label: 'RBSE', value: 'RBSE' },
    { label: 'ICSE', value: 'ICSE' },
    { label: 'IB', value: 'IB' }
  ];

  const classOptions = [...Array(12)].map((_, i) => ({
    label: `Class ${i + 1}`,
    value: String(i + 1)
  }));

  const basePackageColumns = useMemo(() => {
    return createPackageColumns({
      onDelete: (id, name) => handleOpenDelete(id, name, 'package')
    });
  }, [handleOpenDelete]);

  const packageColumns = useSelectableTable({
    columns: basePackageColumns,
    data: filteredPackages,
    idKey: 'package_id',
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
    isSomeSelected
  });

  const deleteMessage = useMemo(() => {
    if (deleteModal.type === 'bulk_package') {
      return `Are you sure you want to delete ${deleteModal.name}? This will cascadingly delete associated perks and course links. This action is permanently blocked if active student enrollments exist.`;
    }
    return `Are you sure you want to delete "${deleteModal.name}"? This will cascadingly delete perks and course links. This action is blocked if students are enrolled.`;
  }, [deleteModal.type, deleteModal.name]);

  const deleteTitle = useMemo(() => {
    return deleteModal.type === 'bulk_package' ? 'Delete Multiple Packages' : 'Delete Package';
  }, [deleteModal.type]);

  const isDeleteProcessing = useMemo(() => {
    return deleteModal.type === 'bulk_package'
      ? deleteManyPackagesMutation.isPending
      : deletePackageMutation.isPending;
  }, [deleteModal.type, deleteManyPackagesMutation.isPending, deletePackageMutation.isPending]);

  /**
   * Dispatches the API request to delete single or bulk package bundles
   * and associated sub-components based on active modal details.
   * 
   * @function handleConfirmDelete
   * @returns {void}
   */
  const executePhysicalDelete = (idsToDelete) => {
    setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    deleteManyPackagesMutation.mutate({ ids: idsToDelete, dryRun: false }, {
      onSuccess: (res) => {
        if (res.success) {
          const deleted = res.data?.manifest?.deleted || idsToDelete;
          setDeleteModal(prev => ({
            ...prev,
            status: 'success',
            resultMessage: `Successfully deleted ${deleted.length} packages.`
          }));
          if (deleted.length > 0) {
            setSelectedIds(prev => prev.filter(id => !deleted.includes(id)));
          }
        } else {
          setDeleteModal(prev => ({
            ...prev,
            status: 'error',
            resultMessage: res.message || 'Failed to delete packages.'
          }));
        }
      },
      onError: (err) => {
        setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'An unexpected error occurred.'
        }));
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.id) return;
    setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    const ids = Array.isArray(deleteModal.id) ? deleteModal.id : [deleteModal.id];

    deleteManyPackagesMutation.mutate({ ids, dryRun: true }, {
      onSuccess: (res) => {
        if (res.success) {
          const manifest = res.data?.manifest || {};
          const failed = manifest.failed || {};
          const failedCount = Object.keys(failed).length;

          if (failedCount > 0) {
            setDeleteModal({ isOpen: false, id: null, name: '', type: 'package', status: 'idle', resultMessage: null });
            setDependencyModal({
              isOpen: true,
              errorPayload: manifest,
              parentId: ids.join(', '),
              parentName: deleteModal.type === 'bulk_package' ? `${ids.length} selected packages` : deleteModal.name
            });
          } else {
            executePhysicalDelete(ids);
          }
        } else {
          setDeleteModal(prev => ({
            ...prev,
            status: 'error',
            resultMessage: res.message || 'Verification inspection failed.'
          }));
        }
      },
      onError: (err) => {
        setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'Validation check failed.'
        }));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Workspace Filters (Segment selectors) */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <ButtonGroupFilter
              options={segmentOptions}
              value={segmentFilter}
              variant="secondary"
              onChange={(val) => {
                setSegmentFilter(val);
                if (!isAcademicFilterActive) {
                  setBoardFilter('');
                  setClassFilter('');
                  setLanguageFilter('');
                }
              }}
            />
          </div>

          {isAcademicFilterActive && (
            <div className="flex flex-wrap items-center gap-4 animate-in zoom-in duration-300">
              <ButtonGroupFilter
                label="Medium"
                options={languageOptions}
                value={languageFilter}
                size="sm"
                variant="secondary"
                onChange={setLanguageFilter}
              />

              <ButtonGroupFilter
                label="Board"
                options={boardOptions}
                value={boardFilter}
                size="sm"
                onChange={setBoardFilter}
              />

              <SelectGroupFilter
                label="Class"
                options={classOptions}
                value={classFilter}
                onChange={setClassFilter}
                defaultLabel="All Classes"
              />
            </div>
          )}
        </div>
      </div>

      {/* Package Search & Mode controls */}
      <CourseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        segmentFilter={segmentFilter}
        onSegmentChange={setSegmentFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        availableSegments={[]}
        showSegmentFilter={false}
      />

      {/* Main Representation Layout */}
      {isLoading ? (
        renderGridSkeletons()
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredPackages.map(pkg => (
            <PackageCard
              key={pkg.package_id}
              pkg={pkg}
              isSelected={selectedIds.includes(pkg.package_id)}
              onToggleSelect={() => toggleSelect(pkg.package_id)}
              isSelectionModeActive={selectedIds.length > 0}
            />
          ))}

          {/* Add New Course Package Placeholder Card */}
          {selectedIds.length === 0 && (
            <Link
              to="/admin/packages/add"
              className="border-2 border-dashed border-border-light dark:border-slate-800/80 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:border-primary/50 hover:bg-primary/[0.01] transition-all cursor-pointer min-h-[180px] gap-4 group"
            >
              <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-secondary dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all border border-border-light dark:border-slate-800">
                <span className="material-symbols-outlined text-2xl font-bold leading-none">add</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-base font-black text-text-main dark:text-white group-hover:text-primary transition-colors">
                  Add New Course Package
                </p>
                <p className="text-xs text-text-secondary font-medium px-4">
                  Bundle courses and define pricing for specific student cohorts.
                </p>
              </div>
            </Link>
          )}

          {filteredPackages.length === 0 && selectedIds.length > 0 && <NoDataFound />}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <DataTable
            data={filteredPackages}
            columns={packageColumns}
            isLoading={false}
          />
        </div>
      )}

      {/* Floating Selection Action Bar for Packages */}
      {selectedIds.length > 0 && (
        <SelectionActionBar
          selectedCount={selectedIds.length}
          itemName="package"
          onClear={clearSelection}
          onDeleteSelected={() => {
            handleOpenDelete(selectedIds, `${selectedIds.length} selected packages`, 'bulk_package');
          }}
          onDeleteAll={() => {
            const allIds = filteredPackages.map(p => p.package_id);
            handleOpenDelete(allIds, `all ${allIds.length} packages matching current filters`, 'bulk_package');
          }}
        />
      )}

      {/* Deletion confirmation modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        status={deleteModal.status}
        resultMessage={deleteModal.resultMessage}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title={deleteTitle}
        message={deleteMessage}
        isProcessing={isDeleteProcessing}
      />

      <DeleteDependencyModal
        isOpen={dependencyModal.isOpen}
        onClose={() => setDependencyModal({ isOpen: false, errorPayload: null, parentId: null, parentName: '' })}
        errorPayload={dependencyModal.errorPayload}
        parentId={dependencyModal.parentId}
        parentName={dependencyModal.parentName}
        parentType="Package"
        onResolve={(blockers, deleteSafe) => {
          if (deleteSafe && dependencyModal.errorPayload?.deleted) {
            executePhysicalDelete(dependencyModal.errorPayload.deleted);
          }
          setDependencyModal({ isOpen: false, errorPayload: null, parentId: null, parentName: '' });
        }}
      />
    </div>
  );
};

const NoDataFound = () => (
  <div className="col-span-full py-20 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl bg-surface-light dark:bg-surface-dark">
    <span className="material-symbols-outlined text-text-secondary/20 text-6xl mb-4">search_off</span>
    <h3 className="text-lg font-bold text-text-main dark:text-white">No items found</h3>
    <p className="text-sm text-text-secondary">Try adjusting your search or filters.</p>
  </div>
);

export default PackageWorkspace;
