import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useBatchesQuery, useDeleteBatchMutation } from './hooks/useBatchQueries';
import { useCoursesQuery } from '../course/hooks/useCourseQueries';
import { useTeacherDetailQuery, useTeachersQuery } from '../teacher/hooks/useTeacherQueries';
import { queryKeys } from '../../lib/react-query/queryKeys';
import { useFilteredBatches } from '../../hooks/useFilteredBatches';
import DataTable from '../../components/ui/DataTable';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { SearchInput, SelectFilter } from '../../components/ui/filters';
import { createBatchColumns } from '../../pages/admin/schemas/batchSchema';

const Batches = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  const { data: batches = [], isLoading, isFetching, error } = useBatchesQuery();
  const { data: courses = [] } = useCoursesQuery();
  const { data: teachers = [] } = useTeachersQuery();

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

  const handlers = {
    onView: (batch) => navigate(`/admin/batches/${batch.batch_id}`),
    onEdit: (batch) => navigate(`/admin/batches/edit/${batch.batch_id}`),
    onDelete: (id, name) => setDeleteModal({ isOpen: true, id, name }),
    isDeleting: deleteMutation.isPending
  };

  const columns = createBatchColumns(handlers);

  const filters = (
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
  );

  if (isLoading) return <LoadingState message="Fetching batch records..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.batch.all })} />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DataTable 
        title="Batch Directory"
        subtitle="Manage class schedules, capacities, and course assignments."
        data={filteredBatches}
        columns={columns}
        filters={filters}
        primaryAction={
          <Link to="/admin/batches/add" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">add</span>
            Create Batch
          </Link>
        }
        secondaryAction={
          <RefreshButton 
            isFetching={isFetching} 
            onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.batch.all })} 
          />
        }
      />

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        onConfirm={() => deleteMutation.mutate({ id: deleteModal.id }, {
          onSuccess: () => setDeleteModal({ isOpen: false, id: null, name: '' })
        })}
        title="Delete Batch"
        message={`Are you sure you want to permanently delete "${deleteModal.name}"? This will affect currently enrolled students.`}
        isProcessing={deleteMutation.isPending}
      />
    </div>
  );
};

export default Batches;

