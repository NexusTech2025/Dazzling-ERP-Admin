import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccountingDataQuery } from './hooks/useFinanceQueries';
import { useStudentsQuery } from '../student/hooks/useStudentQueries';
import { useCoursesQuery } from '../course/hooks/useCourseQueries';
import { usePackagesQuery } from '../course/hooks/usePackageQueries';
import { useFilteredInstallments } from './hooks/useFilteredInstallments';
import MainLayout from '../../components/layout/MainLayout';
import DataTableV2 from '../../components/ui/table/DataTableV2';
import KpiCard from '../../components/ui/v2/KpiCard';
import KpiGrid from '../../components/ui/v2/KpiGrid';
import { SearchInput, SelectFilter } from '../../components/ui/filters';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import { queryKeys } from '../../lib/react-query/queryKeys';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { executeAction } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContextCore';

/**
 * Global Installment & Overdue Tracking Page.
 * Renders cross-student billing schedules with switchable tabs, overdue KPI stats, and MainLayout.
 * 
 * @component
 */
const Installments = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'overdue'
  const [isSticky, setIsSticky] = useState(false);

  const handleBodyScroll = (e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => (prev !== shouldBeSticky ? shouldBeSticky : prev));
  };

  const { data: accountingData, isLoading: isAccountingLoading, isFetching, error } = useAccountingDataQuery();
  const { data: students = [], isLoading: isStudentsLoading } = useStudentsQuery();
  const { data: courses = [], isLoading: isCoursesLoading } = useCoursesQuery();
  const { data: packages = [], isLoading: isPackagesLoading } = usePackagesQuery();

  // Fetch Enrollments for relation mapping
  const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ['finance', 'installments-enrollments'],
    queryFn: async () => {
      const res = await executeAction('data_query', { target: 'Enrollment' }, token);
      return res.data?.data || [];
    },
    enabled: !!token
  });

  const { studentFeeAccounts = [], installments: rawInstallments = [] } = accountingData || {};

  // Hydrate and map raw installments (Rule N1/N5)
  const installments = useMemo(() => {
    console.time('[Installments] Hydrate');
    if (!accountingData || enrollments.length === 0) {
      console.timeEnd('[Installments] Hydrate');
      return [];
    }

    const studentMap = new Map(students.map(s => [s.student_id, s]));
    const courseMap = new Map(courses.map(c => [c.course_id, c]));
    const packageMap = new Map(packages.map(p => [p.package_id, p]));
    const enrollmentMap = new Map(enrollments.map(e => [e.enrollment_id, e]));
    const feeAccountMap = new Map(studentFeeAccounts.map(sfa => [sfa.student_fee_id, sfa]));

    const result = rawInstallments.map(inst => {
      const sfa = feeAccountMap.get(inst.student_fee_id);
      const enrollment = sfa ? enrollmentMap.get(sfa.enrollment_id) : null;
      const student = enrollment ? studentMap.get(enrollment.student_id) : null;
      
      let item = null;
      if (enrollment) {
        if (enrollment.enrollment_type === 'course' || enrollment.enrollment_type === 'subject') {
          item = courseMap.get(enrollment.item_id);
        } else if (enrollment.enrollment_type === 'package') {
          item = packageMap.get(enrollment.item_id);
        }
      }

      const discountAmount = Number(sfa?.discount || 0);
      const isOverdue = inst.status?.toLowerCase() === 'overdue';
      const overdueVal = isOverdue ? Number(inst.due_amount || 0) - Number(inst.paid_amount || 0) : 0;

      return {
        ...inst,
        student_id: student?.student_id || '',
        student_name: student?.student_name || 'Unknown Student',
        course_name: item?.name || 'N/A',
        class_badge: item?.target_class || item?.metadata?.class || '',
        discount: discountAmount,
        overdue_amount: overdueVal,
        amount: inst.due_amount
      };
    });

    console.timeEnd('[Installments] Hydrate');
    return result;
  }, [rawInstallments, studentFeeAccounts, enrollments, students, courses, packages, accountingData]);

  const isLoading = isAccountingLoading || isStudentsLoading || isCoursesLoading || isPackagesLoading || isEnrollmentsLoading;

  // Filter installments for the active tab context
  const tabFilteredInstallments = useMemo(() => {
    if (activeTab === 'overdue') {
      return installments.filter(inst => inst.status?.toLowerCase() === 'overdue');
    }
    return installments;
  }, [installments, activeTab]);

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    filteredInstallments,
    availableStatuses
  } = useFilteredInstallments(tabFilteredInstallments);

  // Compute overdue KPIs
  const overdueKpis = useMemo(() => {
    const overdueList = installments.filter(inst => inst.status?.toLowerCase() === 'overdue');
    const totalOverdue = overdueList.reduce((sum, inst) => sum + (Number(inst.due_amount) - Number(inst.paid_amount)), 0);
    return {
      totalOverdue,
      count: overdueList.length
    };
  }, [installments]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'overdue': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'due':
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'partial':
      case 'partially_paid': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Switchable columns configuration
  const columns = useMemo(() => {
    if (activeTab === 'overdue') {
      return [
        {
          header: 'Student Name',
          className: 'font-bold text-slate-900',
          cell: (row) => (
            <div className="flex flex-col gap-0.5 py-1">
              <span className="font-extrabold text-slate-900">{row.student_name}</span>
              <span className="text-[10px] text-slate-500 font-bold">{row.course_name}</span>
              {row.class_badge && (
                <span className="inline-flex self-start px-1.5 py-0.5 rounded-md text-[8px] font-black bg-indigo-50 text-[#1a237e] border border-indigo-100 uppercase tracking-wide mt-0.5">
                  Class {row.class_badge}
                </span>
              )}
            </div>
          )
        },
        {
          header: 'Due Date',
          width: '120px',
          className: 'text-slate-500 font-semibold',
          cell: (row) => new Date(row.due_date).toLocaleDateString()
        },
        {
          header: 'Overdue By',
          width: '120px',
          cell: (row) => {
            const days = Math.max(0, Math.floor((new Date() - new Date(row.due_date)) / (1000 * 60 * 60 * 24)));
            return (
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-xs font-black text-rose-600">{days} Days</span>
              </div>
            );
          }
        },
        {
          header: 'Overdue Balance',
          align: 'right',
          width: '130px',
          className: 'text-rose-600 font-extrabold',
          cell: (row) => `₹${Number(row.due_amount - row.paid_amount).toLocaleString()}`
        },
        {
          header: 'Action',
          align: 'center',
          width: '120px',
          cell: (row) => (
            <Link
              to={`/admin/students/${row.student_id}?tab=fees`}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-[#1a237e] text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 transition-all active:scale-[0.98]"
            >
              View Profile
            </Link>
          )
        }
      ];
    }

    return [
      {
        header: 'Installment No',
        accessor: 'installment_id',
        width: '120px',
        cell: (row) => (
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-slate-400">receipt_long</span>
            <span className="font-mono text-xs text-slate-600">{row.installment_id}</span>
          </div>
        )
      },
      {
        header: 'Student Name',
        className: 'font-bold text-slate-900',
        cell: (row) => (
          <div className="flex flex-col gap-0.5 py-1">
            <span className="font-extrabold text-slate-900">{row.student_name}</span>
            <span className="text-[10px] text-slate-500 font-bold">{row.course_name}</span>
            {row.class_badge && (
              <span className="inline-flex self-start px-1.5 py-0.5 rounded-md text-[8px] font-black bg-indigo-50 text-[#1a237e] border border-indigo-100 uppercase tracking-wide mt-0.5">
                Class {row.class_badge}
              </span>
            )}
          </div>
        )
      },
      {
        header: 'Due Date',
        width: '110px',
        className: 'text-slate-500 font-semibold',
        cell: (row) => new Date(row.due_date).toLocaleDateString()
      },
      {
        header: 'Total Amount',
        align: 'right',
        width: '115px',
        className: 'font-bold text-slate-800',
        cell: (row) => `₹${Number(row.amount).toLocaleString()}`
      },
      {
        header: 'Paid Amount',
        align: 'right',
        width: '115px',
        className: 'text-emerald-600 font-bold',
        cell: (row) => `₹${Number(row.paid_amount || 0).toLocaleString()}`
      },
      {
        header: 'Discounted',
        align: 'right',
        width: '110px',
        className: 'text-slate-500 font-medium',
        cell: (row) => row.discount > 0 ? `₹${Number(row.discount).toLocaleString()}` : '-'
      },
      {
        header: 'Remaining',
        align: 'right',
        width: '110px',
        className: 'font-extrabold text-slate-800',
        cell: (row) => `₹${Number(row.amount - (row.paid_amount || 0)).toLocaleString()}`
      },
      {
        header: 'Status',
        align: 'center',
        width: '110px',
        cell: (row) => (
          <span className={`inline-flex px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${getStatusStyle(row.status)}`}>
            {row.status}
          </span>
        )
      }
    ];
  }, [activeTab]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    queryClient.invalidateQueries({ queryKey: ['finance', 'installments-enrollments'] });
  };

  if (isLoading) return <LoadingState message="Fetching global installment ledgers..." />;
  if (error) return <ErrorState message={error.message} onRetry={handleRefresh} />;

  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      slotClasses={{
        container: "relative w-full lg:w-[98%] lg:mx-auto xl:w-[95%] max-w-[1440px]",
        body: "py-0 px-2 text-slate-800"
      }}
      header={
        <div
          className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
            isSticky ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-[#f9fbff]/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-2.5 flex items-center justify-between rounded-b-xl shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1a237e] text-sm">receipt_long</span>
              <span className="text-sm font-bold text-[#1a237e] dark:text-white">Fee Installments</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => { setActiveTab('all'); setSearchQuery(''); setStatusFilter('All'); }}
                  className={`px-3 py-1 rounded-md transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  All Installments
                </button>
                <button
                  onClick={() => { setActiveTab('overdue'); setSearchQuery(''); setStatusFilter('All'); }}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${activeTab === 'overdue' ? 'bg-[#1a237e] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <span>Overdue Accounts</span>
                  {overdueKpis.count > 0 && (
                    <span className="px-1 py-0.2 bg-rose-500 text-white text-[8px] font-black rounded-full min-w-[14px] text-center">
                      {overdueKpis.count}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      body={
        <div className="space-y-4 pt-6 lg:pt-8 pb-12">
          {/* Breadcrumb Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Link to="/admin/finance" className="hover:text-primary">Finance</Link>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="text-[#1a237e]">Installments</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1a237e] mt-1">
                Global Installments
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor and manage all fee schedules and overdue payments across the curriculum.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                <button
                  onClick={() => { setActiveTab('all'); setSearchQuery(''); setStatusFilter('All'); }}
                  className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  All Installments
                </button>
                <button
                  onClick={() => { setActiveTab('overdue'); setSearchQuery(''); setStatusFilter('All'); }}
                  className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'overdue' ? 'bg-[#1a237e] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <span>Overdue Accounts</span>
                  {overdueKpis.count > 0 && (
                    <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full min-w-[16px] text-center">
                      {overdueKpis.count}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Overdue Specific KPI Summary Cards */}
          {activeTab === 'overdue' && (
            <KpiGrid cols={1} smCols={2} gap={3}>
              <KpiCard
                label="Total Overdue Amount"
                value={overdueKpis.totalOverdue}
                icon="warning"
                variant="danger"
                size="sm"
              />
              <KpiCard
                label="Overdue Installments"
                value={overdueKpis.count}
                icon="hourglass_top"
                variant="warning"
                size="sm"
                isCount={true}
              />
            </KpiGrid>
          )}

          {/* Search & Filter Row */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-md">search</span>
              </span>
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#1a237e] focus:ring-1 focus:ring-[#1a237e]/20 bg-slate-50/50 transition-all font-semibold"
                placeholder="Search student or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              {activeTab === 'all' && (
                <select
                  className="w-full md:w-44 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#1a237e] bg-white cursor-pointer transition-all font-bold text-slate-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {availableStatuses.map((st, i) => (
                    <option key={i} value={st}>{st === 'All' ? 'Status: All' : st}</option>
                  ))}
                </select>
              )}
              {/* Optional Date Filter placeholder */}
              <div className="flex items-center bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-1.5 opacity-60 text-xs text-slate-400 font-semibold cursor-not-allowed">
                <span className="material-symbols-outlined text-sm mr-1.5">calendar_today</span>
                <span>Date Range (Coming Soon)</span>
              </div>
              <RefreshButton
                isFetching={isFetching}
                onRefresh={handleRefresh}
              />
            </div>
          </div>

          {/* DataTableV2 Rendering List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <DataTableV2
              data={filteredInstallments}
              columns={columns}
              density="high"
              maxHeight="480px"
              stickyHeader={true}
              emptyMessage={activeTab === 'overdue' ? "No overdue installments found." : "No installments found."}
            />
          </div>
        </div>
      }
    />
  );
};

export default Installments;
