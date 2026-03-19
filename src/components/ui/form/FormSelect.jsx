import React from 'react';

/**
 * Standardized Form Select component with label and icon support.
 * @param {Array} options - List of { label, value } objects or strings.
 */
const FormSelect = ({ 
  label, 
  icon, 
  error, 
  required, 
  options = [],
  className = "", 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-xs font-black uppercase tracking-widest text-text-secondary pl-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-lg group-focus-within:text-primary transition-colors pointer-events-none">
            {icon}
          </span>
        )}
        <select 
          className={`w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer ${icon ? 'pl-12' : ''} ${error ? 'border-red-500 focus:ring-red-500/20' : 'focus:border-primary'}`}
          {...props}
        >
          {options.map((opt, i) => {
            const isObj = typeof opt === 'object';
            return (
              <option key={i} value={isObj ? opt.value : opt}>
                {isObj ? opt.label : opt}
              </option>
            );
          })}
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-lg pointer-events-none">
          expand_more
        </span>
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 pl-1">{error}</p>}
    </div>
  );
};

export default FormSelect;
