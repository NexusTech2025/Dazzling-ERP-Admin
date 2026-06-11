import React, { useMemo } from 'react';
import { useCourseDetailQuery } from '../../../course/hooks/useCourseQueries';

/**
 * FinanceStep: Step 3 of the student registration wizard.
 * Loads dynamic course fee rates and installment counts using TanStack query cache hooks.
 * Dynamically computes installment timelines and dates spaced 30 days apart,
 * resolving the Indian Rupees (₹) currency symbol, and validates mathematical checks.
 * 
 * @param {object} props
 * @param {object} props.formData - The registration wizard state object.
 * @param {function} props.setFormData - Wizard state mutator hook.
 * @param {function} props.onNext - Transition to Step 4 callback.
 * @param {function} props.onBack - Transition to Step 2 callback.
 */
const FinanceStep = ({ formData, setFormData, onNext, onBack }) => {
  // Retrieve the dynamically selected course metadata details
  const { data: courseDetail, isLoading: isCourseLoading } = useCourseDetailQuery(formData.courseId);

  // Dynamic pricing calculations
  const baseFee = courseDetail?.base_fee || 12000; // Fallback to 12000 if not cached
  const scholarshipPercent = formData.applicableScholarship || 0;
  const scholarshipAmount = scholarshipPercent > 0 ? Math.round((baseFee * scholarshipPercent) / 100) : 0;
  const earlyBirdDiscount = 200; // Static early-bird incentive mapping
  const finalFee = Math.max(0, baseFee - scholarshipAmount - earlyBirdDiscount);

  // Dynamic installment count resolved directly from schema
  const installmentCount = courseDetail?.default_installment_count || 1;

  // Generate dynamic installment breakdowns with absolute mathematical checksum consistency
  const installments = useMemo(() => {
    const list = [];
    if (installmentCount <= 1) {
      // Single payment cycle mapping
      list.push({
        label: '01. Full Course Payment',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: finalFee,
        status: 'Pending'
      });
      return list;
    }

    // Split finalFee evenly across the installment count
    const standardAmount = Math.floor(finalFee / installmentCount);
    const remainder = finalFee - (standardAmount * installmentCount);

    for (let i = 0; i < installmentCount; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (i * 30)); // 30-day interval spacing

      // Add the remainder division to the first installment (deposit) to ensure perfect matching
      const amount = i === 0 ? standardAmount + remainder : standardAmount;
      const label = i === 0 
        ? '01. Initial Deposit' 
        : `${String(i + 1).padStart(2, '0')}. Installment ${i}`;

      list.push({
        label,
        date: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount,
        status: 'Pending'
      });
    }
    return list;
  }, [finalFee, installmentCount]);

  // Compute mathematical checksum validation
  const calculatedSum = useMemo(() => {
    return installments.reduce((acc, curr) => acc + curr.amount, 0);
  }, [installments]);

  const isChecksumValid = calculatedSum === finalFee;

  // Persist calculated ledger values inside master wizard state before stepping forward
  const handleNext = () => {
    setFormData(prev => ({
      ...prev,
      baseFee,
      scholarshipAmount,
      earlyBirdDiscount,
      finalFee,
      installments: installments.map(inst => ({
        label: inst.label,
        dueDate: inst.date,
        amount: inst.amount,
        status: inst.status
      })),
      initialPaymentAmount: prev.initialPaymentAmount || installments[0]?.amount || ''
    }));
    onNext();
  };

  if (isCourseLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading dynamic fee structures...</p>
      </div>
    );
  }

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header Description */}
      <div className="flex flex-wrap justify-between gap-3 mb-8">
        <div className="flex min-w-72 flex-col gap-2">
          <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-tight">Review Financial Contract</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base font-normal">Review your dynamically generated fee ledger structure and installment timelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Left Column: Installment Schedule Table (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/40 rounded-xl border border-primary/10 overflow-hidden shadow-sm">
            <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold">Installment Schedule</h2>
              </div>
              
              {/* Checksum Validator Indicator */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isChecksumValid 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                <span className="material-symbols-outlined text-sm">
                  {isChecksumValid ? 'check_circle' : 'warning'}
                </span>
                {isChecksumValid ? 'Checksum Verified' : 'Checksum Error'}
              </div>
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
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{inst.label}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{inst.date}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">₹ {inst.amount.toLocaleString()}</td>
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
              <p className="font-bold text-slate-900 dark:text-slate-100">Fee Plan Locked</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Billing records will be created in the database based on a total count of <strong className="text-primary">{installmentCount}</strong> installment cycles.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Summary sticky card (1/3 width) */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-900/40 rounded-xl border border-primary/20 p-6 shadow-lg sticky top-28">
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight mb-6 pb-2 border-b border-primary/10">Pricing Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Base Tuition Fee</p>
                <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">₹ {baseFee.toLocaleString()}</p>
              </div>
              {scholarshipAmount > 0 && (
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Scholarship ({scholarshipPercent}%)</p>
                  <p className="text-green-600 dark:text-green-400 text-sm font-semibold">-₹ {scholarshipAmount.toLocaleString()}</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Early Bird Discount</p>
                <p className="text-green-600 dark:text-green-400 text-sm font-semibold">-₹ {earlyBirdDiscount.toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                <p className="text-slate-900 dark:text-slate-100 text-lg font-bold">Final Fee</p>
                <p className="text-primary text-2xl font-black">₹ {finalFee.toLocaleString()}</p>
              </div>
            </div>
            
            <button 
              onClick={handleNext}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 mb-3 shadow-lg shadow-primary/20 active:scale-95"
            >
              Next: Final Review
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            
            <button 
              onClick={onBack}
              className="w-full bg-transparent hover:bg-primary/10 text-slate-600 dark:text-slate-400 font-medium py-2 px-4 rounded-lg transition-all text-sm"
            >
              Back to Academic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceStep;
