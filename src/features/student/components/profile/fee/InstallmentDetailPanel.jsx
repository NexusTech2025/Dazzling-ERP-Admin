import React from 'react';
import Badge from '../../../../../components/ui/Badge';
import Button from '../../../../../components/ui/v2/Button';

/**
 * Side panel displaying breakdown and transaction ledger for a selected installment.
 *
 * @param {object} props - Component properties.
 * @param {object} [props.installment] - Target installment object containing payment receipts.
 * @param {number} [props.installmentIndex=1] - 1-based index of the installment.
 * @returns {JSX.Element} Installment detail side panel.
 */
export const InstallmentDetailPanel = ({ installment, installmentIndex = 1 }) => {
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

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
          Installment #{installmentIndex} Details
        </h4>
        {getStatusBadge()}
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
            {payments.map((pmt, idx) => (
              <div
                key={pmt.payment_id || pmt.id || idx}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(pmt.payment_date || pmt.created_at)}</span>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{Number(pmt.amount_paid || pmt.amount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="pl-4 space-y-1 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  {pmt.payment_mode && (
                    <div className="uppercase font-sans font-bold text-slate-700 dark:text-slate-300">
                      {pmt.payment_mode}
                    </div>
                  )}
                  {(pmt.transaction_ref || pmt.txn_id) && (
                    <div>TXN: {pmt.transaction_ref || pmt.txn_id}</div>
                  )}
                  {pmt.received_by && (
                    <div className="font-sans text-[11px]">By: {pmt.received_by}</div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Downloading Receipt for Txn: ${pmt.transaction_ref || pmt.payment_id || 'N/A'}`)}
                  className="absolute right-3 bottom-3 text-slate-400 hover:text-primary transition-colors"
                  title="Download Receipt"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                </button>
              </div>
            ))}
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
    </div>
  );
};

export default InstallmentDetailPanel;
