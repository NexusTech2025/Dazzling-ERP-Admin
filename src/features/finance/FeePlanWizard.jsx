import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGenerateFeePlanMutation } from './hooks/useFinanceQueries';
import { useCoursesQuery } from '../course/hooks/useCourseQueries';

/**
 * Multi-step wizard to generate a fee plan for a student.
 */
const FeePlanWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const generateMutation = useGenerateFeePlanMutation();
  const { data: courses = [] } = useCoursesQuery();

  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    discount: 0,
    installments: 4
  });

  const selectedCourse = courses.find(c => c.course_id === formData.courseId);
  const baseFee = selectedCourse ? Number(selectedCourse.base_fee) : 0;
  const netPayable = baseFee - formData.discount;

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleGenerate = () => {
    generateMutation.mutate({
      data: {
        student_id: formData.studentId,
        course_id: formData.courseId,
        total_amount: netPayable,
        installments: formData.installments
      }
    }, {
      onSuccess: () => navigate('/admin/finance/installments')
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <nav className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Link to="/admin/finance" className="hover:text-primary">Finance</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-text-main dark:text-white">Generate Fee Plan</span>
        </nav>
        <h1 className="text-3xl font-black tracking-tight text-text-main dark:text-white">Review Fee Plan</h1>
        <p className="text-text-secondary">Step {step} of 4: Configure the financial structure.</p>
      </div>

      {/* Basic Stepper UI */}
      <div className="flex items-center gap-4 mb-8 border-b border-border-light dark:border-border-dark pb-4 overflow-x-auto">
        {['Enrollment', 'Discount', 'Installments', 'Preview'].map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center justify-center size-8 rounded-full font-bold text-sm transition-colors ${
              step > idx + 1 ? 'bg-green-100 text-green-700' : step === idx + 1 ? 'bg-primary text-white' : 'bg-background-light dark:bg-background-dark text-text-secondary border border-border-light dark:border-border-dark'
            }`}>
              {step > idx + 1 ? <span className="material-symbols-outlined text-sm">check</span> : idx + 1}
            </div>
            <span className={`text-sm font-bold ${step === idx + 1 ? 'text-primary' : 'text-text-secondary'}`}>{label}</span>
            {idx < 3 && <div className="w-8 h-px bg-border-light dark:bg-border-dark mx-2"></div>}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm p-8 min-h-[400px]">
        {step === 1 && (
          <div className="space-y-6 max-w-md animate-in fade-in">
            <h3 className="text-xl font-bold text-text-main dark:text-white">Select Enrollment</h3>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main dark:text-white">Student ID</label>
              <input 
                type="text" 
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4"
                value={formData.studentId}
                onChange={e => setFormData({...formData, studentId: e.target.value})}
                placeholder="e.g. STU-001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main dark:text-white">Course</label>
              <select 
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4"
                value={formData.courseId}
                onChange={e => setFormData({...formData, courseId: e.target.value})}
              >
                <option value="">Select a course...</option>
                {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.name} (${c.base_fee})</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 max-w-md animate-in fade-in">
            <h3 className="text-xl font-bold text-text-main dark:text-white">Apply Discounts</h3>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main dark:text-white">Flat Discount Amount ($)</label>
              <input 
                type="number" 
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4"
                value={formData.discount}
                onChange={e => setFormData({...formData, discount: Number(e.target.value)})}
                max={baseFee}
                min={0}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 max-w-md animate-in fade-in">
            <h3 className="text-xl font-bold text-text-main dark:text-white">Installment Schedule</h3>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main dark:text-white">Number of Payments</label>
              <select 
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4"
                value={formData.installments}
                onChange={e => setFormData({...formData, installments: Number(e.target.value)})}
              >
                {[1,2,3,4,5,6,12].map(n => <option key={n} value={n}>{n} Payments</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
                <p className="text-sm text-text-secondary font-medium">Base Fee</p>
                <p className="text-2xl font-black text-text-main dark:text-white">${baseFee}</p>
              </div>
              <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
                <p className="text-sm text-text-secondary font-medium">Discount</p>
                <p className="text-2xl font-black text-emerald-600">-${formData.discount}</p>
              </div>
              <div className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                <p className="text-sm text-primary font-bold">Net Payable</p>
                <p className="text-2xl font-black text-primary">${netPayable}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4 text-text-main dark:text-white">Generated Schedule</h4>
              <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark text-text-secondary">
                    <tr>
                      <th className="p-4 font-bold">#</th>
                      <th className="p-4 font-bold">Amount</th>
                      <th className="p-4 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark">
                    {[...Array(formData.installments)].map((_, i) => (
                      <tr key={i}>
                        <td className="p-4 font-medium">{i + 1}</td>
                        <td className="p-4 font-black text-text-main dark:text-white">${(netPayable / formData.installments).toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">Scheduled</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-end gap-3 pt-4">
        {step > 1 && (
          <button onClick={prevStep} className="px-6 py-2.5 rounded-xl border border-border-light dark:border-border-dark font-bold text-text-secondary hover:text-text-main transition-colors">
            Back
          </button>
        )}
        {step < 4 ? (
          <button 
            onClick={nextStep} 
            disabled={step === 1 && (!formData.studentId || !formData.courseId)}
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50"
          >
            Next Step
          </button>
        ) : (
          <button 
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {generateMutation.isPending ? 'Generating...' : 'Confirm & Generate'}
          </button>
        )}
      </div>
    </div>
  );
};

export default FeePlanWizard;
