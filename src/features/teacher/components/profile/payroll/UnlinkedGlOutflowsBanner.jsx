import React from 'react';
import Card from '../../../../../components/ui/Card';
import Badge from '../../../../../components/ui/Badge';
import Button from '../../../../../components/ui/v2/Button';

/**
 * Banner component displaying unlinked General Ledger outflows for a specific teacher (Scenario 1).
 * Allows administrative cashiers to either convert the GL entry into a Sub-Ledger Payroll payment or mark it as non-salary reimbursement.
 */
const UnlinkedGlOutflowsBanner = ({ unlinkedOutflows = [], onConvertToPayroll, onMarkNonSalary, isProcessing = false }) => {
  if (!unlinkedOutflows || unlinkedOutflows.length === 0) return null;

  return (
    <Card className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 mb-6">
      <Card.Header border={true} className="flex items-center justify-between bg-amber-500/10 dark:bg-amber-500/20 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl" aria-hidden="true">
            warning
          </span>
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Unlinked General Ledger Outflows Detected ({unlinkedOutflows.length})
          </h3>
        </div>
        <Badge variant="warning" className="font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5">
          RECONCILIATION ACTION NEEDED
        </Badge>
      </Card.Header>

      <Card.Body className="p-4 space-y-3">
        <p className="text-xs text-text-secondary font-medium">
          The following General Ledger outflow(s) were logged directly in the Cash Book for this teacher but have not been linked to a Teacher Sub-Ledger Payroll payout:
        </p>

        <div className="space-y-2">
          {unlinkedOutflows.map((tx) => (
            <div
              key={tx.transaction_id || tx.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-500/20 gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-text-main dark:text-white">
                    {tx.transaction_id || tx.id}
                  </span>
                  <span className="text-xs font-semibold text-text-secondary">•</span>
                  <span className="text-xs font-mono text-text-secondary">
                    {tx.transaction_date || 'N/A'}
                  </span>
                  <Badge variant="info" className="text-[10px] capitalize px-1.5 py-0">
                    {(tx.payment_method || 'cash').replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary font-medium">
                  {tx.notes || tx.remarks || 'Direct General Ledger Cash Book Outflow'}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <span className="font-mono font-bold text-sm text-amber-700 dark:text-amber-300">
                  ₹{(Number(tx.amount) || 0).toLocaleString()}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => onMarkNonSalary && onMarkNonSalary(tx)}
                    disabled={isProcessing}
                    className="text-[11px] font-bold py-1 px-2 text-text-secondary hover:text-amber-700 border-amber-500/30"
                  >
                    Non-Salary
                  </Button>
                  <Button
                    variant="contained"
                    size="sm"
                    startIcon="add_card"
                    onClick={() => onConvertToPayroll && onConvertToPayroll(tx)}
                    disabled={isProcessing}
                    className="text-[11px] font-bold py-1 px-3 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Convert to Payroll
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default React.memo(UnlinkedGlOutflowsBanner);
