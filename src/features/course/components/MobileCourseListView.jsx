import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileBaseLayout from '../../../components/layout/MobileBaseLayout';
import { TabButton } from '../../../components/ui/v2/Tabs';
import { CoursesMobileView } from './CoursesMobileView';
import { PackagesMobileView } from './PackagesMobileView';
import Button from '../../../components/ui/v2/Button';
import HorizontalStatMetrics from '../../../components/ui/v2/cards/HorizontalStatMetrics';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import DeleteDependencyModal from '../../../components/ui/DeleteDependencyModal';
import SelectionActionBar from '../../../components/ui/v2/SelectionActionBar';

/**
 * MobileCourseListView: Consolidates courses and packages listings in a mobile-optimized view
 * using the compound slots of MobileBaseLayout.
 * 
 * @param {Object} props - React props.
 * @param {string} props.activeTab - Currently active tab ('courses' | 'packages').
 * @param {Function} props.setActiveTab - Callback to toggle between tabs.
 * @param {Object} props.courseWorkspaceState - State package returned from useCourseWorkspaceState.
 * @param {Object} props.packageWorkspaceState - State package returned from usePackageWorkspaceState.
 * @param {Function} props.handleRefreshAllData - Trigger callback to queryClient invalidate target queries.
 * @param {Object} props.stats - Aggregated stats numeric properties.
 */
