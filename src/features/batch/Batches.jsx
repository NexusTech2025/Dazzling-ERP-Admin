import React, { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Core UI Utilities & Layout Layer
import MainLayout from '../../components/layout/MainLayout';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import DataTable from '../../components/ui/DataTable';
import ConfirmModal from '../../components/ui/ConfirmModal';
import SelectionActionBar from '../../components/ui/v2/SelectionActionBar';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import { SearchInput, SelectFilter } from '../../components/ui/filters';

// Domain Feature Additions
import { useBatchesQuery, useDeleteBatchMutation } from './hooks/useBatchQueries';
import { useCoursesQuery } from '../course/hooks/useCourseQueries';
import { useTeachersQuery } from '../teacher/hooks/useTeacherQueries';
import MobileBatchListView from './components/MobileBatchListView';

// Shared Utilities & System Architectural Hooks
import { queryKeys } from '../../lib/react-query/queryKeys';
import { useFilteredBatches } from '../../hooks/useFilteredBatches';
import useIsMobile from '../../hooks/useIsMobile';
import useSelection from '../../hooks/useSelection';
import useDeleteManyMutation from '../../hooks/useDeleteManyMutation';
import useSelectableTable from '../../hooks/useSelectableTable';
import { createBatchColumns } from '../../pages/admin/schemas/batchSchema';
// ==========================================
// MEMOIZED MEMORY FILTER COMPONENTS
// ==========================================
const FilterPanel = React.memo(({ searchQuery, setSearchQuery, courseFilter, setCourseFilter, statusFilter, setStatusFilter, availableCourses, availableStatuses }) => (
  <>
    <div className="md:col-span-6 lg:col-span-4 relative">
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search batches, courses..."
      />
    </div>
    <div className="md:col-span-6 lg:col-span-8 flex flex-wrap gap-3 items-center">
      <SelectFilter
        value={courseFilter}
        onChange={setCourseFilter}
        options={availableCourses}
        defaultLabel="Course: All"
      />
      <SelectFilter
        value={statusFilter}
        onChange={setStatusFilter}
        options={availableStatuses}
        defaultLabel="Status: All"
      />
    </div>
  </>
));

FilterPanel.displayName = 'FilterPanel';

// ==========================================
// CORE MASTER COMPONENT REGISTER INTERFACE
// ==========================================
const Batches = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile(768); // Enforce JS-Conditional Viewport branching

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: '',
    type: 'batch',
    status: 'idle',
    resultMessage: null
  });

  const [isSticky, setIsSticky] = useState(false);

  const handleBodyScroll = useCallback((e) => {
    setIsSticky(e.currentTarget.scrollTop > 80);
  }, []);

  // Fetch Boundary Layer
  const { data: batches = [], isLoading, isFetching, error } = useBatchesQuery();
  const { data: courses = [] } = useCoursesQuery();
  const { data: teachers = [] } = useTeachersQuery();

  // Relational Map Consolidation Node
  const resolvedBatches = useMemo(() => {
    return batches.map(batch => {
      const course = courses.find(c => c.course_id === batch.course_id || c.id === batch.course_id);
      const teacher = teachers.find(t => t.teacher_id === batch.teacher_id || t.id === batch.teacher_id);
      return {
        ...batch,
        course_name: course?.name || batch.course_name,
        teacher_name: teacher?.teacher_name || teacher?.full_name || batch.instructor_name
      };
    });
  }, [batches, courses, teachers]);

  const deleteMutation = useDeleteBatchMutation();
  const deleteManyBatchesMutation = useDeleteManyMutation('Batch', [queryKeys.batch.all]);

  const {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected
  } = useSelection();

  const {
    searchQuery,
    setSearchQuery,
    courseFilter,
    setCourseFilter,
    statusFilter,
    setStatusFilter,
    filteredBatches,
    availableCourses,
    availableStatuses
  } = useFilteredBatches(resolvedBatches);

  // Stable Action Callbacks Configuration
  const handlers = useMemo(() => ({
    onView: (batch) => navigate(`/admin/batches/${batch.batch_id}`),
    onEdit: (batch) => navigate(`/admin/batches/edit/${batch.batch_id}`),
    onDelete: (id, name) => setDeleteModal({
      isOpen: true,
      id,
      name,
      type: 'batch',
      status: 'idle',
      resultMessage: null
    }),
    isDeleting: deleteMutation.isPending
  }), [navigate, deleteMutation.isPending]);

  const baseColumns = useMemo(() => createBatchColumns(handlers), [handlers]);

  const columns = useSelectableTable({
    columns: baseColumns,
    data: filteredBatches,
    idKey: 'batch_id',
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
    isSomeSelected
  });

  const handleSingleDelete = useCallback((id) => {
    deleteMutation.mutate({ id }, {
      onSuccess: (response) => {
        setDeleteModal(prev => ({
          ...prev,
          status: response.success ? 'success' : 'error',
          resultMessage: response.success
            ? `Batch "${prev.name}" was successfully deleted.`
            : response.message || `Failed to delete batch "${prev.name}".`
        }));
      },
      onError: (err) => {
        setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'An error occurred while deleting the batch.'
        }));
      }
    });
  }, [deleteMutation]);

  const handleBatchDelete = useCallback((ids) => {
    deleteManyBatchesMutation.mutate({ ids }, {
      onSuccess: (res) => {
        if (res.success) {
          const manifest = res.data?.manifest || {};
          const deleted = manifest.deleted || [];
          const failed = manifest.failed || {};
          const failedCount = Object.keys(failed).length;

          let msg = `Successfully deleted ${deleted.length} batches.`;
          if (failedCount > 0) {
            msg += ` Failed to delete ${failedCount} batches due to active student enrollments.`;
          }

          setDeleteModal(prev => ({
            ...prev,
            status: failedCount > 0 && deleted.length === 0 ? 'error' : 'success',
            resultMessage: msg
          }));

          if (deleted.length > 0) {
            setSelectedIds(prev => prev.filter(id => !deleted.includes(id)));
          }
        } else {
          setDeleteModal(prev => ({
            ...prev,
            status: 'error',
            resultMessage: res.message || 'Failed to delete batches.'
          }));
        }
      },
      onError: (err) => {
        setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'Failed to delete batches due to a server error.'
        }));
      }
    });
  }, [deleteManyBatchesMutation, setSelectedIds]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteModal.id) return;
    setDeleteModal(prev => ({ ...prev, status: 'processing' }));

    if (deleteModal.type === 'bulk_batch') {
      handleBatchDelete(deleteModal.id);
    } else {
      handleSingleDelete(deleteModal.id);
    }
  }, [deleteModal.id, deleteModal.type, handleBatchDelete, handleSingleDelete]);

  const handleCloseModal = useCallback(() => {
    setDeleteModal({ isOpen: false, id: null, name: '', type: 'batch', status: 'idle', resultMessage: null });
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.batch.all });
  }, [queryClient]);

  const renderFilters = useMemo(() => (
    <FilterPanel
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      courseFilter={courseFilter}
      setCourseFilter={setCourseFilter}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      availableCourses={availableCourses}
      availableStatuses={availableStatuses}
    />
  ), [searchQuery, setSearchQuery, courseFilter, setCourseFilter, statusFilter, setStatusFilter, availableCourses, availableStatuses]);

  if (error) return <ErrorState message={error.message} onRetry={handleRefresh} />;

  const crumbs = [{ label: 'Dashboard', path: '/admin' }, { label: 'Batches' }];

  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      header={
        <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${isSticky ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
              <span className="text-sm font-bold text-text-main dark:text-white">Batch Directory</span>
              {isFetching && (
                <div className="ml-3 flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10 animate-pulse">
                  <div className="size-2.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-wider">Updating...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      }
      body={
        <div className="lg:pt-10 pb-6 space-y-6">


          {!isMobile ? (
            /* ==========================================
               DESKTOP ARCHITECTURE FRAMEWORK
               ========================================== */

            <div className="hidden md:block pt-6">
              <Breadcrumbs items={crumbs} className="mb-4" />
              <DataTable
                title="Batch Directory"
                subtitle="Manage class schedules, capacities, and course assignments."
                data={filteredBatches}
                columns={columns}
                filters={renderFilters}
                isLoading={isLoading}
                primaryAction={
                  <Link to="/admin/batches/add" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Create Batch
                  </Link>
                }
                secondaryAction={<RefreshButton isFetching={isFetching} onRefresh={handleRefresh} />}
              />
            </div>
          ) : (
            /* ==========================================
               MOBILE CARD ARCHITECTURE FRAMEWORK
               ========================================== */
            <MobileBatchListView
              batches={batches}
              filteredBatches={filteredBatches}
              isLoading={isLoading}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              courseFilter={courseFilter}
              setCourseFilter={setCourseFilter}
              availableStatuses={availableStatuses}
              availableCourses={availableCourses}
              selectedIds={selectedIds}
              toggleSelect={toggleSelect}
              setDeleteModal={setDeleteModal}
              isFetching={isFetching}
              handleRefresh={handleRefresh}
            />
          )}

          <SelectionActionBar
            selectedCount={selectedIds.length}
            itemName="batch"
            onClear={clearSelection}
            onDeleteSelected={() => setDeleteModal({
              isOpen: true,
              id: selectedIds,
              name: `${selectedIds.length} selected batches`,
              type: 'bulk_batch',
              status: 'idle',
              resultMessage: null
            })}
            onDeleteAll={() => {
              const allIds = filteredBatches.map(b => b.batch_id);
              setDeleteModal({
                isOpen: true,
                id: allIds,
                name: `all ${allIds.length} batches matching current filters`,
                type: 'bulk_batch',
                status: 'idle',
                resultMessage: null
              });
            }}
          />

          <ConfirmModal
            isOpen={deleteModal.isOpen}
            onClose={handleCloseModal}
            onConfirm={handleConfirmDelete}
            status={deleteModal.status}
            resultMessage={deleteModal.resultMessage}
            title={deleteModal.type === 'bulk_batch' ? 'Delete Multiple Batches' : 'Delete Batch'}
            message={
              deleteModal.type === 'bulk_batch'
                ? `Are you sure you want to permanently delete ${deleteModal.name}? This will affect currently enrolled students. This action cannot be undone.`
                : `Are you sure you want to permanently delete "${deleteModal.name}"? This will affect currently enrolled students.`
            }
            isProcessing={deleteModal.type === 'bulk_batch' ? deleteManyBatchesMutation.isPending : deleteMutation.isPending}
          />
        </div>
      }
    />
  );
};

export default Batches;
