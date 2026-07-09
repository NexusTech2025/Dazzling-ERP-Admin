import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MobileBaseLayout from '../../../components/layout/MobileBaseLayout';
import MobileBatchCard from './MobileBatchCard';

/**
 * MobileBatchListView: Displays the mobile batches list directory layout,
 * composed inside MobileBaseLayout slots.
 */
export const MobileBatchListView = ({
  filteredBatches = [],
  isLoading = false,
  searchQuery = '',
  setSearchQuery,
  statusFilter = 'all',
  setStatusFilter,
  courseFilter = 'all',
  setCourseFilter,
  courseTypeFilter = 'all',
  setCourseTypeFilter,
  classFilter = 'all',
  setClassFilter,
  timingFilter = 'all',
  setTimingFilter,
  availableStatuses = ["active", "inactive", "completed", "pending", "canceled"],
  availableCourses = [],
  availableClasses = [],
  courseTypes = [],
  selectedIds = [],
  toggleSelect,
  setDeleteModal,
  isFetching = false,
  handleRefresh
}) => {
  const navigate = useNavigate();
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Helper to handle general actions click
  const handleActionClick = (actionName) => {
    setIsFabOpen(false);
    if (actionName === 'Delete Batches' && selectedIds.length > 0) {
      setDeleteModal({
        isOpen: true,
        id: selectedIds,
        name: `${selectedIds.length} selected batches`,
        type: 'bulk_batch',
        status: 'idle',
        resultMessage: null
      });
    } else {
      alert(`Triggered action: ${actionName}`);
    }
  };

  // Determine if the selected course type is Academic
  const selectedCourseTypeObj = courseTypes.find(ct => (ct.segment_id === courseTypeFilter || ct.id === courseTypeFilter));
  const isAcademicSelected = selectedCourseTypeObj?.type_name?.toLowerCase() === 'academic';

  return (
    <MobileBaseLayout>
      {/* Slot 1: Header Composition */}
      <MobileBaseLayout.Header
        title="Batch Directory"
        renderLeft={
          <button
            onClick={() => navigate('/admin')}
            className="size-9 rounded-full flex items-center justify-center text-text-main dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        }
        renderRight={
          <Link
            to="/admin/batches/add"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3.5 py-2.5 rounded-xl text-xs font-black shadow-md shadow-primary/10 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">add</span>
            <span>New Batch</span>
          </Link>
        }
      />

      {/* Slot 2: Filter Slot Composition */}
      <MobileBaseLayout.FilterSlot>
        <div className="flex flex-col gap-3 w-full">
          {/* Search Input Box */}
          <div className="flex gap-2.5 items-center w-full">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batch, teacher, course..."
                className="w-full bg-slate-50 dark:bg-black/20 border border-border-light dark:border-white/8 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-text-main dark:text-white outline-none focus:border-primary focus:bg-white dark:focus:bg-black/40 transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <button className="size-11 flex-shrink-0 flex items-center justify-center bg-slate-50 dark:bg-black/20 border border-border-light dark:border-white/8 rounded-2xl text-text-secondary hover:text-text-main dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>

          {/* Horizontal Scroll Filter Dropdowns */}
          <div className="flex overflow-x-auto gap-2 pb-1.5 scrollbar-hide -mx-4 px-4 w-[calc(100%+2rem)]">
            {/* Status Dropdown */}
            <div className="relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pr-8 pl-8 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
              >
                <option value="all">Status: All</option>
                {availableStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <span className={`size-1.5 rounded-full absolute left-3.5 top-1/2 -translate-y-1/2 ${statusFilter === 'active' ? 'bg-emerald-500' :
                statusFilter === 'upcoming' ? 'bg-amber-500' :
                  statusFilter === 'all' ? 'bg-slate-400' : 'bg-red-500'
                }`}></span>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-text-secondary">keyboard_arrow_down</span>
            </div>

            {/* Course Dropdown */}
            <div className="relative shrink-0">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
              >
                <option value="all">Course: All</option>
                {availableCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-text-secondary">keyboard_arrow_down</span>
            </div>

            {/* Course Type Dropdown */}
            <div className="relative shrink-0">
              <select
                value={courseTypeFilter}
                onChange={(e) => setCourseTypeFilter(e.target.value)}
                className="appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
              >
                <option value="all">Type: All</option>
                {courseTypes.map(ct => (
                  <option key={ct.segment_id || ct.id} value={ct.segment_id || ct.id}>
                    {ct.type_name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-text-secondary">keyboard_arrow_down</span>
            </div>

            {/* Class Dropdown - shown only when the Course Type is Academic */}
            {isAcademicSelected && (
              <div className="relative shrink-0 animate-in fade-in zoom-in-95 duration-200">
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
                >
                  <option value="all">Class: All</option>
                  {availableClasses.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-text-secondary">keyboard_arrow_down</span>
              </div>
            )}

            {/* Timing Dropdown */}
            <div className="relative shrink-0">
              <select
                value={timingFilter}
                onChange={(e) => setTimingFilter(e.target.value)}
                className="appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
              >
                <option value="all">Timing: All</option>
                <option value="early_morning">Early Morning</option>
                <option value="morning">Morning</option>
                <option value="noon">Noon</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-text-secondary">keyboard_arrow_down</span>
            </div>

            {/* Sort Dropdown (Placeholder) */}
            <div className="relative shrink-0">
              <select
                className="appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all"
              >
                <option value="recent">Sort: Recently Added</option>
                <option value="alphabetical">Sort: Alphabetical</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-text-secondary">keyboard_arrow_down</span>
            </div>
          </div>
        </div>
      </MobileBaseLayout.FilterSlot>

      {/* Slot 3: Scrollable Cards Body */}
      <MobileBaseLayout.ListSlot
        isEmpty={filteredBatches.length === 0}
        renderEmptyState={
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark">
            <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">calendar_today</span>
            <p className="text-sm font-semibold text-text-main dark:text-white">No batches found</p>
          </div>
        }
      >
        <div className="flex flex-col gap-3.5 pb-20">
          {/* Header Count info */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-text-secondary dark:text-slate-400 uppercase font-black tracking-widest">
              Batch List
            </p>
            <p className="text-[10px] text-text-secondary dark:text-slate-400 font-bold">
              Showing {filteredBatches.length} items
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-xs text-text-secondary">Loading batches...</p>
            </div>
          ) : (
            filteredBatches.map((batch) => (
              <MobileBatchCard
                key={batch.batch_id}
                batch={batch}
                isSelected={selectedIds.includes(batch.batch_id)}
                onSelectToggle={() => toggleSelect(batch.batch_id)}
                onView={() => navigate(`/admin/batches/${batch.batch_id}`)}
                onEdit={() => navigate(`/admin/batches/edit/${batch.batch_id}`)}
                onDelete={() => setDeleteModal({
                  isOpen: true,
                  id: batch.batch_id,
                  name: batch.batch_name,
                  type: 'batch',
                  status: 'idle',
                  resultMessage: null
                })}
              />
            ))
          )}
        </div>
      </MobileBaseLayout.ListSlot>

      {/* Slot 4: Floating Action Button (FAB) Menu */}
      <MobileBaseLayout.FloatingActionSlot>
        <div className="relative">
          {/* Hover Menu Popover */}
          {isFabOpen && (
            <div className="absolute bottom-14 right-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-30 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">

              <button
                onClick={() => handleActionClick('Import Batches')}
                className="px-4 py-2.5 text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 font-semibold transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>Import Batches</span>
              </button>

              <button
                onClick={() => handleActionClick('Export Batches')}
                className="px-4 py-2.5 text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 font-semibold transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                <span>Export Batches</span>
              </button>

              <button
                onClick={() => handleActionClick('Batch Report')}
                className="px-4 py-2.5 text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 font-semibold transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                <span>Batch Report</span>
              </button>

              <button
                onClick={() => handleActionClick('Assign Teacher')}
                className="px-4 py-2.5 text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 font-semibold transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Assign Teacher</span>
              </button>

              <button
                onClick={() => handleActionClick('Bulk Edit')}
                className="px-4 py-2.5 text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 font-semibold transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                <span>Bulk Edit</span>
              </button>

              <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />

              <button
                onClick={() => handleActionClick('Delete Batches')}
                className={`px-4 py-2.5 text-xs flex items-center gap-3 font-semibold transition-colors cursor-pointer text-left ${selectedIds.length > 0
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                  : 'text-slate-300 dark:text-slate-600 pointer-events-none'
                  }`}
                disabled={selectedIds.length === 0}
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                <span>Delete Batches</span>
              </button>

            </div>
          )}

          {/* Trigger Circle Button */}
          <button
            onClick={() => setIsFabOpen(prev => !prev)}
            className={`size-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer z-30 ${isFabOpen
              ? 'bg-slate-800 dark:bg-slate-700 text-white rotate-45'
              : 'bg-primary hover:bg-primary-dark text-white'
              }`}
          >
            <span className="material-symbols-outlined text-[24px]">bolt</span>
          </button>
        </div>
      </MobileBaseLayout.FloatingActionSlot>
    </MobileBaseLayout>
  );
};

export default MobileBatchListView;
