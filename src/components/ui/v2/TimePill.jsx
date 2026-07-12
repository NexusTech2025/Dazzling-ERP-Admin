import React from 'react';
import Time from './Time';

/**
 * Reusable pill component to display formatted times with labels.
 */
export const TimePill = ({
  label,
  value,
  variant = 'default', // 'success' (emerald), 'info' (blue), 'warning' (amber), 'danger' (rose), 'default' (slate)
  format = '12h',
  showSeconds = false,
  locale = 'en-US',
  fallback = '--:--',
  className = ''
}) => {
  const variantClasses = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    default: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
  };

  const labelColorClasses = {
    success: 'text-emerald-500 dark:text-emerald-400',
    info: 'text-blue-500 dark:text-blue-400',
    warning: 'text-amber-500 dark:text-amber-400',
    danger: 'text-rose-500 dark:text-rose-400',
    default: 'text-slate-500 dark:text-slate-400'
  };

  const selectedVariant = variantClasses[variant] || variantClasses.default;
  const selectedLabelColor = labelColorClasses[variant] || labelColorClasses.default;

  return (
    <span className={`flex items-center gap-1.5 border px-2.5 py-0.5 rounded-full font-bold text-[11px] ${selectedVariant} ${className}`}>
      {label && (
        <span className={`text-[9px] uppercase tracking-wider font-extrabold ${selectedLabelColor}`}>
          {label}
        </span>
      )}
      <Time value={value} format={format} showSeconds={showSeconds} locale={locale} fallback={fallback} />
    </span>
  );
};

export default TimePill;
