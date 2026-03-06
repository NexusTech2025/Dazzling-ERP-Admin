import React from 'react';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';

const FeeSchedule = ({ installments }) => (
  <Card className="overflow-hidden">
    <div className="p-6 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
      <h3 className="font-bold text-text-main dark:text-white">Installment Schedule</h3>
      <Badge variant="primary">{installments.length} Total Installments</Badge>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-border-light dark:border-border-dark">
            <th className="px-6 py-4">Label</th>
            <th className="px-6 py-4">Due Date</th>
            <th className="px-6 py-4 text-right">Amount</th>
            <th className="px-6 py-4 text-right">Paid</th>
            <th className="px-6 py-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light dark:divide-border-dark">
          {installments.length > 0 ? installments.map((inst, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors text-sm">
              <td className="px-6 py-4 font-bold text-text-main dark:text-white">{inst.installment_name || `Installment ${idx+1}`}</td>
              <td className="px-6 py-4 text-text-secondary font-medium">{new Date(inst.due_date).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-right font-black text-text-main dark:text-white">${Number(inst.amount).toLocaleString()}</td>
              <td className="px-6 py-4 text-right font-bold text-emerald-600">${Number(inst.paid_amount || 0).toLocaleString()}</td>
              <td className="px-6 py-4 text-center">
                <Badge variant={inst.status === 'Paid' ? 'success' : inst.status === 'Overdue' ? 'danger' : 'warning'}>
                  {inst.status}
                </Badge>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" className="px-6 py-10 text-center text-text-secondary italic">No fee records found for this student.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </Card>
);

export default FeeSchedule;
