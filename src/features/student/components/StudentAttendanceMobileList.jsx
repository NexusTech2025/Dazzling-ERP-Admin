import React, { useMemo, useState, useEffect } from 'react';
import { GenericSelectDropdown } from '../../../components/ui/v2/GenericSelectDropdown';
import LowDensityCard from '../../../components/ui/v2/cards/LowDensityCard';

/**
 * StudentAttendanceMobileCard: Memoized mobile card component that localizes remarks inputs to prevent keystroke lag.
 */
const StudentAttendanceMobileCard = React.memo(({
  student,
  isEditingDisabled,
  onStatusChange,
  onTimeChange,
  onRemarksChange,
  batches,
  isExpanded,
  onToggleExpand
}) => {
  const [localRemarks, setLocalRemarks] = useState(student.remarks || '');

  useEffect(() => {
    setLocalRemarks(student.remarks || '');
  }, [student.remarks]);

  const handleRemarksBlur = () => {
    if (localRemarks !== student.remarks) {
      onRemarksChange(student.student_id, localRemarks);
    }
  };

  const isAbsent = student.status === 'A';
  const showNRBadge = student.isUnmarkedPastDate || student.isUnmarkedCurrentDate;

  // Stitch schedule string
  const currentBatchObj = batches.find(b => b.batch_id === student.batch_id);
  let rowScheduleStr = '08:00 AM - 10:00 AM';
  if (currentBatchObj) {
    let scheduleObj = currentBatchObj.schedule;
    if (typeof scheduleObj === 'string') {
      try {
        scheduleObj = JSON.parse(scheduleObj);
      } catch (e) {
        scheduleObj = null;
      }
    }
    if (scheduleObj && scheduleObj.start_time && scheduleObj.end_time) {
      rowScheduleStr = `${scheduleObj.start_time} - ${scheduleObj.end_time}`;
    }
  }
  const displayBatchName = currentBatchObj?.batch_name || 'Active Batch';

  return (
    <div className="flex flex-col p-4 rounded-xl border border-border-light dark:border-white/5 bg-slate-50/50 dark:bg-[#0a1420] shadow-sm relative overflow-visible">
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
            <span className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold mt-1">
              <span className="material-symbols-outlined text-[11px]">schedule</span>
              <span>{rowScheduleStr}</span>
            </span>
          </div>
        </div>

        {/* Right Interactive Status Buttons */}
        <div className={`flex items-center gap-1.5 bg-slate-100/50 dark:bg-black/30 border border-border-light dark:border-white/5 p-1 rounded-xl flex-shrink-0 ${isEditingDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {['P', 'A', 'L'].map(st => {
            const isActive = student.status === st;
            let activeClass = 'text-text-secondary hover:text-text-main dark:hover:text-white';
            if (isActive && !student.isUnmarkedPastDate && !student.isUnmarkedCurrentDate) {
              if (st === 'P') activeClass = 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20';
              else if (st === 'A') activeClass = 'bg-rose-500 text-white shadow-md shadow-rose-500/20';
              else if (st === 'L') activeClass = 'bg-emerald-500 text-white dark:bg-amber-500 shadow-md dark:shadow-amber-500/20';
            }
            return (
              <button
                type="button"
                key={st}
                disabled={isEditingDisabled}
                onClick={() => onStatusChange(student.student_id, st)}
                className={`w-9 h-9 rounded-lg text-[24px] font-black transition-all flex items-center justify-center cursor-pointer ${activeClass}`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Time & Remarks Drawer */}
      <div className="border-t border-slate-100 dark:border-white/5 mt-3 pt-3 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center justify-between w-full text-left text-[10px] font-bold text-text-secondary dark:text-slate-400 cursor-pointer"
        >
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>{student.isUnmarkedPastDate ? 'Not Recorded (NR)' : `In: ${student.entry_time || '--:--'} • Out: ${student.exit_time || '--:--'}`}</span>
            {student.remarks && (
              <span className="truncate max-w-[120px] text-indigo-500"> • {student.remarks}</span>
            )}
          </div>
          <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[220px] opacity-100 mt-2' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary dark:text-slate-400">Check-In</span>
              <input
                type="time"
                disabled={isEditingDisabled || student.status === 'A'}
                value={student.entry_time}
                onChange={(e) => onTimeChange(student.student_id, 'entry_time', e.target.value)}
                className="w-full bg-white dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-lg px-2.5 py-1.5 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary dark:text-slate-400">Check-Out</span>
              <input
                type="time"
                disabled={isEditingDisabled || student.status === 'A'}
                value={student.exit_time}
                onChange={(e) => onTimeChange(student.student_id, 'exit_time', e.target.value)}
                className="w-full bg-white dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-lg px-2.5 py-1.5 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary dark:text-slate-400">Remarks / Notes</span>
            <input
              type="text"
              disabled={isEditingDisabled}
              value={localRemarks}
              placeholder={isEditingDisabled ? "Entries Locked" : "Remarks"}
              onChange={(e) => setLocalRemarks(e.target.value)}
              onBlur={handleRemarksBlur}
              className="w-full bg-white dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-lg px-2.5 py-1.5 text-xs text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
            />
          </div>
        </div>
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
          <GenericSelectDropdown
            items={batches}
            selectedId={selectedBatchId}
            onChange={setSelectedBatchId}
            idProp="batch_id"
            labelProp="batch_name"
            searchFields={["batch_name"]}
            selectedViewMode="one-line"
            placeholder="Select Batch"
            dropdownWidth="w-[340px]"
            renderItem={(item, isSelected) => {
              const initials = item.batch_name ? item.batch_name.substring(0, 2).toUpperCase() : "BT";
              return (
                <LowDensityCard
                  variant="selection-card"
                  title={item.batch_name}
                  subtitle1={`Class ${item.class_level || 11}`}
                  subtitle2={`${item.course?.metadata?.medium || 'English'} • ${item.branch_name || 'Main Campus'}`}
                  avatarText={initials}
                  enrolled={item.enrolled_students || 0}
                  capacity={item.capacity || 30}
                  isSelected={isSelected}
                />
              );
            }}
          />
        </div>
        <div className="relative flex items-center bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2">
          <span className="material-symbols-outlined text-text-secondary text-sm mr-2">calendar_today</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-text-main dark:text-white outline-none cursor-pointer w-24"
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
              key={student.student_id}
              student={student}
              isEditingDisabled={isEditingDisabled}
              onStatusChange={onStatusChange}
              onTimeChange={onTimeChange}
              onRemarksChange={onRemarksChange}
              batches={batches}
              isExpanded={expandedCardId === student.student_id}
              onToggleExpand={() => setExpandedCardId(expandedCardId === student.student_id ? null : student.student_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAttendanceMobileList;
