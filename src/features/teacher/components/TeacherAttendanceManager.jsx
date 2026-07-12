import React, { useState, useMemo } from 'react';
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

// Custom Hooks & Sub-components
import { useTeacherAttendance } from '../hooks/useTeacherAttendance';
import { AttendanceStatsGrid } from './attendance/AttendanceStatsGrid';
import { AttendanceFilterBar } from './attendance/AttendanceFilterBar';
import { AttendanceStatusButtons } from './attendance/AttendanceStatusButtons';
import { AttendanceActionFooter } from './attendance/AttendanceActionFooter';
import MobileTeacherAttendanceView from './attendance/MobileTeacherAttendanceView';

const TeacherAttendanceManager = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile(768);

  const [isSticky, setIsSticky] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('sv-SE'));
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMobileEditingRowId, setActiveMobileEditingRowId] = useState(null);

  const {
    batches,
    filteredTeachers,
    metrics,
    isDirty,
    saveStatus,
    isEditingDisabled,
    isLoading,
    isFetchingRegistry,
    error,
    actions
  } = useTeacherAttendance(selectedDate, selectedBatchId, statusFilter, searchQuery);

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
          isMobile={false}
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
    }
  ], [isEditingDisabled, actions]);

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
        <AttendanceActionFooter
          isDirty={isDirty}
          isSaving={saveStatus === 'saving'}
          onReset={actions.handleReset}
          onSave={actions.handleSave}
        />
      }
    />
  );
};

export default TeacherAttendanceManager;
