import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStudentFeeOverviewQuery } from './hooks/useFinanceQueries';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import RecordPaymentModal from './RecordPaymentModal';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/react-query/queryKeys';

/**
 * Individual Student Fee Overview
 * Detailed financial profile for a specific student.
 */
const StudentFeeOverview = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [paymentModalData, setPaymentModalData] = useState(null);

  const { data: installments = [], isLoading, error } = useStudentFeeOverviewQuery(id);

  if (isLoading) return <LoadingState message="Loading student financial profile..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.finance.installments.student(id) })} />;

  // Derived metrics from installments
  const totalFee = installments.reduce((sum, inst) => sum + Number(inst.amount), 0);
  const totalPaid = installments.reduce((sum, inst) => sum + Number(inst.paid_amount), 0);
  const pendingDue = totalFee - totalPaid;

  const studentName = installments.length > 0 ? installments[0].student_name : 'Unknown Student';
  const courseName = installments.length > 0 ? installments[0].course_name : 'N/A';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <Link to="/admin/finance" className="hover:text-primary">Finance</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <Link to="/admin/finance/installments" className="hover:text-primary">Installments</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-text-main dark:text-white font-medium">Student Overview</span>
          </div>
          <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight">Student Fee Overview</h1>
          <p className="text-text-secondary mt-1 font-medium">Financial summary for ID: <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{id}</span></p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-text-main dark:text-white bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Statement
          </button>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-black shrink-0">
            {studentName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-black text-text-main dark:text-white">{studentName}</h2>
                <p className="text-text-secondary font-medium">{courseName}</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 tracking-wider uppercase">
                Status: Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-text-secondary">
            <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            <p className="text-sm font-bold uppercase tracking-wider">Total Fee</p>
          </div>
          <p className="text-3xl font-black text-text-main dark:text-white">${totalFee.toLocaleString()}</p>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-blue-500">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <p className="text-sm font-bold uppercase tracking-wider">Total Paid</p>
          </div>
          <p className="text-3xl font-black text-blue-600">${totalPaid.toLocaleString()}</p>
          <div className="mt-4 h-1.5 w-full bg-background-light dark:bg-background-dark rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${totalFee > 0 ? (totalPaid / totalFee) * 100 : 0}%` }}></div>
          </div>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-red-500">
            <span className="material-symbols-outlined text-lg">pending</span>
            <p className="text-sm font-bold uppercase tracking-wider">Pending Due</p>
          </div>
          <p className="text-3xl font-black text-red-600">${pendingDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Installment Breakdown */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border-light dark:border-border-dark">
          <h3 className="text-xl font-bold text-text-main dark:text-white">Installment Breakdown</h3>
          <p className="text-sm text-text-secondary">Schedule of payments for the current enrollment</p>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm">
            <thead className="bg-background-light dark:bg-background-dark text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs">Inst ID</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs">Due Date</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs">Amount</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs">Paid</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs">Status</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {installments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-text-secondary font-medium">No installment data found.</td>
                </tr>
              ) : installments.map((inst) => {
                const isOverdue = inst.status === 'Overdue';
                const isPaid = inst.status === 'Paid';
                const pendingAmount = Number(inst.amount) - Number(inst.paid_amount);

                return (
                  <tr key={inst.installment_id} className={`hover:bg-background-light/50 dark:hover:bg-background-dark/50 transition-colors ${isOverdue ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                    <td className="px-6 py-4 font-mono font-medium text-text-main dark:text-white">{inst.installment_id}</td>
                    <td className={`px-6 py-4 font-bold ${isOverdue ? 'text-red-600' : 'text-text-secondary'}`}>
                      {new Date(inst.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-black text-text-main dark:text-white">${Number(inst.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-text-secondary">${Number(inst.paid_amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isPaid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {inst.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isPaid && (
                        <button 
                          onClick={() => setPaymentModalData(inst)}
                          className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-all shadow-sm active:scale-95"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      <RecordPaymentModal 
        isOpen={!!paymentModalData} 
        onClose={() => setPaymentModalData(null)} 
        installment={paymentModalData} 
      />
    </div>
  );
};

export default StudentFeeOverview;
