import React from 'react';

/**
 * SelectedBatchCard: Renders the active batch summary card.
 */
const SelectedBatchCard = ({ batch, details, onChangeClick }) => {
  return (
    <div className="bg-white dark:bg-slate-900/40 rounded-2xl p-6 border-2 border-primary shadow-lg shadow-primary/5 animate-in zoom-in-95 duration-300 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-primary/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
            {details.courseName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{batch.batch_name}</h3>
            <p className="text-xs text-slate-500 mt-1">{details.courseName}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onChangeClick}
          className="flex items-center gap-1.5 px-4 h-9 rounded-lg border border-primary/20 text-xs font-bold text-primary hover:bg-primary/5 transition-all"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Change Batch
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Branch Center</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{details.branchName}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teacher</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{details.teacherName}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timetable</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{details.scheduleText}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capacity</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{batch.capacity ? `Max ${batch.capacity}` : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default SelectedBatchCard;
