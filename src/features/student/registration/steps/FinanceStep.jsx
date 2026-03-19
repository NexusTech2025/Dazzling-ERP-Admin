import React, { useMemo } from 'react';

const FinanceStep = ({ formData, setFormData, onNext, onBack }) => {
  // Mock calculation logic based on previous steps
  const baseFee = 12000; // This should come from the selected course/package
  const scholarshipAmount = formData.applicableScholarship ? (baseFee * formData.applicableScholarship / 100) : 0;
  const earlyBirdDiscount = 200;
  const finalFee = baseFee - scholarshipAmount - earlyBirdDiscount;

  const installments = useMemo(() => [
    { label: '01. Initial Deposit', date: 'Aug 15, 2024', amount: finalFee * 0.25, status: 'Pending' },
    { label: '02. Quarter 1', date: 'Oct 10, 2024', amount: finalFee * 0.25, status: 'Pending' },
    { label: '03. Quarter 2', date: 'Jan 10, 2025', amount: finalFee * 0.25, status: 'Pending' },
    { label: '04. Quarter 3', date: 'Mar 10, 2025', amount: finalFee * 0.25, status: 'Pending' },
  ], [finalFee]);

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-wrap justify-between gap-3 mb-8">
        <div className="flex min-w-72 flex-col gap-2">
          <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-tight">Review Financial Contract</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base font-normal">Please review your auto-generated fee structure and payment schedule based on the previous selection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/40 rounded-xl border border-primary/10 overflow-hidden shadow-sm">
            <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span>
              <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold">Installment Schedule</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Installment</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Due Date</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Amount</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {installments.map((inst, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{inst.label}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{inst.date}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">${inst.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-400">{inst.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <span className="material-symbols-outlined text-primary mt-1">lock</span>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Fee Plan Snapshot</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">This pricing and installment plan is locked based on current enrollment criteria.</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-900/40 rounded-xl border border-primary/20 p-6 shadow-lg sticky top-28">
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight mb-6 pb-2 border-b border-primary/10">Pricing Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Base Tuition Fee</p>
                <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">${baseFee.toLocaleString()}</p>
              </div>
              {scholarshipAmount > 0 && (
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Scholarship ({formData.applicableScholarship}%)</p>
                  <p className="text-green-600 dark:text-green-400 text-sm font-semibold">-${scholarshipAmount.toLocaleString()}</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Early Bird Discount</p>
                <p className="text-green-600 dark:text-green-400 text-sm font-semibold">-${earlyBirdDiscount.toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                <p className="text-slate-900 dark:text-slate-100 text-lg font-bold">Final Fee</p>
                <p className="text-primary text-2xl font-black">${finalFee.toLocaleString()}</p>
              </div>
            </div>
            <button 
              onClick={onNext}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 mb-3 shadow-lg shadow-primary/20 active:scale-95"
            >
              Next: Final Review
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <button 
              onClick={onBack}
              className="w-full bg-transparent hover:bg-primary/10 text-slate-600 dark:text-slate-400 font-medium py-2 px-4 rounded-lg transition-all text-sm"
            >
              Back to Step 3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceStep;
