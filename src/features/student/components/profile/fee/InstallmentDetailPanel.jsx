import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../../../../components/ui/Badge';
import Button from '../../../../../components/ui/v2/Button';
import PaymentReceiptCard from './PaymentReceiptCard';
import MoneyTransactionForm from '../../../../finance/transactions/components/MoneyTransactionForm';
import { useMoneyTransactionsQuery } from '../../../../finance/hooks/useFinanceQueries';
import { useAuth } from '../../../../../context/AuthContextCore';

/**
 * Side panel displaying breakdown and transaction ledger for a selected installment.
 *
 * @param {object} props - Component properties.
 * @param {object} [props.installment] - Target installment object containing payment receipts.
 * @param {number} [props.installmentIndex=1] - 1-based index of the installment.
 * @param {object} [props.feeAccount] - Target parent StudentFeeAccount object (SFA-xxx).
 * @param {object} [props.enrollment] - Target enrollment entity.
 * @returns {JSX.Element} Installment detail side panel.
 */
export const InstallmentDetailPanel = ({
  installment,
  installmentIndex = 1,
  feeAccount,
  enrollment
}) => {
  const { user } = useAuth();
  const currentUserName = user?.name || user?.full_name || user?.username || 'manish_kumar';

  const { data: moneyTransactions = [] } = useMoneyTransactionsQuery();
  const [expandedCards, setExpandedCards] = useState({});
  const [syncModalState, setSyncModalState] = useState({ isOpen: false, initialData: null });

  if (!installment) {
    return (
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center py-12">
        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-2">receipt_long</span>
        <p className="text-xs font-semibold text-slate-500">Select an installment from the schedule or timeline to view details.</p>
      </div>
    );
  }

  const dueAmount = Number(installment.amount || installment.due_amount || 0);
  const paidAmount = Number(installment.paid_amount || 0);
  const lateFee = Number(installment.late_fee || 0);
  const balanceDue = Math.max(0, dueAmount - paidAmount);
  const statusStr = (installment.status || 'pending').toLowerCase();

  const getStatusBadge = () => {
    switch (statusStr) {
      case 'paid':
        return <Badge variant="success">PAID</Badge>;
      case 'upcoming':
        return <Badge variant="info">UPCOMING</Badge>;
      case 'overdue':
        return <Badge variant="danger">OVERDUE</Badge>;
      default:
        return <Badge variant="warning">PENDING</Badge>;
    }
  };

  const payments = installment.payments || (installment.payment_records ? installment.payment_records : []);

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      return new Date(dateVal).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(dateVal);
    }
  };

  const getPaymentMethodIcon = (methodStr) => {
    const m = (methodStr || '').toLowerCase();
    if (m.includes('upi')) return 'smartphone';
    if (m.includes('cash')) return 'payments';
    if (m.includes('bank') || m.includes('neft') || m.includes('transfer')) return 'account_balance';
    if (m.includes('cheque') || m.includes('check')) return 'edit_note';
    return 'credit_card';
  };

  // Single Source of Truth Sync Check Helper
  const checkIsInstallmentSynced = (studentFeeId, installmentId, paymentId) => {
    console.log(`Checking is Syncked: ${studentFeeId}_${installmentId}_${paymentId}`)
    if (!studentFeeId || !installmentId || !paymentId) return false;
    const compositeKey = `${studentFeeId}_${installmentId}_${paymentId}`;
    return moneyTransactions.some(tx => (tx.payment_reference || '').trim() === compositeKey);
  };

  const handleToggleExpand = (cardKey) => {
    setExpandedCards(prev => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  const handleOpenSyncModal = (pmt) => {
    const student = enrollment?.student;
    const studentId = student?.student_id || student?.id || enrollment?.student_id || '';
    const studentName = student?.full_name || student?.student_name || 'Student';
    const programName = enrollment?.item_name || enrollment?.package_name || enrollment?.course_name || 'Academic Program';

    const studentFeeId = feeAccount?.student_fee_id || feeAccount?.id || 'SFA-000000';
    const installmentId = pmt.installment_id || installment?.installment_id || installment?.id || `INS-00000${installmentIndex}`;
    const pmtId = pmt.payment_id || pmt.id || `PMT-${installmentIndex}`;
    const compositeKey = `${studentFeeId}_${installmentId}_${pmtId}`;

    const mappedChannel = (() => {
      const m = (pmt.payment_method || pmt.payment_mode || '').toLowerCase();
      if (m === 'cash') return 'cash';
      if (m.includes('bank') || m.includes('neft')) return 'bank';
      if (m.includes('upi')) return 'phonepe';
      return 'other';
    })();

    const initialData = {
      type: 'in',
      amount: Number(pmt.amount_paid || pmt.amount || 0),
      transaction_date: pmt.payment_date || pmt.created_at ? (pmt.payment_date || pmt.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
      category_id: '',
      payment_method: mappedChannel,
      payment_reference: compositeKey,
      notes: `Student Fee Payment Sync - Installment #${installmentIndex} (${programName})`,
      remarks: pmt.remarks || '',
      party_type: 'student',
      party_id: studentId,
      party_name: studentName,
      by: pmt.created_by || pmt.received_by || currentUserName,
      reconciliation_status: 'unreconciled'
    };

    setSyncModalState({ isOpen: true, initialData });
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
          Installment #{installmentIndex} Details
        </h4>
        <div className="flex items-center gap-2">
          <Link
            to={feeAccount?.student_fee_id ? `/admin/finance/reschedule/${feeAccount.student_fee_id}` : '/admin/finance/reschedule'}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            title="Reschedule Installment Schedule"
          >
            <span className="material-symbols-outlined text-sm">edit_calendar</span>
            Reschedule
          </Link>
          {getStatusBadge()}
        </div>
      </div>

      {/* Financial Key Value Breakdown */}
      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>Due Date</span>
          <span className="font-semibold text-slate-900 dark:text-white">{formatDate(installment.due_date)}</span>
        </div>
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>Due Amount</span>
          <span className="font-bold text-slate-900 dark:text-white">₹{dueAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>Paid Amount</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{paidAmount.toLocaleString()}</span>
        </div>
        {balanceDue > 0 && statusStr !== 'paid' && (
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>Balance Due</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">₹{balanceDue.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>Late Fee</span>
          <span className="font-semibold text-slate-900 dark:text-white">₹{lateFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>Status</span>
          <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
            {statusStr === 'paid' && installment.paid_date
              ? `Paid on ${formatDate(installment.paid_date)}`
              : statusStr}
          </span>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Payment Transactions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Payment(s) ({payments.length})
          </span>
        </div>

        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((pmt, idx) => {
              const pmtKey = pmt.payment_id || pmt.id || `pmt-${idx}`;
              const studentFeeId = feeAccount?.student_fee_id || feeAccount?.id || 'SFA-000000';
              const instId = pmt.installment_id || installment?.installment_id || `INS-#${installmentIndex}`;
              const isSynced = checkIsInstallmentSynced(studentFeeId, instId, pmtKey);
              const isExpanded = !!expandedCards[pmtKey];

              return (
                <PaymentReceiptCard
                  key={pmtKey}
                  pmt={pmt}
                  idx={idx}
                  studentFeeId={studentFeeId}
                  installmentId={instId}
                  installmentIndex={installmentIndex}
                  isSynced={isSynced}
                  isExpanded={isExpanded}
                  onToggleExpand={() => handleToggleExpand(pmtKey)}
                  onOpenSyncModal={handleOpenSyncModal}
                  formatDate={formatDate}
                  getPaymentMethodIcon={getPaymentMethodIcon}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-slate-400 italic">
            No payments recorded yet for this installment.
          </div>
        )}
      </div>

      {/* Footer Action */}
      {statusStr === 'paid' && (
        <Button
          variant="outlined"
          size="sm"
          startIcon="receipt"
          onClick={() => alert(`View Receipt for Installment #${installmentIndex}`)}
          className="w-full justify-center text-xs font-bold rounded-xl"
        >
          View Receipt
        </Button>
      )}

      {/* Stage 2 MoneyTransactionForm Sync Modal Portal */}
      {syncModalState.isOpen && (
        <MoneyTransactionForm
          isOpen={syncModalState.isOpen}
          onClose={() => setSyncModalState({ isOpen: false, initialData: null })}
          initialData={syncModalState.initialData}
        />
      )}
    </div>
  );
};

export default InstallmentDetailPanel;
