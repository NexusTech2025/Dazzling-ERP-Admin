import React from 'react';
import { Link } from 'react-router-dom';

const WizardHeader = ({ 
  currentStep, 
  totalSteps, 
  subLabel, 
  subtotal = 0, 
  netPayable = 0 
}) => {
  return (
    <div className="flex flex-col gap-2 mb-10">
      <nav className="flex items-center gap-2 text-sm font-medium text-text-secondary">
        <Link to="/admin/finance" className="hover:text-primary transition-colors">Finance</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-text-main dark:text-white">Generative Wizard</span>
      </nav>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-text-main dark:text-white">Refine Fee Plan</h1>
          <p className="text-text-secondary mt-1 font-medium italic">Step {currentStep} of {totalSteps}: {subLabel}</p>
        </div>
        
        {/* Real-time Counter Pills */}
        <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <div className="flex items-center gap-3 pr-4 border-r border-border-light dark:border-border-dark">
            <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Base</span>
              <span className="text-xs font-black text-text-main dark:text-white">${subtotal.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Net Payable</span>
              <span className="text-sm font-black text-primary">${netPayable.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardHeader;
