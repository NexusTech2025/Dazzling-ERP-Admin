import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import TimeFieldInput from '../FormField/TimeFieldInput';
import StateSelector from '../../../../components/ui/v2/StateSelector';

/**
 * AttendanceRow: Memoized individual student attendance row.
 * Isolates local remarks typing buffer and blurs to minimize parent render triggers.
 */
const AttendanceRow = React.memo(({ student, onStatusChange, onTimeChange, onRemarksChange }) => {
  const [localRemarks, setLocalRemarks] = useState(student.remarks || '');

  // Sync local remarks state when query updates baseline data or on reset
  React.useEffect(() => {
    setLocalRemarks(student.remarks || '');
  }, [student.remarks]);

  const isAbsent = student.status === 'A';

  const handleRemarksBlur = () => {
    if (localRemarks !== student.remarks) {
      onRemarksChange(student.student_id, localRemarks);
    }
  };

  const ATTENDANCE_CONFIG = [
    { label: 'P', value: 'P', activeClass: 'bg-emerald-500 text-white shadow-emerald-500/20' },
    { label: 'A', value: 'A', activeClass: 'bg-rose-500 text-white shadow-rose-500/20' },
    { label: 'L', value: 'L', activeClass: 'bg-amber-500 text-white shadow-amber-500/20' }
  ];

  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors">
      <td className="p-4 text-center font-mono font-bold text-text-secondary dark:text-slate-400">
        {student.roll_number || '-'}
      </td>
      <td className="p-4">
        <div className="flex flex-col">
          <span className="font-bold text-text-main dark:text-white text-sm">{student.student_name}</span>
          <span className="text-[10px] text-text-secondary dark:text-slate-400 tracking-wider uppercase font-mono mt-0.5">
            {student.student_id}
          </span>
        </div>
      </td>
      <td className="p-4">
        <StateSelector
          options={ATTENDANCE_CONFIG}
          value={student.status}
          onChange={(val) => onStatusChange(student.student_id, val)}
        />
      </td>
      <td className="p-4">
        <TimeFieldInput
          value={student.entry_time}
          disabled={isAbsent}
          onChange={(val) => onTimeChange(student.student_id, 'entry_time', val)}
          is24Hour={false}
        />
      </td>
      <td className="p-4">
        <TimeFieldInput
          value={student.exit_time}
          disabled={isAbsent}
          onChange={(val) => onTimeChange(student.student_id, 'exit_time', val)}
          is24Hour={false}
        />
      </td>
      <td className="p-4">
        <input
          type="text"
          value={localRemarks}
          placeholder="e.g. Doctor appointment, late check-in"
          onChange={(e) => setLocalRemarks(e.target.value)}
          onBlur={handleRemarksBlur}
          className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-3 py-1.5 text-xs text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
        />
      </td>
    </tr>
  );
});

AttendanceRow.propTypes = {
  student: PropTypes.object.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onTimeChange: PropTypes.func.isRequired,
  onRemarksChange: PropTypes.func.isRequired
};

AttendanceRow.displayName = 'AttendanceRow';


export default AttendanceRow
