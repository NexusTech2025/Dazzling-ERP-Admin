import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextCore';
import { deleteStudent } from '../../services/api';
import { useStudents } from '../../hooks/useStudents';
import { useFilteredStudents } from '../../hooks/useFilteredStudents';
import DataTable from '../../components/ui/DataTable';
import { SearchInput, SelectFilter } from '../../components/ui/filters';
import { createStudentColumns } from './schemas/studentSchema';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RefreshButton from '../../components/ui/btn/RefreshButton';

const Students = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    id: null, 
    name: '',
    status: 'idle',
    resultMessage: null
  });

  // 1. Fetch raw data from server
  const { data: students = [], isLoading, isFetching, error } = useStudents();

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
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStudent(token, id),
    onSuccess: (response, deletedId) => {
      if (response.success) {
        queryClient.setQueryData(['students', {}], (old = []) => 
          old.filter(student => student.id !== deletedId)
        );
        setDeleteModal(prev => ({ 
          ...prev, 
          status: 'success',
          resultMessage: response.message || 'Student records have been successfully removed.'
        }));
      } else {
        setDeleteModal(prev => ({ 
          ...prev, 
          status: 'error',
          resultMessage: response.error?.message || response.message || 'Failed to delete student.'
        }));
      }
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

  // 4. Define handlers for the schema
  const handlers = {
    onDelete: (id, name) => {
      setDeleteModal({ 
        isOpen: true, 
        id, 
        name,
        status: 'idle',
        resultMessage: null
      });
    },
    isDeleting: deleteMutation.isPending,
  };

  // 5. Generate columns dynamically
  const columns = createStudentColumns(handlers);

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
    setDeleteModal({ isOpen: false, id: null, name: '', status: 'idle', resultMessage: null });
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
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['students'] })}
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
              onRefresh={() => queryClient.invalidateQueries({ queryKey: ['students'] })} 
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
          deleteMutation.mutate(deleteModal.id);
        }}
        status={deleteModal.status}
        resultMessage={deleteModal.resultMessage}
        title="Delete Student"
        message={`Are you sure you want to permanently delete ${deleteModal.name}? This action cannot be undone.`}
      />
    </>
  );
};

export default Students;
