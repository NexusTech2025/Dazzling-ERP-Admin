import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCoursesQuery, useDeleteCourseMutation, usePackagesQuery, useCourseTypesQuery, useDeletePackageMutation } from './hooks/useCourseQueries';
import { queryKeys } from '../../lib/react-query/queryKeys';
import useSelection from '../../hooks/useSelection';
import useDeleteManyMutation from '../../hooks/useDeleteManyMutation';
import SelectionActionBar from '../../components/ui/v2/SelectionActionBar';
import useSelectableTable from '../../hooks/useSelectableTable';
import { API_REGISTRY } from '../../services/apiRegistry';
import { TabGroup, TabButton } from '../../components/ui/v2/Tabs';

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
import PackageCard from './components/PackageCard';
import CourseListView from './components/CourseListView';
import CourseGridView from './components/CourseGridView';
import MainLayout from '../../components/layout/MainLayout';

const Courses = ({ defaultTab = 'courses' }) => {
  const queryClient = useQueryClient();
  const [isSticky, setIsSticky] = useState(false);
  const handleBodyScroll = (e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => {
      if (prev !== shouldBeSticky) return shouldBeSticky;
      return prev;
    });
  };

  const [activeTab, setTab] = useState(defaultTab);
  const setActiveTab = (val) => {
    setTab(val);
  };
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '', type: 'course', status: 'idle', resultMessage: null });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');

  const { data: courses = [], isLoading: isLoadingCourses, isFetching: isFetchingCourses, error: coursesError } = useCoursesQuery();
  const { data: packages = [], isLoading: isLoadingPackages, error: packagesError } = usePackagesQuery();
  const { data: courseTypes = [], isLoading: isLoadingTypes, error: typesError } = useCourseTypesQuery();
  const deleteMutation = useDeleteCourseMutation();
  const deletePackageMutation = useDeletePackageMutation();

  const selection = useSelection();
  const {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected
  } = selection;

  const deleteManyPackagesMutation = useDeleteManyMutation(
    'Package',
    [
      queryKeys.course.package.all,
      queryKeys.course.packageItem.all,
      queryKeys.course.packagePerk.all
    ],
    API_REGISTRY.ACADEMIC.DELETE_MANY_PACKAGES
  );

  const deleteManyCoursesMutation = useDeleteManyMutation(
    'Course',
    [queryKeys.course.all]
  );

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

  const selectedType = useMemo(() => {
    return courseTypes.find(t => t.segment_id === segmentFilter);
  }, [courseTypes, segmentFilter]);

  const isAcademicFilterActive = useMemo(() => {
    if (!segmentFilter) return false;
    return selectedType 
      ? (selectedType.entity_label === 'Subject' || selectedType.segment_name?.toLowerCase().includes('academic'))
      : false;
  }, [selectedType, segmentFilter]);

  // Filter Logic - Packages
  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.package_id.toLowerCase().includes(searchQuery.toLowerCase());

      // Note: Packages currently don't have segment_id in schema, but they have target_class and board.
      // We assume Academic segment if board or target_class is present.
      const isAcademic = !!(p.board || p.target_class);
      const matchesSegment = !segmentFilter ||
        (isAcademicFilterActive && isAcademic) ||
        (!isAcademicFilterActive && !isAcademic);

      const matchesBoard = !boardFilter || p.board === boardFilter;
      const matchesClass = !classFilter || String(p.target_class) === classFilter;

      // Language filtering for packages (matches description or name metadata for now)
      const matchesLanguage = !languageFilter ||
        (languageFilter === 'Hindi' && p.name.includes('Hindi')) ||
        (languageFilter === 'English' && (p.name.includes('English') || p.name.includes('CBSE')));

      return matchesSearch && matchesSegment && matchesBoard && matchesClass && matchesLanguage;
    });
  }, [packages, searchQuery, segmentFilter, isAcademicFilterActive, boardFilter, classFilter, languageFilter]);

  const availableSegments = useMemo(() => {
    const segments = courses.map(c => c.segment_id);
    return [...new Set(segments)];
  }, [courses]);

  const handleDeleteClick = (id, name, type = 'course') => {
    setDeleteModal({ isOpen: true, id, name, type, status: 'idle', resultMessage: null });
  };

  // --- Filter Options ---

  const segmentOptions = useMemo(() => {
    return [
      { label: 'All', value: '', icon: 'apps' },
      ...courseTypes.map(type => {
        let icon = 'school';
        const nameLower = type.segment_name?.toLowerCase() || '';
        if (nameLower.includes('computer')) icon = 'computer';
        else if (nameLower.includes('foundation')) icon = 'star';
        else if (nameLower.includes('academic') || type.entity_label === 'Subject') icon = 'menu_book';
        
        return {
          label: type.segment_name,
          value: type.segment_id,
          icon: icon
        };
      })
    ];
  }, [courseTypes]);

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

  const basePackageColumns = useMemo(() => [
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
      accessor: 'package_fee',
      className: 'text-right font-black text-primary',
      cell: (row) => `₹${row.package_fee?.toLocaleString()}`
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
          <Link to={`/admin/packages/edit/${row.package_id}`} className="p-1.5 text-text-secondary hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </Link>
          <button 
            onClick={() => handleDeleteClick(row.package_id, row.name, 'package')}
            className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      )
    }
  ], []);

  const packageColumns = useSelectableTable({
    columns: basePackageColumns,
    data: filteredPackages,
    idKey: 'package_id',
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
    isSomeSelected
  });

  const deleteMessage = useMemo(() => {
    if (deleteModal.type === 'bulk_package') {
      return `Are you sure you want to delete ${deleteModal.name}? This will cascadingly delete associated perks and course links. This action is permanently blocked if active student enrollments exist.`;
    }
    if (deleteModal.type === 'bulk_course') {
      return `Are you sure you want to archive ${deleteModal.name}? They will no longer be available for new enrollments.`;
    }
    return deleteModal.type === 'package'
      ? `Are you sure you want to delete "${deleteModal.name}"? This will cascadingly delete perks and course links. This action is blocked if students are enrolled.`
      : `Are you sure you want to archive "${deleteModal.name}"? It will no longer be available for new enrollments.`;
  }, [deleteModal.type, deleteModal.name]);

  const deleteTitle = useMemo(() => {
    if (deleteModal.type === 'bulk_package') {
      return 'Delete Multiple Packages';
    }
    if (deleteModal.type === 'bulk_course') {
      return 'Archive Multiple Courses';
    }
    return deleteModal.type === 'package' ? 'Delete Package' : 'Archive Course';
  }, [deleteModal.type]);

  const isDeleteProcessing = useMemo(() => {
    if (deleteModal.type === 'bulk_package') {
      return deleteManyPackagesMutation.isPending;
    }
    if (deleteModal.type === 'bulk_course') {
      return deleteManyCoursesMutation.isPending;
    }
    return deleteModal.type === 'package' ? deletePackageMutation.isPending : deleteMutation.isPending;
  }, [deleteModal.type, deleteManyPackagesMutation.isPending, deleteManyCoursesMutation.isPending, deletePackageMutation.isPending, deleteMutation.isPending]);

  if (isLoadingCourses || isLoadingPackages || isLoadingTypes) return <LoadingState message="Scanning curriculum library..." />;
  if (coursesError || packagesError || typesError) return <ErrorState message={(coursesError || packagesError || typesError)?.message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.course.all })} />;

  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      header={
        <div
          className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
            isSticky
              ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">school</span>
              <span className="text-sm font-bold text-text-main dark:text-white">
                {activeTab === 'courses' ? 'Curriculum Library' : 'Course Packages'}
              </span>
            </div>
          </div>
        </div>
      }
      body={
        <div className="pt-6 lg:pt-10 pb-6 space-y-6">
          <CourseHeader
            activeTab={activeTab}
            isFetching={isFetchingCourses}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.course.all })}
          />

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Main Tabs Selection */}
              <TabGroup>
                <TabButton
                  active={activeTab === 'courses'}
                  onClick={() => {
                    setActiveTab('courses');
                    clearSelection();
                    setSegmentFilter('');
                    setBoardFilter('');
                    setClassFilter('');
                    setLanguageFilter('');
                  }}
                  icon="school"
                >
                  Courses
                </TabButton>
                <TabButton
                  active={activeTab === 'packages'}
                  onClick={() => {
                    setActiveTab('packages');
                    clearSelection();
                    setSegmentFilter('');
                    setBoardFilter('');
                    setClassFilter('');
                    setLanguageFilter('');
                  }}
                  icon="inventory_2"
                >
                  Packages
                </TabButton>
              </TabGroup>

              {/* Segment Filter (Shared for both tabs) */}
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <ButtonGroupFilter
                  options={segmentOptions}
                  value={segmentFilter}
                  variant="secondary"
                  onChange={(val) => {
                    setSegmentFilter(val);
                    const selected = courseTypes.find(t => t.segment_id === val);
                    const isAcademic = selected 
                      ? (selected.entity_label === 'Subject' || selected.segment_name?.toLowerCase().includes('academic'))
                      : false;
                    
                    if (!isAcademic) {
                      setBoardFilter('');
                      setClassFilter('');
                      setLanguageFilter('');
                    }
                  }}
                />
              </div>

              {/* Academic Specialized Filters (Shared for both tabs when segment is Academic) */}
              {isAcademicFilterActive && (
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
            activeTab === 'courses' ? (
              <CourseGridView
                courses={filteredCourses}
                onDelete={handleDeleteClick}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredPackages.map(pkg => (
                  <PackageCard
                    key={pkg.package_id}
                    pkg={pkg}
                    isSelected={selectedIds.includes(pkg.package_id)}
                    onToggleSelect={() => toggleSelect(pkg.package_id)}
                    isSelectionModeActive={selectedIds.length > 0}
                  />
                ))}

                {/* Add New Course Package Placeholder Card */}
                {selectedIds.length === 0 && (
                  <Link
                    to="/admin/packages/add"
                    className="border-2 border-dashed border-border-light dark:border-slate-800/80 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:border-primary/50 hover:bg-primary/[0.01] transition-all cursor-pointer min-h-[180px] gap-4 group"
                  >
                    <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-secondary dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all border border-border-light dark:border-slate-800">
                      <span className="material-symbols-outlined text-2xl font-bold leading-none">add</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-black text-text-main dark:text-white group-hover:text-primary transition-colors">
                        Add New Course Package
                      </p>
                      <p className="text-xs text-text-secondary font-medium px-4">
                        Bundle courses and define pricing for specific student cohorts.
                      </p>
                    </div>
                  </Link>
                )}

                {filteredPackages.length === 0 && selectedIds.length > 0 && <NoDataFound />}
              </div>
            )
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              {activeTab === 'courses' ? (
                <CourseListView
                  courses={filteredCourses}
                  onDelete={handleDeleteClick}
                  selection={selection}
                />
              ) : (
                <DataTable
                  data={filteredPackages}
                  columns={packageColumns}
                  isLoading={false}
                />
              )}
            </div>
          )}

          {/* Floating Selection Action Bar for Packages */}
          {activeTab === 'packages' && selectedIds.length > 0 && (
            <SelectionActionBar
              selectedCount={selectedIds.length}
              itemName="package"
              onClear={clearSelection}
              onDeleteSelected={() => {
                setDeleteModal({
                  isOpen: true,
                  id: selectedIds,
                  name: `${selectedIds.length} selected packages`,
                  type: 'bulk_package',
                  status: 'idle',
                  resultMessage: null
                });
              }}
              onDeleteAll={() => {
                const allIds = filteredPackages.map(p => p.package_id);
                setDeleteModal({
                  isOpen: true,
                  id: allIds,
                  name: `all ${allIds.length} packages matching current filters`,
                  type: 'bulk_package',
                  status: 'idle',
                  resultMessage: null
                });
              }}
            />
          )}

          {/* Floating Selection Action Bar for Courses */}
          {activeTab === 'courses' && viewMode === 'list' && selectedIds.length > 0 && (
            <SelectionActionBar
              selectedCount={selectedIds.length}
              itemName="course"
              onClear={clearSelection}
              onDeleteSelected={() => {
                setDeleteModal({
                  isOpen: true,
                  id: selectedIds,
                  name: `${selectedIds.length} selected courses`,
                  type: 'bulk_course',
                  status: 'idle',
                  resultMessage: null
                });
              }}
              onDeleteAll={() => {
                const allIds = filteredCourses.map(c => c.course_id);
                setDeleteModal({
                  isOpen: true,
                  id: allIds,
                  name: `all ${allIds.length} courses matching current filters`,
                  type: 'bulk_course',
                  status: 'idle',
                  resultMessage: null
                });
              }}
            />
          )}

          <ConfirmModal
            isOpen={deleteModal.isOpen}
            status={deleteModal.status}
            resultMessage={deleteModal.resultMessage}
            onClose={() => setDeleteModal({ isOpen: false, id: null, name: '', type: 'course', status: 'idle', resultMessage: null })}
            onConfirm={() => {
              setDeleteModal(prev => ({ ...prev, status: 'processing' }));
              if (deleteModal.type === 'bulk_package') {
                deleteManyPackagesMutation.mutate({ ids: deleteModal.id }, {
                  onSuccess: (res) => {
                    if (res.success) {
                      const manifest = res.data?.manifest || {};
                      const deleted = manifest.deleted || [];
                      const failed = manifest.failed || {};
                      const failedCount = Object.keys(failed).length;
                      
                      let msg = `Successfully deleted ${deleted.length} packages.`;
                      if (failedCount > 0) {
                        msg += ` Failed to delete ${failedCount} packages due to referential constraints.`;
                      }
                      
                      setDeleteModal(prev => ({
                        ...prev,
                        status: failedCount > 0 && deleted.length === 0 ? 'error' : 'success',
                        resultMessage: msg
                      }));
                      
                      if (deleted.length > 0) {
                        setSelectedIds(prev => prev.filter(id => !deleted.includes(id)));
                      }
                    } else {
                      setDeleteModal(prev => ({
                        ...prev,
                        status: 'error',
                        resultMessage: res.message || 'Failed to delete packages.'
                      }));
                    }
                  },
                  onError: (err) => {
                    setDeleteModal(prev => ({
                      ...prev,
                      status: 'error',
                      resultMessage: err.message || 'An unexpected error occurred.'
                    }));
                  }
                });
              } else if (deleteModal.type === 'bulk_course') {
                deleteManyCoursesMutation.mutate({ ids: deleteModal.id }, {
                  onSuccess: (res) => {
                    if (res.success) {
                      const manifest = res.data?.manifest || {};
                      const deleted = manifest.deleted || [];
                      const failed = manifest.failed || {};
                      const failedCount = Object.keys(failed).length;
                      
                      let msg = `Successfully archived ${deleted.length} courses.`;
                      if (failedCount > 0) {
                        msg += ` Failed to archive ${failedCount} courses due to referential constraints.`;
                      }
                      
                      setDeleteModal(prev => ({
                        ...prev,
                        status: failedCount > 0 && deleted.length === 0 ? 'error' : 'success',
                        resultMessage: msg
                      }));
                      
                      if (deleted.length > 0) {
                        setSelectedIds(prev => prev.filter(id => !deleted.includes(id)));
                      }
                    } else {
                      setDeleteModal(prev => ({
                        ...prev,
                        status: 'error',
                        resultMessage: res.message || 'Failed to archive courses.'
                      }));
                    }
                  },
                  onError: (err) => {
                    setDeleteModal(prev => ({
                      ...prev,
                      status: 'error',
                      resultMessage: err.message || 'An unexpected error occurred.'
                    }));
                  }
                });
              } else if (deleteModal.type === 'package') {
                deletePackageMutation.mutate({ id: deleteModal.id }, {
                  onSuccess: (res) => {
                    if (res.success) {
                      setDeleteModal(prev => ({
                        ...prev,
                        status: 'success',
                        resultMessage: `Package "${deleteModal.name}" was successfully deleted.`
                      }));
                    } else {
                      setDeleteModal(prev => ({
                        ...prev,
                        status: 'error',
                        resultMessage: res.error?.message || `Failed to delete package: ${res.message || 'Unknown error'}`
                      }));
                    }
                  },
                  onError: (err) => {
                    setDeleteModal(prev => ({
                      ...prev,
                      status: 'error',
                      resultMessage: err.message || 'An unexpected server error occurred.'
                    }));
                  }
                });
              } else {
                deleteMutation.mutate({ id: deleteModal.id }, {
                  onSuccess: (res) => {
                    if (res.success) {
                      setDeleteModal(prev => ({
                        ...prev,
                        status: 'success',
                        resultMessage: `Course "${deleteModal.name}" was successfully archived.`
                      }));
                    } else {
                      setDeleteModal(prev => ({
                        ...prev,
                        status: 'error',
                        resultMessage: res.error?.message || `Failed to archive course: ${res.message || 'Unknown error'}`
                      }));
                    }
                  },
                  onError: (err) => {
                    setDeleteModal(prev => ({
                      ...prev,
                      status: 'error',
                      resultMessage: err.message || 'An unexpected server error occurred.'
                    }));
                  }
                });
              }
            }}
            title={deleteTitle}
            message={deleteMessage}
            isProcessing={isDeleteProcessing}
          />
        </div>
      }
    />
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
