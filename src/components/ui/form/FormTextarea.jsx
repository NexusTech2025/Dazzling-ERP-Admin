import React from 'react';

/**
 * Standardized Form Textarea component for multi-line content.
 */
const FormTextarea = ({ 
  label, 
  error, 
  required, 
  rows = 3,
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
      <textarea 
        rows={rows}
        className={`w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none ${error ? 'border-red-500 focus:ring-red-500/20' : 'focus:border-primary'}`}
        {...props}
      />
      {error && <p className="text-[10px] font-bold text-red-500 pl-1">{error}</p>}
    </div>
  );
};

export default FormTextarea;
