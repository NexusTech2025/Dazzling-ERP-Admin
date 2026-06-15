import React, { useMemo } from 'react';
import { useCourseWorkspaceState } from '../hooks/useCourseWorkspaceState';

// UI Components
import ButtonGroupFilter from '../../../components/ui/filters/ButtonGroupFilter';
import SelectGroupFilter from '../../../components/ui/filters/SelectGroupFilter';
import CourseFilters from '../components/CourseFilters';
import CourseGridView from '../components/CourseGridView';
import CourseListView from '../components/CourseListView';
import SelectionActionBar from '../../../components/ui/v2/SelectionActionBar';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { queryKeys } from '../../../lib/react-query/queryKeys';

/**
 * CourseWorkspace - Decoupled sub-workspace component for Subject and Course curriculum management.
 * Handles the display filters, grid view, list view, selection check bar, and course archive delete modal operations.
 *
 * @component
 * @category Components
 * @returns {React.ReactElement} The rendered Course management workspace sheet.
 */
const CourseWorkspace = () => {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    segmentFilter,
    setSegmentFilter,
    boardFilter,
    setBoardFilter,
    classFilter,
    setClassFilter,
    languageFilter,
    setLanguageFilter,
    deleteModal,
    setDeleteModal,
    handleOpenDelete,
    handleCloseDelete,
    isLoading,
    error,
    filteredCourses,
    availableSegments,
    segmentOptions,
    isAcademicFilterActive,
    selection,
    deleteMutation,
    deleteManyCoursesMutation,
    queryClient
  } = useCourseWorkspaceState();

  const {
    selectedIds,
    setSelectedIds,
    clearSelection
  } = selection;

  const renderGridSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-700/50"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-700/50 rounded w-2/3"></div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700/50 rounded w-1/3"></div>
            </div>
          </div>
          <div className="h-16 bg-slate-100 dark:bg-[#0d1622] rounded-xl w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-1/2 pt-2"></div>
        </div>
      ))}
    </div>
  );

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

  const deleteMessage = useMemo(() => {
    if (deleteModal.type === 'bulk_course') {
      return `Are you sure you want to archive ${deleteModal.name}? They will no longer be available for new enrollments.`;
    }
    return `Are you sure you want to archive "${deleteModal.name}"? It will no longer be available for new enrollments.`;
  }, [deleteModal.type, deleteModal.name]);

  const deleteTitle = useMemo(() => {
    return deleteModal.type === 'bulk_course' ? 'Archive Multiple Courses' : 'Archive Course';
  }, [deleteModal.type]);

  const isDeleteProcessing = useMemo(() => {
    return deleteModal.type === 'bulk_course' 
      ? deleteManyCoursesMutation.isPending 
      : deleteMutation.isPending;
  }, [deleteModal.type, deleteManyCoursesMutation.isPending, deleteMutation.isPending]);

  /**
   * Dispatches the API request to archive single or bulk course datasets
   * based on the staged deleteModal configurations.
   * 
   * @function handleConfirmDelete
   * @returns {void}
   */
  const handleConfirmDelete = () => {
    setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    
    if (deleteModal.type === 'bulk_course') {
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
  };

  return (
    <div className="space-y-6">
      {/* Workspace Filters (Dynamic Segment filters) */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <ButtonGroupFilter
              options={segmentOptions}
              value={segmentFilter}
              variant="secondary"
              onChange={(val) => {
                setSegmentFilter(val);
                if (!isAcademicFilterActive) {
                  setBoardFilter('');
                  setClassFilter('');
                  setLanguageFilter('');
                }
              }}
            />
          </div>

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

      {/* Course Search & Mode controls */}
      <CourseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        segmentFilter={segmentFilter}
        onSegmentChange={setSegmentFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        availableSegments={availableSegments}
        showSegmentFilter={false}
      />

      {/* Main Representation Layout */}
      {isLoading ? (
        renderGridSkeletons()
      ) : viewMode === 'grid' ? (
        <CourseGridView
          courses={filteredCourses}
          onDelete={handleOpenDelete}
        />
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <CourseListView
            courses={filteredCourses}
            onDelete={handleOpenDelete}
            selection={selection}
          />
        </div>
      )}

      {/* Floating Selection Action Bar for Courses */}
      {viewMode === 'list' && selectedIds.length > 0 && (
        <SelectionActionBar
          selectedCount={selectedIds.length}
          itemName="course"
          onClear={clearSelection}
          onDeleteSelected={() => {
            handleOpenDelete(selectedIds, `${selectedIds.length} selected courses`, 'bulk_course');
          }}
          onDeleteAll={() => {
            const allIds = filteredCourses.map(c => c.course_id);
            handleOpenDelete(allIds, `all ${allIds.length} courses matching current filters`, 'bulk_course');
          }}
        />
      )}

      {/* Deletion confirmation modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        status={deleteModal.status}
        resultMessage={deleteModal.resultMessage}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title={deleteTitle}
        message={deleteMessage}
        isProcessing={isDeleteProcessing}
      />
    </div>
  );
};

export default CourseWorkspace;
