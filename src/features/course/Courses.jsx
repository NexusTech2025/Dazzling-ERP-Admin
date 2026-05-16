import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCoursesQuery, useDeleteCourseMutation, usePackagesQuery } from './hooks/useCourseQueries';
import { queryKeys } from '../../lib/react-query/queryKeys';

// UI Components
import DataTable from '../../components/ui/DataTable';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Badge from '../../components/ui/Badge';
import ButtonGroupFilter from '../../components/ui/filters/ButtonGroupFilter';
import SelectGroupFilter from '../../components/ui/filters/SelectGroupFilter';

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
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');

  const { data: courses = [], isLoading: isLoadingCourses, error: coursesError } = useCoursesQuery();
  const { data: packages = [], isLoading: isLoadingPackages, error: packagesError } = usePackagesQuery();
  const deleteMutation = useDeleteCourseMutation();

  // Filter Logic - Courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.course_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSegment = !segmentFilter || c.segment_id === segmentFilter;
      const matchesBoard = !boardFilter || c.metadata?.board === boardFilter;
      const matchesClass = !classFilter || String(c.metadata?.class) === classFilter;
      const matchesLanguage = !languageFilter || c.language_medium === languageFilter;
      
      return matchesSearch && matchesSegment && matchesBoard && matchesClass && matchesLanguage;
    });
  }, [courses, searchQuery, segmentFilter, boardFilter, classFilter, languageFilter]);

  // Filter Logic - Packages
  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.package_id.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Note: Packages currently don't have segment_id in schema, but they have target_class and board.
      // We assume Academic segment if board or target_class is present.
      const isAcademic = !!(p.board || p.target_class);
      const matchesSegment = !segmentFilter || 
                            (segmentFilter === 'SEG-ACA' && isAcademic) || 
                            (segmentFilter !== 'SEG-ACA' && !isAcademic);

      const matchesBoard = !boardFilter || p.board === boardFilter;
      const matchesClass = !classFilter || String(p.target_class) === classFilter;
      
      // Language filtering for packages (matches description or name metadata for now)
      const matchesLanguage = !languageFilter || 
                             (languageFilter === 'Hindi' && p.name.includes('Hindi')) ||
                             (languageFilter === 'English' && (p.name.includes('English') || p.name.includes('CBSE')));

      return matchesSearch && matchesSegment && matchesBoard && matchesClass && matchesLanguage;
    });
  }, [packages, searchQuery, segmentFilter, boardFilter, classFilter, languageFilter]);

  const availableSegments = useMemo(() => {
    const segments = courses.map(c => c.segment_id);
    return [...new Set(segments)];
  }, [courses]);

  const handleDeleteClick = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  // --- Filter Options ---
  
  const tabOptions = [
    { label: 'Courses', value: 'courses', icon: 'school' },
    { label: 'Packages', value: 'packages', icon: 'inventory_2' }
  ];

  const segmentOptions = [
    { label: 'All', value: '', icon: 'apps' },
    { label: 'Academic', value: 'SEG-ACA', icon: 'menu_book' },
    { label: 'Computer', value: 'SEG-CMP', icon: 'computer' },
    { label: 'Foundation', value: 'SEG-FND', icon: 'foundation' }
  ];

  const languageOptions = [
    { label: 'ALL', value: '' },
    { label: 'HINDI', value: 'Hindi' },
    { label: 'ENGLISH', value: 'English' }
  ];

  const boardOptions = [
    { label: 'ALL', value: '' },
    { label: 'CBSE', value: 'CBSE' },
    { label: 'RBSE', value: 'RBSE' },
    { label: 'ICSE', value: 'ICSE' },
    { label: 'IB', value: 'IB' }
  ];

  const classOptions = [...Array(12)].map((_, i) => ({
    label: `Class ${i + 1}`,
    value: String(i + 1)
  }));

  const courseColumns = [
    {
      header: 'Course Name',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">
            {row.name ? row.name.substring(0, 2).toUpperCase() : '??'}
          </div>
          <div>
            <p className="font-bold text-text-main dark:text-white leading-none">{row.name}</p>
            <p className="text-[10px] text-text-secondary mt-1 font-mono">{row.language_medium} • {row.metadata?.board || 'N/A'}</p>
          </div>
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
  if (coursesError || packagesError) return <ErrorState message={(coursesError || packagesError).message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.course.all })} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <CourseHeader activeTab={activeTab} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Main Tabs Selection */}
          <ButtonGroupFilter 
            options={tabOptions} 
            value={activeTab} 
            onChange={(val) => {
              setActiveTab(val);
              setSegmentFilter('');
              setBoardFilter('');
              setClassFilter('');
              setLanguageFilter('');
            }} 
          />

          {/* Segment Filter (Shared for both tabs) */}
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <ButtonGroupFilter 
              options={segmentOptions} 
              value={segmentFilter} 
              variant="secondary"
              onChange={(val) => {
                setSegmentFilter(val);
                if (val !== 'SEG-ACA') {
                  setBoardFilter('');
                  setClassFilter('');
                  setLanguageFilter('');
                }
              }} 
            />
          </div>

          {/* Academic Specialized Filters (Shared for both tabs when segment is Academic) */}
          {segmentFilter === 'SEG-ACA' && (
            <div className="flex flex-wrap items-center gap-4 animate-in zoom-in duration-300">
              <ButtonGroupFilter 
                label="Medium"
                options={languageOptions} 
                value={languageFilter} 
                size="sm"
                variant="secondary"
                onChange={setLanguageFilter} 
              />

              <ButtonGroupFilter 
                label="Board"
                options={boardOptions} 
                value={boardFilter} 
                size="sm"
                onChange={setBoardFilter} 
              />

              <SelectGroupFilter 
                label="Class"
                options={classOptions}
                value={classFilter}
                onChange={setClassFilter}
                defaultLabel="All Classes"
              />
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
        showSegmentFilter={false} 
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
