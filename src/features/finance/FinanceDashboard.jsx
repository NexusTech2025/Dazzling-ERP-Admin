import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextCore';
import { executeAction } from '../../services/apiClient';
import { useAccountingDataQuery } from './hooks/useFinanceQueries';
import { useStudentsQuery } from '../student/hooks/useStudentQueries';
import { useCoursesQuery } from '../course/hooks/useCourseQueries';
import { usePackagesQuery } from '../course/hooks/usePackageQueries';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import { hydrateStudentFeeAccounts, aggregateBillingAccountsByStudent } from './utils';
import DataTableV2 from '../../components/ui/table/DataTableV2';
import KpiCard from '../../components/ui/v2/KpiCard';
import KpiGrid from '../../components/ui/v2/KpiGrid';
import MainLayout from '../../components/layout/MainLayout';

/**
 * Live Institutional Finance Dashboard & Billing Directory
 * Displays global KPIs, student billing directory, and side-by-side transaction ledgers.
 * Renders with a premium Navy & Gold Light Theme using high-density cards and micro-animations.
 * 
 * @component
 */
const FinanceDashboard = () => {
  // Benchmark Timing (Rule N5)
  useEffect(() => {
    console.time('[FinanceDashboard] Load Data');
    return () => {
      console.timeEnd('[FinanceDashboard] Load Data');
    };
  }, []);

  const { token } = useAuth();
  const { data: accountingData, isLoading: isAccountingLoading, error: accountingError } = useAccountingDataQuery();
  const { data: students = [], isLoading: isStudentsLoading } = useStudentsQuery();
  const { data: courses = [], isLoading: isCoursesLoading } = useCoursesQuery();
  const { data: packages = [], isLoading: isPackagesLoading } = usePackagesQuery();

  // Fetch Enrollments and Allocations for the hydration utility
  const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ['finance', 'dashboard-enrollments'],
    queryFn: async () => {
      const res = await executeAction('data_query', { target: 'Enrollment' }, token);
      return res.data?.data || [];
    },
    enabled: !!token
  });

  const { data: batchAllocations = [], isLoading: isAllocationsLoading } = useQuery({
    queryKey: ['finance', 'dashboard-allocations'],
    queryFn: async () => {
      const res = await executeAction('data_query', { target: 'BatchAllocation' }, token);
      return res.data?.data || [];
    },
    enabled: !!token
  });

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [isSticky, setIsSticky] = useState(false);

  const handleBodyScroll = (e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => (prev !== shouldBeSticky ? shouldBeSticky : prev));
  };

  // Stop timer when data finishes loading
  useEffect(() => {
    if (!isAccountingLoading && accountingData) {
      console.timeEnd('[FinanceDashboard] Load Data');
    }
  }, [isAccountingLoading, accountingData]);

  const { studentFeeAccounts = [], installments = [], payments = [], feeAdjustments = [] } = accountingData || {};

  // Map student name and course to fee account records in memory using the hydrate utility (Rule D4/D2)
  const mappedFeeAccounts = useMemo(() => {
    const hydratedAccounts = hydrateStudentFeeAccounts({
      studentFeeAccounts,
      enrollments,
      students,
      courses,
      packages,
      batchAllocations
    });

    return hydratedAccounts.map(acc => {
      const student = acc.enrollment?.student;
      const item = acc.enrollment?.item;
      const targetClass = item?.target_class || item?.metadata?.class || '';
      return {
        ...acc,
        student_id: student?.student_id || acc.enrollment?.student_id || '',
        studentName: student?.student_name || 'Unknown Student',
        courseName: item?.name || 'N/A',
        studentClass: targetClass
      };
    });
  }, [studentFeeAccounts, enrollments, students, courses, packages, batchAllocations]);

  // Derived Global KPIs (Calculated dynamically from live records)
  const kpis = useMemo(() => {
    const totalReceivables = studentFeeAccounts.reduce((sum, acc) =>
      sum + Number(acc.final_fee !== undefined ? acc.final_fee : (acc.total_fee - (acc.discount || 0))), 0);
    const totalCollected = studentFeeAccounts.reduce((sum, acc) => sum + Number(acc.amount_paid || 0), 0);
    const outstandingBalance = studentFeeAccounts.reduce((sum, acc) => sum + Number(acc.balance_due || 0), 0);
    const overdueCount = installments.filter(inst => inst.status?.toLowerCase() === 'overdue').length;
    const activeAccounts = studentFeeAccounts.filter(acc => acc.status?.toLowerCase() === 'active').length;

    return [
      {
        label: 'Total Receivables',
        value: totalReceivables,
        icon: 'account_balance_wallet',
        color: 'text-slate-900',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200'
      },
      {
        label: 'Total Collected',
        value: totalCollected,
        icon: 'payments',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50/50',
        borderColor: 'border-emerald-200'
      },
      {
        label: 'Outstanding Balance',
        value: outstandingBalance,
        icon: 'hourglass_top',
        color: 'text-amber-800',
        bgColor: 'bg-amber-50/40',
        borderColor: 'border-amber-200'
      },
      {
        label: 'Overdue Installments',
        value: overdueCount,
        icon: 'warning',
        color: 'text-rose-700',
        bgColor: 'bg-rose-50/50',
        borderColor: 'border-rose-200',
        isCount: true
      },
      {
        label: 'Active Accounts',
        value: activeAccounts,
        icon: 'group',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50/40',
        borderColor: 'border-blue-200',
        isCount: true
      },
    ];
  }, [studentFeeAccounts, installments]);

  // Filter courses for dropdown list
  const availableCourses = useMemo(() => {
    const courses = new Set(mappedFeeAccounts.map(acc => acc.courseName).filter(Boolean));
    return Array.from(courses);
  }, [mappedFeeAccounts]);

  const aggregatedStudents = useMemo(() => {
    return aggregateBillingAccountsByStudent(mappedFeeAccounts);
  }, [mappedFeeAccounts]);

  // Filtered students matching search and dropdown controls
  const filteredStudents = useMemo(() => {
    return aggregatedStudents.filter(student => {
      const studentId = student.student_id || '';
      const studentName = student.studentName || '';
      const matchQuery =
        studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        studentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = !statusFilter || student.status.toLowerCase() === statusFilter.toLowerCase();
      const matchCourse = !courseFilter || student.accounts.some(acc => acc.courseName.toLowerCase() === courseFilter.toLowerCase());

      return matchQuery && matchStatus && matchCourse;
    });
  }, [aggregatedStudents, searchQuery, statusFilter, courseFilter]);

  const selectedStudentAccounts = useMemo(() => {
    if (!selectedStudentId) return [];
    const student = aggregatedStudents.find(s => s.student_id === selectedStudentId);
    return student ? student.accounts : [];
  }, [selectedStudentId, aggregatedStudents]);

  // Find currently selected student details across all their accounts
  const selectedRecord = useMemo(() => {
    if (!selectedStudentId) return null;
    const student = aggregatedStudents.find(s => s.student_id === selectedStudentId);
    if (!student || student.accounts.length === 0) return null;

    const feeAccountIds = student.accounts.map(acc => acc.student_fee_id);

    const studentInsts = installments.filter(inst => feeAccountIds.includes(inst.student_fee_id));
    const studentPays = payments.filter(pay => feeAccountIds.includes(pay.student_fee_id));
    const studentAdjs = feeAdjustments.filter(adj => feeAccountIds.includes(adj.student_fee_id));

    return {
      account: {
        ...student,
        courseName: student.accounts.map(acc => acc.courseName).join(', ')
      },
      installments: studentInsts,
      payments: studentPays,
      adjustments: studentAdjs
    };
  }, [selectedStudentId, aggregatedStudents, installments, payments, feeAdjustments]);

  // --- DataTableV2 Column Configurations ---

  const directoryColumns = useMemo(() => [
    {
      header: 'Student Name',
      className: 'font-bold text-slate-900',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-extrabold text-slate-900">{row.studentName}</span>
          {row.studentClass && row.studentClass !== 'N/A' && (
            <span className="inline-flex self-start px-1.5 py-0.5 rounded-md text-[8px] font-black bg-indigo-50 text-[#1a237e] border border-indigo-100 uppercase tracking-wide mt-0.5">
              Class {row.studentClass}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Total Fee',
      align: 'right',
      width: '110px',
      className: 'font-bold text-slate-800',
      cell: (row) => `₹${Number(row.total_fee || 0).toLocaleString()}`
    },
    {
      header: 'Amount Paid',
      align: 'right',
      width: '110px',
      className: 'text-emerald-600 font-bold',
      cell: (row) => `₹${Number(row.amount_paid || 0).toLocaleString()}`
    },
    {
      header: 'Balance Due',
      align: 'right',
      width: '110px',
      className: 'text-rose-600 font-extrabold',
      cell: (row) => `₹${Number(row.balance_due || 0).toLocaleString()}`
    },
    {
      header: 'Status',
      align: 'center',
      width: '110px',
      cell: (row) => (
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-extrabold border uppercase tracking-wider ${row.status === 'paid' || row.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            row.status === 'overdue' || row.status === 'defaulted' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              row.status === 'partially_paid' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-amber-50 text-amber-700 border-amber-200/80'
          }`}>
          {row.status}
        </span>
      )
    }
  ], []);

  const programColumns = useMemo(() => [
    {
      header: 'Program / Course',
      accessor: 'courseName',
      className: 'font-bold text-slate-900'
    },
    {
      header: 'Total Fee',
      align: 'right',
      width: '100px',
      className: 'font-bold text-slate-800',
      cell: (row) => {
        const total = Number(row.final_fee !== undefined ? row.final_fee : (row.total_fee - (row.discount || 0)));
        return `₹${total.toLocaleString()}`;
      }
    },
    {
      header: 'Paid',
      align: 'right',
      width: '100px',
      className: 'text-emerald-600 font-bold',
      cell: (row) => `₹${Number(row.amount_paid || 0).toLocaleString()}`
    },
    {
      header: 'Balance',
      align: 'right',
      width: '100px',
      className: 'text-rose-600 font-extrabold',
      cell: (row) => `₹${Number(row.balance_due || 0).toLocaleString()}`
    },
    {
      header: 'Status',
      align: 'center',
      width: '100px',
      cell: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-wider ${
          row.status === 'paid' || row.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          row.status === 'overdue' || row.status === 'defaulted' ? 'bg-rose-50 text-rose-700 border-rose-200' :
          row.status === 'partially_paid' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {row.status}
        </span>
      )
    }
  ], []);

  const installmentColumns = useMemo(() => [
    {
      header: 'Inst #',
      accessor: 'installment_number',
      width: '64px',
      className: 'font-bold text-slate-800'
    },
    {
      header: 'Due Date',
      className: 'text-slate-500 font-semibold',
      cell: (row) => new Date(row.due_date).toLocaleDateString()
    },
    {
      header: 'Due',
      align: 'right',
      width: '96px',
      className: 'font-bold text-slate-800',
      cell: (row) => `₹${Number(row.due_amount).toLocaleString()}`
    },
    {
      header: 'Paid',
      align: 'right',
      width: '96px',
      className: 'text-emerald-600 font-bold',
      cell: (row) => `₹${Number(row.paid_amount || 0).toLocaleString()}`
    },
    {
      header: 'Status',
      align: 'center',
      width: '96px',
      cell: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-wider ${row.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            row.status === 'overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
          {row.status}
        </span>
      )
    }
  ], []);

  const paymentColumns = useMemo(() => [
    {
      header: 'Date',
      className: 'text-slate-500 font-semibold',
      cell: (row) => new Date(row.payment_date).toLocaleDateString()
    },
    {
      header: 'Amount',
      align: 'right',
      width: '96px',
      className: 'text-emerald-600 font-bold',
      cell: (row) => `₹${Number(row.amount_paid).toLocaleString()}`
    },
    {
      header: 'Method',
      align: 'center',
      width: '96px',
      className: 'text-slate-500 font-bold uppercase',
      accessor: 'payment_method'
    },
    {
      header: 'Reference ID',
      className: 'font-mono text-[10px] text-slate-400',
      cell: (row) => row.reference_number || row.transaction_reference || 'N/A'
    }
  ], []);

  const adjustmentColumns = useMemo(() => [
    {
      header: 'Type',
      className: 'font-extrabold uppercase text-[#1a237e]',
      accessor: 'adjustment_type'
    },
    {
      header: 'Amount',
      align: 'right',
      width: '96px',
      className: 'text-rose-600 font-bold',
      cell: (row) => `-₹${Number(row.amount).toLocaleString()}`
    },
    {
      header: 'Reason / Remarks',
      className: 'text-slate-500 font-medium',
      cell: (row) => row.reason || row.remarks || 'Discount adjustment applied.'
    }
  ], []);

  if (isAccountingLoading || isStudentsLoading || isCoursesLoading || isPackagesLoading || isEnrollmentsLoading || isAllocationsLoading) {
    return <LoadingState message="Hydrating student transactional accounting ledger..." />;
  }

  if (accountingError) {
    return <ErrorState message={accountingError.message} />;
  }

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
              <span className="material-symbols-outlined text-[#1a237e] text-sm">payments</span>
              <span className="text-sm font-bold text-[#1a237e] dark:text-white">Finance Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/finance/fee-plan"
                className="flex items-center gap-1.5 bg-[#1a237e] hover:bg-indigo-950 text-white font-bold py-1 px-3 rounded-lg text-[11px] transition-all duration-300 shadow-md"
              >
                <span className="material-symbols-outlined text-[14px]">add_circle</span>
                <span>Generate Fee Plan</span>
              </Link>
            </div>
          </div>
        </div>
      }
      body={
        <div className="space-y-4 pt-6 lg:pt-8 pb-12">
          {/* Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1a237e]">
                Finance Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tuition collections, billing schedules, and relational adjustments ledger.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/finance/fee-plan"
                className="flex items-center gap-2 bg-[#1a237e] hover:bg-indigo-950 text-white font-bold py-1.5 px-4 rounded-xl text-xs transition-all duration-300 shadow-md hover:shadow-indigo-900/10 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Generate Fee Plan</span>
              </Link>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <KpiGrid cols={1} smCols={2} lgCols={5} gap={3}>
            {kpis.map((kpi, idx) => {
              const variant =
                kpi.color.includes('emerald') ? 'success' :
                  kpi.color.includes('rose') ? 'danger' :
                    kpi.color.includes('amber') ? 'warning' :
                      kpi.color.includes('blue') ? 'info' : 'neutral';

              return (
                <KpiCard
                  key={idx}
                  label={kpi.label}
                  value={kpi.value}
                  icon={kpi.icon}
                  isCount={kpi.isCount}
                  variant={variant}
                  size="md"
                />
              );
            })}
          </KpiGrid>

          {/* Filter and Search Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-md">search</span>
              </span>
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#1a237e] focus:ring-1 focus:ring-[#1a237e]/20 bg-slate-50/50 transition-all font-semibold"
                placeholder="Search student name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <select
                className="w-full md:w-44 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#1a237e] bg-white cursor-pointer transition-all font-bold text-slate-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Status: All</option>
                <option value="active">Active Account</option>
                <option value="paid">Fully Paid</option>
                <option value="completed">Completed</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="overdue">Overdue</option>
                <option value="defaulted">Defaulted</option>
              </select>
              <select
                className="w-full md:w-44 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#1a237e] bg-white cursor-pointer transition-all font-bold text-slate-700"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="">Course: All</option>
                {availableCourses.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-side Directory and Program Accounts Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Side: Directory Table */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300">
              <div className="py-2.5 px-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">list_alt</span>
                  Student Billing Directory (Aggregated)
                </h3>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-lg">
                  {filteredStudents.length} Students
                </span>
              </div>

              <DataTableV2
                data={filteredStudents}
                columns={directoryColumns}
                density="high"
                maxHeight="220px"
                stickyHeader={true}
                selectedRowKey="student_id"
                selectedRowValue={selectedStudentId}
                onRowClick={(row) => setSelectedStudentId(selectedStudentId === row.student_id ? null : row.student_id)}
                emptyMessage="No students found matching the criteria."
              />
            </div>

            {/* Right Side: Program Accounts Table */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300">
              <div className="py-2.5 px-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">school</span>
                  Student Program Accounts
                </h3>
                {selectedStudentId && (
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-lg">
                    {selectedStudentAccounts.length} Programs
                  </span>
                )}
              </div>

              {!selectedStudentId ? (
                <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 text-xs">
                  <span className="material-symbols-outlined text-4xl mb-1 opacity-20">info</span>
                  <p className="font-bold text-slate-500">Select a student to load program accounts</p>
                </div>
              ) : (
                <DataTableV2
                  data={selectedStudentAccounts}
                  columns={programColumns}
                  density="high"
                  maxHeight="220px"
                  stickyHeader={true}
                  emptyMessage="No program accounts found."
                />
              )}
            </div>
          </div>

          {/* Selected Student Drill-Down Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm transition-all duration-300">
            {!selectedRecord ? (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                <div className="p-3 bg-indigo-50/50 rounded-full inline-flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-3xl text-[#1a237e]">payments</span>
                </div>
                <p className="text-sm font-bold text-slate-600">Select a student from the directory list to load billing schedules and transaction logs.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-[#1a237e]">account_circle</span>
                      {selectedRecord.account.studentName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Student ID:</span>
                      <span className="font-mono font-bold text-[#1a237e] bg-slate-100 px-2 py-0.5 rounded">{selectedRecord.account.student_id}</span>
                      <span>•</span>
                      <span>Course:</span>
                      <span className="font-semibold text-slate-700">{selectedRecord.account.courseName}</span>
                    </p>
                  </div>
                  <Link
                    to={`/admin/students/${selectedRecord.account.student_id}?tab=fees`}
                    className="text-xs text-[#1a237e] hover:underline font-bold flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-all hover:bg-indigo-100/80"
                  >
                    <span>View Full Profile</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Installments Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#1a237e]">schedule</span>
                      Installment Schedule
                    </h4>
                    <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
                      <DataTableV2
                        data={selectedRecord.installments}
                        columns={installmentColumns}
                        density="high"
                        emptyMessage="No installments configured."
                      />
                    </div>
                  </div>

                  {/* Payments & Adjustments Table */}
                  <div className="space-y-4">
                    {/* Payments */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">receipt_long</span>
                        Payment History
                      </h4>
                      <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
                        <DataTableV2
                          data={selectedRecord.payments}
                          columns={paymentColumns}
                          density="high"
                          emptyMessage="No payments logged in the ledger."
                        />
                      </div>
                    </div>

                    {/* Adjustments */}
                    {selectedRecord.adjustments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-indigo-600">percent</span>
                          Fee Adjustments & Discounts
                        </h4>
                        <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
                          <DataTableV2
                            data={selectedRecord.adjustments}
                            columns={adjustmentColumns}
                            density="high"
                            emptyMessage="No adjustments applied."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
};

export default FinanceDashboard;
