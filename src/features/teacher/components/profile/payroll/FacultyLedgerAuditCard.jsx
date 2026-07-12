import React from 'react';
import Card from '../../../../../components/ui/Card';
import Badge from '../../../../../components/ui/Badge';
import Button from '../../../../../components/ui/v2/Button';
import { formatFinancialLakh, formatFinancialK } from '../../../utils/teacher.utils';

const FacultyLedgerAuditCard = React.memo(({ calculations = {}, onReconcile, onDisburse, onIssueAdvance, onViewLogs }) => {
  return (
    <Card>
      <Card.Header border={true} className="flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary text-xl" aria-hidden="true">account_balance_wallet</span>
          <h3 className="text-lg font-bold text-text-main dark:text-white">
            Ledger Audit Summary
          </h3>
        </div>
        <Badge variant="success" className="font-black tracking-widest text-[9px] uppercase px-2 py-0.5">
          RECONCILED
        </Badge>
      </Card.Header>

      <Card.Body className="space-y-6">
        {/* Section A: Budgetary Allocation */}
        <div className="space-y-3">
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest block">Budgetary Allocation</span>

          <div className="bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-xl border border-border-light dark:border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Total Contract Value</span>
              <p className="text-2xl font-bold font-mono text-text-main dark:text-white mt-1">
                INR {(calculations.totalAmountToPay || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <span className="material-symbols-outlined text-text-secondary text-2xl" aria-hidden="true">account_balance</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50/30 dark:bg-slate-950/20 p-3 rounded-lg border border-border-light dark:border-slate-800/30">
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Active Base Rate</span>
              <span className="font-bold text-text-main dark:text-white font-mono">
                INR {(calculations.activeBaseRate || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}/mo
              </span>
            </div>
            <div className="bg-slate-50/30 dark:bg-slate-950/20 p-3 rounded-lg border border-border-light dark:border-slate-800/30">
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Settlement Ratio</span>
              <span className="font-bold text-text-main dark:text-white font-mono">
                {(calculations.settlementRatio || 0).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Average Payouts Full-Width Split Card */}
          <div className="bg-orange-500/5 dark:bg-rose-500/5 p-4 rounded-xl border border-orange-500/20 dark:border-rose-500/20 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-orange-500 dark:text-rose-400 uppercase tracking-wider">Average Monthly Payouts</span>
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] text-text-secondary uppercase block">Should Pay</span>
                <span className="text-sm font-bold font-mono text-text-main dark:text-white">
                  ₹{(calculations.avgMonthlyPay || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="h-8 w-px bg-orange-500/20 dark:bg-rose-500/20" />
              <div className="text-right">
                <span className="text-[9px] text-text-secondary uppercase block">Currently Paying</span>
                <span className="text-sm font-bold font-mono text-text-main dark:text-white">
                  ₹{(calculations.avgMonthlyPaid || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Transaction Reconciliation */}
        <div className="space-y-4 pt-4 border-t border-border-light/10 dark:border-slate-800/40">
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest block">Transaction Reconciliation</span>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">Gross Paid</span>
              <p className="text-xl font-bold font-mono text-emerald-400">
                {formatFinancialLakh(calculations.paidAmount || 0)}
              </p>
            </div>
            <div className="bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/20">
              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">Net Owed</span>
              <p className="text-xl font-bold font-mono text-indigo-400">
                {formatFinancialK(calculations.pendingAmount || 0)}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-medium">
            <div className="flex items-center justify-between py-1 border-b border-border-light/10 dark:border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-[16px]" aria-hidden="true">check_circle</span>
                <span>Successful Payments</span>
              </div>
              <span className="font-bold font-mono">{calculations.successfulCount || 0}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border-light/10 dark:border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[16px]" aria-hidden="true">pending</span>
                <span>Pending Processing</span>
              </div>
              <span className="font-bold font-mono">{calculations.pendingCount || 0}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border-light/10 dark:border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[16px]" aria-hidden="true">payments</span>
                <span>Salary Advances</span>
              </div>
              <span className="font-bold font-mono">INR {(calculations.advancesSum || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="bg-slate-50/30 dark:bg-slate-950/20 py-2.5 rounded-lg border border-border-light dark:border-slate-800/40">
              <span className="text-[9px] font-bold text-text-secondary uppercase block mb-0.5">UPI</span>
              <span className="font-bold font-mono text-text-main dark:text-white">
                ₹{(calculations.upiSum || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-50/30 dark:bg-slate-950/20 py-2.5 rounded-lg border border-border-light dark:border-slate-800/40">
              <span className="text-[9px] font-bold text-text-secondary uppercase block mb-0.5">Cash</span>
              <span className="font-bold font-mono text-text-main dark:text-white">
                ₹{(calculations.cashSum || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-50/30 dark:bg-slate-950/20 py-2.5 rounded-lg border border-border-light dark:border-slate-800/40">
              <span className="text-[9px] font-bold text-text-secondary uppercase block mb-0.5">Bank</span>
              <span className="font-bold font-mono text-text-main dark:text-white">
                ₹{(calculations.bankSum || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Triggers Grid inside card body */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-light/10 dark:border-slate-800/40">
          <Button
            variant="outlined"
            size="sm"
            startIcon="payments"
            onClick={onIssueAdvance}
            className="w-full text-[10px] uppercase font-bold"
          >
            Issue Advance
          </Button>
          <Button
            variant="outlined"
            size="sm"
            startIcon="assignment"
            onClick={onViewLogs}
            className="w-full text-[10px] uppercase font-bold"
          >
            View Logs
          </Button>
        </div>
      </Card.Body>

      <Card.Footer border={true} className="flex gap-2">
        <Button
          variant="outlined"
          size="md"
          onClick={onReconcile}
          className="flex-1 text-[10px] uppercase font-bold"
        >
          Reconcile Ledger
        </Button>
        <Button
          variant="contained"
          size="md"
          onClick={onDisburse}
          className="flex-1 text-[10px] uppercase font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Disburse Salary
        </Button>
      </Card.Footer>
    </Card>
  );
});

FacultyLedgerAuditCard.displayName = 'FacultyLedgerAuditCard';

export default FacultyLedgerAuditCard;
