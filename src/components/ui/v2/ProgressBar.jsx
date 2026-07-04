import React from 'react';

/**
 * ProgressBar: A horizontal color progress indicator supporting inline and stacked labels.
 * 
 * @component
 * @param {Object} props
 * @param {number} props.value - Active completed progress.
 * @param {number} props.max - Max bounds of progress.
 * @param {'primary'|'success'|'warning'|'danger'} [props.color='primary'] - Filler bar color theme.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Thickness size.
 * @param {'default'|'inline'|'stacked'} [props.variant='default'] - Label presentation configuration.
 * @param {string} [props.label] - Title prefix text.
 * @param {boolean} [props.showPercentage=false] - If true and percentageLabel not provided, renders computed percentage.
 * @param {string} [props.percentageLabel] - Custom override text displayed on the right.
 * @param {string} [props.className] - Container layout overrides.
 */
export default function ProgressBar({ 
  value = 0, 
  max = 100, 
  color = "primary", 
  size = "md", 
  className = "",
  
  // Layout Options
  variant = "default", // "default" | "inline" | "stacked"
  label = "",
  showPercentage = false,
  percentageLabel = ""
}) {
  const percentage = Math.min(Math.max((value / (max || 1)) * 100, 0), 100);
  
  const colors = {
    primary: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500"
  };

  const sizes = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2.5"
  };

  const finalPercentageLabel = percentageLabel || (showPercentage ? `${Math.round(percentage)}%` : "");

  const barElement = (
    <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0 ${sizes[size]}`}>
      <div 
        className={`h-full rounded-full transition-all duration-300 ${colors[color] || colors.primary}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 w-full font-sans text-[9px] text-text-secondary font-bold ${className}`}>
        {label && <span className="uppercase shrink-0">{label}</span>}
        <div className="flex-1 min-w-0">
          {barElement}
        </div>
        {finalPercentageLabel && <span className="shrink-0">{finalPercentageLabel}</span>}
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col gap-1 w-full font-sans ${className}`}>
        {(label || finalPercentageLabel) && (
          <div className="flex items-center justify-between text-[9px] text-text-secondary font-bold">
            {label && <span className="uppercase">{label}</span>}
            {finalPercentageLabel && <span>{finalPercentageLabel}</span>}
          </div>
        )}
        {barElement}
      </div>
    );
  }

  // Fallback to default variant
  return (
    <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0 ${sizes[size]} ${className}`}>
      <div 
        className={`h-full rounded-full transition-all duration-300 ${colors[color] || colors.primary}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
