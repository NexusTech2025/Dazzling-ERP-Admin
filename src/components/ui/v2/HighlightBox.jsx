import React from 'react';

/**
 * HighlightBox: A callout component for key metrics or snapshots.
 * Used inside cards to draw attention to specific data points.
 */
const HighlightBox = ({ 
  label, 
  value, 
  icon, 
  variant = "neutral",
  trailingNode,
  className = ""
}) => {
  const variants = {
    primary: {
      bg: "bg-primary/5 dark:bg-primary/10 border-primary/20",
      iconBg: "bg-primary/10 text-primary",
    },
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800",
      iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    },
    danger: {
      bg: "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800",
      iconBg: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    },
    neutral: {
      bg: "bg-slate-50 dark:bg-slate-800/50 border-border-light dark:border-border-dark",
      iconBg: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
    }
  };

  const theme = variants[variant];

  return (
    <div className={`rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border ${theme.bg} ${className}`}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-sm ${theme.iconBg}`}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-tighter">{label}</p>
          <p className="text-xl font-black text-text-main dark:text-white">{value}</p>
        </div>
      </div>
      {trailingNode && (
        <>
          <div className="h-8 w-px bg-border-light dark:bg-border-dark hidden sm:block"></div>
          <div className="flex items-center">
            {trailingNode}
          </div>
        </>
      )}
    </div>
  );
};

export default HighlightBox;
