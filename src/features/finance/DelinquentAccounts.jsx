import React from 'react';
import { useDelinquentAccountsQuery } from './hooks/useFinanceQueries';
import DataTable from '../../components/ui/DataTable';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import { queryKeys } from '../../lib/react-query/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Delinquent Accounts Page
 * Specifically tracks overdue installments requiring immediate attention.
 */
const DelinquentAccounts = () => {
  const queryClient = useQueryClient();
  const { data: accounts = [], isLoading, isFetching, error } = useDelinquentAccountsQuery();

  const calculateTotalOverdue = () => accounts.reduce((sum, acc) => sum + (Number(acc.amount) - Number(acc.paid_amount)), 0);

  const columns = [
    {
      header: 'Student Name',
      accessor: 'student_name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 flex items-center justify-center text-xs font-black">
            {row.student_name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-text-main dark:text-white">{row.student_name}</div>
            <div className="text-[10px] text-text-secondary uppercase font-bold tracking-tight">ID: {row.student_id}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Course',
      accessor: 'course_name',
      cell: (row) => <span className="text-sm text-text-secondary">{row.course_name}</span>
    },
    {
      header: 'Overdue By',
      accessor: 'due_date',
      cell: (row) => {
        const days = Math.floor((new Date() - new Date(row.due_date)) / (1000 * 60 * 60 * 24));
        return (
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-sm font-black text-red-600 dark:text-red-400">{days} Days</span>
          </div>
        );
      }
    },
    {
      header: 'Balance',
      accessor: 'amount',
      className: 'text-right',
      cell: (row) => (
        <span className="font-black text-text-main dark:text-white">
          ${(Number(row.amount) - Number(row.paid_amount)).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Action',
      className: 'text-center',
      cell: (row) => (
        <button className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm hover:bg-primary-dark transition-all active:scale-95">
          Notify
        </button>
      )
    }
  ];

  if (isLoading) return <LoadingState message="Scanning for delinquent accounts..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.finance.all })} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight">Delinquent Accounts</h1>
        <p className="text-text-secondary max-w-2xl">Track and prioritize actions for installments that have exceeded their due dates.</p>
      </div>

      {/* KPI Overlays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Total Overdue</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-black text-red-600">${calculateTotalOverdue().toLocaleString()}</h3>
            <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg border border-red-100 dark:border-red-800">CRITICAL</span>
          </div>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Account Count</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-black text-text-main dark:text-white">{accounts.length}</h3>
            <span className="text-xs font-bold text-text-secondary italic">Requires Follow-up</span>
          </div>
        </div>
      </div>

      <DataTable 
        data={accounts}
        columns={columns}
        secondaryAction={
          <RefreshButton 
            isFetching={isFetching} 
            onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.finance.all })} 
          />
        }
      />
    </div>
  );
};

export default DelinquentAccounts;
