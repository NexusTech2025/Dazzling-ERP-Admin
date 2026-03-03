import React from 'react';

export const SearchInput = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="relative w-full">
    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl">search</span>
    <input 
      type="text" 
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none"
    />
  </div>
);

export const SelectFilter = ({ value, onChange, options = [], defaultLabel = "All" }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg py-2 px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
  >
    {options.map((option, index) => {
      // Handle both array of strings or array of objects {value, label}
      const val = typeof option === 'object' ? option.value : option;
      const label = typeof option === 'object' ? option.label : option;
      
      // If it's the "All" option, use the defaultLabel for clearer context
      const displayLabel = val === 'All' ? defaultLabel : label;
      
      return (
        <option key={index} value={val}>{displayLabel}</option>
      );
    })}
  </select>
);
