import React from 'react';

const ActivationStep = ({ formData, setFormData, onFinish, onBack, isPending }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="layout-content-container flex flex-col max-w-[800px] flex-1 gap-6 mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col gap-3 px-4">
        <h1 className="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight">Record Initial Payment</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Finalizing registration and account activation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4">
        {/* Left Column: Payment Form */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-primary/10 shadow-sm">
            <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span>
              Payment Details
            </h3>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount to Pay (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input 
                    name="initialPaymentAmount"
                    value={formData.initialPaymentAmount || ''}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-10" 
                    type="number"
                  />
                </div>
                <p className="text-xs text-slate-500 italic">Defaulted to first installment amount</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {['cash', 'upi', 'bank'].map(method => (
                    <label key={method} className="cursor-pointer">
                      <input 
                        className="hidden peer" 
                        name="paymentMethod" 
                        type="radio" 
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={handleChange}
                      />
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all capitalize">
                        <span className="material-symbols-outlined mb-1">
                          {method === 'cash' ? 'payments' : method === 'upi' ? 'qr_code_2' : 'account_balance'}
                        </span>
                        <span className="text-xs font-semibold">{method}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                  <input 
                    name="paymentDate"
                    value={formData.paymentDate || new Date().toISOString().split('T')[0]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-10" 
                    type="date"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Transaction Ref</label>
                  <input 
                    name="transactionRef"
                    value={formData.transactionRef || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-10" 
                    placeholder="e.g. TXN-98234" 
                    type="text"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & CTA */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl border border-primary/20">
            <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">assignment_ind</span>
              Student Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Student Name</p>
                <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">{formData.fullName}</p>
              </div>
              <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Batch</p>
                <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">{formData.batchName}</p>
              </div>
              <div className="flex flex-col gap-1 border-b border-primary/10 pb-2">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Course</p>
                <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">{formData.courseName}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={onFinish}
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
              >
                {isPending ? (
                  <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined">task_alt</span>
                )}
                Complete & Activate
              </button>
              <button 
                onClick={onBack}
                className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium py-2 px-4 rounded-lg transition-all"
              >
                Back to Finance
              </button>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3 bg-white/50 dark:bg-slate-900/50">
            <span className="material-symbols-outlined text-amber-500">info</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              By clicking 'Complete & Activate', the system will generate a payment receipt and officially mark the student as 'Active'.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationStep;
