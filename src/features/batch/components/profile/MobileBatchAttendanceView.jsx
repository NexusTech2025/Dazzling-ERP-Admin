import React from 'react';
import PropTypes from 'prop-types';
import MobileBaseLayout from '../../../../components/layout/MobileBaseLayout';
import MobilePunchEditorDrawer from '../../../../components/domain/MobilePunchEditorDrawer';
import Button from '../../../../components/ui/v2/Button';
import TimePill from '../../../../components/ui/v2/TimePill';
import { StatusCell } from './AttendanceRegisterMatrix';

export const MobileBatchAttendanceView = ({
  studentsList,
  isLoading,
  selectedDate,
  handleDateChange,
  updateStageField,
  kpiStats,
  isDirty,
  saveStatus,
  stagedChanges,
  handleMarkAllPresent,
  handleReset,
  commitDeltaChanges,
  commitFullRosterSnapshot,
  activeMobileEditingRowId,
  setActiveMobileEditingRowId,
  activeMobileEditingRow,
  onTimeChange,
  onRemarksChange,
  onBack
}) => {
  return (
    <MobileBaseLayout>
      <MobileBaseLayout.Header
        title="Batch Attendance"
        renderLeft={
          <button
            onClick={onBack}
            className="size-9 rounded-full flex items-center justify-center text-text-main dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        }
        renderRight={
          <Button 
            onClick={handleMarkAllPresent}
            disabled={isLoading || studentsList.length === 0}
            variant="outlined"
            size="sm"
            className="cursor-pointer font-bold tracking-wider text-[10px]"
          >
            Mark All Present
          </Button>
        }
      />

      {/* Swipeable Compact Metrics Ribbon */}
      <MobileBaseLayout.RibbonSlot>
        <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-black/30 p-1.5 border border-border-light dark:border-white/5 rounded-xl self-start w-full overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-wider">Total</span>
            <span className="text-xs font-black">{kpiStats.totalCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-wider">Present</span>
            <span className="text-xs font-black">{kpiStats.presentCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-wider">Absent</span>
            <span className="text-xs font-black">{kpiStats.absentCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-wider">Leave</span>
            <span className="text-xs font-black">{kpiStats.leaveCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-wider">Rate</span>
            <span className="text-xs font-black">{kpiStats.attendanceRate}%</span>
          </div>
        </div>
      </MobileBaseLayout.RibbonSlot>

      {/* Date Filter Bar */}
      <MobileBaseLayout.FilterSlot>
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-bold text-text-secondary dark:text-slate-400">Registry Date:</span>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-xl px-4 py-2 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all cursor-pointer"
          />
        </div>
      </MobileBaseLayout.FilterSlot>

      {/* Roster List view */}
      <MobileBaseLayout.ListSlot
        isEmpty={studentsList.length === 0}
        renderEmptyState={
          <div className="py-10 text-center text-xs text-text-secondary w-full">
            {isLoading ? 'Loading mobile registry...' : 'No student records found.'}
          </div>
        }
      >
        <div className="flex flex-col gap-3 pb-24">
          {studentsList.map((row) => (
            <div key={row.student_id} className="p-4 rounded-xl border border-border-light dark:border-white/5 bg-slate-50/50 dark:bg-[#0a1420] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-text-main dark:text-white">{row.student_name}</span>
                  <span className="text-[9px] text-text-secondary mt-0.5">Roll No: {row.roll_number || 'N/A'}</span>
                </div>
                <StatusCell
                  studentId={row.student_id}
                  status={row.status}
                  updateStageField={updateStageField}
                />
              </div>
              
              <div className="flex items-center justify-between text-[11px] text-text-secondary pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <TimePill
                    label="In"
                    value={row.entry_time}
                    variant="success"
                  />
                  <TimePill
                    label="Out"
                    value={row.exit_time}
                    variant="info"
                  />
                </div>
                <Button 
                  variant="text" 
                  size="sm" 
                  startIcon="edit" 
                  onClick={() => setActiveMobileEditingRowId(row.student_id)}
                  className="text-[10px]"
                >
                  Configure
                </Button>
              </div>
            </div>
          ))}
        </div>
      </MobileBaseLayout.ListSlot>

      {/* Sticky Bottom Actions Bar */}
      {isDirty && (
        <MobileBaseLayout.ActionBarSlot>
          <div className="p-4 bg-surface-light dark:bg-[#122131] border-t border-border-light dark:border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 animate-pulse text-lg">warning</span>
              <span className="text-xs font-bold text-text-main dark:text-white">Unsaved ({Object.keys(stagedChanges).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outlined" size="sm" onClick={handleReset} className="font-bold text-[10px]">Reset</Button>
              <Button variant="success" size="sm" onClick={commitDeltaChanges} disabled={saveStatus === 'saving'} className="font-bold text-[10px]">Save Changes</Button>
              <Button variant="contained" size="sm" className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px]" onClick={commitFullRosterSnapshot} disabled={saveStatus === 'saving'}>Force Full</Button>
            </div>
          </div>
        </MobileBaseLayout.ActionBarSlot>
      )}

      {/* Bottom Sheet Drawer for parameter config */}
      {activeMobileEditingRow && (
        <MobilePunchEditorDrawer
          row={activeMobileEditingRow}
          isEditingDisabled={isLoading}
          onTimeChange={onTimeChange}
          onRemarksChange={onRemarksChange}
          onClose={() => setActiveMobileEditingRowId(null)}
        />
      )}
    </MobileBaseLayout>
  );
};

MobileBatchAttendanceView.propTypes = {
  studentsList: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  selectedDate: PropTypes.string.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  updateStageField: PropTypes.func.isRequired,
  kpiStats: PropTypes.object.isRequired,
  isDirty: PropTypes.bool.isRequired,
  saveStatus: PropTypes.string,
  stagedChanges: PropTypes.object.isRequired,
  handleMarkAllPresent: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  commitDeltaChanges: PropTypes.func.isRequired,
  commitFullRosterSnapshot: PropTypes.func.isRequired,
  activeMobileEditingRowId: PropTypes.string,
  setActiveMobileEditingRowId: PropTypes.func.isRequired,
  activeMobileEditingRow: PropTypes.object,
  onTimeChange: PropTypes.func.isRequired,
  onRemarksChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};

export default MobileBatchAttendanceView;
