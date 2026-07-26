import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/v2/Button';
import TextInput from '../../components/ui/v2/TextInput';
import FormField from '../../components/ui/v2/FormField';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useAuth } from '../../context/AuthContextCore';
import { useRecordPaymentMutation } from './hooks/useFinanceQueries';
import { queryKeys, EMPTY_FILTER } from '../../lib/react-query/queryKeys';

/**
 * 2-Step Interactive Payment Recording Modal Dialog with ConfirmModal integration.
 * Displays financial context, target installment breakdown, payment inputs,
 * live cascading allocation preview, and payment receipt sidebar preview.
 *
 * @param {object} props - Component properties.
 * @param {boolean} props.isOpen - Visibility flag controlling modal portal.
 * @param {Function} props.onClose - Callback fired when dialog is dismissed or payment completes.
 * @param {object} [props.enrollment] - Hydrated target enrollment entity.
 * @param {object} [props.feeAccount] - Target StudentFeeAccount entity (SFA-xxx).
 * @param {object} [props.installment] - Target Installment entity (INS-xxx).
 * @returns {JSX.Element|null} Rendered payment modal dialog portal.
 */
export const RecordPaymentModal = ({
  isOpen,
  onClose,
  enrollment,
  feeAccount: passedFeeAccount,
  installment: passedInstallment
}) => {
  const { user } = useAuth();
  const currentUserName = user?.name || user?.full_name || user?.username || 'manish_kumar';

  const queryClient = useQueryClient();
  const recordMutation = useRecordPaymentMutation();

  // Resolve target objects
  const feeAccount = passedFeeAccount || enrollment?.studentfeeaccounts?.[0];
  const installments = useMemo(() => feeAccount?.installments || [], [feeAccount]);

  const targetInstallment = useMemo(() => {
    if (passedInstallment) return passedInstallment;
    if (installments.length > 0) {
      const pendingInst = installments.find(i => (i.status || '').toLowerCase() !== 'paid');
      return pendingInst || installments[0];
    }
    return null;
  }, [passedInstallment, installments]);

  const targetIndex = useMemo(() => {
    if (!installments || !targetInstallment) return 0;
    return installments.findIndex(i => (i.installment_id || i.id) === (targetInstallment.installment_id || targetInstallment.id));
  }, [installments, targetInstallment]);

  // Derived initial values
  const remainingDueOnTarget = useMemo(() => {
    if (!targetInstallment) return 0;
    const due = Number(targetInstallment.amount || targetInstallment.due_amount || 0);
    const paid = Number(targetInstallment.paid_amount || 0);
    return Math.max(0, due - paid);
  }, [targetInstallment]);

  // Form States
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [transactionRef, setTransactionRef] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState(null);

  // ConfirmModal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    status: 'idle', // 'idle' | 'processing' | 'success' | 'error'
    resultMessage: null
  });

  // Sync amount input when target installment changes
  useEffect(() => {
    if (targetInstallment) {
      setAmountPaidInput(remainingDueOnTarget.toString());
      setError(null);
    }
  }, [targetInstallment, remainingDueOnTarget]);

  if (!isOpen || !targetInstallment || !feeAccount) return null;

  const numericAmountPaid = Number(amountPaidInput) || 0;

  // Student Identity Details
  const student = enrollment?.student;
  const studentName = student?.full_name || student?.student_name || 'Student';
  const studentInitials = studentName.substring(0, 2).toUpperCase();
  const enrollmentId = enrollment?.enrollment_id || enrollment?.id || 'ENR-938112AF';
  const programName = enrollment?.item_name || enrollment?.package_name || enrollment?.course_name || 'Academic Package';
  const batchName = enrollment?.batch_name || '2026 Batch';
  const feePlanName = feeAccount?.feeplan?.name || feeAccount?.feeplan?.plan_name || 'Default Standard Plan';

  // Fee Summary Derivations
  const totalFee = Number(feeAccount?.final_fee ?? feeAccount?.total_fee ?? 0);
  const currentPaid = Number(feeAccount?.amount_paid ?? 0);
  const currentBalance = Number(feeAccount?.balance_due ?? Math.max(0, totalFee - currentPaid));
  const paidCount = installments.filter(i => (i.status || '').toLowerCase() === 'paid').length;

  // Live After Payment Calculation
  const newTotalPaid = currentPaid + numericAmountPaid;
  const newBalanceDue = Math.max(0, totalFee - newTotalPaid);

  // Live Stepper Allocation Preview
  const allocationPreview = installments.map((inst, idx) => {
    const instDue = Number(inst.amount || inst.due_amount || 0);
    const instPaid = Number(inst.paid_amount || 0);
    const instRem = Math.max(0, instDue - instPaid);

    if (idx < targetIndex) {
      return { ...inst, previewStatus: 'Already Paid', allocated: 0 };
    }

    return { ...inst, previewStatus: 'Evaluated', remaining: instRem };
  });

  // Calculate allocation breakdown
  let unallocated = numericAmountPaid;
  const detailedAllocations = allocationPreview.map((inst, idx) => {
    if (idx < targetIndex) {
      return { ...inst, allocated: 0, finalPaid: inst.paid_amount || 0, willBePaid: true };
    }

    const rem = inst.remaining || 0;
    const alloc = Math.min(unallocated, rem);
    unallocated -= alloc;
    const totalInstPaid = (Number(inst.paid_amount) || 0) + alloc;
    const willBePaid = rem > 0 ? alloc >= rem : true;

    return {
      ...inst,
      allocated: alloc,
      totalInstPaid,
      willBePaid
    };
  });

  const hasExcessOverpayment = unallocated > 0;

  const formatDateLabel = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      return new Date(dateVal).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(dateVal);
    }
  };

  // Form Submit Handler: Opens ConfirmModal in idle mode
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (numericAmountPaid <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      status: 'idle',
      resultMessage: (
        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Are you sure you want to record the following fee payment transaction?
          </p>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Student:</span>
              <strong className="text-slate-900 dark:text-white">{studentName}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Program:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{programName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Installment:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">#{targetIndex + 1} of {installments.length}</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-bold">Payment Amount:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 text-sm">₹{numericAmountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Payment Method:</span>
              <span className="font-bold uppercase text-slate-700 dark:text-slate-300">{paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Payment Date:</span>
              <span className="font-semibold">{formatDateLabel(paymentDate)}</span>
            </div>
          </div>
        </div>
      )
    });
  };

  // Execution Handler triggered by ConfirmModal "onConfirm"
  const handleConfirmSubmit = () => {
    setConfirmModal(prev => ({ ...prev, status: 'processing' }));

    const studentFeeId = feeAccount.student_fee_id || feeAccount.id;
    const installmentId = targetInstallment.installment_id || targetInstallment.id;

    const isoPaymentDate = paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString();

    recordMutation.mutate(
      {
        student_fee_id: studentFeeId,
        installment_id: installmentId,
        amount_paid: numericAmountPaid,
        payment_method: paymentMethod,
        transaction_reference: transactionRef.trim() || undefined,
        payment_date: isoPaymentDate,
        remarks: remarks.trim() || undefined,
        created_by: currentUserName
      },
      {
        onSuccess: (res) => {
        if (res?.success || res?.data?.success) {
          queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.enrollment.list(EMPTY_FILTER) });

          const receiptId = res?.data?.data?.payment_id || res?.data?.payment_id || 'PAY-SUCCESS';

          setConfirmModal({
            isOpen: true,
            status: 'success',
            resultMessage: (
              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                  <span className="material-symbols-outlined">check_circle</span>
                  Payment Transaction Recorded Successfully!
                </p>
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Receipt / Payment ID:</span>
                    <strong className="font-mono text-slate-900 dark:text-white">{receiptId}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Amount Deposited:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">₹{numericAmountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">New Balance Due:</span>
                    <strong className="text-amber-600 dark:text-amber-400">₹{newBalanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Account Status:</span>
                    <span className="font-extrabold uppercase text-emerald-600">{newBalanceDue === 0 ? 'COMPLETED' : 'ACTIVE'}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">All student installment schedules and RAM caches have been rebalanced.</p>
              </div>
            )
          });
        } else {
          const errorMsg = res?.message || res?.error?.message || 'Failed to process payment transaction.';
          setConfirmModal({
            isOpen: true,
            status: 'error',
            resultMessage: errorMsg
          });
        }
      },
        onError: (err) => {
          setConfirmModal({
            isOpen: true,
            status: 'error',
            resultMessage: err.message || 'An unexpected error occurred during payment submission.'
          });
        }
}
    );
  };

