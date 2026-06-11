import React from 'react';

/**
 * BatchPlaceholderCard: Renders the empty state placeholder for batch selection.
 */
const BatchPlaceholderCard = ({ onSelectClick }) => {
  return (
    <div className="bg-white/50 dark:bg-slate-900/50 border border-dashed border-primary/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4 min-h-[220px]">
      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined text-2xl">group_add</span>
      </div>
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white mb-1">No Active Batch Selected</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">Please select a class batch schedule containing an active branch, syllabus, and teacher profile to complete the enrollment.</p>
      </div>
      <button
        type="button"
        onClick={onSelectClick}
        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-dark transition-all"
      >
        Select Active Batch
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    </div>
  );
};

export default BatchPlaceholderCard;
