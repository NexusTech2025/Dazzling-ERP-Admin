import React from 'react';

const WizardFooter = ({ 
  currentStep, 
  onPrev, 
  onNext, 
  onCancel, 
  onFinalize, 
  canProceed, 
  isPending 
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-72 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-xl border-t border-border-light dark:border-border-dark p-4 z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
        <button 
          onClick={onPrev}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black transition-all group ${
            currentStep === 1 
              ? 'opacity-0 pointer-events-none' 
              : 'text-text-secondary hover:text-text-main dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back
        </button>
        
        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
          >
            Cancel Wizard
          </button>
          
          {currentStep < 5 ? (
            <button 
              onClick={onNext}
              disabled={!canProceed}
              className="flex items-center gap-2 px-10 py-3 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-40 disabled:grayscale group"
            >
              Next Step
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          ) : (
            <button 
              onClick={onFinalize}
              disabled={!canProceed || isPending}
              className="flex items-center gap-3 px-12 py-3 bg-emerald-600 text-white font-black rounded-xl shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <span className="size-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              )}
              {isPending ? 'Generating Schedule...' : 'Finalize & Create Plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardFooter;
