import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextCore';
import { useStudentsQuery, useUpdateStudentMutation, useDeleteStudentMutation } from '../../features/student/hooks/useStudentQueries';
import { queryKeys } from '../../lib/react-query/queryKeys';
import { useFilteredStudents } from '../../hooks/useFilteredStudents';
import DataTable from '../../components/ui/DataTable';
import { SearchInput, SelectFilter } from '../../components/ui/filters';
import { createStudentColumns } from './schemas/studentSchema';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import StudentDetailModal from '../../features/student/components/StudentDetailModal';
import StudentEditModal from '../../features/student/components/StudentEditModal';
import useSelection from '../../hooks/useSelection';
import useDeleteManyMutation from '../../hooks/useDeleteManyMutation';
import SelectionActionBar from '../../components/ui/v2/SelectionActionBar';
import { API_REGISTRY } from '../../services/apiRegistry';

const Students = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: '',
    type: 'student',
    status: 'idle',
    resultMessage: null
  });

  const [selectedStudentForView, setSelectedStudentForView] = useState(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);

  // 1. Fetch raw data from server
  const { data: students = [], isLoading, isFetching, error } = useStudentsQuery();
  const updateMutation = useUpdateStudentMutation();

  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected
  } = useSelection();

  const deleteManyStudentsMutation = useDeleteManyMutation(
    'Student',
    [queryKeys.student.all],
    API_REGISTRY.STUDENT.DELETE_MANY
  );

  // 2. Pass raw data to filtering hook
  const {
    searchQuery,
    setSearchQuery,
    batchFilter,
    setBatchFilter,
    courseFilter,
    setCourseFilter,
    filteredStudents,
    availableBatches,
    availableCourses
  } = useFilteredStudents(students);

  // 3. Optimized Deletion
  const deleteMutation = useDeleteStudentMutation();

  const handleBatchDelete = (ids) => {
    console.log("batch delete initiated with ids: ", ids)
    deleteManyStudentsMutation.mutate({ ids }, {
      onSuccess: (res) => {
        if (res.success) {
          const manifest = res.data?.manifest || {};
          const deleted = manifest.deleted || [];
          const failed = manifest.failed || {};
          const failedCount = Object.keys(failed).length;

          let msg = `Successfully deleted ${deleted.length} students.`;
          if (failedCount > 0) {
            msg += ` Failed to delete ${failedCount} students due to referential constraints.`;
          }

          // Close view or edit details for deleted students
          if (selectedStudentForView && deleted.includes(selectedStudentForView.student_id)) {
            setSelectedStudentForView(null);
          }
          if (selectedStudentForEdit && deleted.includes(selectedStudentForEdit.student_id)) {
            setSelectedStudentForEdit(null);
          }

          setDeleteModal(prev => ({
            ...prev,
            status: failedCount > 0 && deleted.length === 0 ? 'error' : 'success',
            resultMessage: msg
          }));

          if (deleted.length > 0) {
            clearSelection();
          }
        } else {
          setDeleteModal(prev => ({
            ...prev,
            status: 'error',
            resultMessage: res.message || 'Failed to delete students.'
          }));
        }
      },
      onError: (err) => {
        console.error('Delete Many Students Error:', err);
        setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'Failed to delete students due to a server error.'
        }));
      }
    });
  };

  const handleSingleDelete = (id) => {
    deleteMutation.mutate({ id }, {
      onSuccess: (response) => {
        // Close details or edit modal if this student was active
        if (selectedStudentForView?.student_id === id) {
          setSelectedStudentForView(null);
        }
        if (selectedStudentForEdit?.student_id === id) {
          setSelectedStudentForEdit(null);
        }
        setDeleteModal(prev => ({
          ...prev,
          status: 'success',
          resultMessage: response.data?.message || response.message || 'Student record has been successfully removed.'
        }));
      },
      onError: (err) => {
        console.error('Delete Student Error:', err);
        setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'Connection error. Please check your network.'
        }));
      }
    });
  };

  // 4. Define handlers for the schema
  const handlers = useMemo(() => ({
    onView: (student) => navigate(`/admin/students/${student.student_id}`),
    onEdit: (student) => setSelectedStudentForEdit(student),
    onDelete: (id, name) => {
      setDeleteModal({
        isOpen: true,
        id,
        name,
        type: 'student',
        status: 'idle',
        resultMessage: null
      });
    },
    isDeleting: deleteMutation.isPending,
  }), [navigate, deleteMutation.isPending]);

  // 5. Generate columns dynamically with select-all support
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

  const handleSaveStudent = (updatedData) => {
    updateMutation.mutate({
      id: updatedData.student_id,
      data: updatedData
    }, {
      onSuccess: () => setSelectedStudentForEdit(null)
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.id) return;
    setDeleteModal(prev => ({ ...prev, status: 'processing' }));

    const handler = deleteModal.type === 'bulk_student' ? handleBatchDelete : handleSingleDelete;
    handler(deleteModal.id);
  };

  // 6. Define reusable filters
  const filters = (
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
        <button className="ml-auto text-primary text-sm font-medium flex items-center gap-1 hover:underline">
          <span className="material-symbols-outlined text-lg">filter_list</span>
          More Filters
        </button>
      </div>
    </>
  );

  const handleCloseModal = () => {
    setDeleteModal({ isOpen: false, id: null, name: '', type: 'student', status: 'idle', resultMessage: null });
  };

  return (
    <>
      <DataTable
        title="Student Directory"
        subtitle="Manage student enrollment and academic records"
        columns={columns}
        data={filteredStudents}
        isLoading={isLoading}
        error={error}
        onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.student.all })}
        emptyMessage="No students found matching your filters."
        filters={filters}
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
              onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.student.all })}
            />
            <button className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-lg">download</span>
              Export
            </button>
          </>
        }
      />

      {/* Floating Selection Action Bar */}
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

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        status={deleteModal.status}
        resultMessage={deleteModal.resultMessage}
        title={deleteModal.type === 'bulk_student' ? 'Delete Multiple Students' : 'Delete Student'}
        message={
          deleteModal.type === 'bulk_student'
            ? `Are you sure you want to permanently delete ${deleteModal.name}? This will cascadingly delete associated addresses, contacts, and education records. This action cannot be undone.`
            : `Are you sure you want to permanently delete ${deleteModal.name}? This action cannot be undone.`
        }
        isProcessing={deleteModal.type === 'bulk_student' ? deleteManyStudentsMutation.isPending : deleteMutation.isPending}
      />

      <StudentDetailModal
        isOpen={!!selectedStudentForView}
        onClose={() => setSelectedStudentForView(null)}
        student={selectedStudentForView}
      />

      <StudentEditModal
        isOpen={!!selectedStudentForEdit}
        onClose={() => setSelectedStudentForEdit(null)}
        student={selectedStudentForEdit}
        onSave={handleSaveStudent}
      />
    </>
  );
};

export default Students;
