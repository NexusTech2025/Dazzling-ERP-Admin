import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCoursesQuery, useDeleteCourseMutation } from './hooks/useCourseQueries';
import { queryKeys } from '../../lib/react-query/queryKeys';

// UI Components
import DataTable from '../../components/ui/DataTable';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Badge from '../../components/ui/Badge';

// Feature Components
import CourseHeader from './components/CourseHeader';
import CourseFilters from './components/CourseFilters';
import CourseCard from './components/CourseCard';

const Courses = () => {
  const queryClient = useQueryClient();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');

  const { data: courses = [], isLoading, isFetching, error } = useCoursesQuery();
  const deleteMutation = useDeleteCourseMutation();

  // Filter Logic
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesSearch = c.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.course_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSegment = !segmentFilter || c.segment_id === segmentFilter;
      return matchesSearch && matchesSegment;
    });
  }, [courses, searchQuery, segmentFilter]);

  const availableSegments = useMemo(() => {
    const segments = courses.map(c => c.segment_id);
    return [...new Set(segments)];
  }, [courses]);

  const handleDeleteClick = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const listColumns = [
    {
      header: 'Course Name',
      accessor: 'item_name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">
            {row.item_name ? row.item_name.substring(0, 2).toUpperCase() : '??'}
          </div>
          <span className="font-bold text-text-main dark:text-white">{row.item_name}</span>
        </div>
      )
    },
    {
      header: 'ID',
      accessor: 'course_id',
      className: 'font-mono text-xs'
    },
    {
      header: 'Fee',
      accessor: 'base_fee',
      className: 'text-right font-black',
      cell: (row) => `$${row.base_fee?.toLocaleString()}`
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <button 
          onClick={() => handleDeleteClick(row.course_id, row.item_name)}
          className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      )
    }
  ];

  if (isLoading) return <LoadingState message="Scanning curriculum library..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <CourseHeader />

      <CourseFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        segmentFilter={segmentFilter}
        onSegmentChange={setSegmentFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        availableSegments={availableSegments}
      />

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredCourses.length > 0 ? filteredCourses.map(course => (
            <CourseCard 
              key={course.course_id} 
              course={course} 
              onDelete={handleDeleteClick}
            />
          )) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl bg-surface-light dark:bg-surface-dark">
              <span className="material-symbols-outlined text-text-secondary/20 text-6xl mb-4">search_off</span>
              <h3 className="text-lg font-bold text-text-main dark:text-white">No courses found</h3>
              <p className="text-sm text-text-secondary">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <DataTable 
            data={filteredCourses}
            columns={listColumns}
            isLoading={false}
          />
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        onConfirm={() => deleteMutation.mutate({ id: deleteModal.id }, {
          onSuccess: () => setDeleteModal({ isOpen: false, id: null, name: '' })
        })}
        title="Archive Course"
        message={`Are you sure you want to archive "${deleteModal.name}"? It will no longer be available for new enrollments.`}
        isProcessing={deleteMutation.isPending}
      />
    </div>
  );
};

export default Courses;
