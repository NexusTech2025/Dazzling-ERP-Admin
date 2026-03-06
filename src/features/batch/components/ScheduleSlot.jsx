import React from 'react';

const ScheduleSlot = ({ slot }) => {
  const colors = {
    teal: 'bg-teal-50 border-teal-100 text-teal-800 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-300',
    blue: 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
    orange: 'bg-orange-50 border-orange-100 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300',
    slate: 'bg-slate-50 border-slate-100 text-slate-800 dark:bg-slate-900/20 dark:border-slate-800 dark:text-slate-300'
  };

  const colorClass = colors[slot.color] || colors.slate;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4 transition-all hover:shadow-sm ${colorClass}`}>
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold">{slot.time}</span>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-70 flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[14px]">location_on</span> 
            {slot.room}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold opacity-80">{slot.teacher}</span>
        <span className="inline-flex items-center rounded-full bg-white/50 dark:bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider border border-current/10">
          {slot.subject}
        </span>
      </div>
    </div>
  );
};

export default ScheduleSlot;
