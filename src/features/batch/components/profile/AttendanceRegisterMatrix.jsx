import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useStudentAttendance } from '../../../attendance/hooks/useAttendance';
import { useIsMobile } from '../../../../hooks/useIsMobile';
import MobileBatchAttendanceView from './MobileBatchAttendanceView';
import TimeFieldInput from '../FormField/TimeFieldInput';
import StateSelector from '../../../../components/ui/v2/StateSelector';
import Button from '../../../../components/ui/v2/Button';
import KpiGrid from '../../../../components/ui/v2/KpiGrid';
import KpiCard from '../../../../components/ui/v2/KpiCard';
import DataTable from '../../../../components/ui/DataTable';

const ATTENDANCE_CONFIG = [
  { label: 'P', value: 'P', activeClass: 'bg-emerald-500 text-white shadow-emerald-500/20' },
  { label: 'A', value: 'A', activeClass: 'bg-rose-500 text-white shadow-rose-500/20' },
  { label: 'L', value: 'L', activeClass: 'bg-amber-500 text-white shadow-amber-500/20' }
];

/**
 * RemarksInput: Memoized component for Remarks input cell to prevent keystroke lag.
 */
const RemarksInput = React.memo(({ student, onChange }) => {
  const [localRemarks, setLocalRemarks] = useState(student.remarks || '');

  React.useEffect(() => {
    setLocalRemarks(student.remarks || '');
  }, [student.remarks]);

  const handleBlur = () => {
    if (localRemarks !== student.remarks) {
      onChange(student.student_id, localRemarks);
    }
  };

  return (
    <input 
      type="text" 
      value={localRemarks}
      placeholder="e.g. Doctor appointment, late check-in"
      onChange={(e) => setLocalRemarks(e.target.value)}
      onBlur={handleBlur}
      className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-3 py-1.5 text-xs text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
    />
  );
});

