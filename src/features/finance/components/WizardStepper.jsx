import React from 'react';

const WizardStepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center w-full max-w-4xl mx-auto overflow-x-auto pb-6 mb-8 scrollbar-hide">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = currentStep > stepNum;
        const isActive = currentStep === stepNum;
        
        return (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-3 shrink-0 group">
              <div className={`
                flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300
                ${isCompleted ? 'bg-primary text-white shadow-lg shadow-primary/20' : 
                  isActive ? 'bg-primary text-white ring-4 ring-primary/20' : 
                  'bg-background-light dark:bg-background-dark text-text-secondary border border-border-light dark:border-border-dark'}
              `}>
                {isCompleted ? <span className="material-symbols-outlined text-[18px]">check</span> : stepNum}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-bold transition-colors ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                  {step.label}
                </span>
                {step.subLabel && (
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-primary/70' : 'text-text-secondary/60'}`}>
                    {step.subLabel}
                  </span>
                )}
              </div>
            </div>
            
            {idx < steps.length - 1 && (
              <div className="flex-1 min-w-[30px] h-px bg-border-light dark:bg-border-dark mx-4 transition-colors">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-in-out" 
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default WizardStepper;
