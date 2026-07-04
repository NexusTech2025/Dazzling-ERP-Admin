import React, { forwardRef, memo } from 'react';

/**
 * Standardized Form Input component with label and icon support.
 * Wrapped in React.forwardRef and React.memo to support RHF ref binding and skip redundant rendering.
 */
const FormInput = forwardRef(({ 
  label, 
  icon, 
  error, 
  required, 
  className = "", 
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-xs font-black uppercase tracking-widest text-text-secondary pl-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-lg group-focus-within:text-primary transition-colors">
            {icon}
          </span>
        )}
        <input 
          ref={ref}
          className={`w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${icon ? 'pl-12' : ''} ${error ? 'border-red-500 focus:ring-red-500/20' : 'focus:border-primary'}`}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 pl-1">{error}</p>}
    </div>
  );
});

FormInput.displayName = "FormInput";

export default memo(FormInput);
