import React from 'react';
import { Link } from 'react-router-dom';
import { useInstallmentsQuery } from './hooks/useFinanceQueries';
import { useFilteredInstallments } from './hooks/useFilteredInstallments';
import DataTable from '../../components/ui/DataTable';
import { SearchInput, SelectFilter } from '../../components/ui/filters';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import { queryKeys } from '../../lib/react-query/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Global Installment Tracking Page
 */
const Installments = () => {
  const queryClient = useQueryClient();
  const { data: installments = [], isLoading, isFetching, error } = useInstallmentsQuery();

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    filteredInstallments,
    availableStatuses
  } = useFilteredInstallments(installments);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'due': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'partial': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const columns = [
    {
      header: 'Installment No',
      accessor: 'installment_id',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-sm">receipt_long</span>
          </div>
          <span className="font-bold text-text-main dark:text-white">{row.installment_id}</span>
        </div>
      )
    },
    {
      header: 'Student',
      accessor: 'student_name',
      cell: (row) => (
        <div>
          <Link to={`/admin/finance/student/${row.student_id}`} className="font-bold text-text-main dark:text-white hover:text-primary transition-colors">
            {row.student_name}
          </Link>
          <div className="text-xs text-text-secondary">{row.course_name}</div>
        </div>
      )
    },
    {
      header: 'Due Date',
      accessor: 'due_date',
      cell: (row) => (
        <span className={row.status === 'Overdue' ? 'text-red-600 font-bold' : ''}>
          {new Date(row.due_date).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Total Amount',
      accessor: 'amount',
      className: 'text-right',
      cell: (row) => <span className="font-black">${Number(row.amount).toLocaleString()}</span>
    },
    {
      header: 'Paid Amount',
      accessor: 'paid_amount',
      className: 'text-right',
      cell: (row) => <span className="text-text-secondary">${Number(row.paid_amount).toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      className: 'text-center',
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(row.status)}`}>
          {row.status}
        </span>
      )
    }
  ];

  const filters = (
    <>
      <div className="md:col-span-6 lg:col-span-4 relative">
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search student or ID..."
        />
      </div>
      <div className="md:col-span-6 lg:col-span-8 flex flex-wrap gap-3 items-center">
        <SelectFilter 
          value={statusFilter}
          onChange={setStatusFilter}
          options={availableStatuses}
          defaultLabel="Status: All"
        />
        {/* Placeholder for Date Range Filter */}
        <div className="flex-1 min-w-[200px] flex items-center bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-3 py-2 opacity-50 cursor-not-allowed">
          <span className="material-symbols-outlined text-text-secondary mr-2 text-[20px]">calendar_today</span>
          <span className="text-sm text-text-secondary">Date Range (Coming Soon)</span>
        </div>
        <button className="ml-auto text-primary text-sm font-medium flex items-center gap-1 hover:underline">
          <span className="material-symbols-outlined text-lg">filter_list</span>
          More Filters
        </button>
      </div>
    </>
  );

  if (isLoading) return <LoadingState message="Fetching installment records..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.finance.all })} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight">Global Installments</h1>
          <Link to="/admin/finance/overdue" className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            View Overdue
          </Link>
        </div>
        <p className="text-text-secondary max-w-2xl">Monitor and manage all fee installments across the academy curriculum.</p>
      </div>

      <DataTable 
        data={filteredInstallments}
        columns={columns}
        filters={filters}
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

export default Installments;
