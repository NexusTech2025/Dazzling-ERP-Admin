import React from 'react';
import Button from '../../../../../components/ui/v2/Button';
import ExpandableLowDensityCard from '../../../../../components/ui/v2/cards/ExpandableLowDensityCard';

/**
 * Renders a single payment receipt item using ExpandableLowDensityCard primitive
 * displaying payment method icon, date, sync status icon, and expanded action tray.
 *
 * @param {object} props - Component properties.
 * @param {object} props.pmt - Payment receipt data object.
 * @param {number} props.idx - Iteration index.
 * @param {string} props.studentFeeId - Target StudentFeeAccount ID.
 * @param {string} props.installmentId - Target Installment ID.
 * @param {number} [props.installmentIndex=1] - 1-based index of target installment.
 * @param {boolean} props.isSynced - Whether this payment is synced with MoneyTransaction ledger.
 * @param {boolean} props.isExpanded - Expansion state of card.
 * @param {Function} props.onToggleExpand - Expansion toggle handler.
 * @param {Function} props.onOpenSyncModal - Handler to open Stage 2 MoneyTransactionForm modal.
 * @param {Function} props.formatDate - Helper function to format date strings.
 * @param {Function} props.getPaymentMethodIcon - Helper function to resolve method icon strings.
 * @returns {JSX.Element} Rendered expandable payment receipt card.
 */
export const PaymentReceiptCard = ({
  pmt,
  idx,
  studentFeeId,
  installmentId,
  installmentIndex = 1,
  isSynced,
  isExpanded,
  onToggleExpand,
  onOpenSyncModal,
  formatDate,
  getPaymentMethodIcon
}) => {
  const pmtKey = pmt.payment_id || pmt.id || `pmt-${idx}`;
  const method = pmt.payment_method || pmt.payment_mode || 'N/A';
  const compositeKey = `${studentFeeId}_${installmentId}_${pmtKey}`;
  const username = pmt.created_by || pmt.received_by || pmt.recorded_by || 'Admin';
  const txnRef = pmt.transaction_reference || pmt.transaction_ref || pmt.payment_id || 'N/A';

  const leftHeader = (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-base">{getPaymentMethodIcon(method)}</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
            {formatDate(pmt.payment_date || pmt.created_at)}
          </span>
          {isSynced ? (
            <span className="material-symbols-outlined !text-sm text-emerald-500 font-bold" title="Synced with General Ledger">
              sync
            </span>
          ) : (
            <span className="material-symbols-outlined !text-sm text-rose-500 font-bold animate-pulse" title="Not Synced with General Ledger">
              sync_problem
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {method.toUpperCase()} • {installmentId}
        </p>
      </div>
    </div>
  );

  const rightHeader = (
    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
      ₹{Number(pmt.amount_paid || pmt.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
    </span>
  );

  const expandedContent = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
        <div>
          <span className="text-slate-400 block text-[10px]">Reference Key</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block">{compositeKey}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Recorded By</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{username}</span>
        </div>
        <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-700/50">
          <span className="text-slate-400 block text-[10px]">Txn Ref</span>
          <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">{txnRef}</span>
        </div>
      </div>

      {/* Action Buttons Tray */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          variant="outlined"
          size="sm"
          startIcon="download"
          onClick={(e) => {
            e.stopPropagation();
            alert(`Downloading Receipt for Txn: ${txnRef}`);
          }}
          className="text-xs py-1 px-3"
        >
          Receipt
        </Button>

        {!isSynced && (
          <Button
            variant="contained"
            size="sm"
            startIcon="sync"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSyncModal(pmt);
            }}
            className="text-xs py-1 px-3 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Sync
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <ExpandableLowDensityCard
      key={pmtKey}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      onCardClick={onToggleExpand}
      leftHeader={leftHeader}
      rightHeader={rightHeader}
      expandedContent={expandedContent}
    />
  );
};

export default PaymentReceiptCard;
