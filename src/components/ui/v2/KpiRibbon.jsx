import React from 'react';

/**
 * KpiRibbon: Renders a horizontal, compact list of KPI stats, typically for mobile screens.
 * Aligns with the V2 Atomic design standards for high-density mobile ribbons.
 * 
 * @param {Object} props - React props.
 * @param {Array<Object>} props.items - Array of KPI stats items.
 * @param {string} [props.items[].icon] - Optional material symbol icon name.
 * @param {string} props.items[].label - Item description.
 * @param {string|number} props.items[].value - Item scalar or count value.
 * @param {string} [props.items[].bgColor] - Custom Tailwind background class override.
 * @param {string} [props.items[].textColor] - Custom Tailwind text color class override.
 * @param {string} [props.items[].variant] - Predefined semantic theme: 'neutral' | 'success' | 'warning' | 'danger' | 'info'.
 * @param {string} [props.className] - Optional container class extensions.
 * @returns {React.ReactElement} Compact KPI ribbon component.
 */
export const KpiRibbon = ({ items = [], className = '' }) => {
  const variantConfig = {
    neutral: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    info: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 bg-slate-100/50 dark:bg-black/30 p-1.5 border border-border-light dark:border-white/5 rounded-xl self-start ${className}`}>
      {items.map((item, idx) => {
        const colorClasses = item.bgColor && item.textColor
          ? `${item.bgColor} ${item.textColor}`
          : (variantConfig[item.variant] || variantConfig.neutral);

        return (
          <div
            key={idx}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${colorClasses}`}
          >
            {item.icon && (
              <span className="material-symbols-outlined text-[10px] flex-shrink-0">
                {item.icon}
              </span>
            )}
            <span className="text-[9px] font-black uppercase tracking-wider">
              {item.label}
            </span>
            <span className="text-xs font-black">
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default KpiRibbon;
