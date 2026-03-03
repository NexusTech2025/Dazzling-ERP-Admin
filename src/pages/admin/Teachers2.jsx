import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextCore';
import { deleteTeacher } from '../../services/api';
import { useTeachers } from '../../hooks/useTeachers';
import { useFilteredTeachers } from '../../hooks/useFilteredTeachers';
import DataTable from '../../components/ui/DataTable';
import { SearchInput, SelectFilter } from '../../components/ui/filters';
import { createTeacherColumns } from './schemas/teacherSchema';

const Teachers2 = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  // 1. Fetch raw data from server
  const { data: teachers = [], isLoading, error } = useTeachers();

  // 2. Pass raw data to filtering hook
  const {
    searchQuery,
    setSearchQuery,
    departmentFilter,
    setDepartmentFilter,
    filteredTeachers,
    availableDepartments
  } = useFilteredTeachers(teachers);

  // 3. Optimized Deletion
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTeacher(token, id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['teachers', {}], (old = []) => 
        old.filter(teacher => teacher.id !== deletedId)
      );
      alert('Teacher deleted successfully');
    },
    onError: (err) => {
      console.error('Delete Teacher Error:', err);
      alert(err.message || 'Failed to delete teacher');
    }
  });

  // 4. Define handlers for the schema
  const handlers = {
    onDelete: (id, name) => {
      if (window.confirm(`Are you sure you want to permanently delete teacher ${name}? This action cannot be undone.`)) {
        deleteMutation.mutate(id);
      }
    },
    isDeleting: deleteMutation.isPending,
    // onView: (teacher) => navigate(`/admin/teachers/${teacher.id}`), // Example
    // onEdit: (teacher) => navigate(`/admin/teachers/${teacher.id}/edit`), // Example
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

  return (
    <DataTable 
      title="Faculty Directory (V2)"
      subtitle="Manage teacher profiles and department assignments (Modular Table Test)"
      columns={columns}
      data={filteredTeachers}
      isLoading={isLoading}
      error={error}
      onRetry={() => queryClient.invalidateQueries({ queryKey: ['teachers'] })}
      emptyMessage="No faculty members found matching your filters."
      filters={filters}
      primaryAction={
        <Link to="/admin/teachers/add" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark transition-colors">
          <span className="material-symbols-outlined text-lg">add</span>
          Add Faculty
        </Link>
      }
      secondaryAction={
        <button className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-lg">download</span>
          Export
        </button>
      }
    />
  );
};

export default Teachers2;
