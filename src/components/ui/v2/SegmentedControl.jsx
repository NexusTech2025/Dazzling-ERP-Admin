import React from 'react';

/**
 * SegmentedControl: A button-group style selection component.
 * Ideal for switching between small sets of options (tabs, slots, views).
 */
const SegmentedControl = ({
  options = [],
  value,
  onChange,
  label,
  className = "",
  containerClassName = ""
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">
          {label}
        </span>
      )}
      
      <div className={`flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit ${className}`}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200
                ${isSelected 
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-black/5' 
                  : 'text-text-secondary hover:text-text-main dark:hover:text-white'}
              `}
            >
              {option.icon && (
                <span className="material-symbols-outlined text-[16px]">{option.icon}</span>
              )}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SegmentedControl;
