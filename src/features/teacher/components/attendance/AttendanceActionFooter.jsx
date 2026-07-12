import React from 'react';
import Button from '../../../../components/ui/v2/Button';

export const AttendanceActionFooter = ({ isDirty, isSaving, onReset, onSave }) => {
  if (!isDirty) return null;

  return (
    <div className="w-full animate-in slide-in-from-bottom-8 duration-300 fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="bg-surface-light/95 dark:bg-[#122131]/95 border border-border-light dark:border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-lg flex items-center justify-between gap-4 max-w-7xl mx-auto">
        
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-lg animate-pulse">warning</span>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-text-main dark:text-white">Unsaved Staged Entries Active</p>
            <p className="text-[10px] text-text-secondary dark:text-slate-400">
              You have modified workspace registers. Commit changes to persist calculations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outlined" 
            size="sm" 
            onClick={onReset}
            disabled={isSaving}
          >
            Reset Changes
          </Button>
          <Button 
            variant="contained" 
            size="sm" 
            loading={isSaving} 
            onClick={onSave}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-indigo-500/25 min-w-[160px]"
          >
            Save Attendance
          </Button>
        </div>
        
      </div>
    </div>
  );
};
export default AttendanceActionFooter;
