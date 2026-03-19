import React, { useState } from 'react';
import ButtonGroupFilter from '../../components/ui/filters/ButtonGroupFilter';

const TestFilters = () => {
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [board, setBoard] = useState('CBSE');

  const categoryOptions = [
    { label: 'All', value: '', icon: 'apps' },
    { label: 'Academic', value: 'SEG-ACA', icon: 'menu_book' },
    { label: 'Computer', value: 'SEG-CMP', icon: 'computer' },
    { label: 'Foundation', value: 'SEG-FND', icon: 'foundation' },
  ];

  const languageOptions = [
    { label: 'All', value: '' },
    { label: 'Hindi', value: 'Hindi' },
    { label: 'English', value: 'English' },
  ];

  const boardOptions = [
    { label: 'CBSE', value: 'CBSE' },
    { label: 'RBSE', value: 'RBSE' },
    { label: 'ICSE', value: 'ICSE' },
    { label: 'IB', value: 'IB' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-text-main dark:text-white">Component Showcase</h1>
        <p className="text-text-secondary font-medium">Testing our new reusable ButtonGroupFilter component.</p>
      </div>

      {/* Primary Variant - With Icons */}
      <section className="space-y-4 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-border-light dark:border-border-dark shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-widest text-primary">1. Category Filter (Primary, With Icons)</h2>
        <ButtonGroupFilter 
          options={categoryOptions} 
          value={category} 
          onChange={setCategory} 
          variant="primary"
        />
        <p className="text-xs text-text-secondary mt-2">Active Value: <span className="font-mono font-bold text-primary">{category || 'empty'}</span></p>
      </section>

      {/* Secondary Variant - Small, Text Only */}
      <section className="space-y-4 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-border-light dark:border-border-dark shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-widest text-primary">2. Language Toggle (Secondary, Small)</h2>
        <ButtonGroupFilter 
          label="Instruction Medium"
          options={languageOptions} 
          value={language} 
          onChange={setLanguage} 
          variant="secondary"
          size="sm"
        />
        <p className="text-xs text-text-secondary mt-2">Active Value: <span className="font-mono font-bold text-primary">{language || 'empty'}</span></p>
      </section>

      {/* Primary Variant - Label, Small */}
      <section className="space-y-4 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-border-light dark:border-border-dark shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-widest text-primary">3. Board Selection (Primary, Small)</h2>
        <ButtonGroupFilter 
          label="Educational Board"
          options={boardOptions} 
          value={board} 
          onChange={setBoard} 
          variant="primary"
          size="sm"
        />
        <p className="text-xs text-text-secondary mt-2">Active Value: <span className="font-mono font-bold text-primary">{board}</span></p>
      </section>
    </div>
  );
};

export default TestFilters;
