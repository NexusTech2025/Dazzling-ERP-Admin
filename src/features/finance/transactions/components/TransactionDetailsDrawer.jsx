import React from 'react';

/**
 * Renders a detailed metadata drawer for a transaction.
 * @param {Object} props - Component properties.
 * @param {Object|null} props.transaction - The active transaction record to inspect.
 * @param {boolean} props.isOpen - Visibility state toggle.
 * @param {Function} props.onClose - Dismissal handler callback.
 * @param {Function} props.onEdit - In-place editing trigger callback.
 * @param {Function} props.getCategoryName - Helper function mapping category ID to display string.
 * @returns {React.JSX.Element|null} Detailed slide-out presentation drawer.
 */
export const TransactionDetailsDrawer = ({
  transaction,
  isOpen,
  onClose,
  onEdit,
  getCategoryName
}) => {
  if (!isOpen || !transaction) return null;

  const isReceived = transaction.type === 'in';
  
  // Dynamic color schemes
  const typeBadgeStyles = isReceived
    ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
    : 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30';

  const reconBadgeStyles = 
    transaction.reconciliation_status === 'matched' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' :
    transaction.reconciliation_status === 'discrepancy' ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30' :
    'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/30';

  const partyBadgeStyles = 
    transaction.party_type === 'student' ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30' :
    transaction.party_type === 'teacher' ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-900/30' :
    transaction.party_type === 'staff' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/30' :
    'bg-slate-100 dark:bg-slate-800/40 text-text-secondary dark:text-on-surface-variant border-border-light dark:border-border-dark';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex justify-end">
      {/* Click outside target */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Drawer layout container */}
      <div className="relative w-full max-w-md h-full bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <header className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
          <div>
            <span className="text-[10px] font-black tracking-widest text-text-secondary uppercase">Transaction Details</span>
            <h2 className="text-lg font-black text-text-main dark:text-white font-mono mt-0.5">#{transaction.transaction_id}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-text-secondary hover:text-text-main dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Scrollable details list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Big Amount Panel */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-border-light dark:border-border-dark p-6 rounded-2xl text-center space-y-2">
            <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Transaction Amount</span>
            <h1 className={`text-3xl font-black font-mono ${isReceived ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {isReceived ? '+' : '-'}₹{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            <div className="flex justify-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${typeBadgeStyles}`}>
                {isReceived ? 'Received (In)' : 'Sent (Out)'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${reconBadgeStyles}`}>
                {transaction.reconciliation_status || 'unreconciled'}
              </span>
            </div>
          </div>

          {/* Core Properties */}
          <div className="space-y-4">
            
            {/* Category */}
            <div className="flex justify-between items-center py-2 border-b border-border-light dark:border-border-dark">
              <span className="text-xs font-bold text-text-secondary">Category</span>
              <span className="text-xs font-black text-text-main dark:text-white">{getCategoryName(transaction.category_id)}</span>
            </div>

            {/* Date */}
            <div className="flex justify-between items-center py-2 border-b border-border-light dark:border-border-dark">
              <span className="text-xs font-bold text-text-secondary">Date</span>
              <span className="text-xs font-semibold text-text-main dark:text-white">
                {new Date(transaction.transaction_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Payment Info */}
            <div className="flex justify-between items-start py-2 border-b border-border-light dark:border-border-dark">
              <span className="text-xs font-bold text-text-secondary">Payment Method</span>
              <div className="text-right">
                <span className="text-xs font-semibold capitalize text-text-main dark:text-white">{transaction.payment_method}</span>
                {transaction.payment_reference && (
                  <p className="text-[10px] text-text-secondary font-mono mt-0.5">REF: {transaction.payment_reference}</p>
                )}
              </div>
            </div>

            {/* Drive Attachment */}
            <div className="flex justify-between items-center py-2 border-b border-border-light dark:border-border-dark">
              <span className="text-xs font-bold text-text-secondary">Receipt Attachment</span>
              {transaction.attachment_drive_id ? (
                <a 
                  href={`https://drive.google.com/open?id=${transaction.attachment_drive_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">attachment</span>
                  View Receipt
                </a>
              ) : (
                <span className="text-xs text-text-secondary italic">No Attachment</span>
              )}
            </div>

          </div>

          {/* Relational Polymorphic Party */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-border-light dark:border-border-dark p-4 rounded-xl space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
              {isReceived ? 'Received From (Sender)' : 'Sent To (Receiver)'}
            </span>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-text-main dark:text-white">{transaction.party_name}</h4>
                {transaction.party_id && (
                  <span className="text-[10px] text-text-secondary font-mono mt-0.5">ID: {transaction.party_id}</span>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${partyBadgeStyles}`}>
                {transaction.party_type}
              </span>
            </div>
          </div>

          {/* Audit Handlers */}
          <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-border-light dark:border-border-dark p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Audit Trail</span>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-text-secondary block font-bold">System Handler</span>
                <span className="font-semibold text-text-main dark:text-white">{transaction.by || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary block font-bold">Logged By</span>
                <span className="font-semibold text-text-main dark:text-white">{transaction.created_by || '—'}</span>
              </div>
            </div>
          </div>

          {/* Notes & Remarks */}
          <div className="space-y-4">
            {transaction.notes && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Transaction Notes</span>
                <p className="text-xs text-text-main dark:text-text-secondary bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-border-light dark:border-border-dark leading-relaxed">
                  {transaction.notes}
                </p>
              </div>
            )}
            
            {transaction.remarks && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Auditor Remarks</span>
                <p className="text-xs text-text-main dark:text-text-secondary bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-border-light dark:border-border-dark leading-relaxed">
                  {transaction.remarks}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <footer className="px-6 py-4 border-t border-border-light dark:border-border-dark flex gap-3 bg-slate-50 dark:bg-slate-900/30">
          <button 
            onClick={() => onEdit(transaction)}
            className="flex-1 py-2 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Edit Transaction
          </button>
          <button 
            onClick={onClose}
            className="py-2 px-4 border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-800 text-text-main dark:text-white text-xs font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </footer>

      </div>
    </div>
  );
};
