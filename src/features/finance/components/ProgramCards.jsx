import React from 'react';
import Card from '../../../components/ui/Card';

export const ProgramSelectionCard = ({ program, isSelected, onSelect }) => {
  return (
    <Card 
      variant={isSelected ? 'primary' : 'background'} 
      onClick={() => onSelect(program)}
      className={`p-4 relative flex items-center justify-between border-2 transition-all ${
        isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-border-light dark:border-border-dark hover:border-text-secondary/30'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded shadow-sm ${
          isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-text-secondary border border-border-light dark:border-border-dark'
        }`}>
          <span className="material-symbols-outlined">{program.icon || 'menu_book'}</span>
        </div>
        <div>
          <h4 className={`text-sm font-bold transition-colors ${isSelected ? 'text-text-main dark:text-white' : 'text-text-secondary'}`}>
            {program.name}
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            {program.batch || 'Current Batch'} • {program.type || 'Full-time'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className={`block text-sm font-bold transition-colors ${isSelected ? 'text-primary' : 'text-text-main dark:text-white'}`}>
            ${program.base_fee?.toLocaleString() || '0.00'}
          </span>
          <span className="block text-[10px] text-text-secondary uppercase tracking-wide font-medium">Total Fee</span>
        </div>
        <span className={`material-symbols-outlined text-[20px] transition-colors ${isSelected ? 'text-primary' : 'text-text-secondary/30'}`}>
          {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
        </span>
      </div>
    </Card>
  );
};
