import React from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCoursesQuery, useDeleteCourseMutation } from './hooks/useCourseQueries';
import DataTable from '../../components/ui/DataTable';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { queryKeys } from '../../lib/react-query/queryKeys';

/**
 * Course Directory Page
 * Lists all available courses with status and revenue insights.
 */
const Courses = () => {
  const queryClient = useQueryClient();
  const [deleteModal, setDeleteModal] = React.useState({ isOpen: false, id: null, name: '' });

  const { data: courses = [], isLoading, isFetching, error } = useCoursesQuery();
  const deleteMutation = useDeleteCourseMutation();

  const columns = [
    {
      header: 'Course Name',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {row.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-semibold text-text-main dark:text-white">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Base Fee',
      accessor: 'base_fee',
      cell: (row) => (
        <span className="font-mono text-text-main dark:text-gray-300">
          ${Number(row.base_fee).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Installments',
      accessor: 'default_installment_count',
      className: 'text-center'
    },
    {
      header: 'Status',
      accessor: 'is_active',
      cell: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          row.is_active 
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' 
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
        }`}>
          <span className={`size-1.5 rounded-full ${row.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Link 
            to={`/admin/courses/${row.course_id}`}
            className="p-1.5 text-text-secondary hover:text-primary transition-colors"
            title="View Details"
          >
            <span className="material-symbols-outlined text-[20px]">analytics</span>
          </Link>
          <button 
            onClick={() => setDeleteModal({ isOpen: true, id: row.course_id, name: row.name })}
            className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
            title="Delete Course"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      )
    }
  ];

  if (isLoading) return <LoadingState message="Fetching course directory..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })} />;

  return (
    <div className="space-y-6">
      <DataTable 
        title="Course Directory"
        subtitle="Manage your academy's course offerings and fee structures."
        data={courses}
        columns={columns}
        primaryAction={
          <Link to="/admin/courses/add" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">add</span>
            Add Course
          </Link>
        }
        secondaryAction={
          <RefreshButton 
            isFetching={isFetching} 
            onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })} 
          />
        }
      />

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        onConfirm={() => deleteMutation.mutate({ id: deleteModal.id })}
        title="Delete Course"
        message={`Are you sure you want to permanently delete "${deleteModal.name}"? All enrollment data for this course will be affected.`}
        isProcessing={deleteMutation.isPending}
      />
    </div>
  );
};

export default Courses;
