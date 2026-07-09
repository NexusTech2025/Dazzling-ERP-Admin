import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileBaseLayout from '../../../components/layout/MobileBaseLayout';
import { TabButton } from '../../../components/ui/v2/Tabs';
import { PackagesMobileView } from './PackagesMobileView';
import Button from '../../../components/ui/v2/Button';
import HorizontalStatMetrics from '../../../components/ui/v2/cards/HorizontalStatMetrics';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import DeleteDependencyModal from '../../../components/ui/DeleteDependencyModal';
import SelectionActionBar from '../../../components/ui/v2/SelectionActionBar';

/**
 * MobilePackageListView: MobileBaseLayout wrapper showing only Packages.
 * 
 * @param {Object} props - Component properties.
 * @param {string} props.activeTab - Currently active tab ('courses' | 'packages').
 * @param {Function} props.setActiveTab - Callback to toggle tabs.
 * @param {Object} props.packageWorkspaceState - State package from usePackageWorkspaceState.
 * @param {Object} props.stats - Aggregated stats numeric properties.
 * @param {Function} props.handleRefreshAllData - Data refetch invalidation handler.
 */
export const MobilePackageListView = ({
  activeTab,
  setActiveTab,
  packageWorkspaceState,
  stats,
  handleRefreshAllData
}) => {
  const navigate = useNavigate();
  const [dependencyModal, setDependencyModal] = useState({ isOpen: false, errorPayload: null, parentId: null, parentName: '' });

  // Package-specific metrics
  const statsItems = useMemo(() => [
    { 
      icon: 'inventory_2', 
      label: 'Packages', 
      value: String(stats.totalPackages), 
      className: '[&_span.material-symbols-outlined]:bg-indigo-500/10 [&_span.material-symbols-outlined]:text-indigo-500 [&_span.material-symbols-outlined]:p-2 [&_span.material-symbols-outlined]:rounded-full' 
    },
    { 
      icon: 'group', 
      label: 'Students', 
      value: String(stats.totalStudents), 
      className: '[&_span.material-symbols-outlined]:bg-cyan-500/10 [&_span.material-symbols-outlined]:text-cyan-500 [&_span.material-symbols-outlined]:p-2 [&_span.material-symbols-outlined]:rounded-full' 
    },
    { 
      icon: 'payments', 
      label: 'Revenue', 
      value: String(stats.totalRevenue), 
      className: '[&_span.material-symbols-outlined]:bg-amber-500/10 [&_span.material-symbols-outlined]:text-amber-500 [&_span.material-symbols-outlined]:p-2 [&_span.material-symbols-outlined]:rounded-full' 
    }
  ], [stats]);

  const executePackagePhysicalDelete = (idsToDelete) => {
    packageWorkspaceState.setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    packageWorkspaceState.deleteManyPackagesMutation.mutate({ ids: idsToDelete, dryRun: false }, {
      onSuccess: (res) => {
        if (res.success) {
          const deleted = res.data?.manifest?.deleted || idsToDelete;
          packageWorkspaceState.setDeleteModal(prev => ({
            ...prev,
            status: 'success',
            resultMessage: `Successfully deleted ${deleted.length} packages.`
          }));
          if (deleted.length > 0) {
            packageWorkspaceState.selection.setSelectedIds(prev => prev.filter(id => !deleted.includes(id)));
          }
        } else {
          packageWorkspaceState.setDeleteModal(prev => ({
            ...prev,
            status: 'error',
            resultMessage: res.message || 'Failed to delete packages.'
          }));
        }
      },
      onError: (err) => {
        packageWorkspaceState.setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'An unexpected error occurred.'
        }));
      }
    });
  };

  const handleConfirmPackageDelete = () => {
    const deleteModal = packageWorkspaceState.deleteModal;
    if (!deleteModal.id) return;
    packageWorkspaceState.setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    const ids = Array.isArray(deleteModal.id) ? deleteModal.id : [deleteModal.id];

    packageWorkspaceState.deleteManyPackagesMutation.mutate({ ids, dryRun: true }, {
      onSuccess: (res) => {
        if (res.success) {
          const manifest = res.data?.manifest || {};
          const failed = manifest.failed || {};
          const failedCount = Object.keys(failed).length;

          if (failedCount > 0) {
            packageWorkspaceState.handleCloseDelete();
            setDependencyModal({
              isOpen: true,
              errorPayload: manifest,
              parentId: ids.join(', '),
              parentName: deleteModal.type === 'bulk_package' ? `${ids.length} selected packages` : deleteModal.name
            });
          } else {
            executePackagePhysicalDelete(ids);
          }
        } else {
          packageWorkspaceState.setDeleteModal(prev => ({
            ...prev,
            status: 'error',
            resultMessage: res.message || 'Verification inspection failed.'
          }));
        }
      },
      onError: (err) => {
        packageWorkspaceState.setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'Validation check failed.'
        }));
      }
    });
  };

  const currentSelectionCount = packageWorkspaceState.selection.selectedIds.length;

  return (
    <MobileBaseLayout>
      {/* Header Slot */}
      <MobileBaseLayout.Header
        title="Course Packages"
        renderLeft={
          <Button
            variant="text"
            size="xs"
            onClick={() => navigate('/admin')}
            className="!p-1.5 text-text-secondary hover:text-text-main dark:hover:text-white"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Button>
        }
        renderRight={
          <Button
            variant="contained"
            size="sm"
            onClick={() => navigate('/admin/packages/add')}
            startIcon="add"
          >
            Package
          </Button>
        }
      />

      {/* Tabs Slot */}
      <MobileBaseLayout.TabsSlot>
        <div className="flex gap-4 py-2">
          <TabButton
            active={activeTab === 'courses'}
            onClick={() => setActiveTab('courses')}
            icon="school"
          >
            Courses
          </TabButton>
          <TabButton
            active={activeTab === 'packages'}
            onClick={() => setActiveTab('packages')}
            icon="inventory_2"
          >
            Packages
          </TabButton>
        </div>
      </MobileBaseLayout.TabsSlot>

      {/* Stats Slot */}
      <MobileBaseLayout.StatsSlot>
        <HorizontalStatMetrics
          items={statsItems}
          allowWrap={false}
          className="py-1"
        />
      </MobileBaseLayout.StatsSlot>

      {/* Filter Slot */}
      <MobileBaseLayout.FilterSlot>
        <div className="flex flex-col gap-3 w-full">
          {/* Search box */}
          <div className="flex gap-2.5 items-center w-full">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
              <input
                type="text"
                value={packageWorkspaceState.searchQuery}
                onChange={(e) => packageWorkspaceState.setSearchQuery(e.target.value)}
                placeholder="Search packages..."
                className="w-full bg-slate-50 dark:bg-black/20 border border-border-light dark:border-white/8 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-text-main dark:text-white outline-none focus:border-primary focus:bg-white dark:focus:bg-black/40 transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <Button
              variant="outlined"
              size="sm"
              onClick={handleRefreshAllData}
              className="!h-11 !w-11 !p-0 !min-h-0 flex-shrink-0 !rounded-2xl"
              title="Refresh lists"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">refresh</span>
            </Button>
          </div>

          {/* Filter dropdowns */}
          <div className="flex overflow-x-auto gap-2 pb-1.5 scrollbar-hide -mx-4 px-4 w-[calc(100%+2rem)]">
            <div className="relative shrink-0">
              <select
                value={packageWorkspaceState.segmentFilter}
                onChange={(e) => packageWorkspaceState.setSegmentFilter(e.target.value)}
                className="appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
              >
                {packageWorkspaceState.segmentOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-text-secondary">keyboard_arrow_down</span>
            </div>

            {packageWorkspaceState.isAcademicFilterActive && (
              <div className="relative shrink-0">
                <select
                  value={packageWorkspaceState.boardFilter}
                  onChange={(e) => packageWorkspaceState.setBoardFilter(e.target.value)}
                  className="appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
                >
                  <option value="">Board: All</option>
                  <option value="CBSE">CBSE</option>
                  <option value="RBSE">RBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="IB">IB</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-text-secondary">keyboard_arrow_down</span>
              </div>
            )}

            {packageWorkspaceState.isAcademicFilterActive && (
              <div className="relative shrink-0">
                <select
                  value={packageWorkspaceState.classFilter}
                  onChange={(e) => packageWorkspaceState.setClassFilter(e.target.value)}
                  className="appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
                >
                  <option value="">Class: All</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-text-secondary">keyboard_arrow_down</span>
              </div>
            )}
          </div>
        </div>
      </MobileBaseLayout.FilterSlot>

      {/* List Slot */}
      <MobileBaseLayout.ListSlot
        isEmpty={packageWorkspaceState.filteredPackages.length === 0}
        renderEmptyState={
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark">
            <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">search_off</span>
            <p className="text-sm font-semibold text-text-main dark:text-white">No packages match filters</p>
          </div>
        }
      >
        <div className="flex flex-col gap-3.5 pb-20">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary px-0.5">
            <span>Showing {packageWorkspaceState.filteredPackages.length} records</span>
          </div>

          <PackagesMobileView
            packages={packageWorkspaceState.filteredPackages}
            selection={packageWorkspaceState.selection}
            onDelete={packageWorkspaceState.handleOpenDelete}
          />
        </div>
      </MobileBaseLayout.ListSlot>

      {/* Action Bar Slot */}
      {currentSelectionCount > 0 && (
        <MobileBaseLayout.ActionBarSlot>
          <SelectionActionBar
            selectedCount={currentSelectionCount}
            itemName="package"
            onClear={packageWorkspaceState.selection.clearSelection}
            onDeleteSelected={() => {
              packageWorkspaceState.handleOpenDelete(
                packageWorkspaceState.selection.selectedIds,
                `${currentSelectionCount} selected packages`,
                'bulk_package'
              );
            }}
            onDeleteAll={() => {
              const allIds = packageWorkspaceState.filteredPackages.map(p => p.package_id);
              packageWorkspaceState.handleOpenDelete(allIds, `all ${allIds.length} packages matching filters`, 'bulk_package');
            }}
          />
        </MobileBaseLayout.ActionBarSlot>
      )}

      {/* Confirmation Modals */}
      {packageWorkspaceState.deleteModal.isOpen && (
        <ConfirmModal
          isOpen={packageWorkspaceState.deleteModal.isOpen}
          status={packageWorkspaceState.deleteModal.status}
          resultMessage={packageWorkspaceState.deleteModal.resultMessage}
          onClose={packageWorkspaceState.handleCloseDelete}
          onConfirm={handleConfirmPackageDelete}
          title={packageWorkspaceState.deleteModal.type === 'bulk_package' ? 'Delete Multiple Packages' : 'Delete Package'}
          message={
            packageWorkspaceState.deleteModal.type === 'bulk_package'
              ? `Are you sure you want to delete ${packageWorkspaceState.deleteModal.name}? This will cascadingly delete associated perks and course links.`
              : `Are you sure you want to delete "${packageWorkspaceState.deleteModal.name}"? This will cascadingly delete associated perks and course links.`
          }
          isProcessing={
            packageWorkspaceState.deleteModal.type === 'bulk_package'
              ? packageWorkspaceState.deleteManyPackagesMutation.isPending
              : packageWorkspaceState.deletePackageMutation.isPending
          }
        />
      )}

      {dependencyModal.isOpen && (
        <DeleteDependencyModal
          isOpen={dependencyModal.isOpen}
          onClose={() => setDependencyModal({ isOpen: false, errorPayload: null, parentId: null, parentName: '' })}
          errorPayload={dependencyModal.errorPayload}
          parentId={dependencyModal.parentId}
          parentName={dependencyModal.parentName}
          parentType="Package"
          onResolve={(blockers, deleteSafe) => {
            if (deleteSafe && dependencyModal.errorPayload?.deleted) {
              executePackagePhysicalDelete(dependencyModal.errorPayload.deleted);
            }
            setDependencyModal({ isOpen: false, errorPayload: null, parentId: null, parentName: '' });
          }}
        />
      )}
    </MobileBaseLayout>
  );
};

export default MobilePackageListView;
