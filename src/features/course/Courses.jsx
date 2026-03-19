import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCoursesQuery, useDeleteCourseMutation, usePackagesQuery } from './hooks/useCourseQueries';
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
import PackageCard from './components/PackageCard';

const Courses = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('courses');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');

  const { data: courses = [], isLoading: isLoadingCourses, error: coursesError } = useCoursesQuery();
  const { data: packages = [], isLoading: isLoadingPackages, error: packagesError } = usePackagesQuery();
  const deleteMutation = useDeleteCourseMutation();

  // Filter Logic
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.course_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSegment = !segmentFilter || c.segment_id === segmentFilter;
      return matchesSearch && matchesSegment;
    });
  }, [courses, searchQuery, segmentFilter]);

  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.package_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [packages, searchQuery]);

  const availableSegments = useMemo(() => {
    const segments = courses.map(c => c.segment_id);
    return [...new Set(segments)];
  }, [courses]);

  const handleDeleteClick = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const courseColumns = [
    {
      header: 'Course Name',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">
            {row.name ? row.name.substring(0, 2).toUpperCase() : '??'}
          </div>
          <span className="font-bold text-text-main dark:text-white">{row.name}</span>
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
          onClick={() => handleDeleteClick(row.course_id, row.name)}
          className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      )
    }
  ];

  const packageColumns = [
    {
      header: 'Package Name',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
          </div>
          <span className="font-bold text-text-main dark:text-white">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Included Courses',
      accessor: 'included_courses',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.included_courses.map((c, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold text-text-secondary border border-border-light dark:border-border-dark whitespace-nowrap">
              {c}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'base_fee',
      className: 'text-right font-black text-primary',
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
        <div className="flex items-center justify-end gap-1">
          <button className="p-1.5 text-text-secondary hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button className="p-1.5 text-text-secondary hover:text-red-500 transition-colors">
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      )
    }
  ];

  if (isLoadingCourses || isLoadingPackages) return <LoadingState message="Scanning curriculum library..." />;
  if (coursesError || packagesError) return <ErrorState message={(coursesError || packagesError).message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })} />;

  const segments = [
    { id: '', name: 'All', icon: 'apps' },
    { id: 'SEG-ACA', name: 'Academic', icon: 'menu_book' },
    { id: 'SEG-CMP', name: 'Computer', icon: 'computer' },
    { id: 'SEG-FND', name: 'Foundation', icon: 'foundation' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <CourseHeader activeTab={activeTab} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Switcher & Segment Filters Group */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Main Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl w-fit shadow-sm">
            <button 
              onClick={() => {
                setActiveTab('courses');
                setSegmentFilter(''); // Reset segment when switching back to courses
              }}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'courses' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <span className="material-symbols-outlined text-lg">school</span>
              Courses
            </button>
            <button 
              onClick={() => {
                setActiveTab('packages');
                setSegmentFilter(''); // Not applicable for packages
              }}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'packages' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <span className="material-symbols-outlined text-lg">inventory_2</span>
              Packages
            </button>
          </div>

          {/* Segment Filter Buttons (Only for Courses tab) */}
          {activeTab === 'courses' && (
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit animate-in fade-in slide-in-from-left-4 duration-300">
              {segments.map((seg) => (
                <button
                  key={seg.id}
                  onClick={() => setSegmentFilter(seg.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    segmentFilter === seg.id
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                      : 'text-text-secondary hover:text-text-main'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{seg.icon}</span>
                  {seg.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <CourseFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        segmentFilter={segmentFilter}
        onSegmentChange={setSegmentFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        availableSegments={activeTab === 'courses' ? availableSegments : []}
        showSegmentFilter={false} // Hidden because we now have the big buttons above
      />

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'courses' ? (
            filteredCourses.length > 0 ? filteredCourses.map(course => (
              <CourseCard 
                key={course.course_id} 
                course={course} 
                onDelete={handleDeleteClick}
              />
            )) : <NoDataFound />
          ) : (
            filteredPackages.length > 0 ? filteredPackages.map(pkg => (
              <PackageCard 
                key={pkg.package_id} 
                pkg={pkg} 
              />
            )) : <NoDataFound />
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <DataTable 
            data={activeTab === 'courses' ? filteredCourses : filteredPackages}
            columns={activeTab === 'courses' ? courseColumns : packageColumns}
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

const NoDataFound = () => (
  <div className="col-span-full py-20 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl bg-surface-light dark:bg-surface-dark">
    <span className="material-symbols-outlined text-text-secondary/20 text-6xl mb-4">search_off</span>
    <h3 className="text-lg font-bold text-text-main dark:text-white">No items found</h3>
    <p className="text-sm text-text-secondary">Try adjusting your search or filters.</p>
  </div>
);

export default Courses;
