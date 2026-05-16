import React from 'react';

/**
 * RadioGroup: A group of radio inputs with card-style or simple list styling.
 */
const RadioGroup = ({
  options = [],
  value,
  onChange,
  name,
  label,
  error,
  layout = "grid", // "grid" or "list"
  columns = 2,
  className = ""
}) => {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {label && (
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">
          {label}
        </span>
      )}

      <div className={`
        ${layout === "grid" ? `grid grid-cols-1 md:grid-cols-${columns} gap-4` : 'flex flex-col gap-2'}
      `}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={`
                relative flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
                  : 'border-border-light dark:border-border-dark hover:border-slate-300 dark:hover:border-slate-700 bg-surface-light dark:bg-surface-dark'}
              `}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                className="text-primary focus:ring-primary h-4 w-4"
              />
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-text-main dark:text-white'}`}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-[10px] text-text-secondary font-medium">
                    {option.description}
                  </span>
                )}
              </div>
              {option.icon && (
                <span className={`material-symbols-outlined ml-auto ${isSelected ? 'text-primary' : 'text-text-secondary'}`}>
                  {option.icon}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {error && (
        <p className="text-[10px] font-medium text-red-500 pl-1">{error}</p>
      )}
    </div>
  );
};

export default RadioGroup;
