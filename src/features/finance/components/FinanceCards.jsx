import React from 'react';
import Card from '../../../components/ui/Card';

export const FeeComponentInput = ({ label, value, onChange, icon = 'payments' }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-text-main dark:text-white flex items-center gap-2">
      <span className="material-symbols-outlined text-text-secondary text-[18px]">{icon}</span>
      {label}
    </label>
    <div className="relative group">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors group-focus-within:text-primary">
        <span className="text-text-secondary text-sm font-bold">$</span>
      </div>
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="block w-full rounded-xl border-border-light bg-background-light py-3 pl-8 pr-4 text-sm font-bold text-text-main transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white"
        placeholder="0.00"
      />
    </div>
  </div>
);

export const TaxInput = ({ value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-text-main dark:text-white flex items-center gap-2">
      <span className="material-symbols-outlined text-text-secondary text-[18px]">percent</span>
      Tax / GST
    </label>
    <div className="relative group">
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="block w-full rounded-xl border-border-light bg-background-light py-3 px-4 text-sm font-bold text-text-main transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white pr-10"
        placeholder="0"
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 transition-colors group-focus-within:text-primary">
        <span className="text-text-secondary text-sm font-bold">%</span>
      </div>
    </div>
  </div>
);

export const DiscountTypeSelector = ({ selected, onChange }) => (
  <div className="flex gap-4">
    {['percentage', 'fixed'].map((type) => (
      <label 
        key={type}
        className={`flex-1 flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
          selected === type 
            ? 'border-primary bg-primary/10 shadow-sm' 
            : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <input 
          type="radio" 
          checked={selected === type}
          onChange={() => onChange(type)}
          className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
        />
        <span className={`text-sm font-bold uppercase tracking-wide ${selected === type ? 'text-primary' : 'text-text-secondary'}`}>
          {type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
        </span>
      </label>
    ))}
  </div>
);
