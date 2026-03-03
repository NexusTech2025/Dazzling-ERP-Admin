import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextCore';
import { deleteStudent } from '../../services/api';
import { useStudents } from '../../hooks/useStudents';
import { useFilteredStudents } from '../../hooks/useFilteredStudents';
import DataTable from '../../components/ui/DataTable';
import { SearchInput, SelectFilter } from '../../components/ui/filters';
import { createStudentColumns } from './schemas/studentSchema';

const Students2 = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  // 1. Fetch raw data from server
  const { data: students = [], isLoading, error } = useStudents();

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
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['students', {}], (old = []) => 
        old.filter(student => student.id !== deletedId)
      );
      alert('Student deleted successfully');
    },
    onError: (err) => {
      console.error('Delete Student Error:', err);
      alert(err.message || 'Failed to delete student');
    }
  });

  // 4. Define handlers for the schema
  const handlers = {
    onDelete: (id, name) => {
      if (window.confirm(`Are you sure you want to permanently delete student ${name}? This action cannot be undone.`)) {
        deleteMutation.mutate(id);
      }
    },
    isDeleting: deleteMutation.isPending,
    // onView: (student) => navigate(`/admin/students/${student.id}`), // Example
    // onEdit: (student) => navigate(`/admin/students/${student.id}/edit`), // Example
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

  return (
    <DataTable 
      title="Student Directory (V2)"
      subtitle="Manage student enrollment and academic records (Modular Table Test)"
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
        <button className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-lg">download</span>
          Export
        </button>
      }
    />
  );
};

export default Students2;
