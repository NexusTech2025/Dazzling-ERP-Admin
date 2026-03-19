import React from 'react';

const ProgramStep = ({ formData, setFormData, onNext, onBack }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="layout-content-container flex flex-col max-w-[800px] flex-1 gap-8 mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Student Registration</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Step 2: Program Details & Admission Context</p>
      </div>

      {/* Program Selection Section */}
      <section className="bg-white dark:bg-slate-800/40 p-6 rounded-xl shadow-sm border border-primary/5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">category</span>
          Program Selection
        </h3>
        <div className="flex bg-slate-100 dark:bg-background-dark p-1.5 rounded-xl">
          <label className="flex-1">
            <input 
              className="peer hidden" 
              name="programType" 
              type="radio" 
              value="academic"
              checked={formData.programType === 'academic'}
              onChange={handleChange}
            />
            <div className="cursor-pointer text-center py-3 rounded-lg text-slate-500 peer-checked:bg-primary peer-checked:text-white transition-all font-semibold text-sm">
              Academic Package
            </div>
          </label>
          <label className="flex-1">
            <input 
              className="peer hidden" 
              name="programType" 
              type="radio" 
              value="single"
              checked={formData.programType === 'single'}
              onChange={handleChange}
            />
            <div className="cursor-pointer text-center py-3 rounded-lg text-slate-500 peer-checked:bg-primary peer-checked:text-white transition-all font-semibold text-sm">
              Single Course
            </div>
          </label>
        </div>
      </section>

      {/* Admission Context Section */}
      <section className="bg-white dark:bg-slate-800/40 p-6 rounded-xl shadow-sm border border-primary/5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">assignment_ind</span>
          Admission Context
        </h3>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Admission Type</label>
          <div className="relative">
            <select 
              name="admissionType"
              value={formData.admissionType || ''}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark py-3 px-4 focus:ring-primary focus:border-primary appearance-none h-12"
            >
              <option value="" disabled>Select Admission Type</option>
              <option value="direct">Direct Admission</option>
              <option value="merit">Merit Based</option>
              <option value="entrance">Entrance Exam</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Benefits Section */}
      <section className="bg-white dark:bg-slate-800/40 p-6 rounded-xl shadow-sm border border-primary/5">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">featured_seasonal_and_gifts</span>
          Apply Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coupon Code */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Coupon Code</label>
            <div className="flex gap-2">
              <input 
                name="couponCode"
                value={formData.couponCode || ''}
                onChange={handleChange}
                className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark py-2 px-4 focus:ring-primary focus:border-primary uppercase placeholder:text-slate-300 h-11" 
                placeholder="ENTER CODE" 
                type="text"
              />
              <button 
                type="button"
                className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary transition-colors h-11"
              >
                Apply
              </button>
            </div>
          </div>
          {/* Referral Discount */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Referral ID</label>
            <input 
              name="referralId"
              value={formData.referralId || ''}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark py-2 px-4 focus:ring-primary focus:border-primary h-11" 
              placeholder="Optional" 
              type="text"
            />
          </div>
          {/* Scholarship Fields */}
          <div className="col-span-1 md:col-span-2 mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">Entrance Exam Scholarship Eligibility</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Entrance Exam Score</label>
                <div className="relative">
                  <input 
                    name="entranceScore"
                    value={formData.entranceScore || ''}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark py-2 pl-4 pr-10 focus:ring-primary focus:border-primary h-11" 
                    placeholder="0 - 100" 
                    type="number"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Scholarship % Applicable</label>
                <input 
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 py-2 px-4 text-primary font-bold h-11" 
                  readOnly 
                  type="text" 
                  value={`${formData.applicableScholarship || 0}%`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center px-4 py-6 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>
        <button 
          onClick={onNext}
          className="bg-primary text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          Save & Continue
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default ProgramStep;
