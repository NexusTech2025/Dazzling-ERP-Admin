import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MobileListView from '../../../components/ui/v2/MobileListView';
import KpiCard from '../../../components/ui/v2/KpiCard';
import KpiGrid from '../../../components/ui/v2/KpiGrid';
import RefreshButton from '../../../components/ui/btn/RefreshButton';
import { SearchInput, SelectFilter } from '../../../components/ui/filters';
import { StudentsMobileView } from './StudentsMobileView';
import SelectionActionBar from '../../../components/ui/v2/SelectionActionBar';

/**
 * Domain Wrapper Component for Student Directory Mobile View.
 * Composes <MobileListView> compound slots (Header, Hero, Filter, List, FAB, ActionBar) cleanly.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {Object} props.controller - Consolidated object returned by useStudentListView hook.
 * @returns {React.JSX.Element} Composed mobile student directory view.
 */
export function StudentMobileListView({ controller }) {
  const navigate = useNavigate();
  const [showMetricsGrid, setShowMetricsGrid] = useState(false);

  const { data, status, filterState, selectionState, modals, actions } = controller;
  const { filteredStudents, kpiMetrics } = data;
  const { isLoading, isFetching, error } = status;
  const {
    searchQuery,
    setSearchQuery,
    batchFilter,
    setBatchFilter,
    courseFilter,
    setCourseFilter,
    availableBatches,
    availableCourses,
    kpiFilter,
    toggleKpiFilter
  } = filterState;

  const { selectedIds, toggleSelect, clearSelection } = selectionState;
  const { setDeleteModal } = modals;
  const { handlers, handleRefresh } = actions;

  const activeFilterLabel = kpiFilter !== 'All' 
    ? kpiFilter.replace('_', ' ').toUpperCase()
    : null;

  return (
    <MobileListView
      isLoading={isLoading}
      error={error}
      isEmpty={filteredStudents.length === 0}
      selectedIds={selectedIds}
      onClearSelection={clearSelection}
    >
      {/* Slot 1: Header with Back Arrow to Admin Dashboard */}
      <MobileListView.Header
        title="Student Directory"
        renderLeft={
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="p-1 -ml-1 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer"
            title="Back to Admin Dashboard"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
        }
        renderRight={
          <div className="flex items-center gap-1.5">
            <RefreshButton isFetching={isFetching} onRefresh={handleRefresh} />
            <button
              type="button"
              className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">download</span>
            </button>
          </div>
        }
      >
        <p className="text-[11px] font-medium text-text-secondary mt-0.5">
          {filteredStudents.length.toLocaleString()} Students {activeFilterLabel ? `• Filtered: ${activeFilterLabel}` : ''}
        </p>
      </MobileListView.Header>

      {/* Slot 2: Consolidated Hero Card + Collapsible 3x2 Secondary KPI Grid */}
      <MobileListView.Hero>
        <div className="space-y-2">
          {/* Consolidated Hero Card: Total Students + Active/Inactive Sub-Pills */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div onClick={() => toggleKpiFilter('All')} className="cursor-pointer">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {kpiMetrics.total.toLocaleString()}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMetricsGrid(prev => !prev)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">analytics</span>
                  <span>Metrics</span>
                  <span className="material-symbols-outlined text-sm">
                    {showMetricsGrid ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>
            </div>

            {/* Active & Inactive Sub-Pills */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                <span className="size-1.5 rounded-full bg-emerald-500"></span>
                {kpiMetrics.active.toLocaleString()} Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <span className="size-1.5 rounded-full bg-slate-400"></span>
                {kpiMetrics.inactive.toLocaleString()} Inactive
              </span>
            </div>
          </div>

          {/* Collapsible Symmetrical 3x2 Secondary KPI Grid (6 Cards) */}
          {showMetricsGrid && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200 pt-1">
              <KpiGrid cols={3} smCols={3} gap={2}>
                <div onClick={() => toggleKpiFilter('fee_due')} className="cursor-pointer">
                  <KpiCard
                    label="Fee Due"
                    value={kpiMetrics.feeDueCount}
                    icon="payments"
                    variant="warning"
                    size="sm"
                    isCount
                    className={kpiFilter === 'fee_due' ? 'border-amber-500 ring-2 ring-amber-500/20' : ''}
                  />
                </div>
                <div onClick={() => toggleKpiFilter('overdue')} className="cursor-pointer">
                  <KpiCard
                    label="Overdue"
                    value={kpiMetrics.overdueCount}
                    icon="warning"
                    variant="danger"
                    size="sm"
                    isCount
                    className={kpiFilter === 'overdue' ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}
                  />
                </div>
                <div onClick={() => toggleKpiFilter('paid_full')} className="cursor-pointer">
                  <KpiCard
                    label="Paid Full"
                    value={kpiMetrics.paidFullCount}
                    icon="verified"
                    variant="success"
                    size="sm"
                    isCount
                    className={kpiFilter === 'paid_full' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}
                  />
                </div>
                <div onClick={() => toggleKpiFilter('new_admissions')} className="cursor-pointer">
                  <KpiCard
                    label="New Reg."
                    value={kpiMetrics.newAdmissionsCount}
                    icon="person_add"
                    variant="info"
                    size="sm"
                    isCount
                    className={kpiFilter === 'new_admissions' ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}
                  />
                </div>
                <div onClick={() => toggleKpiFilter('low_attendance')} className="cursor-pointer">
                  <KpiCard
                    label="Low Attn"
                    value={kpiMetrics.lowAttendanceCount}
                    icon="event_busy"
                    variant="danger"
                    size="sm"
                    isCount
                    className={kpiFilter === 'low_attendance' ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}
                  />
                </div>
                <div onClick={() => toggleKpiFilter('unassigned')} className="cursor-pointer">
                  <KpiCard
                    label="Unassigned"
                    value={kpiMetrics.unassignedCount}
                    icon="group_off"
                    variant="warning"
                    size="sm"
                    isCount
                    className={kpiFilter === 'unassigned' ? 'border-amber-500 ring-2 ring-amber-500/20' : ''}
                  />
                </div>
              </KpiGrid>
            </div>
          )}
        </div>
      </MobileListView.Hero>

      {/* Slot 3: Search & Dropdown Filter Bar */}
      <MobileListView.Filter>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name, ID, or email"
              />
            </div>
            <button
              type="button"
              className="size-10 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-center justify-center text-text-secondary hover:text-primary transition-colors shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">tune</span>
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <SelectFilter value={batchFilter} onChange={setBatchFilter} options={availableBatches} defaultLabel="Batch: All" />
            <SelectFilter value={courseFilter} onChange={setCourseFilter} options={availableCourses} defaultLabel="Course: All" />
          </div>
        </div>
      </MobileListView.Filter>

      {/* Slot 4: Scrollable List Area */}
      <MobileListView.List emptyMessage="No students found matching your filters.">
        <StudentsMobileView
          students={filteredStudents}
          selectedIds={selectedIds}
          onSelectRow={toggleSelect}
          handlers={handlers}
        />
      </MobileListView.List>

      {/* Slot 5: Floating Action Button */}
      <MobileListView.FAB>
        <Link
          to="/admin/students/add"
          className="size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary-dark transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </Link>
      </MobileListView.FAB>

      {/* Slot 6: Selection Action Bar */}
      <MobileListView.ActionBar>
        <SelectionActionBar
          selectedCount={selectedIds.length}
          itemName="student"
          onClear={clearSelection}
          onDeleteSelected={() => {
            setDeleteModal({
              isOpen: true,
              id: selectedIds,
              name: `${selectedIds.length} selected students`,
              type: 'bulk_student',
              status: 'idle',
              resultMessage: null
            });
          }}
        />
      </MobileListView.ActionBar>
    </MobileListView>
  );
}

export default StudentMobileListView;
