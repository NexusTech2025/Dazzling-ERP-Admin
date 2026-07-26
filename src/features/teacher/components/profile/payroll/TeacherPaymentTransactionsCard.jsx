import React from 'react';
import Card from '../../../../../components/ui/Card';
import Badge from '../../../../../components/ui/Badge';
import Button from '../../../../../components/ui/v2/Button';
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty
} from '../../../../../components/ui/table';
import { formatDateBounds } from '../../../utils/teacher.utils';
import { useMoneyTransactionsQuery } from '../../../../finance/hooks/useFinanceQueries';

const TeacherPaymentTransactionsCard = React.memo(({ transactions = [], teacherId, teacherName, onSyncLedger }) => {
  const { data: moneyTransactions = [] } = useMoneyTransactionsQuery();

  return (
    <Card>
      <Card.Header border={true} className="flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary text-xl" aria-hidden="true">list_alt</span>
          <h3 className="text-lg font-bold text-text-main dark:text-white">
            Payment Transactions Ledger
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="h-8 w-8 flex items-center justify-center rounded-lg border border-border-light dark:border-slate-800 text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-base">filter_list</span>
          </button>
          <button type="button" className="h-8 w-8 flex items-center justify-center rounded-lg border border-border-light dark:border-slate-800 text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-base">more_vert</span>
          </button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {transactions.length === 0 ? (
          <div className="py-12">
            <TableEmpty message="No payment transactions found." icon="payments" />
          </div>
        ) : (
          <TableContainer>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Salary Month</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Ref Number</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead>GL Sync</TableHead>
                <TableHead align="right">Amount</TableHead>
                <TableHead align="center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const targetTeacherId = teacherId || tx.teacher_id;
                const compositeKey = `${targetTeacherId}_${tx.salary_month}_${tx.transaction_id}`;
                
                const isSynced = moneyTransactions.some(mt => 
                  mt.payment_reference === compositeKey || 
                  (mt.payment_reference && mt.payment_reference.includes(tx.transaction_id))
                );

                return (
                  <TableRow key={tx.transaction_id}>
                    <TableCell className="text-xs">
                      {formatDateBounds(tx.transaction_date, 'N/A')}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.salary_month || 'N/A'}
                    </TableCell>
                    <TableCell className="capitalize text-xs font-semibold">
                      {tx.payment_type || 'SALARY'}
                    </TableCell>
                    <TableCell className="capitalize text-xs font-mono">
                      {(tx.payment_method || '').replace('_', ' ')}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.reference_number || '-'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {tx.created_by || '-'}
                    </TableCell>
                    <TableCell>
                      {isSynced ? (
                        <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs" title="Synced with General Ledger">
                          <span className="material-symbols-outlined text-sm">sync</span>
                          <span className="text-[10px] uppercase">Synced</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-500 font-bold text-xs" title="Not Synced with General Ledger">
                          <span className="material-symbols-outlined text-sm animate-pulse">sync_problem</span>
                          <span className="text-[10px] uppercase">Not Synced</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell align="right" className="font-mono font-bold">
                      ₹{(tx.amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      {!isSynced ? (
                        <Button
                          variant="outlined"
                          size="sm"
                          startIcon="sync"
                          onClick={() => onSyncLedger && onSyncLedger(tx, compositeKey)}
                          className="text-[10px] uppercase font-bold py-0.5 px-2"
                        >
                          Sync
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-600 font-mono">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </TableContainer>
        )}
      </Card.Body>

      <Card.Footer border={true} className="text-center py-3">
        <button type="button" className="text-xs font-bold text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
          View Full History <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
        </button>
      </Card.Footer>
    </Card>
  );
});

TeacherPaymentTransactionsCard.displayName = 'TeacherPaymentTransactionsCard';

export default TeacherPaymentTransactionsCard;
