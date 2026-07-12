import React, { useState, useEffect } from 'react';
import { TableRow, TableCell } from '../../../components/ui/table';
import TimePill from '../../../components/ui/v2/TimePill';

/**
 * StudentTableRow: Isolated row component rendering daily attendance controls for a student.
 * 
 * @param {Object} props - React props.
 * @param {Object} props.student - Hydrated student record (baseline + staged modifications).
 * @param {boolean} props.isEditingDisabled - Disable control buttons and inputs.
 * @param {Function} props.onStatusChange - Updates student attendance status ('P', 'A', 'L').
 * @param {Function} props.onTimeChange - Updates entry_time or exit_time.
 * @param {Function} props.onRemarksChange - Syncs local remarks on blur.
 * @param {Array<Object>} props.batches - List of batch metadata.
 */
export const StudentTableRow = React.memo(({
  student,
  isEditingDisabled,
  onStatusChange,
  onTimeChange,
  onRemarksChange,
  batches
}) => {
  const [localRemarks, setLocalRemarks] = useState(student.remarks || '');

  // Synchronize local input state with changes coming from parent updates (e.g. baseline query load or Mark All Present)
  useEffect(() => {
    setLocalRemarks(student.remarks || '');
  }, [student.remarks]);

  const handleRemarksBlur = () => {
    if (localRemarks !== student.remarks) {
      onRemarksChange(student.id, localRemarks);
    }
  };

  const isAbsent = student.status === 'A';
  const showNRBadge = student.isUnmarkedPastDate || student.isUnmarkedCurrentDate;

  return (
    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
      {/* Roll Number Column */}
      <TableCell align="center" className="font-mono text-xs font-bold text-slate-500 w-16">
        {student.roll_number || '-'}
      </TableCell>

      {/* Student Details Column */}
      <TableCell>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-main dark:text-white text-sm">{student.student_name}</span>
            {showNRBadge && (
              <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider">
                <span className={`w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 ${student.isUnmarkedCurrentDate ? 'animate-pulse bg-blue-400 dark:bg-blue-500' : ''}`}></span>
                NR
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-text-secondary dark:text-slate-400 tracking-wider uppercase font-mono">{student.student_id}</span>
            {student.batch_id && (
              <span className="text-[9px] bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {batches.find(b => b.batch_id === student.batch_id)?.batch_name || student.batch_id}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Attendance Status Selector Column */}
      <TableCell align="center" className="w-44">
        <div className={`flex items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-black/30 border border-border-light dark:border-white/5 rounded-xl w-fit mx-auto ${isEditingDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
          <button
            type="button"
            disabled={isEditingDisabled}
            onClick={() => onStatusChange(student.id, 'P')}
            className={`w-9 h-9 rounded-lg text-[24px] font-black uppercase transition-all duration-200 cursor-pointer flex items-center justify-center ${student.status === 'P' && !student.isUnmarkedPastDate && !student.isUnmarkedCurrentDate
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105'
                : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
              }`}
          >
            P
          </button>
          <button
            type="button"
            disabled={isEditingDisabled}
            onClick={() => onStatusChange(student.id, 'A')}
            className={`w-9 h-9 rounded-lg text-[24px] font-black uppercase transition-all duration-200 cursor-pointer flex items-center justify-center ${student.status === 'A' && !student.isUnmarkedPastDate && !student.isUnmarkedCurrentDate
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105'
                : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
              }`}
          >
            A
          </button>
          <button
            type="button"
            disabled={isEditingDisabled}
            onClick={() => onStatusChange(student.id, 'L')}
            className={`w-9 h-9 rounded-lg text-[24px] font-black uppercase transition-all duration-200 cursor-pointer flex items-center justify-center ${student.status === 'L' && !student.isUnmarkedPastDate && !student.isUnmarkedCurrentDate
                ? 'bg-emerald-500 text-white dark:bg-amber-500 shadow-md dark:shadow-amber-500/20 scale-105'
                : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
              }`}
          >
            L
          </button>
        </div>
      </TableCell>

      {/* Entry Time / Check-In Column */}
      <TableCell className="w-44">
        {isEditingDisabled || isAbsent ? (
          <div className="flex justify-center">
            <TimePill value={student.entry_time} format="12h" variant="success" label="In" />
          </div>
        ) : (
          <input
            type="time"
            value={student.entry_time}
            disabled={isEditingDisabled || isAbsent}
            onChange={(e) => onTimeChange(student.id, 'entry_time', e.target.value)}
            className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-3 py-1.5 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
          />
        )}
      </TableCell>

      {/* Exit Time / Check-Out Column */}
      <TableCell className="w-44">
        {isEditingDisabled || isAbsent ? (
          <div className="flex justify-center">
            <TimePill value={student.exit_time} format="12h" variant="info" label="Out" />
          </div>
        ) : (
          <input
            type="time"
            value={student.exit_time}
            disabled={isEditingDisabled || isAbsent}
            onChange={(e) => onTimeChange(student.id, 'exit_time', e.target.value)}
            className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-3 py-1.5 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
          />
        )}
      </TableCell>

      {/* Remarks Column */}
      <TableCell>
        <input
          type="text"
          value={localRemarks}
          disabled={isEditingDisabled}
          placeholder={isEditingDisabled ? "Entries Locked" : "Remarks"}
          onChange={(e) => setLocalRemarks(e.target.value)}
          onBlur={handleRemarksBlur}
          className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-3 py-1.5 text-xs text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-indigo-500 transition-all disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
        />
      </TableCell>
    </TableRow>
  );
});

StudentTableRow.displayName = 'StudentTableRow';
export default StudentTableRow;
