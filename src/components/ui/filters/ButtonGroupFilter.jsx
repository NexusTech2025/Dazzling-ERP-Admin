import React from 'react';

/**
 * Reusable Button Group Filter component
 * @param {Array} options - Array of { label, value, icon }
 * @param {string} value - Current active value
 * @param {function} onChange - Callback when a button is clicked
 * @param {string} size - 'sm' | 'md' (default)
 * @param {string} variant - 'primary' (default) | 'secondary'
 */
const ButtonGroupFilter = ({ 
  options = [], 
  value, 
  onChange, 
  size = 'md',
  variant = 'primary',
  label = null
}) => {
  const isSm = size === 'sm';
  
  const containerClasses = `flex items-center gap-1.5 p-1 rounded-2xl w-fit transition-all ${
    variant === 'primary' 
      ? 'bg-primary/5 border border-primary/10' 
      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
  }`;

  const buttonBase = `rounded-xl font-black transition-all flex items-center gap-2 whitespace-nowrap active:scale-95`;
  
  const getButtonClasses = (isActive) => {
    if (variant === 'primary') {
      return `${buttonBase} ${isSm ? 'px-3 py-1 text-[10px]' : 'px-4 py-1.5 text-xs'} ${
        isActive 
          ? 'bg-primary text-white shadow-lg' 
          : 'text-primary hover:bg-primary/10'
      }`;
    }
    return `${buttonBase} ${isSm ? 'px-3 py-1 text-[10px]' : 'px-4 py-1.5 text-xs'} ${
      isActive 
        ? 'bg-white dark:bg-slate-600 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-500' 
        : 'text-text-secondary hover:text-text-main'
    }`;
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">{label}:</span>}
      <div className={containerClasses}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={getButtonClasses(value === opt.value)}
          >
            {opt.icon && <span className="material-symbols-outlined text-base">{opt.icon}</span>}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ButtonGroupFilter;
