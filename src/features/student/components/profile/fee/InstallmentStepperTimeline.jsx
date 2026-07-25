import React from 'react';
import Badge from '../../../../../components/ui/Badge';

/**
 * Interactive horizontal payment journey stepper for installment progression.
 *
 * @param {object} props - Component properties.
 * @param {Array<object>} props.installments - Array of installment records.
 * @param {string} props.selectedInstallmentId - Currently active installment ID.
 * @param {Function} props.onSelectInstallment - Callback when an installment node is clicked.
 * @returns {JSX.Element} Horizontal timeline stepper.
 */
export const InstallmentStepperTimeline = ({
  installments = [],
  selectedInstallmentId,
  onSelectInstallment
}) => {
  if (!installments || installments.length === 0) return null;

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      return new Date(dateVal).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="min-w-[600px] px-4 relative">
        {/* Continuous Horizontal Line */}
        <div className="absolute top-7 left-12 right-12 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"></div>

        {/* Stepper Nodes */}
        <div className="flex items-center justify-between relative z-10">
          {installments.map((inst, idx) => {
            const instId = inst.installment_id || inst.id || `inst-${idx}`;
            const isSelected = selectedInstallmentId === instId;
            const statusStr = (inst.status || 'pending').toLowerCase();
            const dueAmount = Number(inst.amount || inst.due_amount || 0);

            let nodeBg = 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-500';
            let badgeVariant = 'neutral';

            if (statusStr === 'paid') {
              nodeBg = 'bg-emerald-500 text-white border-2 border-emerald-500 shadow-sm shadow-emerald-500/30';
              badgeVariant = 'success';
            } else if (statusStr === 'upcoming') {
              nodeBg = 'bg-blue-500 text-white border-2 border-blue-500 ring-4 ring-blue-500/20';
              badgeVariant = 'info';
            } else if (statusStr === 'overdue') {
              nodeBg = 'bg-rose-500 text-white border-2 border-rose-500 ring-4 ring-rose-500/20';
              badgeVariant = 'danger';
            } else {
              badgeVariant = 'warning';
            }

            return (
              <button
                key={instId}
                type="button"
                onClick={() => onSelectInstallment && onSelectInstallment(instId)}
                className={`flex flex-col items-center group focus:outline-none transition-all ${
                  isSelected ? 'scale-105' : 'hover:scale-102'
                }`}
              >
                {/* Step Circle Node */}
                <div
                  className={`size-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${nodeBg} ${
                    isSelected ? 'ring-4 ring-primary/30 font-black' : ''
                  }`}
                >
                  {statusStr === 'paid' ? (
                    <span className="material-symbols-outlined text-base">check</span>
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Info Text & Badge Below */}
                <div className="mt-3 flex flex-col items-center text-center space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {formatDate(inst.due_date)}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    ₹{dueAmount.toLocaleString()}
                  </span>
                  <div className="pt-0.5">
                    <Badge variant={badgeVariant} className="text-[10px] px-2 py-0.5">
                      {statusStr.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InstallmentStepperTimeline;
