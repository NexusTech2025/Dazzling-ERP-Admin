import React from 'react';

/**
 * Renders the day columns for the timetable header
 */
export const ScheduleHeader = ({ days }) => (
  <thead>
    <tr className="bg-slate-50 dark:bg-slate-800/50">
      {days.map(day => (
        <th key={day} className="p-4 border-b border-r border-border-light dark:border-border-dark text-[10px] font-black uppercase tracking-widest text-text-secondary text-center w-[14.28%]">
          {day}
        </th>
      ))}
    </tr>
  </thead>
);

/**
 * Header for the Master Timetable (Time Ranges)
 */
export const TimeHeader = ({ timeSlots }) => (
  <thead>
    <tr className="bg-slate-50 dark:bg-slate-800/50">
      <th className="p-4 border-b border-r border-border-light dark:border-border-dark text-[10px] font-black uppercase tracking-widest text-text-secondary text-left sticky left-0 bg-slate-50 dark:bg-slate-800 z-30 min-w-[200px]">
        Batch / Resource
      </th>
      {timeSlots.map(time => (
        <th key={time} className="p-4 border-b border-r border-border-light dark:border-border-dark text-[10px] font-black uppercase tracking-widest text-text-secondary text-center min-w-[200px]">
          {time}
        </th>
      ))}
    </tr>
  </thead>
);

/**
 * Renders an individual class slot with color coding
 */
export const ScheduleSlotCard = ({ slot }) => {
  const getSlotColor = (color) => {
    const colors = {
      teal: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
      blue: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      orange: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
      slate: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className={`h-full rounded-xl border p-3 flex flex-col justify-between gap-2 shadow-sm animate-in fade-in zoom-in-95 duration-300 ${getSlotColor(slot.color)}`}>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black leading-tight uppercase opacity-80">{slot.time}</span>
        <span className="text-xs font-bold leading-tight line-clamp-2">{slot.subject}</span>
      </div>
      <div className="pt-2 border-t border-current/10 flex flex-col">
        <span className="text-[9px] font-bold opacity-70 truncate">{slot.teacher}</span>
        <span className="text-[9px] font-black uppercase tracking-tighter opacity-60 flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[12px]">location_on</span>
          {slot.room}
        </span>
      </div>
    </div>
  );
};

/**
 * Renders an empty placeholder for days without a class at that slot
 */
export const EmptySlot = () => (
  <div className="h-full rounded-xl border border-dashed border-border-light dark:border-border-dark flex items-center justify-center opacity-30 group transition-all hover:opacity-50 min-h-[80px]">
    <span className="material-symbols-outlined text-slate-400 group-hover:scale-110 transition-transform">event_busy</span>
  </div>
);

/**
 * Renders the color legend at the bottom of the table
 */
export const ScheduleLegend = () => (
  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-border-light dark:border-border-dark flex items-center gap-6 overflow-x-auto">
    <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Legend:</span>
    <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-wider">
      <div className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-teal-500"></span> Science</div>
      <div className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-blue-500"></span> Core</div>
      <div className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-orange-500"></span> Exams</div>
      <div className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-indigo-500"></span> Practicals</div>
    </div>
  </div>
);
