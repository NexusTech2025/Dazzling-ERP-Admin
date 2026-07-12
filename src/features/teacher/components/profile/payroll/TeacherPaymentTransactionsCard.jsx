import React from 'react';
import Card from '../../../../../components/ui/Card';
import Badge from '../../../../../components/ui/Badge';
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

const TeacherPaymentTransactionsCard = React.memo(({ transactions = [] }) => {
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
                <TableHead>Status</TableHead>
                <TableHead align="right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
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
                    <Badge variant={
                      tx.__tx_status === 'COMMITTED' || tx.__tx_status === 'SUCCESS' ? 'success' :
                        tx.__tx_status === 'FAILED' ? 'danger' : 'warning'
                    } className="font-black tracking-widest text-[9px] uppercase">
                      {tx.__tx_status || 'PENDING'}
                    </Badge>
                  </TableCell>
                  <TableCell align="right" className="font-mono font-bold">
                    ₹{(tx.amount || 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
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
