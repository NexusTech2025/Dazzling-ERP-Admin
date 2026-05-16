import React from 'react';

/**
 * FormSection: A card-based layout component for grouping related form fields.
 * Includes a header with title and icon.
 */
const FormSection = ({ 
  title, 
  icon, 
  children, 
  className = "",
  headerAction 
}) => {
  return (
    <div className={`bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-background-light/30 dark:bg-background-dark/30">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">{icon}</span>
            </div>
          )}
          <h3 className="font-bold text-lg text-text-main dark:text-white tracking-tight">
            {title}
          </h3>
        </div>
        {headerAction && (
          <div>{headerAction}</div>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormSection;
