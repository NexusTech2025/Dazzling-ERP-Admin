/**
 * @file RescheduleInstallmentsView.jsx
 * Standalone Page View for Installment Rescheduling (Layout Option A: Spreadsheet / Scheduler Builder).
 * Bound inside MainLayout container to align perfectly with admin viewport dimensions,
 * featuring Hero Header, Sticky Footer, dynamic student identity resolution, right-sliding alert toast,
 * and 1-click Auto-Balance ledger difference button.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, addMonths, addDays } from 'date-fns';
import { useAccountingDataQuery, useRescheduleInstallmentsMutation } from './hooks/useFinanceQueries';
import { useStudentsQuery } from '../student/hooks/useStudentQueries';
import { useEnrollmentsQuery } from '../student/hooks/useEnrollmentQueries';
import { validateRescheduleState } from './utils/rescheduleValidator';

import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/v2/Button';
import TextInput from '../../components/ui/v2/TextInput';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import ConfirmModal from '../../components/ui/ConfirmModal';
import DateDisplay from '../../components/ui/presets/DateDisplay';

export default function RescheduleInstallmentsView() {
  const { id: targetFeeAccountId } = useParams();
  const navigate = useNavigate();

  // Queries
  const { data: accountingData, isLoading: isAccountingLoading, error: dataError } = useAccountingDataQuery();
  const { data: students = [] } = useStudentsQuery();
  const { data: enrollments = [] } = useEnrollmentsQuery();
  const rescheduleMutation = useRescheduleInstallmentsMutation();

  const [remarks, setRemarks] = useState('');
  const [workingRows, setWorkingRows] = useState([]);
  const [originalSnapshot, setOriginalSnapshot] = useState([]);
  const [smartMenuOpen, setSmartMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);

  const studentFeeAccounts = useMemo(() => accountingData?.studentFeeAccounts || [], [accountingData]);
  const allInstallments = useMemo(() => accountingData?.installments || [], [accountingData]);

  // Find target active fee account object
  const activeFeeAccount = useMemo(() => {
    if (!targetFeeAccountId || !studentFeeAccounts.length) return null;
    return studentFeeAccounts.find(fa => fa.student_fee_id === targetFeeAccountId) || null;
  }, [studentFeeAccounts, targetFeeAccountId]);

  // Dynamic Student & Program Metadata Resolution
  const studentMeta = useMemo(() => {
    if (!activeFeeAccount) return { name: 'Student', initials: 'ST', enrollmentId: 'N/A', programName: 'Academic Program' };

    const enrollment = enrollments.find(e => e.enrollment_id === activeFeeAccount.enrollment_id || e.student_fee_id === targetFeeAccountId);
    const studentId = activeFeeAccount.student_id || enrollment?.student_id;
    const student = students.find(s => s.student_id === studentId || s.id === studentId);

    const name = student?.student_name || student?.full_name || activeFeeAccount.student_name || 'Student Account';
    const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
    const enrollmentId = activeFeeAccount.enrollment_id || enrollment?.enrollment_id || 'N/A';
    const programName = enrollment?.item_name || enrollment?.course_name || enrollment?.package_name || activeFeeAccount.course_name || 'Academic Program';

    return { name, initials, enrollmentId, programName };
  }, [activeFeeAccount, enrollments, students, targetFeeAccountId]);

  // Populate working rows when target fee account changes or data loads
  useEffect(() => {
    if (targetFeeAccountId && allInstallments.length > 0) {
      const rawRows = allInstallments
        .filter(ins => ins.student_fee_id === targetFeeAccountId)
        .sort((a, b) => Number(a.installment_number || 0) - Number(b.installment_number || 0));

      const rows = rawRows.map((ins, idx) => ({
        installment_id: ins.installment_id,
        tempId: ins.installment_id,
        originalNumber: ins.installment_number || (idx + 1),
        due_date: ins.due_date ? format(parseISO(ins.due_date), 'yyyy-MM-dd') : '',
        due_amount: Number(ins.due_amount || 0),
        paid_amount: Number(ins.paid_amount || 0),
        status: (ins.status || 'pending').toLowerCase(),
        isNew: false,
        isDeleted: false,
        isEditing: false
      }));

      setWorkingRows(rows);
      setOriginalSnapshot(JSON.parse(JSON.stringify(rows)));
    } else {
      setWorkingRows([]);
      setOriginalSnapshot([]);
    }
  }, [targetFeeAccountId, allInstallments]);

  // Live schedule validation calculations
  const validationResult = useMemo(() => {
    if (!activeFeeAccount) return { isValid: false, checks: {}, rowErrors: {}, totalDue: 0, difference: 0 };
    return validateRescheduleState(activeFeeAccount, workingRows, originalSnapshot);
  }, [activeFeeAccount, workingRows, originalSnapshot]);

  // Row Field Mutation Handlers
  const handleRowChange = (id, field, value) => {
    setWorkingRows(prev => prev.map(row => {
      if ((row.installment_id && row.installment_id === id) || row.tempId === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  // Mark Row Deleted or Restore
  const handleToggleDeleteRow = (id) => {
    setWorkingRows(prev => prev.map(row => {
      if ((row.installment_id && row.installment_id === id) || row.tempId === id) {
        return { ...row, isDeleted: !row.isDeleted };
      }
      return row;
    }));
  };

  // Add New Installment Row
  const handleAddInstallmentRow = () => {
    const activeRows = workingRows.filter(r => !r.isDeleted);
    let nextDate = format(new Date(), 'yyyy-MM-dd');
    if (activeRows.length > 0) {
      const lastDateStr = activeRows[activeRows.length - 1].due_date;
      if (lastDateStr) {
        nextDate = format(addMonths(parseISO(lastDateStr), 1), 'yyyy-MM-dd');
      }
    }
    const remainingBalance = Math.max(0, (Number(activeFeeAccount?.final_fee || 0) - validationResult.totalDue));

    const newRow = {
      installment_id: null,
      tempId: `NEW-${Date.now()}`,
      originalNumber: null,
      due_date: nextDate,
      due_amount: remainingBalance > 0 ? remainingBalance : 5000,
      paid_amount: 0,
      status: 'pending',
      isNew: true,
      isDeleted: false,
      isEditing: true
    };

    setWorkingRows(prev => [...prev, newRow]);
  };

  // Delete Draft New Row permanently before commit
  const handleRemoveDraftRow = (tempId) => {
    setWorkingRows(prev => prev.filter(r => r.tempId !== tempId));
  };

  // 1-Click Auto-Balance Ledger Difference feature
  const handleAutoBalanceDifference = () => {
    const diff = validationResult.difference;
    if (Math.abs(diff) < 0.01) return;

    const activeRows = workingRows.filter(r => !r.isDeleted);
    const lastPendingIndex = activeRows.findLastIndex(r => r.status !== 'paid');

    if (lastPendingIndex === -1) {
      setToastMessage('No open unpaid installment available to absorb difference.');
      return;
    }

    const targetRow = activeRows[lastPendingIndex];
    const newDueAmount = Math.max(0, targetRow.due_amount - diff);

    setWorkingRows(prev => prev.map(r => {
      if (r.tempId === targetRow.tempId) {
        return { ...r, due_amount: newDueAmount };
      }
      return r;
    }));

    setToastMessage(`Auto-balanced ledger: adjusted term by ${diff > 0 ? '-' : '+'}` + `₹${Math.abs(diff).toLocaleString()}`);
  };

  // Smart Action: Evenly Distribute Balance across open pending terms
  const handleSmartActionDistributeBalance = () => {
    const activeRows = workingRows.filter(r => !r.isDeleted);
    const paidSum = activeRows.reduce((sum, r) => sum + (r.status === 'paid' ? r.due_amount : 0), 0);
    const remainingFee = Math.max(0, Number(activeFeeAccount?.final_fee || 0) - paidSum);
    const pendingRows = activeRows.filter(r => r.status !== 'paid');

    if (pendingRows.length === 0) return;

    const perTermAmount = Math.floor(remainingFee / pendingRows.length);
    const remainder = remainingFee - (perTermAmount * pendingRows.length);

    setWorkingRows(prev => prev.map(row => {
      if (row.isDeleted || row.status === 'paid') return row;

      const pendingIndex = pendingRows.findIndex(p => p.tempId === row.tempId);
      const isLastPending = pendingIndex === pendingRows.length - 1;
      const newAmt = isLastPending ? (perTermAmount + remainder) : perTermAmount;

      return { ...row, due_amount: newAmt };
    }));

    setSmartMenuOpen(false);
    setToastMessage('Balanced remaining fee evenly across active pending terms.');
  };

  // Smart Action: Split Selected Pending Term
  const handleSmartActionSplitPendingTerm = () => {
    const activeRows = workingRows.filter(r => !r.isDeleted);
    const lastPendingIndex = activeRows.findLastIndex(r => r.status !== 'paid');
    if (lastPendingIndex === -1) {
      setToastMessage('No open pending installment available to split.');
      setSmartMenuOpen(false);
      return;
    }

    const targetRow = activeRows[lastPendingIndex];
    const halfAmt = Math.floor(targetRow.due_amount / 2);
    const secondHalf = targetRow.due_amount - halfAmt;

    const firstDate = targetRow.due_date || format(new Date(), 'yyyy-MM-dd');
    const secondDate = format(addMonths(parseISO(firstDate), 1), 'yyyy-MM-dd');

    const splitRow1 = { ...targetRow, due_amount: halfAmt };
    const splitRow2 = {
      installment_id: null,
      tempId: `NEW-SPLIT-${Date.now()}`,
      originalNumber: null,
      due_date: secondDate,
      due_amount: secondHalf,
      paid_amount: 0,
      status: 'pending',
      isNew: true,
      isDeleted: false,
      isEditing: true
    };

    setWorkingRows(prev => {
      const indexInState = prev.findIndex(r => r.tempId === targetRow.tempId);
      const copy = [...prev];
      copy.splice(indexInState, 1, splitRow1, splitRow2);
      return copy;
    });

    setSmartMenuOpen(false);
    setToastMessage('Split last pending term into two equal monthly installments.');
  };

  // Smart Action: Shift Pending Dates (+15 Days)
  const handleSmartActionShiftDates = () => {
    setWorkingRows(prev => prev.map(row => {
      if (row.isDeleted || row.status === 'paid' || !row.due_date) return row;
      const shifted = format(addDays(parseISO(row.due_date), 15), 'yyyy-MM-dd');
      return { ...row, due_date: shifted };
    }));
    setSmartMenuOpen(false);
    setToastMessage('Shifted all pending due dates forward by 15 days.');
  };

  // Smart Action: Reset Schedule
  const handleResetToOriginal = () => {
    setWorkingRows(JSON.parse(JSON.stringify(originalSnapshot)));
    setShowConfirmResetModal(false);
    setToastMessage('Schedule reset to original database state.');
  };

  // Submit Final Schedule Payload
  const handleSaveChanges = async () => {
    if (!validationResult.isValid || !targetFeeAccountId) return;

    const update_installments = [];
    const delete_installment_ids = [];
    const add_installments = [];

    workingRows.forEach(row => {
      if (row.isDeleted && row.installment_id) {
        delete_installment_ids.push(row.installment_id);
      } else if (!row.isDeleted && row.isNew) {
        add_installments.push({
          due_date: row.due_date,
          due_amount: Number(row.due_amount)
        });
      } else if (!row.isDeleted && row.installment_id) {
        const orig = originalSnapshot.find(o => o.installment_id === row.installment_id);
        if (orig && (orig.due_date !== row.due_date || orig.due_amount !== Number(row.due_amount))) {
          update_installments.push({
            installment_id: row.installment_id,
            due_date: row.due_date,
            due_amount: Number(row.due_amount)
          });
        }
      }
    });

    const payload = {
      student_fee_id: targetFeeAccountId,
      update_installments: update_installments.length > 0 ? update_installments : undefined,
      delete_installment_ids: delete_installment_ids.length > 0 ? delete_installment_ids : undefined,
      add_installments: add_installments.length > 0 ? add_installments : undefined,
      remarks: remarks.trim() || undefined
    };

    console.log('[RescheduleInstallmentsView] Submitting payload:', payload);

    try {
      const response = await rescheduleMutation.mutateAsync(payload);
      console.log('[RescheduleInstallmentsView] Response:', response);
      if (response.success) {
        setToastMessage('Schedule rescheduled successfully!');
        setTimeout(() => {
          navigate(-1);
        }, 1200);
      } else {
        alert(response.error?.message || response.message || 'Failed to reschedule installments.');
      }
    } catch (err) {
      console.error('[RescheduleInstallmentsView] Error:', err);
      alert(err.message || 'An unexpected network error occurred.');
    }
  };

  if (isAccountingLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading Student Fee Account & Installment Ledgers...</p>
        </div>
      </div>
    );
  }

  if (dataError || (!isAccountingLoading && !activeFeeAccount)) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-4 shadow-sm">
        <span className="material-symbols-outlined text-5xl text-rose-500">account_balance_wallet</span>
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Student Fee Account Not Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {dataError?.message || `No active fee account matches identifier "${targetFeeAccountId}". Please select a valid student from the directory.`}
          </p>
        </div>
        <Button variant="contained" onClick={() => navigate('/admin/students')}>
          Go to Student Directory
        </Button>
      </div>
    );
  }

  return (
    <MainLayout
      slotClasses={{
        container: "relative w-full lg:w-[98%] lg:mx-auto xl:w-[95%] max-w-[1440px]",
        body: "py-4 px-2 space-y-6"
      }}
      body={
        <div className="space-y-6">
          {/* Dynamic Toast Notification Banner */}
          {toastMessage && (
            <div className="fixed bottom-20 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white border border-slate-700 shadow-2xl px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
              <span className="material-symbols-outlined text-emerald-400">check_circle</span>
              <span className="text-sm font-medium">{toastMessage}</span>
              <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {/* Dynamic Right-Sliding Validation Toast Alert */}
          {!validationResult.isValid && (
            <div className="fixed right-6 bottom-20 z-50 max-w-md bg-rose-900/95 dark:bg-rose-950/95 text-white p-4 rounded-xl shadow-2xl border border-rose-700/80 backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-right duration-300">
              <span className="material-symbols-outlined text-rose-300 text-xl shrink-0 mt-0.5">warning</span>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-200">Validation Error Present</h4>
                <p className="text-xs text-rose-100 font-medium">
                  {!validationResult.checks.feeMatches ? `Schedule total differs from final fee by ₹${Math.abs(validationResult.difference).toLocaleString()}.` :
                   !validationResult.checks.datesChronological ? 'Installment due dates must be in strictly ascending chronological order.' :
                   !validationResult.checks.noPaidDeleted ? 'Paid installments cannot be marked for deletion.' :
                   'Due amounts cannot be set less than collected payments.'}
                </p>
                {Math.abs(validationResult.difference) > 0 && (
                  <button
                    onClick={handleAutoBalanceDifference}
                    className="mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                    Auto-Balance Ledger ({validationResult.difference > 0 ? '-' : '+'}₹{Math.abs(validationResult.difference).toLocaleString()})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 1. Integrated Hero Header Card (Title + Back Button + Student Identity) */}
          <Card variant="default" className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <Card.Body className="p-6 space-y-6">
              {/* Top Title Row with Back Button */}
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors"
                  title="Back to Previous Page"
                >
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Reschedule Installments</h1>
                    <span className="material-symbols-outlined text-slate-400 text-lg cursor-help" title="Update due dates, amounts, add terms or re-sequence fee schedules.">info</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    Update, add, delete or re-schedule installments for the selected Student Fee Account.
                  </p>
                </div>
              </div>

              {/* Student Identity Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 items-center">
                {/* Student Identity */}
                <div className="col-span-2 sm:col-span-3 lg:col-span-2 flex items-center gap-3 border-r border-slate-200 dark:border-slate-800 pr-4">
                  <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-200 dark:border-blue-500/30 shrink-0">
                    {studentMeta.initials}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Student</div>
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100">{studentMeta.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {studentMeta.enrollmentId} • {studentMeta.programName}
                    </div>
                  </div>
                </div>

                {/* Fee Account ID */}
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Fee Account ID</div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <span>{activeFeeAccount.student_fee_id}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(activeFeeAccount.student_fee_id)}
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Copy Fee Account ID"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                  </div>
                </div>

                {/* Final Fee */}
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Final Fee</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    ₹{Number(activeFeeAccount.final_fee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Total Paid */}
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Paid</div>
                  <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(activeFeeAccount.amount_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Balance Due */}
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Balance Due</div>
                  <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                    ₹{Number(activeFeeAccount.balance_due || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Status & Next Due */}
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Status & Next Due</div>
                  <div className="flex items-center gap-2">
                    <Badge variant={activeFeeAccount.status?.toLowerCase() === 'active' ? 'success' : 'warning'}>
                      {(activeFeeAccount.status || 'ACTIVE').toUpperCase()}
                    </Badge>
                    {activeFeeAccount.next_due_date && (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        <DateDisplay date={activeFeeAccount.next_due_date} />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Remarks Input */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-start md:items-center gap-3">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Remarks (Optional)</label>
                <div className="w-full relative flex-1">
                  <TextInput
                    value={remarks}
                    maxLength={250}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add a note about this reschedule..."
                    className="w-full pr-12 text-sm bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
                    {remarks.length}/250
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* 2. Installment Schedule Section (Spreadsheet Builder Grid) */}
          <Card variant="default" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
            <Card.Header border={true} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50/80 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">grid_on</span>
                  Installment Schedule
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Edit existing installments, delete or add new ones. Changes will be validated before saving.
                </p>
              </div>

              <div className="flex items-center gap-3 relative">
                {/* Smart Actions Dropdown */}
                <div className="relative">
                  <Button
                    variant="outlined"
                    onClick={() => setSmartMenuOpen(!smartMenuOpen)}
                    startIcon={<span className="material-symbols-outlined text-amber-500 text-base">bolt</span>}
                    endIcon={<span className="material-symbols-outlined text-xs">expand_more</span>}
                  >
                    Smart Actions
                  </Button>

                  {smartMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 py-1 text-sm animate-in fade-in zoom-in-95">
                      <button
                        onClick={handleSmartActionDistributeBalance}
                        className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 flex items-center gap-2 font-medium"
                      >
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-base">balance</span>
                        Evenly Distribute Balance
                      </button>
                      <button
                        onClick={handleSmartActionSplitPendingTerm}
                        className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 flex items-center gap-2 font-medium"
                      >
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-base">call_split</span>
                        Split Pending Installment
                      </button>
                      <button
                        onClick={handleSmartActionShiftDates}
                        className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 flex items-center gap-2 font-medium"
                      >
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-base">edit_calendar</span>
                        Shift Dates (+15 Days)
                      </button>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                      <button
                        onClick={() => { setSmartMenuOpen(false); setShowConfirmResetModal(true); }}
                        className="w-full text-left px-4 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700/70 flex items-center gap-2 font-medium"
                      >
                        <span className="material-symbols-outlined text-base">restart_alt</span>
                        Reset to Original
                      </button>
                    </div>
                  )}
                </div>

                <Button
                  variant="contained"
                  onClick={handleAddInstallmentRow}
                  startIcon={<span className="material-symbols-outlined text-base">add</span>}
                >
                  Add Installment
                </Button>
              </div>
            </Card.Header>

            <Card.Body className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-44">Installment ID</th>
                    <th className="py-3 px-4 w-48">Due Date</th>
                    <th className="py-3 px-4 w-40">Due Amount (₹)</th>
                    <th className="py-3 px-4 w-36">Paid Amount (₹)</th>
                    <th className="py-3 px-4 w-28">Status</th>
                    <th className="py-3 px-4 w-32">Actions</th>
                    <th className="py-3 px-4 w-48">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                  {workingRows.map((row, idx) => {
                    const rowId = row.installment_id || row.tempId;
                    const isPaid = row.status === 'paid' || row.paid_amount > 0;
                    const rowErrors = validationResult.rowErrors[rowId] || [];
                    const hasError = rowErrors.length > 0;

                    if (row.isDeleted) {
                      return (
                        <tr key={rowId} className="bg-rose-50/60 dark:bg-rose-950/20 text-slate-400 dark:text-slate-500 line-through">
                          <td className="py-3 px-4 text-center text-xs">
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 text-base">drag_indicator</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">{row.installment_id || 'Draft'}</td>
                          <td className="py-3 px-4">{row.due_date}</td>
                          <td className="py-3 px-4">₹{row.due_amount}</td>
                          <td className="py-3 px-4">₹{row.paid_amount}</td>
                          <td className="py-3 px-4">
                            <Badge variant="danger">DELETED</Badge>
                          </td>
                          <td className="py-3 px-4" colSpan={2}>
                            <Button
                              variant="text"
                              className="text-xs text-blue-600 dark:text-blue-400 no-underline hover:underline p-0 font-bold"
                              onClick={() => handleToggleDeleteRow(rowId)}
                            >
                              Undo Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={rowId} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${hasError ? 'bg-rose-50/50 dark:bg-rose-950/10' : ''}`}>
                        {/* Row Seq */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 font-mono text-xs">
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 text-base cursor-grab">drag_indicator</span>
                            {row.isNew ? (
                              <Badge variant="info" className="text-[10px] px-1.5 py-0.5">NEW</Badge>
                            ) : (
                              <span className="font-bold text-slate-700 dark:text-slate-300">{idx + 1}</span>
                            )}
                          </div>
                        </td>

                        {/* Installment ID */}
                        <td className="py-3 px-4">
                          {row.isNew ? (
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono italic">(New Installment)</span>
                          ) : (
                            <div>
                              <div className="font-semibold font-mono text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                {row.installment_id}
                                {isPaid && <span className="material-symbols-outlined text-amber-500 text-xs" title="Paid term locked">verified</span>}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">Original #{row.originalNumber}</div>
                            </div>
                          )}
                        </td>

                        {/* Due Date Input */}
                        <td className="py-3 px-4">
                          {isPaid ? (
                            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                              {row.due_date}
                            </div>
                          ) : (
                            <TextInput
                              type="date"
                              value={row.due_date}
                              onChange={(e) => handleRowChange(rowId, 'due_date', e.target.value)}
                              className="text-xs py-1 px-2 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-blue-500"
                            />
                          )}
                        </td>

                        {/* Due Amount Input */}
                        <td className="py-3 px-4">
                          {isPaid ? (
                            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                              {Number(row.due_amount).toLocaleString()}
                            </div>
                          ) : (
                            <TextInput
                              type="number"
                              value={row.due_amount}
                              onChange={(e) => handleRowChange(rowId, 'due_amount', Number(e.target.value))}
                              className="text-xs py-1 px-2 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-blue-500 w-32 font-semibold"
                            />
                          )}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-3 px-4">
                          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-300">
                            {Number(row.paid_amount).toLocaleString()}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              row.status === 'paid' ? 'success' :
                              row.status === 'partially_paid' ? 'info' :
                              row.status === 'overdue' ? 'danger' : 'warning'
                            }
                          >
                            {(row.status || 'PENDING').toUpperCase()}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          {isPaid ? (
                            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-sm">lock</span>
                              Locked
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {row.isNew ? (
                                <button
                                  onClick={() => handleRemoveDraftRow(rowId)}
                                  className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                  title="Discard Draft"
                                >
                                  <span className="material-symbols-outlined text-base">close</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleDeleteRow(rowId)}
                                  className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                  title="Delete Installment"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Row Validation */}
                        <td className="py-3 px-4">
                          {hasError ? (
                            <div className="text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1 font-semibold">
                              <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-sm shrink-0">error</span>
                              <span>{rowErrors[0]}</span>
                            </div>
                          ) : (
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">check_circle</span>
                              Valid
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {workingRows.filter(r => !r.isDeleted).length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        No installments in schedule. Click "+ Add Installment" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card.Body>

            <Card.Footer bg={true} className="p-3 bg-slate-50/60 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <Button
                variant="text"
                onClick={handleAddInstallmentRow}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold"
                startIcon={<span className="material-symbols-outlined text-sm">add_circle</span>}
              >
                Add Installment
              </Button>
            </Card.Footer>
          </Card>

          {/* 3. Schedule Summary & Validation Section (2 Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Card 1: Schedule Summary (Col 6) */}
            <Card variant="default" className="lg:col-span-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <Card.Header border={true} className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-base">calculate</span>
                  Schedule Summary
                </h3>
              </Card.Header>
              <Card.Body className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Installments Total</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                      ₹{validationResult.totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Expected (Final Fee)</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-200 mt-1">
                      ₹{validationResult.expectedFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/60 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Difference:</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${validationResult.checks.feeMatches ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      ₹{Math.abs(validationResult.difference).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <Badge variant={validationResult.checks.feeMatches ? 'success' : 'danger'}>
                      {validationResult.checks.feeMatches ? 'MATCH' : 'MISMATCH'}
                    </Badge>

                    {/* 1-Click Quick Auto-Balance Button */}
                    {Math.abs(validationResult.difference) > 0 && (
                      <button
                        onClick={handleAutoBalanceDifference}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm"
                        title="Auto-adjust last open pending term to balance the ledger"
                      >
                        <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                        {validationResult.difference > 0 ? '-' : '+'}₹{Math.abs(validationResult.difference).toLocaleString()} Auto-Balance
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-3">
                  <span>Total Installments:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{validationResult.totalInstallmentsCount}</span>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 p-3 rounded-xl flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300 font-medium">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-base shrink-0">info</span>
                  <span>Total of all due amounts must always equal the Final Fee.</span>
                </div>
              </Card.Body>
            </Card>

            {/* Card 2: Validation Status Rules (Col 6) */}
            <Card variant="default" className="lg:col-span-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <Card.Header border={true} className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-base">verified_user</span>
                  Validation Status
                </h3>
              </Card.Header>
              <Card.Body className="p-5 space-y-3.5 text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-base ${validationResult.checks.feeMatches ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {validationResult.checks.feeMatches ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={validationResult.checks.feeMatches ? 'text-slate-700 dark:text-slate-200' : 'text-rose-600 dark:text-rose-300'}>
                    Total due amount matches final fee
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-base ${validationResult.checks.datesChronological ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {validationResult.checks.datesChronological ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={validationResult.checks.datesChronological ? 'text-slate-700 dark:text-slate-200' : 'text-rose-600 dark:text-rose-300'}>
                    Installment dates are in chronological order
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-base ${validationResult.checks.noPaidDeleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {validationResult.checks.noPaidDeleted ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={validationResult.checks.noPaidDeleted ? 'text-slate-700 dark:text-slate-200' : 'text-rose-600 dark:text-rose-300'}>
                    No paid installments are marked for deletion
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-base ${validationResult.checks.dueGtePaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {validationResult.checks.dueGtePaid ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={validationResult.checks.dueGtePaid ? 'text-slate-700 dark:text-slate-200' : 'text-rose-600 dark:text-rose-300'}>
                    No due amount is less than collected payments
                  </span>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* 4. Bottom Note Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-4 rounded-xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300 font-medium">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg shrink-0">lightbulb</span>
            <span>
              <strong>Note:</strong> After saving, the system will automatically re-sequence installments, re-calculate payment allocation, update next due date and account status.
            </span>
          </div>
        </div>
      }
      footer={
        <div className="bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-6 py-3.5 shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`material-symbols-outlined text-base ${validationResult.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
              {validationResult.isValid ? 'check_circle' : 'warning'}
            </span>
            <span className={validationResult.isValid ? 'text-slate-700 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400'}>
              {validationResult.isValid ? 'Schedule is valid and ready to save.' : 'Fix validation errors to enable saving changes.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              startIcon={<span className="material-symbols-outlined text-base">close</span>}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!validationResult.isValid || rescheduleMutation.isPending}
              loading={rescheduleMutation.isPending}
              onClick={handleSaveChanges}
              startIcon={<span className="material-symbols-outlined text-base">save</span>}
            >
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={showConfirmResetModal}
        onClose={() => setShowConfirmResetModal(false)}
        onConfirm={handleResetToOriginal}
        title="Reset Schedule to Original?"
        message="Are you sure you want to discard all pending changes and restore the original database installment schedule?"
        confirmText="Reset Schedule"
        cancelText="Cancel"
      />
    </MainLayout>
  );
}