RemarksInput.propTypes = {
  student: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

RemarksInput.displayName = 'RemarksInput';

/**
 * StatusCell: Memoized cell wrapper for StateSelector to avoid recreation of handler references.
 */
export const StatusCell = React.memo(({ studentId, status, updateStageField }) => {
  const handleChange = useCallback((val) => {
    updateStageField(studentId, 'status', val);
  }, [studentId, updateStageField]);

  return (
    <StateSelector
      options={ATTENDANCE_CONFIG}
      value={status}
      onChange={handleChange}
    />
  );
});

StatusCell.propTypes = {
  studentId: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  updateStageField: PropTypes.func.isRequired
};

StatusCell.displayName = 'StatusCell';

/**
 * TimeCell: Memoized cell wrapper for TimeFieldInput to avoid recreation of handler references.
 */
const TimeCell = React.memo(({ studentId, field, value, disabled, updateStageField }) => {
  const handleChange = useCallback((val) => {
    updateStageField(studentId, field, val);
  }, [studentId, field, updateStageField]);

  return (
    <TimeFieldInput
      value={value}
      disabled={disabled}
      onChange={handleChange}
      is24Hour={false}
    />
  );
});

TimeCell.propTypes = {
  studentId: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  updateStageField: PropTypes.func.isRequired
};

TimeCell.displayName = 'TimeCell';

/**
 * ActionCell: Memoized cell wrapper for the save Button to avoid recreation of handler references.
 */
const ActionCell = React.memo(({ row, isRowDirty, saveStatus, commitIndividualRow }) => {
  const handleClick = useCallback(() => {
    commitIndividualRow(row);
  }, [row, commitIndividualRow]);

  const isLoading = saveStatus === 'saving' && isRowDirty;

  return (
    <Button
      size="xs"
      variant={isRowDirty ? "contained" : "outlined"}
      disabled={!isRowDirty || saveStatus === 'saving'}
      loading={isLoading}
      onClick={handleClick}
      startIcon="save"
      className={isRowDirty ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20" : ""}
    />
  );
});

ActionCell.propTypes = {
  row: PropTypes.object.isRequired,
  isRowDirty: PropTypes.bool.isRequired,
  saveStatus: PropTypes.string,
  commitIndividualRow: PropTypes.func.isRequired
};

ActionCell.displayName = 'ActionCell';

/**
 * AttendanceRegisterMatrix Component: Decoupled daily attendance registry form logic.
 */
const AttendanceRegisterMatrix = ({ batchId }) => {
  const isMobile = useIsMobile(768);
  const [activeMobileEditingRowId, setActiveMobileEditingRowId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('sv-SE'));

  // 1. Consume the Consolidated State Selector Hook
  const {
    roster: studentsList,
    metrics: kpiStats,
    isDirty,
    saveStatus,
    stageUpdate: updateStageField,
    clearWorkspaceDrafts: handleReset,
    commitDeltaChanges,
    commitIndividualRow,
    commitFullRosterSnapshot,
    isLoading,
    draftDeltas
  } = useStudentAttendance({ selectedBatchId: batchId, selectedDate });

  const handleMarkAllPresent = useCallback(() => {
    studentsList.forEach(rec => {
      if (rec.status !== 'P') {
        updateStageField(rec.student_id, 'status', 'P');
      }
    });
  }, [studentsList, updateStageField]);

  // Wipes staging buffer on calendar date changes
  const handleDateChange = useCallback((newDateStr) => {
    handleReset();
    setSelectedDate(newDateStr);
  }, [handleReset, setSelectedDate]);

  // DataTable column configurations
  const columns = useMemo(() => [
    {
      header: 'Student Name',
      headerClassName: 'font-bold text-[9px] uppercase tracking-widest text-text-secondary dark:text-slate-400',
      className: 'p-4',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-main dark:text-white text-sm">{row.student_name}</span>
          <span className="text-[10px] text-text-secondary dark:text-slate-400 tracking-wider uppercase font-mono mt-0.5">
            {row.student_id}
          </span>
        </div>
      )
    },
    {
      header: 'Attendance Status',
      align: 'center',
      headerClassName: 'w-48 font-bold text-[9px] uppercase tracking-widest text-text-secondary dark:text-slate-400',
      className: 'p-4',
      render: (row) => (
        <StatusCell
          studentId={row.student_id}
          status={row.status}
          updateStageField={updateStageField}
        />
      )
    },
    {
      header: 'Check-In',
      headerClassName: 'w-44 font-bold text-[9px] uppercase tracking-widest text-text-secondary dark:text-slate-400',
      className: 'p-4',
      render: (row) => (
        <TimeCell
          studentId={row.student_id}
          field="entry_time"
          value={row.entry_time}
          disabled={row.status === 'A' || row.status === 'NR'}
          updateStageField={updateStageField}
        />
      )
    },
    {
      header: 'Check-Out',
      headerClassName: 'w-44 font-bold text-[9px] uppercase tracking-widest text-text-secondary dark:text-slate-400',
      className: 'p-4',
      render: (row) => (
        <TimeCell
          studentId={row.student_id}
          field="exit_time"
          value={row.exit_time}
          disabled={row.status === 'A' || row.status === 'NR'}
          updateStageField={updateStageField}
        />
      )
    },
    {
      header: 'Remarks / Notes',
      headerClassName: 'font-bold text-[9px] uppercase tracking-widest text-text-secondary dark:text-slate-400',
      className: 'p-4',
      render: (row) => (
        <RemarksInput
          student={row}
          onChange={(id, val) => updateStageField(id, 'remarks', val)}
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
          commitIndividualRow={commitIndividualRow}
        />
      )
    }
  ], [updateStageField, commitIndividualRow, saveStatus]);

  const activeMobileEditingRow = useMemo(() => {
    return studentsList.find(s => s.student_id === activeMobileEditingRowId);
  }, [studentsList, activeMobileEditingRowId]);

  if (isMobile) {
    return (
      <MobileBatchAttendanceView
        studentsList={studentsList}
        isLoading={isLoading}
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        updateStageField={updateStageField}
        kpiStats={kpiStats}
        isDirty={isDirty}
        saveStatus={saveStatus}
        stagedChanges={draftDeltas}
        handleMarkAllPresent={handleMarkAllPresent}
        handleReset={handleReset}
        commitDeltaChanges={commitDeltaChanges}
        commitFullRosterSnapshot={commitFullRosterSnapshot}
        activeMobileEditingRowId={activeMobileEditingRowId}
        setActiveMobileEditingRowId={setActiveMobileEditingRowId}
        activeMobileEditingRow={activeMobileEditingRow}
        onTimeChange={updateStageField}
        onRemarksChange={(id, val) => updateStageField(id, 'remarks', val)}
        onBack={() => window.history.back()}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Dashboard Grid */}
      <KpiGrid cols={4} smCols={2} mdCols={4} lgCols={4} gap={4}>
        <KpiCard
          label="Present Students"
          value={kpiStats.presentCount}
          icon="check_circle"
          variant="success"
          isCount={true}
        />
        <KpiCard
          label="Absent logs"
          value={kpiStats.absentCount}
          icon="cancel"
          variant="danger"
          isCount={true}
        />
        <KpiCard
          label="On Leave"
          value={kpiStats.leaveCount}
          icon="event_busy"
          variant="warning"
          isCount={true}
        />
        <KpiCard
          label="Attendance Rate"
          value={kpiStats.attendanceRate}
          icon="analytics"
          variant="info"
          isCount={false}
        />
      </KpiGrid>

      {/* Main Roster Panel Sheet */}
      <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-2xl shadow-sm backdrop-blur-md overflow-hidden flex flex-col justify-between min-h-[400px]">
        
        {/* Table Panel Header */}
        <div className="p-6 border-b border-border-light dark:border-white/8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400">group</span>
            <div>
              <h3 className="text-base font-bold text-text-main dark:text-white">Daily register sheet</h3>
              <p className="text-xs text-text-secondary mt-0.5">Punch entry/exit times and toggle states. Select dates to view records.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-xl px-4 py-2 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all cursor-pointer"
            />
            <Button 
              onClick={handleMarkAllPresent}
              disabled={isLoading || studentsList.length === 0}
              variant="outlined"
              size="sm"
            >
              Mark All Present
            </Button>
          </div>
        </div>

        {/* Data Table Grid */}
        <div className="flex-1 overflow-x-auto">
          <DataTable
            columns={columns}
            data={studentsList}
            isLoading={isLoading}
            emptyMessage="No student baseline enrollment records found."
          />
        </div>

        {/* Sticky Action Footer Tray */}
        {isDirty && (
          <div className="p-4 bg-slate-50 dark:bg-black/15 border-t border-border-light dark:border-white/8 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 animate-pulse">warning</span>
              <span className="text-xs text-text-secondary dark:text-slate-400 font-medium">
                You have unsaved changes in your staging workspace.
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outlined"
                size="sm"
                onClick={handleReset}
              >
                Reset Workspace
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={commitDeltaChanges}
                disabled={saveStatus === 'saving'}
              >
                Save Changes (Delta)
              </Button>
              <Button
                variant="contained"
                size="sm"
                onClick={commitFullRosterSnapshot}
                disabled={saveStatus === 'saving'}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold"
              >
                Overwrite Full Snapshot
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

AttendanceRegisterMatrix.propTypes = {
  batchId: PropTypes.string.isRequired
};

export default AttendanceRegisterMatrix;
