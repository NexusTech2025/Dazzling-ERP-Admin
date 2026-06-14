import React from 'react';
import { 
  LowDensityCard, 
  MediumDensityCard, 
  HighDensityCard 
} from '../../../components/ui/v2/cards';
import Button from '../../../components/ui/v2/Button';
import { Badge } from '../../../components/ui/v2/indicators';

const FinanceCard = ({
  transaction = {},
  density = 'medium',
  onClick,
  onReceipt,
  onRefund,
  onMoreClick, // Action options trigger
  className = ''
}) => {
  const method = transaction.payment_method || 'UPI Transfer';
  const id = transaction.transaction_id || transaction.id || 'TXN-000';
  const amountLabel = `₹ ${transaction.amount ? transaction.amount.toLocaleString() : '12,500'}`;

  // Color mapping based on status
  const status = transaction.status || 'success';

  // Low Density
  if (density === 'low') {
    const bodyText = (
      <div className="flex flex-col gap-1 items-start md:items-end text-left md:text-right w-full">
        <Badge
          variant="status"
          color={
            status === 'success' ? 'success' :
            status === 'pending' ? 'primary' : 'error'
          }
          content={status.toUpperCase()}
          size="sm"
          className="self-start md:self-end"
        />
        <p className="font-mono text-xs sm:text-sm font-black text-text-main dark:text-white">{amountLabel}</p>
      </div>
    );

    const actions = [
      { label: 'Receipt', icon: 'receipt_long', priority: 'primary', onClick: (e) => { e.stopPropagation(); onReceipt && onReceipt(); } },
      { label: 'Refund', icon: 'undo', priority: 'secondary', onClick: (e) => { e.stopPropagation(); onRefund && onRefund(); } }
    ];

    return (
      <LowDensityCard
        icon="payments"
        title={method}
        subtitle1={id}
        subtitle2={transaction.date || 'Today, 10:30 AM'}
        bodyText={bodyText}
        actions={actions}
        onClick={onClick}
        className={className}
      />
    );
  }

  // Medium Density
  if (density === 'medium') {
    const tags = [
      { label: 'UPI Settlement', variant: 'neutral' },
      { label: status === 'success' ? 'Reconciled' : 'Pending Verification', variant: status === 'success' ? 'success' : 'warning' }
    ];

    const metrics = [
      { label: 'Paid By', value: transaction.student_name || 'Arthur Sterling' },
      { label: 'Amount', value: amountLabel, colorClass: 'text-primary font-mono' }
    ];

    return (
      <MediumDensityCard
        icon="account_balance_wallet"
        title={method}
        subtitle={transaction.date || 'Today, 10:30 AM'}
        tags={tags}
        metrics={metrics}
        badgeText={
          <Badge 
            variant="status" 
            color={
              status === 'success' ? 'success' :
              status === 'pending' ? 'primary' : 'error'
            }
            content={status.toUpperCase()} 
            size="sm"
          />
        }
        badgeClass="border-0 bg-transparent p-0 inline-flex"
        trend={transaction.trend || { value: '12%', direction: 'up' }}
        progress={transaction.installments_percent || 75}
        actionText="Transaction Details"
        onAction={onClick}
        onClick={onClick}
        className={className}
      />
    );
  }

  // High Density
  const headerActions = (
    <>
      <Button variant="outlined" size="sm" onClick={onRefund} className="text-xs font-bold uppercase tracking-wider py-1.5 px-3">Refund</Button>
      <Button variant="contained" size="sm" onClick={onReceipt} className="text-xs font-bold uppercase tracking-wider py-1.5 px-3">Receipt</Button>
    </>
  );

  const metrics = [
    { label: 'Amount Paid', value: amountLabel, colorClass: 'text-primary font-mono' },
    { label: 'Transaction Date', value: transaction.date || 'June 13, 2026' },
    { label: 'Settlement Status', value: status.toUpperCase(), colorClass: status === 'success' ? 'text-emerald-500' : 'text-primary' }
  ];

  const checklist = [
    { label: 'Bank Settlement Verified', checked: status === 'success', icon: 'check_circle' },
    { label: 'Email Invoice Sent', checked: true, icon: 'mail' },
    { label: 'GST Ledger Entry Reconciled', checked: status === 'success', icon: 'account_balance' }
  ];

  return (
    <HighDensityCard
      icon="receipt_long"
      title={transaction.student_name || 'Arthur Sterling'}
      subtitle={`Category: ${transaction.category || 'External Auditor'}`}
      idText={id}
      headerActions={headerActions}
      metrics={metrics}
      checklist={checklist}
      description={transaction.notes || 'This transaction represents tuition collection fee installment 1. Verified and settled by the automated ledger sync.'}
      className={className}
    />
  );
};

export default FinanceCard;
