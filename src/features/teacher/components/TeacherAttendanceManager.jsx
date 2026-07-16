import React, { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import { useIsMobile } from '../../../hooks/useIsMobile';

// Standard Design System UI Modules
import MainLayout from '../../../components/layout/MainLayout';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import DataTable from '../../../components/ui/DataTable';
import RefreshButton from '../../../components/ui/btn/RefreshButton';
import Button from '../../../components/ui/v2/Button';
import TextInput from '../../../components/ui/v2/TextInput';
import TimeFieldInput from '../../batch/components/FormField/TimeFieldInput';
import { AttendanceStatusButtons } from './attendance/AttendanceStatusButtons';

// Custom Hooks & Sub-components
import { useTeacherAttendanceStrategy } from '../../attendance/hooks/useAttendance';
import { AttendanceStatsGrid } from './attendance/AttendanceStatsGrid';
import { AttendanceFilterBar } from './attendance/AttendanceFilterBar';
import MobileTeacherAttendanceView from './attendance/MobileTeacherAttendanceView';

/**
 * ActionCell: Memoized cell wrapper for single row saves.
 */
const ActionCell = React.memo(({ row, isRowDirty, saveStatus, isEditingDisabled, commitIndividualRow }) => {
  console.log('[ActionCell] row id:', row.id, 'isRowDirty:', isRowDirty, 'saveStatus:', saveStatus);
  const handleClick = useCallback(() => {
    commitIndividualRow(row);
  }, [row, commitIndividualRow]);

  const isLoading = saveStatus === 'saving' && isRowDirty;

  return (
    <Button
      size="xs"
      variant={isRowDirty ? "contained" : "outlined"}
      disabled={!isRowDirty || saveStatus === 'saving' || isEditingDisabled}
      loading={isLoading}
      onClick={handleClick}
      startIcon="save"
      className={isRowDirty && !isEditingDisabled ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20" : ""}
    />
  );
});

ActionCell.displayName = 'ActionCell';

const TeacherAttendanceManager = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile(768);

  const [isSticky, setIsSticky] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('sv-SE'));
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMobileEditingRowId, setActiveMobileEditingRowId] = useState(null);

  // 1. Consume the Consolidated State Selector Hook
  const {
    roster: allTeachers,
    metrics,
    isDirty,
    saveStatus,
    stageUpdate,
    clearWorkspaceDrafts,
    commitDeltaChanges,
    commitIndividualRow,
    commitFullRosterSnapshot,
    isLoading,
    isFetchingRegistry,
    error
  } = useTeacherAttendanceStrategy({ selectedDate });

  // Read-only Lock Verification Context
  const isEditingDisabled = useMemo(() => {
    return false;
  }, [selectedDate]);

  // Derived state: Apply client-side filters (batchId, status, search) to allTeachers roster
  const filteredTeachers = useMemo(() => {
    if (!Array.isArray(allTeachers)) return [];
    
    return allTeachers.filter((item) => {
      // 1. Batch ID Filter
      if (selectedBatchId !== 'all' && item.batch_id !== selectedBatchId) {
        return false;
      }
      // 2. Status Filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      // 3. Search Query Filter
      if (searchQuery.trim() !== '') {
        const cleanQuery = searchQuery.trim().toLowerCase();
        const matchesName = item.full_name?.toLowerCase().includes(cleanQuery);
        const matchesId = item.teacher_id?.toLowerCase().includes(cleanQuery);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });
  }, [allTeachers, selectedBatchId, statusFilter, searchQuery]);

  // Expose callbacks mapped to legacy workspace action interfaces
  const actions = useMemo(() => ({
    handleStatusChange: (id, status) => stageUpdate(id, { status }),
    handleTimeChange: (id, field, val) => stageUpdate(id, { [field]: val }),
    handleRemarksChange: (id, val) => stageUpdate(id, { remarks: val }),
    handleMarkAllPresent: () => {
      filteredTeachers.forEach(rec => {
        if (rec.status !== 'P') {
          stageUpdate(rec.id, { status: 'P' });
        }
      });
    },
    handleReset: clearWorkspaceDrafts,
    commitDeltaChanges,
    commitFullRosterSnapshot
  }), [stageUpdate, filteredTeachers, clearWorkspaceDrafts, commitDeltaChanges, commitFullRosterSnapshot]);

  // DataTable column configurations
  const columns = useMemo(() => [
    {
      header: 'Teacher Details',
      accessor: 'full_name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
            {row.full_name?.charAt(0) || 'T'}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-main dark:text-white text-sm">{row.full_name}</span>
              {(row.isUnmarkedPastDate || row.isUnmarkedCurrentDate) && (
                <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-500 px-1.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider">
                  <span className={`w-1.5 h-1.5 rounded-full ${row.isUnmarkedCurrentDate ? 'animate-pulse bg-blue-400' : 'bg-slate-400'}`}></span>
                  NR
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-text-secondary dark:text-slate-400 tracking-wider uppercase font-mono">{row.teacher_id}</span>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{row.batch_name}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Attendance Status',
      accessor: 'status',
      align: 'center',
      className: 'w-48',
      render: (row) => (
        <AttendanceStatusButtons
          row={row}
          isEditingDisabled={isEditingDisabled}
          onStatusChange={actions.handleStatusChange}
        />
      )
    },
    {
      header: 'Punch In',
      accessor: 'entry_time',
      className: 'w-36',
      render: (row) => (
        <TimeFieldInput
          value={row.entry_time}
          onChange={(val) => actions.handleTimeChange(row.id, 'entry_time', val)}
          disabled={isEditingDisabled}
          is24Hour={false}
        />
      )
    },
    {
      header: 'Punch Out',
      accessor: 'exit_time',
      className: 'w-36',
      render: (row) => (
        <TimeFieldInput
          value={row.exit_time}
          onChange={(val) => actions.handleTimeChange(row.id, 'exit_time', val)}
          disabled={isEditingDisabled}
          is24Hour={false}
        />
      )
    },
    {
      header: 'Remarks / Notes',
      accessor: 'remarks',
      render: (row) => (
        <TextInput
          disabled={isEditingDisabled}
          value={row.remarks}
          placeholder={isEditingDisabled ? "Entries Locked" : "Remarks"}
          onChange={(e) => actions.handleRemarksChange(row.id, e.target.value)}
          trim={false}
        />
      )
    },
    {
      header: 'Actions',
      align: 'center',
      headerClassName: 'w-24 font-bold text-[9px] uppercase tracking-widest text-text-secondary dark:text-slate-400',
      className: 'p-4 text-center',
      render: (row) => (
        <ActionCell
          row={row}
          isRowDirty={row.isRowDirty}
          saveStatus={saveStatus}
          isEditingDisabled={isEditingDisabled}
          commitIndividualRow={commitIndividualRow}
        />
      )
    }
  ], [isEditingDisabled, actions, saveStatus, commitIndividualRow]);

  // Extract static list of batches from the roster for filtering
  const batches = useMemo(() => {
    if (!Array.isArray(allTeachers)) return [];
    const uniqueBatches = [];
    const seen = new Set();
    allTeachers.forEach(t => {
      if (t.batch_id && !seen.has(t.batch_id)) {
        seen.add(t.batch_id);
        uniqueBatches.push({
          batch_id: t.batch_id,
          batch_name: t.batch_name || t.batch_id
        });
      }
    });
    return uniqueBatches;
  }, [allTeachers]);

  const filters = (
    <AttendanceFilterBar
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      batches={batches}
      selectedBatchId={selectedBatchId}
      setSelectedBatchId={setSelectedBatchId}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
    />
  );

  const activeMobileEditingRow = useMemo(() => {
    return filteredTeachers.find(t => t.id === activeMobileEditingRowId);
  }, [filteredTeachers, activeMobileEditingRowId]);

  if (isMobile) {
    return (
      <MobileTeacherAttendanceView
        filteredTeachers={filteredTeachers}
        isLoading={isLoading}
        isEditingDisabled={isEditingDisabled}
        actions={actions}
        activeMobileEditingRowId={activeMobileEditingRowId}
        setActiveMobileEditingRowId={setActiveMobileEditingRowId}
        activeMobileEditingRow={activeMobileEditingRow}
        metrics={metrics}
        filters={filters}
        isDirty={isDirty}
        saveStatus={saveStatus}
      />
    );
  }

  return (
    <MainLayout
      onBodyScroll={(e) => setIsSticky(e.currentTarget.scrollTop > 80)}
      body={
        <div className="pt-6 lg:pt-10 pb-24 space-y-6">
          <Breadcrumbs items={[{ label: 'Dashboard', path: '/admin/dashboard', icon: 'home' }, { label: 'Teachers', path: '/admin/teachers' }, { label: 'Attendance' }]} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-text-main dark:text-white">Teacher Attendance Register</h1>
              <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">
                Manage daily check-ins, check-outs, status registers, and shift tracking for teachers by batch.
              </p>
            </div>
            {isEditingDisabled && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl text-xs font-bold">
                <span className="material-symbols-outlined text-sm">lock</span>
                Past Logs Locked (Superadmin Only)
              </div>
            )}
          </div>

          <AttendanceStatsGrid metrics={metrics} isMobile={false} />

          <DataTable
            title="Daily Registry"
            subtitle={isEditingDisabled ? "Viewing historical records (Read-Only Mode)" : "Staging changes before committing bulk updates"}
            columns={columns}
            data={filteredTeachers}
            isLoading={isLoading}
            error={error}
            onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all })}
            filters={filters}
            secondaryAction={
              <>
                <RefreshButton isFetching={isFetchingRegistry} onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all })} />
                <Button variant="outlined" size="sm" onClick={actions.handleMarkAllPresent} disabled={isLoading || filteredTeachers.length === 0 || isEditingDisabled}>
                  Mark All Present
                </Button>
              </>
            }
          />
        </div>
      }
      footer={
        isDirty && (
          <div className="w-full animate-in slide-in-from-bottom-8 duration-300 fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
            <div className="bg-surface-light/95 dark:bg-[#122131]/95 border border-border-light dark:border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-lg flex items-center justify-between gap-4 max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-lg animate-pulse">warning</span>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-text-main dark:text-white">Unsaved Staged Entries Active</p>
                  <p className="text-[10px] text-text-secondary dark:text-slate-400">
                    You have modified workspace registers. Commit changes to persist calculations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outlined" 
                  size="sm" 
                  onClick={actions.handleReset}
                  disabled={saveStatus === 'saving'}
                >
                  Reset Changes
                </Button>
                <Button 
                  variant="success" 
                  size="sm" 
                  disabled={saveStatus === 'saving'} 
                  onClick={commitDeltaChanges}
                  className="min-w-[140px]"
                >
                  Save (Delta)
                </Button>
                <Button 
                  variant="contained" 
                  size="sm" 
                  disabled={saveStatus === 'saving'} 
                  onClick={commitFullRosterSnapshot}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold min-w-[140px]"
                >
                  Force Full
                </Button>
              </div>
            </div>
          </div>
        )
      }
    />
  );
};

export default TeacherAttendanceManager;
