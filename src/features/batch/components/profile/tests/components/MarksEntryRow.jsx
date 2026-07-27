import React from 'react';
import TextInput from '../../../../../../components/ui/v2/TextInput';

/**
 * Memoized single student row for bulk marks entry table.
 */
const MarksEntryRow = React.memo(function MarksEntryRow({
  index,
  student,
  markData,
  totalMarks,
  onChange
}) {
  const studentId = student?.student_id || student?.id || student?.allocation_id || '';
  const studentName = student?.student?.student_name || student?.student_name || 'Unnamed Student';

  const isAbsent = Boolean(markData?.is_absent);
  const obtainedMarks = markData?.obtained_marks ?? '';
  const remarks = markData?.remarks || '';

  const isInvalid = !isAbsent && obtainedMarks !== '' && (Number(obtainedMarks) > Number(totalMarks) || Number(obtainedMarks) < 0);

  const handleMarksChange = (val) => {
    onChange(studentId, {
      ...markData,
      student_id: studentId,
      obtained_marks: val,
      is_absent: false
    });
  };

  const handleAbsentToggle = (e) => {
    const checked = e.target.checked;
    onChange(studentId, {
      ...markData,
      student_id: studentId,
      is_absent: checked,
      obtained_marks: checked ? 0 : ''
    });
  };

  const handleRemarksChange = (val) => {
    onChange(studentId, {
      ...markData,
      student_id: studentId,
      remarks: val
    });
  };

  return (
    <tr className="border-b border-border-light dark:border-border-dark hover:bg-surface-light/50 dark:hover:bg-surface-dark/50 transition-colors">
      <td className="px-4 py-3 text-xs font-semibold text-text-secondary">
        {index + 1}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {studentName ? studentName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <span className="text-sm font-semibold text-text-main dark:text-white block">
              {studentName}
            </span>
            <span className="text-xs text-text-secondary">
              ID: {studentId}
            </span>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 w-32">
        <TextInput
          type="number"
          value={isAbsent ? '' : obtainedMarks}
          onChange={(e) => handleMarksChange(e.target.value)}
          disabled={isAbsent}
          placeholder="0"
          min={0}
          max={totalMarks}
          className={isInvalid ? 'border-red-500 focus:ring-red-500' : ''}
        />
        {isInvalid && (
          <span className="text-[10px] text-red-500 mt-0.5 block">
            Max: {totalMarks}
          </span>
        )}
      </td>

      <td className="px-4 py-3 text-center w-24">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAbsent}
            onChange={handleAbsentToggle}
            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary dark:border-border-dark dark:bg-surface-dark"
          />
          <span className={`text-xs font-medium ${isAbsent ? 'text-red-500 font-bold' : 'text-text-secondary'}`}>
            Absent
          </span>
        </label>
      </td>

      <td className="px-4 py-3">
        <TextInput
          value={remarks}
          onChange={(e) => handleRemarksChange(e.target.value)}
          placeholder="Optional remarks..."
        />
      </td>
    </tr>
  );
});

MarksEntryRow.displayName = 'MarksEntryRow';
export default MarksEntryRow;
