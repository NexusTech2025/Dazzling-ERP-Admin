import React from 'react';

// ==========================================
// Variant 1: Simple Thin Line Stepper Component
// ==========================================
const SimpleStepper = ({ currentStep, totalSteps, steps, percentage }) => {
  return (
    <div className="mb-6 w-full rounded-2xl bg-white dark:bg-slate-900/50 p-4 shadow-sm border border-primary/5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step {currentStep} of {totalSteps}</span>
        <span className="text-xs font-bold text-primary">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
      </div>

      <div className="relative flex justify-between items-center w-full px-4">
        {/* Background thin line track */}
        <div className="absolute left-0 right-0 h-[2px] bg-slate-200 dark:bg-slate-800 top-3 -translate-y-1/2 z-0">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          
          return (
            <div key={label} className="relative flex flex-col items-center z-10">
              <div className={`
                size-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300
                ${isCompleted 
                  ? 'bg-primary text-white scale-100' 
                  : isActive 
                  ? 'bg-primary text-white ring-4 ring-primary/20 scale-110' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}
              `}>
                {isCompleted ? (
                  <span className="material-symbols-outlined text-xs font-black">check</span>
                ) : (
                  stepNum
                )}
              </div>
              <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// Variant 2: Brand Orange Accent Stepper Component
// ==========================================
const BrandOrangeStepper = ({ currentStep, totalSteps, steps, percentage }) => {
  return (
    <div className="mb-6 w-full rounded-2xl bg-white dark:bg-slate-900/50 p-4 shadow-sm border border-primary/5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Standard Wizard Progression</span>
        <span className="text-xs font-bold text-amber-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
      </div>

      <div className="relative flex justify-between items-center w-full px-4">
        <div className="absolute left-0 right-0 h-[2px] bg-slate-200 dark:bg-slate-800 top-3 -translate-y-1/2 z-0">
          <div 
            className="h-full bg-amber-500 transition-all duration-500 ease-in-out" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          
          return (
            <div key={label} className="relative flex flex-col items-center z-10">
              <div className={`
                size-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300
                ${isCompleted 
                  ? 'bg-amber-500 text-white' 
                  : isActive 
                  ? 'bg-amber-500 text-white ring-4 ring-amber-500/20 scale-110 shadow-md shadow-amber-500/10' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}
              `}>
                {isCompleted ? (
                  <span className="material-symbols-outlined text-xs font-bold">check</span>
                ) : (
                  stepNum
                )}
              </div>
              <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-amber-500' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// Variant 3: Gradient Accent Stepper Component
// ==========================================
const GradientAccentStepper = ({ currentStep, totalSteps, steps, percentage }) => {
  return (
    <div className="mb-6 max-w-xl mx-auto w-full rounded-2xl bg-white dark:bg-slate-900/50 p-4 shadow-sm border border-primary/5">
      <div className="relative flex justify-between items-center w-full px-6">
        {/* Subtle gradient track line */}
        <div className="absolute left-0 right-0 h-[2px] bg-slate-200 dark:bg-slate-800 top-3 -translate-y-1/2 z-0">
          <div 
            className="h-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-500 ease-in-out" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          
          return (
            <div key={label} className="relative flex flex-col items-center z-10">
              <div className={`
                size-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-300
                ${isCompleted 
                  ? 'bg-gradient-to-r from-primary to-amber-500 text-white' 
                  : isActive 
                  ? 'bg-primary text-white ring-4 ring-primary/30 scale-110 shadow-lg shadow-primary/30' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}
              `}>
                {stepNum}
              </div>
              <span className={`mt-2 text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// Variant 4: Glassmorphic Minimal Dot Bar Component
// ==========================================
const GlassIndicatorStepper = ({ currentStep, totalSteps, steps, percentage }) => {
  return (
    <div className="mb-6 w-full rounded-xl bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-md p-3 shadow-sm border border-white/10 flex items-center justify-between gap-6">
      <div className="flex flex-col gap-0.5 pl-2">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary leading-none">Wizard Progress</span>
        <span className="text-xs font-bold text-slate-800 dark:text-white leading-none mt-1">
          {steps[currentStep - 1]}
        </span>
      </div>

      <div className="hidden sm:flex flex-1 max-w-xs relative justify-between items-center px-4">
        <div className="absolute left-0 right-0 h-[1px] bg-slate-300 dark:bg-slate-800 top-1/2 -translate-y-1/2 z-0">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          
          return (
            <div key={label} className="relative z-10 flex items-center justify-center">
              <div className={`
                size-3.5 rounded-full transition-all duration-300 flex items-center justify-center
                ${isCompleted 
                  ? 'bg-primary' 
                  : isActive 
                  ? 'bg-primary ring-4 ring-primary/20 scale-110' 
                  : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'}
              `}>
                {isActive && <div className="size-1 bg-white rounded-full"></div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-3 py-1 rounded bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
        {Math.round((currentStep / totalSteps) * 100)}% Done
      </div>
    </div>
  );
};

// ==========================================
// Main ProgressStepper Router Component
// ==========================================
const ProgressStepper = ({ 
  currentStep, 
  totalSteps = 4, 
  steps = ['Profile', 'Academic', 'Finance', 'Activate'],
  variant = 'simple' // 'simple' | 'brand-orange' | 'gradient-accent' | 'glass-indicator'
}) => {
  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const props = { currentStep, totalSteps, steps, percentage };

  switch (variant) {
    case 'brand-orange':
      return <BrandOrangeStepper {...props} />;
    case 'gradient-accent':
      return <GradientAccentStepper {...props} />;
    case 'glass-indicator':
      return <GlassIndicatorStepper {...props} />;
    case 'simple':
    default:
      return <SimpleStepper {...props} />;
  }
};

export default ProgressStepper;
