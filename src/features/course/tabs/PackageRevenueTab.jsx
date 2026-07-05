import React, { memo } from 'react';
import Badge from '../../../components/ui/Badge';

/**
 * PackageRevenueTab Component - Renders package revenue metrics and installment transaction ledger.
 * Supports layout adaptation via the isMobile prop.
 */
export const PackageRevenueTab = ({
  feeAccounts = [],
  isLoading = false,
  totalRevenue = 0,
  collected = 0,
  pending = 0,
  isMobile = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-background-light dark:bg-background-dark rounded-2xl p-6 border border-border-light dark:border-border-dark animate-pulse">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (feeAccounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-text-secondary">
        <span className="material-symbols-outlined text-5xl opacity-30">payments</span>
        <p className="font-black text-lg">No Revenue Data</p>
        <p className="text-sm font-medium opacity-70">Fee accounts for this package will appear here once students are enrolled.</p>
      </div>
    );
  }

  if (isMobile) {
    const installmentsList = feeAccounts.flatMap((account) =>
      (account.installments || []).map((inst) => ({
        ...inst,
        studentName: account.enrollment?.student?.student_name || 'Unknown Student'
      }))
    );

    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        {/* KPI Cards in a compact row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-xl text-center">
            <p className="text-[8px] font-black text-text-secondary uppercase">Revenue</p>
            <p className="text-xs font-black mt-0.5 text-text-main dark:text-white">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-xl text-center">
            <p className="text-[8px] font-black text-emerald-600 uppercase">Collected</p>
            <p className="text-xs font-black mt-0.5 text-emerald-600">₹{collected.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-xl text-center">
            <p className="text-[8px] font-black text-rose-500 uppercase">Pending</p>
            <p className="text-xs font-black mt-0.5 text-rose-500">₹{pending.toLocaleString()}</p>
          </div>
        </div>

        {/* Installment ledger cards */}
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase text-text-secondary">Installment Ledger</h4>
          {installmentsList.length === 0 ? (
            <p className="text-xs text-text-secondary italic">No installments logged.</p>
          ) : (
            installmentsList.map((inst, idx) => {
              const dueDate = inst.due_date
                ? new Date(inst.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                : '—';
              const isOverdue = inst.status?.toLowerCase() === 'overdue';
              return (
                <div 
                  key={inst.installment_id || idx} 
                  className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex items-center justify-between min-h-[52px]"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-text-main dark:text-white truncate">{inst.studentName}</h4>
                    <p className={`text-[10px] mt-0.5 font-medium ${isOverdue ? 'text-rose-500 font-bold' : 'text-text-secondary'}`}>
                      Due: {dueDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-text-main dark:text-white font-mono">₹{inst.amount?.toLocaleString()}</p>
                      <p className="text-[9px] text-emerald-600 font-bold font-mono">Paid: ₹{inst.paid_amount?.toLocaleString()}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      inst.status?.toLowerCase() === 'paid' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                        : isOverdue 
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' 
                        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400'
                    }`}>
                      {inst.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Desktop view layout
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: 'account_balance_wallet', color: 'blue' },
          { label: 'Collected', value: `₹${collected.toLocaleString()}`, icon: 'check_circle', color: 'emerald' },
          { label: 'Pending', value: `₹${pending.toLocaleString()}`, icon: 'pending', color: 'rose' },
        ].map((kpi, i) => (
          <div key={i} className="bg-background-light dark:bg-background-dark rounded-2xl p-6 border border-border-light dark:border-border-dark flex items-center gap-5 group hover:shadow-lg transition-all">
            <div className={`size-12 bg-${kpi.color}-100 dark:bg-${kpi.color}-900/30 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
              <span className={`material-symbols-outlined text-${kpi.color}-600 text-xl`}>{kpi.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.15em] mb-1">{kpi.label}</p>
              <p className="text-2xl font-black text-text-main dark:text-white">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Installment Ledger */}
      <div className="bg-background-light dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark">
          <h3 className="font-black text-sm text-text-main dark:text-white uppercase tracking-widest">Installment Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-border-light dark:border-border-dark">
                <th className="px-6 py-3 text-left">Student</th>
                <th className="px-6 py-3 text-right">Due Amount</th>
                <th className="px-6 py-3 text-right">Paid</th>
                <th className="px-6 py-3 text-left">Due Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {feeAccounts.flatMap((account) =>
                (account.installments || []).map((inst) => {
                  const studentName = account.enrollment?.student?.student_name || '—';
                  const dueDate = inst.due_date
                    ? new Date(inst.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';
                  const isOverdue = inst.status === 'overdue';
                  return (
                    <tr
                      key={inst.installment_id}
                      className="border-b border-border-light dark:border-border-dark last:border-0 hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-text-main dark:text-white">{studentName}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-text-main dark:text-white">₹{(inst.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">₹{(inst.paid_amount || 0).toLocaleString()}</td>
                      <td className={`px-6 py-4 font-medium ${isOverdue ? 'text-rose-500' : 'text-text-secondary'}`}>{dueDate}</td>
                      <td className="px-6 py-4">
                        <Badge variant={inst.status === 'paid' ? 'success' : isOverdue ? 'danger' : 'warning'}>
                          {inst.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default memo(PackageRevenueTab);
