import React from 'react';
import { Link } from 'react-router-dom';
import { useRevenueSummaryQuery, useInstallmentsQuery } from './hooks/useFinanceQueries';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';

/**
 * Institutional Finance Dashboard
 * High-level overview of revenue, collections, and overdue payments.
 */
const FinanceDashboard = () => {
  const { data: summary, isLoading: isSummaryLoading, error: summaryError } = useRevenueSummaryQuery();
  const { data: recentPayments = [], isLoading: isPaymentsLoading } = useInstallmentsQuery({ limit: 5 });

  if (isSummaryLoading) return <LoadingState message="Calculating financial metrics..." />;
  if (summaryError) return <ErrorState message={summaryError.message} />;

  const kpis = [
    { 
      label: 'Total Collected', 
      value: summary?.total_collected || 0, 
      trend: '+12%', 
      color: 'text-emerald-600', 
      bg: 'bg-blue-50 dark:bg-blue-900/30', 
      icon: 'payments' 
    },
    { 
      label: 'Pending Fees', 
      value: summary?.total_pending || 0, 
      trend: '+5%', 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 dark:bg-amber-900/30', 
      icon: 'hourglass_top' 
    },
    { 
      label: 'Overdue', 
      value: summary?.total_overdue || 0, 
      trend: '-2%', 
      color: 'text-red-600', 
      bg: 'bg-red-50 dark:bg-red-900/30', 
      icon: 'warning',
      link: '/admin/finance/delinquent'
    },
    { 
      label: 'Monthly Revenue', 
      value: 120000, 
      trend: '+8%', 
      color: 'text-emerald-600', 
      bg: 'bg-purple-50 dark:bg-purple-900/30', 
      icon: 'calendar_today' 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight">Finance Dashboard</h1>
          <p className="text-text-secondary mt-1">Institutional financial health and revenue distribution.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-surface-light dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-text-main dark:text-white font-bold py-2.5 px-4 rounded-xl transition-all border border-border-light dark:border-border-dark shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span className="hidden sm:inline">Export</span>
          </button>
          <Link to="/admin/finance/fee-plan" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Generate Fee Plan</span>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const CardContent = (
            <div className={`bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-border-light dark:border-border-dark flex flex-col justify-between h-40 group transition-all ${kpi.link ? 'hover:border-primary cursor-pointer hover:shadow-md' : 'hover:border-primary/50'}`}>
              <div className="flex justify-between items-start">
                <div className={`p-2 ${kpi.bg} rounded-lg text-primary`}>
                  <span className="material-symbols-outlined">{kpi.icon}</span>
                </div>
                <span className={`flex items-center text-xs font-black ${kpi.color} bg-background-light dark:bg-background-dark px-2.5 py-1 rounded-full border border-border-light dark:border-border-dark`}>
                  {kpi.trend}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{kpi.label}</p>
                <div className="flex items-center justify-between mt-1">
                  <h3 className="text-2xl font-black text-text-main dark:text-white">
                    ${Number(kpi.value).toLocaleString()}
                  </h3>
                  {kpi.link && <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>}
                </div>
              </div>
            </div>
          );

          return kpi.link ? <Link key={idx} to={kpi.link}>{CardContent}</Link> : <React.Fragment key={idx}>{CardContent}</React.Fragment>;
        })}
      </div>

      {/* Main Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-border-light dark:border-border-dark lg:col-span-2">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-bold text-text-main dark:text-white tracking-tight">Revenue Trend</h3>
              <p className="text-sm text-text-secondary">Academic Year 2023-24 Performance</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-text-main dark:text-white">$1.2M</span>
              <p className="text-xs font-bold text-emerald-600 uppercase">+8.5% VS LAST YEAR</p>
            </div>
          </div>
          
          {/* Mock Chart Area */}
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[40, 55, 35, 70, 60, 80, 45, 90, 65, 85, 50, 95].map((h, i) => (
              <div key={i} className="w-full bg-primary/5 dark:bg-primary/10 rounded-t-lg relative group h-full">
                <div 
                  className="absolute bottom-0 w-full bg-primary rounded-t-lg opacity-80 group-hover:opacity-100 transition-all cursor-pointer" 
                  style={{ height: `${h}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-text-main text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap transition-all">
                    ${h}k
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-black text-text-secondary uppercase tracking-widest px-2">
            <span>Jan</span><span>Dec</span>
          </div>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-border-light dark:border-border-dark flex flex-col">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-text-main dark:text-white tracking-tight">Revenue by Course</h3>
            <p className="text-sm text-text-secondary">Current Semester Distribution</p>
          </div>
          <div className="space-y-6 flex-1">
            {[
              { name: 'Business Admin', val: 340, p: 85, color: 'bg-primary' },
              { name: 'Computer Science', val: 210, p: 65, color: 'bg-purple-500' },
              { name: 'Medical Sciences', val: 180, p: 45, color: 'bg-amber-500' },
              { name: 'Arts & Humanities', val: 120, p: 30, color: 'bg-emerald-500' }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-text-secondary">{item.name}</span>
                  <span className="text-text-main dark:text-white">${item.val}k</span>
                </div>
                <div className="w-full bg-background-light dark:bg-background-dark rounded-full h-2">
                  <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.p}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
        <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
          <h3 className="text-lg font-bold text-text-main dark:text-white tracking-tight">Recent Payments</h3>
          <Link to="/admin/finance/installments" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
            View All Installments <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/30">
                <th className="p-4 text-xs font-black text-text-secondary uppercase tracking-widest">Student</th>
                <th className="p-4 text-xs font-black text-text-secondary uppercase tracking-widest">Course</th>
                <th className="p-4 text-xs font-black text-text-secondary uppercase tracking-widest">Date</th>
                <th className="p-4 text-xs font-black text-text-secondary uppercase tracking-widest text-right">Amount</th>
                <th className="p-4 text-xs font-black text-text-secondary uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {recentPayments.length > 0 ? recentPayments.map((p, i) => (
                <tr key={i} className="hover:bg-background-light/50 dark:hover:bg-background-dark/50 transition-colors">
                  <td className="p-4">
                    <Link to={`/admin/finance/student/${p.student_id}`} className="text-sm font-bold text-text-main dark:text-white hover:text-primary transition-colors">
                      {p.student_name || 'Anonymous'}
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">{p.course_name || 'General'}</td>
                  <td className="p-4 text-sm text-text-secondary">{new Date(p.due_date).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-black text-text-main dark:text-white text-right">${p.amount}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Completed
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-text-secondary text-sm font-medium">
                    No recent payment data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
