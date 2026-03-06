import React from 'react';
import InstallmentScheduler from './InstallmentScheduler';

const InstallmentsStep = ({ 
  scheduling, 
  calculations, 
  onSetSchedulingConfig, 
  onGenerateSchedule, 
  onUpdateInstallment, 
  onAddManualInstallment, 
  onDeleteInstallment 
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <InstallmentScheduler 
        installments={scheduling.installments}
        config={{
          count: scheduling.count,
          setCount: (n) => onSetSchedulingConfig({ count: n }),
          frequency: scheduling.frequency,
          setFrequency: (f) => onSetSchedulingConfig({ frequency: f })
        }}
        onGenerate={onGenerateSchedule}
        onChange={onUpdateInstallment}
        onAdd={onAddManualInstallment}
        onDelete={onDeleteInstallment}
      />
      {!calculations.isBalanced && scheduling.installments.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 shadow-sm animate-pulse">
          <span className="material-symbols-outlined text-xl">warning</span>
          <p className="text-sm font-black">UNBALANCED: The total scheduled amount (${calculations.installmentSum.toLocaleString()}) must match the Net Payable (${calculations.netPayable.toLocaleString()}).</p>
        </div>
      )}
    </div>
  );
};

export default InstallmentsStep;