const handleCloseConfirmModal = () => {
  const wasSuccess = confirmModal.status === 'success';
  setConfirmModal({ isOpen: false, status: 'idle', resultMessage: null });
  if (wasSuccess) {
    onClose();
  }
};

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150 overflow-y-auto">
    <div className="bg-white dark:bg-slate-900 w-full max-w-7xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">

      {/* Top Dialog Title Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">credit_card</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Record Student Payment</h3>
            <p className="text-xs text-slate-500">Collect fee transactions and trigger automatic schedule rebalancing</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="size-8 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Sub-Header Banner (Student & Program Context) */}
      <div className="px-6 py-3.5 bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary text-white font-black flex items-center justify-center text-sm shadow-md shadow-primary/20">
            {studentInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{studentName}</h4>
              <Badge variant="success" className="text-[10px] py-0 px-2">ACTIVE</Badge>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">Enrollment ID: <strong className="text-slate-700 dark:text-slate-300">{enrollmentId}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-600 dark:text-slate-300 flex-wrap">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Program</span>
            <span className="font-bold text-slate-900 dark:text-white">{programName}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Batch</span>
            <span className="font-semibold">{batchName}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee Plan</span>
            <span className="font-semibold">{feePlanName}</span>
          </div>
          <Button
            variant="outlined"
            size="sm"
            endIcon="open_in_new"
            onClick={() => alert(`Navigating to Fee Account for enrollment ${enrollmentId}...`)}
            className="text-[11px] py-1 px-3 rounded-xl border-slate-300 dark:border-slate-700"
          >
            View Fee Account
          </Button>
        </div>
      </div>

      {/* Split Two-Column Modal Body */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Main Form Column (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* 1. Fee Account Summary Tiles (5 mini cards) */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fee Account Summary</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Fee</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">₹{totalFee.toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Paid Amount</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{currentPaid.toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Balance Due</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">₹{currentBalance.toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Next Due Date</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
                  {formatDateLabel(targetInstallment.due_date)}
                </span>
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Installments</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {paidCount} / {installments.length} Paid
                </span>
              </div>
            </div>
          </div>

          {/* 2. Target Installment Breakdown Card */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Target Installment</span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Installment</span>
                <span className="font-bold text-slate-900 dark:text-white">#{targetIndex + 1} of {installments.length}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Due Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDateLabel(targetInstallment.due_date)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Due Amount</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{Number(targetInstallment.amount || targetInstallment.due_amount || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Already Paid</span>
                <span className="font-semibold text-emerald-600">₹{Number(targetInstallment.paid_amount || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Remaining Due</span>
                <span className="font-bold text-amber-600">₹{remainingDueOnTarget.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Late Fee</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">₹{Number(targetInstallment.late_fee || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 3. Payment Information Form Inputs */}
          <form id="record-payment-form" onSubmit={handleSubmit} className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Payment Information</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Amount */}
              <FormField label="Payment Amount *" helpText="Enter amount you are collecting">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">₹</span>
                  <TextInput
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={amountPaidInput}
                    onChange={(e) => setAmountPaidInput(e.target.value)}
                    className="pl-8 font-bold text-sm"
                    placeholder="0.00"
                  />
                </div>
              </FormField>

              {/* Payment Date */}
              <FormField label="Payment Date *">
                <TextInput
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="text-sm font-semibold"
                />
              </FormField>
            </div>

            {/* Payment Method Cards */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Payment Method *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    id: 'upi',
                    label: 'UPI',
                    icon: 'smartphone',
                    colorClass: 'text-amber-500'
                  },
                  {
                    id: 'cash',
                    label: 'Cash',
                    icon: 'payments',
                    colorClass: 'text-emerald-500'
                  },
                  {
                    id: 'bank_transfer',
                    label: 'Bank Transfer',
                    icon: 'account_balance',
                    colorClass: 'text-blue-500'
                  },
                  {
                    id: 'cheque',
                    label: 'Cheque',
                    icon: 'edit_note',
                    colorClass: 'text-indigo-500'
                  }
                ].map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all ${isSelected
                        ? 'border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`material-symbols-outlined text-xl ${method.colorClass}`}>{method.icon}</span>
                        <span>{method.label}</span>
                      </div>
                      <div className={`size-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                        {isSelected && <span className="size-1.5 rounded-full bg-white"></span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transaction Reference */}
            <FormField label="Transaction Reference (Optional)" helpText="UPI ID, Transaction No., Cheque No., etc.">
              <TextInput
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. UPI-88392011"
                className="font-mono text-xs"
              />
            </FormField>

            {/* Remarks */}
            <FormField label="Remarks (Optional)">
              <textarea
                rows="2"
                maxLength="255"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any notes or remarks..."
                className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
              />
              <div className="text-right text-[10px] text-slate-400 mt-1">{remarks.length} / 255</div>
            </FormField>
          </form>

          {/* 4. Live Allocation Stepper Preview */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                Live Allocation Preview
              </span>
              <Badge variant={hasExcessOverpayment ? 'warning' : 'success'} className="text-[10px]">
                {hasExcessOverpayment ? '⚡ Cascading Overpayment Applied' : 'No Overpayment'}
              </Badge>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {detailedAllocations.map((inst, idx) => (
                <React.Fragment key={inst.installment_id || inst.id || idx}>
                  <div className={`p-3 rounded-xl border text-xs space-y-1 min-w-[130px] shrink-0 ${inst.allocated > 0
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Installment #{idx + 1}</div>
                    <div className="text-[11px] text-slate-400">{formatDateLabel(inst.due_date)}</div>
                    <div className="font-extrabold text-slate-900 dark:text-white">₹{Number(inst.amount || inst.due_amount || 0).toLocaleString()}</div>
                    <div className="pt-1">
                      <Badge
                        variant={inst.willBePaid ? 'success' : 'neutral'}
                        className="text-[9px] py-0 px-1.5"
                      >
                        {inst.allocated > 0 ? (inst.willBePaid ? 'Will be Paid' : `₹${inst.allocated.toLocaleString()} Applied`) : (inst.paid_amount >= inst.amount ? 'Paid' : 'Due')}
                      </Badge>
                    </div>
                  </div>

                  {idx < detailedAllocations.length - 1 && (
                    <span className="material-symbols-outlined text-slate-400 shrink-0">double_arrow</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sidebar Column (4 Columns) - Payment Receipt Preview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-5 sticky top-0">

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment Receipt Preview</span>
              <Badge variant="info" className="text-[10px]">Preview</Badge>
            </div>

            {/* Receipt Visual Header */}
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Payment Receipt</h4>
                <span className="text-[11px] text-slate-400">Transaction summary preview</span>
              </div>
            </div>

            {/* Key-Value Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Student Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{studentName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Program</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[150px]">{programName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Installment</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">#{targetIndex + 1} of {installments.length}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 pt-1">
                <span>Payment Amount</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{numericAmountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Payment Method</span>
                <span className="font-bold uppercase text-slate-700 dark:text-slate-300">{paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Payment Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDateLabel(paymentDate)}</span>
              </div>
              {transactionRef && (
                <div className="flex justify-between items-center text-slate-500">
                  <span>Reference</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">{transactionRef}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-500">
                <span>Recorded By</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">{currentUserName}</span>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* After This Payment Metrics */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">After this payment</span>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Total Paid</span>
                <span className="font-bold text-emerald-600">₹{newTotalPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Balance Due</span>
                <span className="font-bold text-amber-600">₹{newBalanceDue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Account Status</span>
                <Badge variant={newBalanceDue === 0 ? 'success' : 'info'} className="text-[9px]">
                  {newBalanceDue === 0 ? 'Completed' : 'Active'}
                </Badge>
              </div>
            </div>

            {/* Info Notice Box */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-[11px] text-blue-700 dark:text-blue-400 flex items-start gap-2">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">info</span>
              <span>Receipt will be generated automatically after successful payment transaction.</span>
            </div>

          </div>
        </div>

      </div>

      {/* Modal Bottom Action Footer */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={onClose}
          disabled={recordMutation.isPending}
          className="rounded-xl px-5 text-xs font-bold"
        >
          Cancel
        </Button>

        <Button
          form="record-payment-form"
          type="submit"
          variant="contained"
          size="sm"
          startIcon="payments"
          loading={recordMutation.isPending}
          className="rounded-xl px-6 text-xs font-bold shadow-lg shadow-primary/25"
        >
          Record Payment
        </Button>
      </div>

    </div>

    {/* ConfirmModal Portal Overlay */}
    {confirmModal.isOpen && (
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmSubmit}
        title="Confirm Payment Transaction"
        message="Are you sure you want to record this payment?"
        confirmText="Confirm Payment"
        cancelText="Back"
        status={confirmModal.status}
        resultMessage={confirmModal.resultMessage}
      />
    )}
  </div>
);
};

export default RecordPaymentModal;
