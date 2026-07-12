import React, { useMemo, useState, useEffect } from 'react';
import { Dropdown } from '../../../components/ui/v2/SelectDropdown';
import LowDensityCard from '../../../components/ui/v2/cards/LowDensityCard';
import { BatchFilter } from '../../batch/components/BatchFilters';
import TimePill from '../../../components/ui/v2/TimePill';
import Button from '../../../components/ui/v2/Button';
import { MobilePunchEditorDrawer } from '../../../components/domain/MobilePunchEditorDrawer';

/**
 * StudentAttendanceMobileCard: Memoized mobile card component that localizes remarks inputs to prevent keystroke lag.
 */
const StudentAttendanceMobileCard = React.memo(({
  student,
  isEditingDisabled,
  onStatusChange,
  batches,
  onConfigureTimes
}) => {
  const isAbsent = student.status === 'A';
  const showNRBadge = student.isUnmarkedPastDate || student.isUnmarkedCurrentDate;

  // Stitch schedule string
  const currentBatchObj = batches.find(b => b.batch_id === student.batch_id);
  const displayBatchName = currentBatchObj?.batch_name || 'Active Batch';

  return (
    <div className="flex flex-col p-4 rounded-xl border border-border-light dark:border-white/5 bg-slate-50/50 dark:bg-[#0a1420] shadow-sm relative overflow-visible space-y-3">
      <div className="flex items-center justify-between w-full">
        {/* Left Avatar & Name Stack */}
        <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {student.student_name?.charAt(0) || 'S'}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-main dark:text-white text-xs truncate">{student.student_name}</span>
              {showNRBadge && (
                <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider flex-shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 ${student.isUnmarkedCurrentDate ? 'animate-pulse bg-blue-400 dark:bg-blue-500' : ''}`}></span>
                  NR
                </span>
              )}
            </div>
            <span className="text-[10px] text-text-secondary truncate mt-0.5 font-medium font-mono uppercase tracking-wider">ID: {student.student_id}</span>
            <span className="text-[9px] text-text-secondary truncate font-medium">Batch: {displayBatchName}</span>
          </div>
        </div>

        {/* Right Interactive Status Buttons */}
        <div className={`flex items-center gap-1.5 bg-slate-100/50 dark:bg-black/30 border border-border-light dark:border-white/5 p-1 rounded-xl flex-shrink-0 ${isEditingDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {['P', 'A', 'L'].map(st => {
            const isActive = student.status === st;
            let activeClass = 'text-text-secondary hover:text-text-main dark:hover:text-white';
            if (isActive && !student.isUnmarkedPastDate && !student.isUnmarkedCurrentDate) {
              if (st === 'P') activeClass = 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105';
              else if (st === 'A') activeClass = 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105';
              else if (st === 'L') activeClass = 'bg-emerald-500 text-white dark:bg-amber-500 shadow-md dark:shadow-amber-500/20 scale-105';
            }
            return (
              <button
                type="button"
                key={st}
                disabled={isEditingDisabled}
                onClick={() => onStatusChange(student.id, st)}
                className={`w-9 h-9 rounded-lg text-[20px] font-black transition-all flex items-center justify-center cursor-pointer ${activeClass}`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Check-In and Check-Out Time Display */}
      <div className="flex items-center justify-between text-[11px] text-text-secondary pt-2 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          {student.isUnmarkedPastDate ? (
            <span className="text-[10px] text-text-secondary dark:text-slate-400 italic">Not Recorded (NR)</span>
          ) : (
            <>
              <TimePill
                label="In"
                value={student.entry_time}
                variant="success"
              />
              <TimePill
                label="Out"
                value={student.exit_time}
                variant="info"
              />
            </>
          )}
        </div>
        <Button 
          variant="text" 
          size="sm" 
          startIcon="edit" 
          disabled={isAbsent}
          onClick={onConfigureTimes}
        >
          Configure times
        </Button>
      </div>
    </div>
  );
});

StudentAttendanceMobileCard.displayName = 'StudentAttendanceMobileCard';

/**
 * StudentAttendanceMobileList: Mobile viewport card-based listing and control block.
 */
export const StudentAttendanceMobileList = ({
  students = [],
  isEditingDisabled,
  onStatusChange,
  onTimeChange,
  onRemarksChange,
  batches = [],
  isLoading,
  expandedCardId,
  setExpandedCardId,
  selectedBatchId,
  setSelectedBatchId,
  selectedDate,
  setSelectedDate
}) => {
  return (
    <div className="md:hidden flex flex-col gap-6">
      {/* Batch & Date Selectors side-by-side */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">

          <BatchFilter
            value={selectedBatchId}
            onChange={setSelectedBatchId}
            batches={batches}
          />

        </div>
        <div className="relative flex items-center bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2">
          <span className="material-symbols-outlined text-text-secondary text-sm mr-2">calendar_today</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-text-main dark:text-white outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Cards feed list */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-text-secondary">Loading registry...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="py-20 text-center text-text-secondary text-xs border border-dashed border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark">
          No student records found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((student) => (
            <StudentAttendanceMobileCard
              key={student.id}
              student={student}
              isEditingDisabled={isEditingDisabled}
              onStatusChange={onStatusChange}
              batches={batches}
              onConfigureTimes={() => setExpandedCardId(student.id)}
            />
          ))}
        </div>
      )}

      {/* Decoupled Popover Portal to avoid input re-render jank */}
      {expandedCardId && (
        <MobilePunchEditorDrawer
          row={students.find((s) => s.id === expandedCardId)}
          isEditingDisabled={isEditingDisabled}
          onTimeChange={onTimeChange}
          onRemarksChange={onRemarksChange}
          onClose={() => setExpandedCardId(null)}
        />
      )}
    </div>
  );
};

export default StudentAttendanceMobileList;
