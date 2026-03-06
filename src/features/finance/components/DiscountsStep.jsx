import React from 'react';
import Card from '../../../components/ui/Card';
import { DiscountTypeSelector } from './FinanceCards';
import SummarySidebar from './SummarySidebar';

const DiscountsStep = ({ discounts, calculations, onAddDiscount, onRemoveDiscount }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="lg:col-span-2 space-y-6">
        <Card variant="background" className="p-8">
          <h3 className="text-xl font-black text-text-main dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">redeem</span>
            Discounts & Adjustments
          </h3>
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-text-main dark:text-white block">Adjustment Type</label>
              <DiscountTypeSelector 
                selected="percentage" 
                onChange={() => {}} // Placeholder
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-main dark:text-white">Adjustment Value</label>
                <input 
                  type="number"
                  className="w-full bg-background-light dark:bg-background-dark border-2 border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm font-black text-text-main focus:border-primary outline-none transition-all"
                  placeholder="0"
                  onBlur={(e) => {
                    if (e.target.value > 0) {
                      onAddDiscount({ 
                        name: 'Manual Adjustment', 
                        type: 'percentage', 
                        value: Number(e.target.value) 
                      });
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
            
            {discounts.length > 0 && (
              <div className="pt-6 border-t border-border-light dark:border-border-dark space-y-3">
                <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Applied Scholarships</h4>
                {discounts.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3.5 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl group transition-all hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-text-main dark:text-white">{d.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">Value: {d.value}{d.type === 'percentage' ? '%' : '$'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onRemoveDiscount(d.id)} 
                      className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <SummarySidebar data={{
          originalFee: calculations.subtotal,
          taxAmount: calculations.taxAmount,
          discounts: discounts.map(d => ({
            name: d.name,
            amount: d.type === 'percentage' ? (calculations.subtotal * d.value) / 100 : d.value
          })),
          totalPayable: calculations.netPayable
        }} />
      </div>
    </div>
  );
};

export default DiscountsStep;
