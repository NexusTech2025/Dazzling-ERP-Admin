import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextCore';
import { useStudentsQuery, useUpdateStudentMutation, useDeleteStudentMutation } from '../../features/student/hooks/useStudentQueries';
import { queryKeys, EMPTY_FILTER } from '../../lib/react-query/queryKeys';
import { useFilteredStudents } from '../../hooks/useFilteredStudents';
import DataTable from '../../components/ui/DataTable';
import { SearchInput, SelectFilter } from '../../components/ui/filters';
import { createStudentColumns } from './schemas/studentSchema';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import StudentDetailModal from '../../features/student/components/StudentDetailModal';
import StudentEditModal from '../../features/student/components/StudentEditModal';
import { StudentsMobileView } from '../../features/student/components/StudentsMobileView';
import DeleteDependencyModal, { parseDeleteBlockers } from '../../components/ui/DeleteDependencyModal';
import useSelection from '../../hooks/useSelection';
import useDeleteManyMutation from '../../hooks/useDeleteManyMutation';
import SelectionActionBar from '../../components/ui/v2/SelectionActionBar';
import { API_REGISTRY } from '../../services/apiRegistry';
import useIsMobile from '../../hooks/useIsMobile';
import { useBatchesQuery } from '../../features/batch/hooks/useBatchQueries';
import { useCoursesQuery, useCourseTypesQuery } from '../../features/course/hooks/useCourseQueries';
import { batchRepo } from '../../features/batch/utils/batchCacheHelper';

/**
 * Helper to evaluate if the student list needs relational hydration (allocations / enrollments).
 */
function isStudentListIncomplete(studentsList) {
  if (!Array.isArray(studentsList) || studentsList.length === 0) return false;
  const sample = studentsList[0];
  const hasAllocations = (Array.isArray(sample.allocations) && sample.allocations.length > 0) || (Array.isArray(sample.BatchAllocation) && sample.BatchAllocation.length > 0);
  const hasEnrollments = Array.isArray(sample.enrollments) && sample.enrollments.length > 0;
  return !hasAllocations && !hasEnrollments;
}

const Students = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Pre-fetch relational lookup datasets (Batches, Courses, CourseTypes) for batchRepo
  const { data: batches = [] } = useBatchesQuery();
  const { data: courses = [] } = useCoursesQuery();
  const { data: courseTypes = [] } = useCourseTypesQuery();

  // Prime batchRepo singleton whenever batches, courses, or courseTypes change
  React.useEffect(() => {
    batchRepo.prime(batches, courses, courseTypes);
  }, [batches, courses, courseTypes]);

  // Conditional Hydration State
  const [needsRefetch, setNeedsRefetch] = useState(false);
  const hasRefetchedRef = React.useRef(false);
  const wasFetchingRef = React.useRef(false);

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
  const [dependencyViolations, setDependencyViolations] = useState([]);
  const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
  const [blockedParentId, setBlockedParentId] = useState('');
  const [blockedParentName, setBlockedParentName] = useState('');

  // 1. Fetch data with conditional forceRefetch
  const { data: students = [], isLoading, isFetching, error } = useStudentsQuery(undefined, {
    forceRefetch: needsRefetch
  });

  // Detect incomplete hydration and trigger single imperative refetch
  React.useEffect(() => {
    if (hasRefetchedRef.current || needsRefetch || isFetching) return;
    if (isStudentListIncomplete(students)) {
      console.log('🔄 [Students] Incomplete student list hydration detected — setting forceRefetch = true');
      hasRefetchedRef.current = true;
      queryClient.invalidateQueries({ queryKey: queryKeys.student.list(EMPTY_FILTER) });
      setNeedsRefetch(true);
    }
  }, [students, needsRefetch, isFetching, queryClient]);

  // Reset refetch flag after fetch completes
  React.useEffect(() => {
    if (isFetching) {
      wasFetchingRef.current = true;
    } else if (needsRefetch && wasFetchingRef.current) {
      console.log('✅ [Students] List hydration settled — resetting forceRefetch');
      setNeedsRefetch(false);
      wasFetchingRef.current = false;
    }
  }, [needsRefetch, isFetching]);
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
        const rawErr = err.rawBackendError;
        if (rawErr?.details?.failed) {
          const parsedBlockers = parseDeleteBlockers(rawErr, 'Student');
          if (parsedBlockers.length > 0) {
            setDependencyViolations(parsedBlockers);
            setBlockedParentId('Multiple Students');
            setBlockedParentName(`${Object.keys(rawErr.details.failed).length} selected profiles`);
            setIsDependencyModalOpen(true);
            setDeleteModal(prev => ({ ...prev, isOpen: false }));
            return;
          }
        }
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
        const rawErr = err.rawBackendError;
        if (rawErr?.details?.violations) {
          const parsedBlockers = parseDeleteBlockers(rawErr, 'Student');
          if (parsedBlockers.length > 0) {
            setDependencyViolations(parsedBlockers);
            setBlockedParentId(id);
            setBlockedParentName(deleteModal.name || 'Rahul Sharma');
            setIsDependencyModalOpen(true);
            setDeleteModal(prev => ({ ...prev, isOpen: false }));
            return;
          }
        }
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
      {isMobile ? (
        /* Mobile Viewport Layout */
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 px-2 pt-6 pb-24">
          {/* Header Block */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-main dark:text-white">Student Directory</h1>
              <p className="text-xs text-text-secondary">Manage student enrollment and academic records</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <RefreshButton
                isFetching={isFetching}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.student.all })}
              />
              <button className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-lg">download</span>
                Export
              </button>
              <Link to="/admin/students/add" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark transition-colors ml-auto">
                <span className="material-symbols-outlined text-lg">add</span>
                Add Student
              </Link>
            </div>
          </div>

          {/* Filters Block */}
          {filters && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 shadow-sm">
              {filters}
            </div>
          )}

          {/* Loading/Error/List Block */}
          {isLoading ? (
            <div className="py-20 text-center">
              <span className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin inline-block"></span>
              <p className="text-xs text-text-secondary mt-2">Loading students...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20 text-rose-600">
              <p className="text-sm font-bold">{error.message || 'Failed to load student data'}</p>
              <button onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.student.all })} className="text-xs text-primary font-bold underline mt-2">
                Retry
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark">
              <span className="material-symbols-outlined text-text-secondary/20 text-5xl mb-2">person_off</span>
              <p className="text-sm font-bold text-text-main dark:text-white">No students found matching your filters.</p>
            </div>
          ) : (
            <StudentsMobileView
              students={filteredStudents}
              selectedIds={selectedIds}
              onSelectRow={toggleSelect}
              handlers={handlers}
            />
          )}
        </div>
      ) : (
        /* Desktop view */
        <div>
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
        </div>
      )}

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

      {deleteModal.isOpen && (
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

      {isDependencyModalOpen && (
        <DeleteDependencyModal
          isOpen={isDependencyModalOpen}
          onClose={() => {
            setIsDependencyModalOpen(false);
            setDependencyViolations([]);
          }}
          errorPayload={dependencyViolations}
          parentId={blockedParentId}
          parentName={blockedParentName}
          onResolve={() => {
            setIsDependencyModalOpen(false);
            setDependencyViolations([]);
            navigate('/admin/finance');
          }}
        />
      )}
    </>
  );
};

export default Students;
