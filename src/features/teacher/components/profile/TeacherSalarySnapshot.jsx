import React from 'react';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';

const TeacherSalarySnapshot = () => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-text-secondary">payments</span>
        Salary & Payroll Snapshot
      </h3>
      <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View History</button>
    </div>
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-border-light dark:border-border-dark">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
          <span className="material-symbols-outlined">check_circle</span>
        </div>
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-tighter">Last Payout (Oct 2023)</p>
          <p className="text-xl font-black text-text-main dark:text-white">$4,250.00</p>
        </div>
      </div>
      <div className="h-8 w-px bg-border-light dark:bg-border-dark hidden sm:block"></div>
      <div className="text-center sm:text-left">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-tighter">Next Cycle</p>
        <p className="text-sm font-bold text-text-main dark:text-white">Nov 30, 2023</p>
      </div>
      <Badge variant="success">Processed</Badge>
    </div>
  </Card>
);

export default TeacherSalarySnapshot;
