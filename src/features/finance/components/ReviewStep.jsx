import React from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

const ReviewStep = ({ enrollment, structure, calculations, isVerified, onSetIsVerified }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-3 pb-4">
        <h3 className="text-3xl font-black text-text-main dark:text-white tracking-tight">Final Review & Verification</h3>
        <p className="text-text-secondary font-medium max-w-lg mx-auto">Please perform a final audit of the student's fee plan. Once confirmed, the payment schedule will be active.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="background" className="p-6 border-2 border-primary/5">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="primary">Student Profile</Badge>
            <span className="material-symbols-outlined text-text-secondary opacity-20">person</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl border-2 border-primary/5">
              {enrollment.studentName ? enrollment.studentName.substring(0, 2).toUpperCase() : '??'}
            </div>
            <div>
              <h4 className="text-lg font-black text-text-main dark:text-white">{enrollment.studentName}</h4>
              <p className="text-sm text-text-secondary font-medium tracking-tight">ID: {enrollment.studentId}</p>
              <p className="text-xs text-text-secondary mt-1">{enrollment.email}</p>
            </div>
          </div>
        </Card>
        
        <Card variant="background" className="p-6 border-2 border-indigo-500/5">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="info">Enrollment Goal</Badge>
            <span className="material-symbols-outlined text-text-secondary opacity-20">school</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border-2 border-indigo-500/5">
              <span className="material-symbols-outlined text-2xl">menu_book</span>
            </div>
            <div>
              <h4 className="text-lg font-black text-text-main dark:text-white">{enrollment.programName}</h4>
              <p className="text-sm text-text-secondary font-medium tracking-tight">2026 January Batch • Full-time</p>
              <p className="text-xs text-text-secondary mt-1">Cohort: DSC-2026-A</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border-2 border-border-light dark:border-border-dark">
        <Card.Header className="bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest">Financial Audit Table</h4>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-text-secondary uppercase">Live Calculation</span>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                  <td className="p-5 text-text-secondary font-bold">Base Fee Structure</td>
                  <td className="p-5 text-right font-black text-text-main dark:text-white text-base">${calculations.subtotal.toLocaleString()}</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                  <td className="p-5 text-text-secondary font-bold">Government Taxes / GST ({structure.taxPercent}%)</td>
                  <td className="p-5 text-right font-black text-text-main dark:text-white text-base">${calculations.taxAmount.toLocaleString()}</td>
                </tr>
                <tr className="bg-emerald-50/20 dark:bg-emerald-900/5">
                  <td className="p-5 text-emerald-600 font-black">Applied Financial Incentives</td>
                  <td className="p-5 text-right font-black text-emerald-600 text-base">-${calculations.totalDiscount.toLocaleString()}</td>
                </tr>
                <tr className="bg-primary/5">
                  <td className="p-6">
                    <p className="text-xl font-black text-text-main dark:text-white">Net Total Payable</p>
                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mt-1 italic">Authorized for installment generation</p>
                  </td>
                  <td className="p-6 text-right font-black text-primary text-3xl">
                    ${calculations.netPayable.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      <div className="flex flex-col items-center gap-6 pt-6 bg-surface-light dark:bg-surface-dark rounded-2xl border-2 border-dashed border-border-light dark:border-border-dark p-8">
        <label className="flex items-center gap-4 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only"
              checked={isVerified}
              onChange={(e) => onSetIsVerified(e.target.checked)}
            />
            <div className={`size-7 rounded-lg border-2 transition-all flex items-center justify-center ${
              isVerified ? 'bg-primary border-primary scale-110 shadow-lg shadow-primary/20' : 'border-border-light dark:border-border-dark group-hover:border-primary/50'
            }`}>
              {isVerified && <span className="material-symbols-outlined text-white text-[20px] font-black">check</span>}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-text-main dark:text-white group-hover:text-primary transition-colors">Verified for Generation</span>
            <span className="text-xs text-text-secondary font-medium">I attest that the fee structure and schedule align with institutional policy.</span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default ReviewStep;
