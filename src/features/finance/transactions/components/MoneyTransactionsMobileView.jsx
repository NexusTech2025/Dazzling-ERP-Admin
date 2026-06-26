import React, { useState } from 'react';
import ExpandableLowDensityCard from '../../../../components/ui/v2/cards/ExpandableLowDensityCard';

/**
 * Renders a list of transaction cards optimized for mobile display with inline expandable bars.
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.transactions - Filtered and sorted transactions list.
 * @param {Array<string>} props.selectedIds - List of checked row IDs.
 * @param {Function} props.onSelectRow - Checkbox toggle callback.
 * @param {Function} props.getCategoryName - Category display mapper.
 * @param {Function} props.onRowClick - Detail drawer selection callback.
 * @param {Function} props.onEdit - Edit form modal trigger callback.
 * @param {Function} props.onDelete - Deletion trigger callback.
 * @returns {React.JSX.Element} Low-density mobile-optimized cards layout.
 */
export const MoneyTransactionsMobileView = ({
  transactions,
  selectedIds,
  onSelectRow,
  getCategoryName,
  onRowClick,
  onEdit,
  onDelete
}) => {
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-4">
      {transactions.length > 0 ? (
        transactions.map((tx) => {
          const isExpanded = !!expandedIds[tx.transaction_id];
          const isReceived = tx.type === 'in';
          const isChecked = selectedIds.includes(tx.transaction_id);

          // Badges and styles
          const typeBadgeStyles = isReceived
            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
            : 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30';

          const partyBadgeStyles =
            tx.party_type === 'student' ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30' :
              tx.party_type === 'teacher' ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30' :
                tx.party_type === 'staff' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30' :
                  'bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-on-surface-variant border-border-light dark:border-border-dark';

          const reconBadgeStyles =
            tx.reconciliation_status === 'matched' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' :
              tx.reconciliation_status === 'discrepancy' ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30' :
                'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/30';

          return (
            <ExpandableLowDensityCard
              key={tx.transaction_id}
              isChecked={isChecked}
              onSelect={() => onSelectRow(tx.transaction_id)}
              isExpanded={isExpanded}
              onToggleExpand={(e) => toggleExpand(e, tx.transaction_id)}
              onCardClick={() => onRowClick(tx)}
              leftHeader={
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-primary text-[12px]">#{tx.transaction_id}</span>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded w-fit border ${partyBadgeStyles}`}>
                    {tx.party_type}
                  </span>
                </div>
              }
              rightHeader={
                <div className="flex items-center gap-4">
                  {/* Flow Direction Indicator */}
                  <div className="flex items-center justify-center">
                    {isReceived ? (
                      <span className="material-symbols-outlined text-emerald-500 font-black text-base" title="Received (In)">arrow_downward</span>
                    ) : (
                      <span className="material-symbols-outlined text-red-500 font-black text-base" title="Sent (Out)">arrow_upward</span>
                    )}
                  </div>

                  {/* Amount and Date */}
                  <div className="text-right">
                    <div className={`font-mono font-bold ${isReceived ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {isReceived ? '+' : '-'}₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-text-secondary dark:text-on-surface-variant">
                      {new Date(tx.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: "numeric" })}
                    </div>
                  </div>
                </div>
              }
              expandedContent={
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-text-secondary dark:text-on-surface-variant">
                    <div>
                      <span className="font-bold block text-[9px] uppercase tracking-wider text-text-secondary/70">Sent From/To</span>
                      <span className="font-semibold text-text-main dark:text-white">{tx.from_to || tx.party_name}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-[9px] uppercase tracking-wider text-text-secondary/70">Received/Sent By</span>
                      <span className="font-semibold text-text-main dark:text-white">{tx.by || tx.created_by || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-[9px] uppercase tracking-wider text-text-secondary/70">Payment Info</span>
                      <span className="font-semibold text-text-main dark:text-white capitalize">{tx.payment_method}</span>
                      {tx.payment_reference && (
                        <span className="font-mono block text-[9px] text-text-secondary/80">REF: {tx.payment_reference}</span>
                      )}
                    </div>
                    <div>
                      <span className="font-bold block text-[9px] uppercase tracking-wider text-text-secondary/70">Category</span>
                      <span className="font-semibold text-text-main dark:text-white">{getCategoryName(tx.category_id)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-light/50 dark:border-border-dark/50">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${reconBadgeStyles}`}>
                        {tx.reconciliation_status || 'unreconciled'}
                      </span>
                      {tx.attachment_drive_id && (
                        <a
                          href={`https://drive.google.com/open?id=${tx.attachment_drive_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-0.5 text-primary hover:underline font-bold text-[10px]"
                        >
                          <span className="material-symbols-outlined text-xs">attachment</span>
                          Receipt
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(tx)}
                        className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">edit</span>
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(tx.transaction_id)}
                        className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold rounded transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              }
            />
          );
        })
      ) : (
        <div className="text-center py-12 text-text-secondary text-sm">
          No transactions registered matching active filters.
        </div>
      )}
    </div>
  );
};
