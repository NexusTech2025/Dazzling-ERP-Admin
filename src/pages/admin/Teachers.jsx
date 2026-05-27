import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

const Teachers = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    id: null, 
    name: '',
    status: 'idle',
    resultMessage: null
  });

  // 1. Fetch raw data from mock API
  const { data: teachers = [], isLoading, isFetching, error } = useTeachersQuery();
  const deleteMutation = useDeleteTeacherMutation();

  // 2. Pass raw data to filtering hook
  const {
    searchQuery,
    setSearchQuery,
    departmentFilter,
    setDepartmentFilter,
    filteredTeachers,
    availableDepartments
  } = useFilteredTeachers(teachers);

  // 4. Define handlers for the schema
  const handlers = {
    onView: (teacher) => navigate(`/admin/teachers/${teacher.teacher_id}`),
    onEdit: (teacher) => navigate(`/admin/teachers/edit/${teacher.teacher_id}`),
    onDelete: (id, name) => {
      setDeleteModal({ 
        isOpen: true, 
        id, 
        name,
        status: 'idle',
        resultMessage: null
      });
    },
    deletingId: deleteMutation.isPending ? deleteModal.id : null,
  };

  // 5. Generate columns dynamically
  const columns = createTeacherColumns(handlers);

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
    setDeleteModal({ isOpen: false, id: null, name: '', status: 'idle', resultMessage: null });
  };

  return (
    <>
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
      
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={() => {
          setDeleteModal(prev => ({ ...prev, status: 'processing' }));
          deleteMutation.mutate(
            { id: deleteModal.id },
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
        }}
        status={deleteModal.status}
        resultMessage={deleteModal.resultMessage}
        title="Delete Faculty"
        message={`Are you sure you want to permanently delete ${deleteModal.name}? This action cannot be undone.`}
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
