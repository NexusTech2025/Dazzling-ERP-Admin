import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextCore';
import { useTeachersQuery, useDeleteTeacherMutation } from '../../features/teacher/hooks/useTeacherQueries';
import { useFilteredTeachers } from '../../hooks/useFilteredTeachers';
import DataTable from '../../components/ui/DataTable';
import { SearchInput, SelectFilter } from '../../components/ui/filters';
import { createTeacherColumns } from './schemas/teacherSchema';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import { queryKeys } from '../../lib/react-query/queryKeys';
import PageErrorBoundary from '../../components/ui/PageErrorBoundary';
import useSelection from '../../hooks/useSelection';
import useDeleteManyMutation from '../../hooks/useDeleteManyMutation';
import useSelectableTable from '../../hooks/useSelectableTable';
import SelectionActionBar from '../../components/ui/v2/SelectionActionBar';
import { API_REGISTRY } from '../../services/apiRegistry';
import TeacherCard from '../../features/teacher/components/TeacherCard';

const Teachers = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    id: null, 
    name: '',
    type: 'teacher',
    status: 'idle',
    resultMessage: null
  });

  // 1. Fetch raw data
  const { data: teachers = [], isLoading, isFetching, error } = useTeachersQuery();
  const deleteMutation = useDeleteTeacherMutation();

  const {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected
  } = useSelection();

  const deleteManyTeachersMutation = useDeleteManyMutation(
    'Teacher',
    [queryKeys.teacher.all],
    API_REGISTRY.STAFF.DELETE_MANY
  );

  // 2. Pass raw data to filtering hook
  const {
    searchQuery,
    setSearchQuery,
    departmentFilter,
    setDepartmentFilter,
    filteredTeachers,
    availableDepartments
  } = useFilteredTeachers(teachers);

  // 3. Define handlers for the schema
  const handlers = useMemo(() => ({
    onView: (teacher) => navigate(`/admin/teachers/${teacher.teacher_id}`),
    onEdit: (teacher) => navigate(`/admin/teachers/edit/${teacher.teacher_id}`),
    onDelete: (id, name) => {
      setDeleteModal({ 
        isOpen: true, 
        id, 
        name,
        type: 'teacher',
        status: 'idle',
        resultMessage: null
      });
    },
    deletingId: deleteMutation.isPending ? deleteModal.id : null,
  }), [navigate, deleteMutation.isPending, deleteModal.id]);

  // 4. Generate base columns and decorate them
  const baseColumns = useMemo(() => createTeacherColumns(handlers), [handlers]);
  const columns = useSelectableTable({
    columns: baseColumns,
    data: filteredTeachers,
    idKey: 'teacher_id',
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
    isSomeSelected
  });

  // 5. Delete Handlers
  const handleSingleDelete = (id) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: (response) => {
          if (response.success) {
            setDeleteModal(prev => ({ 
              ...prev, 
              status: 'success', 
              resultMessage: `${deleteModal.name} has been deleted successfully.`
            }));
          } else {
            setDeleteModal(prev => ({ 
              ...prev, 
              status: 'error', 
              resultMessage: response.message || `Failed to delete ${deleteModal.name}.`
            }));
          }
        },
        onError: (err) => {
          setDeleteModal(prev => ({ 
            ...prev, 
            status: 'error', 
            resultMessage: err.message || `An error occurred while deleting ${deleteModal.name}.`
          }));
        }
      }
    );
  };

  const handleBatchDelete = (ids) => {
    deleteManyTeachersMutation.mutate(
      { ids },
      {
        onSuccess: (res) => {
          if (res.success) {
            const manifest = res.data?.manifest || {};
            const deleted = manifest.deleted || [];
            const failed = manifest.failed || {};
            const failedCount = Object.keys(failed).length;

            let msg = `Successfully deleted ${deleted.length} teachers.`;
            if (failedCount > 0) {
              msg += ` Failed to delete ${failedCount} teachers due to active batch assignments or financial configurations.`;
            }

            setDeleteModal(prev => ({
              ...prev,
              status: failedCount > 0 && deleted.length === 0 ? 'error' : 'success',
              resultMessage: msg
            }));

            if (deleted.length > 0) {
              // Clear only successfully deleted IDs from selection
              setSelectedIds(prev => prev.filter(id => !deleted.includes(id)));
            }
          } else {
            setDeleteModal(prev => ({
              ...prev,
              status: 'error',
              resultMessage: res.message || 'Failed to delete teachers.'
            }));
          }
        },
        onError: (err) => {
          setDeleteModal(prev => ({
            ...prev,
            status: 'error',
            resultMessage: err.message || 'Failed to delete teachers due to a server error.'
          }));
        }
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.id) return;
    setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    
    if (deleteModal.type === 'bulk_teacher') {
      handleBatchDelete(deleteModal.id);
    } else {
      handleSingleDelete(deleteModal.id);
    }
  };

  // 6. Define reusable filters
  const filters = (
    <>
      <div className="md:col-span-6 lg:col-span-4 relative">
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, ID, or department"
        />
      </div>
      <div className="md:col-span-6 lg:col-span-8 flex flex-wrap gap-3 items-center">
        <SelectFilter 
          value={departmentFilter}
          onChange={setDepartmentFilter}
          options={availableDepartments}
          defaultLabel="Department: All"
        />
        <button className="ml-auto text-primary text-sm font-medium flex items-center gap-1 hover:underline">
          <span className="material-symbols-outlined text-lg">filter_list</span>
          More Filters
        </button>
      </div>
    </>
  );

  const handleCloseModal = () => {
    setDeleteModal({ isOpen: false, id: null, name: '', type: 'teacher', status: 'idle', resultMessage: null });
  };

  return (
    <>
      {/* Mobile Viewport Layout */}
      <div className="md:hidden flex flex-col gap-6 animate-in fade-in duration-300 px-2 pt-6 pb-24">
        {/* Header Block */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main dark:text-white">Faculty Directory</h1>
            <p className="text-xs text-text-secondary">Manage teacher profiles and department assignments</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <RefreshButton 
              isFetching={isFetching} 
              onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all })} 
            />
            <button className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-lg">download</span>
              Export
            </button>
            <Link to="/admin/teachers/add" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark transition-colors ml-auto">
              <span className="material-symbols-outlined text-lg">add</span>
              Add Faculty
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 bg-surface-light/45 dark:bg-surface-dark/45 p-4 rounded-xl border border-border-light dark:border-border-dark">
          {filters}
        </div>

        {/* Card Stack / List */}
        {isLoading ? (
          <div className="py-20 text-center">
            <p className="text-xs text-text-secondary">Loading faculty list...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center border border-rose-500/20 rounded-xl bg-rose-500/5">
            <p className="text-xs font-bold text-rose-500">Failed to load faculty members.</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all })}
              className="mt-2 text-xs font-bold text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark">
            <span className="material-symbols-outlined text-text-secondary/20 text-5xl mb-2">person_off</span>
            <p className="text-sm font-bold text-text-main dark:text-white">No faculty members found matching your filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredTeachers.map((teacher) => {
              const isSelected = selectedIds.includes(teacher.teacher_id);
              const isSelectionMode = selectedIds.length > 0;

              const checkboxElement = (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(teacher.teacher_id)}
                  onClick={(e) => e.stopPropagation()}
                  className="size-5 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary/20 cursor-pointer"
                />
              );

              return (
                <div key={teacher.teacher_id} className="w-full">
                  <TeacherCard
                    teacher={teacher}
                    density="low"
                    icon={isSelectionMode ? checkboxElement : undefined}
                    onClick={() => handlers.onView(teacher)}
                    onEdit={() => handlers.onEdit(teacher)}
                    onDelete={() => handlers.onDelete(teacher.teacher_id, teacher.full_name)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <DataTable 
          title="Faculty Directory"
          subtitle="Manage teacher profiles and department assignments"
          columns={columns}
          data={filteredTeachers}
          isLoading={isLoading}
          error={error}
          onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all })}
          emptyMessage="No faculty members found matching your filters."
          filters={filters}
          primaryAction={
            <Link to="/admin/teachers/add" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark transition-colors">
              <span className="material-symbols-outlined text-lg">add</span>
              Add Faculty
            </Link>
          }
          secondaryAction={
            <>
              <RefreshButton 
                isFetching={isFetching} 
                onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all })} 
              />
              <button className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-lg">download</span>
                Export
              </button>
            </>
          }
        />
      </div>
      
      {/* Floating Selection Action Bar */}
      <SelectionActionBar
        selectedCount={selectedIds.length}
        itemName="teacher"
        onClear={clearSelection}
        onDeleteSelected={() => {
          setDeleteModal({
            isOpen: true,
            id: selectedIds,
            name: `${selectedIds.length} selected teachers`,
            type: 'bulk_teacher',
            status: 'idle',
            resultMessage: null
          });
        }}
        onDeleteAll={() => {
          const allIds = filteredTeachers.map(t => t.teacher_id);
          setDeleteModal({
            isOpen: true,
            id: allIds,
            name: `all ${allIds.length} teachers matching current filters`,
            type: 'bulk_teacher',
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
        title={deleteModal.type === 'bulk_teacher' ? 'Delete Multiple Faculty' : 'Delete Faculty'}
        message={
          deleteModal.type === 'bulk_teacher'
            ? `Are you sure you want to permanently delete ${deleteModal.name}? This will cascade deletion to teacher subjects, documents, and salary configurations. This action cannot be undone.`
            : `Are you sure you want to permanently delete ${deleteModal.name}? This action cannot be undone.`
        }
        isProcessing={deleteModal.type === 'bulk_teacher' ? deleteManyTeachersMutation.isPending : deleteMutation.isPending}
      />
    </>
  );
};

const TeachersPage = () => (
  <PageErrorBoundary>
    <Teachers />
  </PageErrorBoundary>
);

export default TeachersPage;
