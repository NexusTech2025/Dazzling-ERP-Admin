import React from 'react';

/**
 * RadioIndicator: A reusable selection checkbox mimic indicator.
 */
export default function RadioIndicator({ checked = false, disabled = false, className = "" }) {
  return (
    <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
      checked 
        ? "border-primary bg-primary/10 text-primary" 
        : "border-slate-300 dark:border-slate-700"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
      {checked && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
    </span>
  );
}
