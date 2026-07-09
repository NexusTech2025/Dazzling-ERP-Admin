import React from 'react';
import KeyValuePair from '../../../components/ui/v2/KeyValuePair';

/**
 * BatchCard: A reusable premium card component for presenting and selecting dynamic batch details.
 * Performs real-time schema alignment by fetching course, teacher, and branch info from React Query cache.
 * 
 * @param {object} props
 * @param {object} props.batch - The batch object containing batch_id, batch_name, course_id, teacher_id, branch_id, schedule_time.
 * @param {boolean} props.isSelected - Indicates if this specific card is selected.
 * @param {function} props.onSelect - Callback triggered when the card is clicked.
 */
const BatchCard = ({ batch, isSelected, onSelect }) => {
  if (!batch) return null;

  const courseName = batch.course?.name || batch.course_name || 'N/A';
  const teacherName = batch.teacher?.full_name || batch.teacher?.teacher_name || batch.instructor_name || 'Unassigned';
  const branchName = batch.branch?.branch_name || batch.branch?.name || batch.branch_name || 'N/A';

  return (
    <div
      onClick={onSelect}
      className={`
        relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200
        ${isSelected
          ? 'bg-white dark:bg-slate-800 border-primary shadow-lg shadow-primary/5'
          : 'bg-white/50 dark:bg-slate-900/50 border-transparent hover:border-primary/30 hover:bg-white'}
      `}
    >
      {/* Radio Check Indicator */}
      <div className="absolute top-4 right-4">
        <span className={`material-symbols-outlined ${isSelected ? 'text-primary' : 'text-slate-300'}`}>
          {isSelected ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      </div>

      {/* Header Info: Course Avatar, Name & Subject */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`
          h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg
          ${isSelected ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}
        `}>
          {courseName.charAt(0) || 'B'}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[180px]">{batch.batch_name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">{courseName}</p>
        </div>
      </div>

      {/* Footer Info: Assigned Teacher, Branch & Schedule Time */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <KeyValuePair
          label="Teacher"
          value={teacherName}
          icon="person"
          layout="horizontal"
          sizeProp="12px"
        />
        <KeyValuePair
          label="Location"
          value={branchName}
          icon="location_on"
          layout="horizontal"
          sizeProp="12px"
        />
      </div>

      <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">schedule</span>
          {`${batch.schedule.start_time} - ${batch.schedule.end_time}` || 'N/A'}
        </span>
        {batch.capacity && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">group</span>
            Cap: {batch.capacity}
          </span>
        )}
      </div>
    </div>
  );
};

export default BatchCard;
