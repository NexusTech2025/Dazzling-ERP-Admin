import React from 'react';

/**
 * StepNavigation: Standard footer navigation buttons for Wizard Steps.
 */
const StepNavigation = ({ onBack, onNext, isNextDisabled }) => {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
      <button 
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back
      </button>
      <button 
        type="button"
        disabled={isNextDisabled}
        onClick={onNext}
        className="flex items-center gap-2 px-10 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
      >
        Save & Continue
        <span className="material-symbols-outlined text-lg">arrow_forward</span>
      </button>
    </div>
  );
};

export default StepNavigation;
