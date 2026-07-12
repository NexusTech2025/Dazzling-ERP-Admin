import React from 'react';

export const AttendanceStatusButtons = ({ row, isEditingDisabled, onStatusChange, isMobile = false }) => {
  // Select button dimensions based on layout targets
  const buttonSizingClass = isMobile
    ? 'w-10 h-10 text-[20px] rounded-sm'
    : 'w-12 h-12 text-[26px] rounded-sm';

  return (
    <div className={`flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-black/30 border border-border-light dark:border-white/5 rounded-sm w-fit mx-auto ${isEditingDisabled ? 'opacity-60 pointer-events-none' : ''
      }`}>
      {['P', 'A', 'L'].map(st => {
        const isActive = row.status === st && !row.isUnmarkedPastDate && !row.isUnmarkedCurrentDate;
        let variantColors = 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white';

        if (isActive) {
          if (st === 'P') variantColors = 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105';
          if (st === 'A') variantColors = 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105';
          if (st === 'L') variantColors = 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105';
        }

        return (
          <button
            key={st}
            disabled={isEditingDisabled}
            onClick={() => onStatusChange(row.id, st)}
            className={`${buttonSizingClass} font-black uppercase transition-all duration-200 flex items-center justify-center cursor-pointer ${variantColors}`}
          >
            {st}
          </button>
        );
      })}
    </div>
  );
};