export const MobileCourseListView = ({
  activeTab,
  setActiveTab,
  courseWorkspaceState,
  packageWorkspaceState,
  handleRefreshAllData,
  stats
}) => {
  const navigate = useNavigate();

  const [courseDependencyModal, setCourseDependencyModal] = useState({ isOpen: false, errorPayload: null, parentId: null, parentName: '' });
  const [packageDependencyModal, setPackageDependencyModal] = useState({ isOpen: false, errorPayload: null, parentId: null, parentName: '' });

  const activeState = activeTab === 'courses' ? courseWorkspaceState : packageWorkspaceState;

  // Horizontal stats data formatted for HorizontalStatMetrics with custom pop icon classes
  const statsItems = useMemo(() => [
    { 
      icon: 'school', 
      label: 'Courses', 
      value: String(stats.totalCourses), 
      className: '[&_span.material-symbols-outlined]:bg-blue-500/10 [&_span.material-symbols-outlined]:text-blue-500 [&_span.material-symbols-outlined]:p-2 [&_span.material-symbols-outlined]:rounded-full' 
    },
    { 
      icon: 'check_circle', 
      label: 'Active', 
      value: String(stats.activeCourses), 
      className: '[&_span.material-symbols-outlined]:bg-emerald-500/10 [&_span.material-symbols-outlined]:text-emerald-500 [&_span.material-symbols-outlined]:p-2 [&_span.material-symbols-outlined]:rounded-full' 
    },
    { 
      icon: 'cancel', 
      label: 'Inactive', 
      value: String(stats.inactiveCourses), 
      className: '[&_span.material-symbols-outlined]:bg-rose-500/10 [&_span.material-symbols-outlined]:text-rose-500 [&_span.material-symbols-outlined]:p-2 [&_span.material-symbols-outlined]:rounded-full' 
    },
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

  // Modals & Action handlers for Courses
  const executeCoursePhysicalDelete = (idsToDelete) => {
    courseWorkspaceState.setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    courseWorkspaceState.deleteManyCoursesMutation.mutate({ ids: idsToDelete, dryRun: false }, {
      onSuccess: (res) => {
        if (res.success) {
          const deleted = res.data?.manifest?.deleted || idsToDelete;
          courseWorkspaceState.setDeleteModal(prev => ({
            ...prev,
            status: 'success',
            resultMessage: `Successfully archived ${deleted.length} courses.`
          }));
          if (deleted.length > 0) {
            courseWorkspaceState.selection.setSelectedIds(prev => prev.filter(id => !deleted.includes(id)));
          }
        } else {
          courseWorkspaceState.setDeleteModal(prev => ({
            ...prev,
            status: 'error',
            resultMessage: res.message || 'Failed to archive courses.'
          }));
        }
      },
      onError: (err) => {
        courseWorkspaceState.setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'An unexpected error occurred.'
        }));
      }
    });
  };

  const handleConfirmCourseDelete = () => {
    const deleteModal = courseWorkspaceState.deleteModal;
    if (!deleteModal.id) return;
    courseWorkspaceState.setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    const ids = Array.isArray(deleteModal.id) ? deleteModal.id : [deleteModal.id];

    courseWorkspaceState.deleteManyCoursesMutation.mutate({ ids, dryRun: true }, {
      onSuccess: (res) => {
        if (res.success) {
          const manifest = res.data?.manifest || {};
          const failed = manifest.failed || {};
          const failedCount = Object.keys(failed).length;

          if (failedCount > 0) {
            courseWorkspaceState.handleCloseDelete();
            setCourseDependencyModal({
              isOpen: true,
              errorPayload: manifest,
              parentId: ids.join(', '),
              parentName: deleteModal.type === 'bulk_course' ? `${ids.length} selected courses` : deleteModal.name
            });
          } else {
            executeCoursePhysicalDelete(ids);
          }
        } else {
          courseWorkspaceState.setDeleteModal(prev => ({
            ...prev,
            status: 'error',
            resultMessage: res.message || 'Verification inspection failed.'
          }));
        }
      },
      onError: (err) => {
        courseWorkspaceState.setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'Validation check failed.'
        }));
      }
    });
  };

  // Modals & Action handlers for Packages
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
            setPackageDependencyModal({
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

  const currentSelectionCount = activeState.selection.selectedIds.length;

  return (
    <MobileBaseLayout>
      {/* Slot 1: Sticky Navigation Header */}
      <MobileBaseLayout.Header
        title={activeTab === 'courses' ? 'Curriculum Library' : 'Course Packages'}
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
            onClick={() => navigate(activeTab === 'courses' ? '/admin/courses/add' : '/admin/packages/add')}
            startIcon="add"
          >
            {activeTab === 'courses' ? 'Course' : 'Package'}
          </Button>
        }
      />

      {/* Slot 2: Tabs Selection Slot */}
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

      {/* Slot 3: Horizontal Stats bar */}
      <MobileBaseLayout.StatsSlot>
        <HorizontalStatMetrics
          items={statsItems}
          allowWrap={false}
          className="py-1"
        />
      </MobileBaseLayout.StatsSlot>

      {/* Slot 4: Directory search and scrolling filter selectors */}
      <MobileBaseLayout.FilterSlot>
        <div className="flex flex-col gap-3 w-full">
          {/* Search box */}
          <div className="flex gap-2.5 items-center w-full">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
              <input
                type="text"
                value={activeState.searchQuery}
                onChange={(e) => activeState.setSearchQuery(e.target.value)}
                placeholder={activeTab === 'courses' ? "Search courses, codes..." : "Search packages..."}
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

          {/* Scrolling filter dropdowns */}
          <div className="flex overflow-x-auto gap-2 pb-1.5 scrollbar-hide -mx-4 px-4 w-[calc(100%+2rem)]">
            {/* Segment / Category Dropdown */}
            <div className="relative shrink-0">
              <select
                value={activeState.segmentFilter}
                onChange={(e) => activeState.setSegmentFilter(e.target.value)}
                className="appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
              >
                {activeState.segmentOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-text-secondary">keyboard_arrow_down</span>
            </div>

            {/* Language / Medium (Only for Courses) */}
            {activeTab === 'courses' && (
              <div className="relative shrink-0">
                <select
                  value={activeState.languageFilter}
                  onChange={(e) => activeState.setLanguageFilter(e.target.value)}
                  className="appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
                >
                  <option value="">Language: All</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-text-secondary">keyboard_arrow_down</span>
              </div>
            )}

            {/* Academic Board Constraint */}
            {activeState.isAcademicFilterActive && (
              <div className="relative shrink-0">
                <select
                  value={activeState.boardFilter}
                  onChange={(e) => activeState.setBoardFilter(e.target.value)}
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

            {/* Academic Class Level Selector */}
            {activeState.isAcademicFilterActive && (
              <div className="relative shrink-0">
                <select
                  value={activeState.classFilter}
                  onChange={(e) => activeState.setClassFilter(e.target.value)}
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

      {/* Slot 5: Scrolling card directory layout list */}
      <MobileBaseLayout.ListSlot
        isEmpty={activeTab === 'courses' ? courseWorkspaceState.filteredCourses.length === 0 : packageWorkspaceState.filteredPackages.length === 0}
        renderEmptyState={
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark">
            <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">search_off</span>
            <p className="text-sm font-semibold text-text-main dark:text-white">No items match filters</p>
          </div>
        }
      >
        <div className="flex flex-col gap-3.5 pb-20">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary px-0.5">
            <span>Showing {activeTab === 'courses' ? courseWorkspaceState.filteredCourses.length : packageWorkspaceState.filteredPackages.length} records</span>
          </div>

          {activeTab === 'courses' ? (
            <CoursesMobileView
              courses={courseWorkspaceState.filteredCourses}
              selection={courseWorkspaceState.selection}
              onDelete={courseWorkspaceState.handleOpenDelete}
            />
          ) : (
            <PackagesMobileView
              packages={packageWorkspaceState.filteredPackages}
              selection={packageWorkspaceState.selection}
              onDelete={packageWorkspaceState.handleOpenDelete}
            />
          )}
        </div>
      </MobileBaseLayout.ListSlot>

      {/* Selection action overlay bar */}
      {currentSelectionCount > 0 && (
        <MobileBaseLayout.ActionBarSlot>
          <SelectionActionBar
            selectedCount={currentSelectionCount}
            itemName={activeTab === 'courses' ? 'course' : 'package'}
            onClear={activeState.selection.clearSelection}
            onDeleteSelected={() => {
              activeState.handleOpenDelete(
                activeState.selection.selectedIds,
                `${currentSelectionCount} selected items`,
                activeTab === 'courses' ? 'bulk_course' : 'bulk_package'
              );
            }}
            onDeleteAll={() => {
              const allIds = activeTab === 'courses'
                ? courseWorkspaceState.filteredCourses.map(c => c.course_id)
                : packageWorkspaceState.filteredPackages.map(p => p.package_id);
              activeState.handleOpenDelete(
                allIds,
                `all ${allIds.length} items matching current filters`,
                activeTab === 'courses' ? 'bulk_course' : 'bulk_package'
              );
            }}
          />
        </MobileBaseLayout.ActionBarSlot>
      )}

      {/* Course Modals */}
      {courseWorkspaceState.deleteModal.isOpen && (
        <ConfirmModal
          isOpen={courseWorkspaceState.deleteModal.isOpen}
          status={courseWorkspaceState.deleteModal.status}
          resultMessage={courseWorkspaceState.deleteModal.resultMessage}
          onClose={courseWorkspaceState.handleCloseDelete}
          onConfirm={handleConfirmCourseDelete}
          title={courseWorkspaceState.deleteModal.type === 'bulk_course' ? 'Archive Multiple Courses' : 'Archive Course'}
          message={
            courseWorkspaceState.deleteModal.type === 'bulk_course'
              ? `Are you sure you want to archive ${courseWorkspaceState.deleteModal.name}? They will no longer be available for new enrollments.`
              : `Are you sure you want to archive "${courseWorkspaceState.deleteModal.name}"? It will no longer be available for new enrollments.`
          }
          isProcessing={
            courseWorkspaceState.deleteModal.type === 'bulk_course'
              ? courseWorkspaceState.deleteManyCoursesMutation.isPending
              : courseWorkspaceState.deleteMutation.isPending
          }
        />
      )}

      {courseDependencyModal.isOpen && (
        <DeleteDependencyModal
          isOpen={courseDependencyModal.isOpen}
          onClose={() => setCourseDependencyModal({ isOpen: false, errorPayload: null, parentId: null, parentName: '' })}
          errorPayload={courseDependencyModal.errorPayload}
          parentId={courseDependencyModal.parentId}
          parentName={courseDependencyModal.parentName}
          parentType="Course"
          onResolve={(blockers, deleteSafe) => {
            if (deleteSafe && courseDependencyModal.errorPayload?.deleted) {
              executeCoursePhysicalDelete(courseDependencyModal.errorPayload.deleted);
            }
            setCourseDependencyModal({ isOpen: false, errorPayload: null, parentId: null, parentName: '' });
          }}
        />
      )}

      {/* Package Modals */}
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

      {packageDependencyModal.isOpen && (
        <DeleteDependencyModal
          isOpen={packageDependencyModal.isOpen}
          onClose={() => setPackageDependencyModal({ isOpen: false, errorPayload: null, parentId: null, parentName: '' })}
          errorPayload={packageDependencyModal.errorPayload}
          parentId={packageDependencyModal.parentId}
          parentName={packageDependencyModal.parentName}
          parentType="Package"
          onResolve={(blockers, deleteSafe) => {
            if (deleteSafe && packageDependencyModal.errorPayload?.deleted) {
              executePackagePhysicalDelete(packageDependencyModal.errorPayload.deleted);
            }
            setPackageDependencyModal({ isOpen: false, errorPayload: null, parentId: null, parentName: '' });
          }}
        />
      )}
    </MobileBaseLayout>
  );
};

export default MobileCourseListView;
