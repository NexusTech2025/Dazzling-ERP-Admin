import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import { SearchInput, SelectFilter } from '../../components/ui/filters';
import { createStudentColumns } from './schemas/studentSchema';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import StudentDetailModal from '../../features/student/components/StudentDetailModal';
import StudentEditModal from '../../features/student/components/StudentEditModal';
import DeleteDependencyModal from '../../components/ui/DeleteDependencyModal';
import SelectionActionBar from '../../components/ui/v2/SelectionActionBar';
import useIsMobile from '../../hooks/useIsMobile';
import useStudentListView from '../../features/student/hooks/useStudentListView';
import StudentMobileListView from '../../features/student/components/StudentMobileListView';

/**
 * Main Student Directory Page Controller.
 * Delegates mobile view presentation to <StudentMobileListView />, desktop grid to <DataTable />,
 * and state management to the useStudentListView() view-controller hook.
 */
const Students = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const listController = useStudentListView();

  const { data, status, filterState, selectionState, modals, actions } = listController;
  const { filteredStudents } = data;
  const { isLoading, isFetching, error } = status;

  const {
    searchQuery,
    setSearchQuery,
    batchFilter,
    setBatchFilter,
    courseFilter,
    setCourseFilter,
    availableBatches,
    availableCourses
  } = filterState;

  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected
  } = selectionState;

  const {
    deleteModal,
    setDeleteModal,
    selectedStudentForView,
    setSelectedStudentForView,
    selectedStudentForEdit,
    setSelectedStudentForEdit,
    dependencyModal,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleSaveStudent
  } = modals;

  const { handlers, handleRefresh, deleteMutation, deleteManyMutation } = actions;

  // 1. Desktop DataTable Select-All Column Setup
  const allStudentIds = useMemo(() => filteredStudents.map(s => s.student_id), [filteredStudents]);

  const columns = useMemo(() => {
    const cols = createStudentColumns(handlers);
    return [
      {
        header: (
          <input
            type="checkbox"
            className="size-4 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 cursor-pointer transition-all"
            checked={isAllSelected(allStudentIds)}
            ref={input => {
              if (input) {
                input.indeterminate = isSomeSelected(allStudentIds);
              }
            }}
            onChange={() => toggleSelectAll(allStudentIds)}
          />
        ),
        accessor: 'checkbox',
        className: 'w-10',
        cell: (row) => (
          <input
            type="checkbox"
            className="size-4 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 cursor-pointer transition-all"
            checked={selectedIds.includes(row.student_id)}
            onChange={() => toggleSelect(row.student_id)}
          />
        )
      },
      ...cols
    ];
  }, [handlers, filteredStudents, allStudentIds, selectedIds, toggleSelect, toggleSelectAll, isAllSelected, isSomeSelected]);

  // 2. Desktop Filters Panel
  const desktopFilters = (
    <>
      <div className="md:col-span-6 lg:col-span-4 relative">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, ID, or email"
        />
      </div>
      <div className="md:col-span-6 lg:col-span-8 flex flex-wrap gap-3 items-center">
        <SelectFilter
          value={batchFilter}
          onChange={setBatchFilter}
          options={availableBatches}
          defaultLabel="Batch: All"
        />
        <SelectFilter
          value={courseFilter}
          onChange={setCourseFilter}
          options={availableCourses}
          defaultLabel="Course: All"
        />
        <button type="button" className="ml-auto text-primary text-sm font-medium flex items-center gap-1 hover:underline cursor-pointer">
          <span className="material-symbols-outlined text-lg">filter_list</span>
          More Filters
        </button>
      </div>
    </>
  );

  return (
    <>
      {isMobile ? (
        /* Mobile Viewport Layout */
        <StudentMobileListView controller={listController} />
      ) : (
        /* Desktop Viewport Layout */
        <div>
          <DataTable
            title="Student Directory"
            subtitle="Manage student enrollment and academic records"
            columns={columns}
            data={filteredStudents}
            isLoading={isLoading}
            error={error}
            onRetry={handleRefresh}
            emptyMessage="No students found matching your filters."
            filters={desktopFilters}
            primaryAction={
              <Link to="/admin/students/add" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark transition-colors">
                <span className="material-symbols-outlined text-lg">add</span>
                Add Student
              </Link>
            }
            secondaryAction={
              <>
                <RefreshButton
                  isFetching={isFetching}
                  onRefresh={handleRefresh}
                />
                <button type="button" className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-lg">download</span>
                  Export
                </button>
              </>
            }
          />

          {/* Desktop Selection Action Bar */}
          <SelectionActionBar
            selectedCount={selectedIds.length}
            itemName="student"
            onClear={clearSelection}
            onDeleteSelected={() => {
              setDeleteModal({
                isOpen: true,
                id: selectedIds,
                name: `${selectedIds.length} selected students`,
                type: 'bulk_student',
                status: 'idle',
                resultMessage: null
              });
            }}
            onDeleteAll={() => {
              const allIds = filteredStudents.map(s => s.student_id);
              setDeleteModal({
                isOpen: true,
                id: allIds,
                name: `all ${allIds.length} students matching current filters`,
                type: 'bulk_student',
                status: 'idle',
                resultMessage: null
              });
            }}
          />
        </div>
      )}

      {/* Shared Modals */}
      {deleteModal.isOpen && (
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          status={deleteModal.status}
          resultMessage={deleteModal.resultMessage}
          title={deleteModal.type === 'bulk_student' ? 'Delete Multiple Students' : 'Delete Student'}
          message={
            deleteModal.type === 'bulk_student'
              ? `Are you sure you want to permanently delete ${deleteModal.name}? This will cascadingly delete associated addresses, contacts, and education records. This action cannot be undone.`
              : `Are you sure you want to permanently delete ${deleteModal.name}? This action cannot be undone.`
          }
          isProcessing={deleteModal.type === 'bulk_student' ? deleteManyMutation.isPending : deleteMutation.isPending}
        />
      )}

      {selectedStudentForView && (
        <StudentDetailModal
          isOpen={!!selectedStudentForView}
          onClose={() => setSelectedStudentForView(null)}
          student={selectedStudentForView}
        />
      )}

      {selectedStudentForEdit && (
        <StudentEditModal
          isOpen={!!selectedStudentForEdit}
          onClose={() => setSelectedStudentForEdit(null)}
          student={selectedStudentForEdit}
          onSave={handleSaveStudent}
        />
      )}

      {dependencyModal.isOpen && (
        <DeleteDependencyModal
          isOpen={dependencyModal.isOpen}
          onClose={() => {
            dependencyModal.setIsOpen(false);
            dependencyModal.setViolations([]);
          }}
          errorPayload={dependencyModal.violations}
          parentId={dependencyModal.blockedParentId}
          parentName={dependencyModal.blockedParentName}
          onResolve={() => {
            dependencyModal.setIsOpen(false);
            dependencyModal.setViolations([]);
            navigate('/admin/finance');
          }}
        />
      )}
    </>
  );
};

export default Students;
