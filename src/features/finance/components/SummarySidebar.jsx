import React from 'react';
import Card from '../../../components/ui/Card';

const SummarySidebar = ({ data }) => {
  const { originalFee = 0, taxAmount = 0, discounts = [], totalPayable = 0 } = data;

  return (
    <div className="sticky top-8 flex flex-col gap-6">
      <Card className="overflow-hidden">
        <Card.Header className="bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
          <h3 className="text-sm font-bold text-text-main dark:text-white uppercase tracking-wider">Fee Summary</h3>
        </Card.Header>
        <Card.Body className="space-y-4">
          <dl className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <dt className="text-text-secondary font-medium">Original Fee</dt>
              <dd className="font-bold text-text-main dark:text-white">${originalFee.toLocaleString()}</dd>
            </div>
            
            {taxAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <dt className="text-text-secondary font-medium">Tax / GST</dt>
                <dd className="font-bold text-text-main dark:text-white">+${taxAmount.toLocaleString()}</dd>
              </div>
            )}

            {discounts.length > 0 && discounts.map((discount, idx) => (
              <div key={idx} className="flex items-start justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <dt className="flex flex-col">
                  <span className="font-medium">{discount.name || 'Discount'}</span>
                  {discount.description && <span className="text-[10px] opacity-70 mt-0.5">{discount.description}</span>}
                </dt>
                <dd className="font-bold">-${discount.amount.toLocaleString()}</dd>
              </div>
            ))}

            <div className="pt-4 border-t border-border-light dark:border-border-dark mt-2">
              <div className="flex items-center justify-between">
                <dt className="text-sm font-bold text-text-main dark:text-white">Net Payable</dt>
                <dd className="text-xl font-black text-primary">${totalPayable.toLocaleString()}</dd>
              </div>
            </div>
          </dl>
        </Card.Body>
      </Card>

      {/* Helper info card */}
      <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            The net payable amount is calculated after applying taxes and all valid discounts. Installments will be generated based on this final value.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummarySidebar;
