import React from 'react';

/**
 * KeyValuePair: Foundational component for displaying read-only data.
 * Ideal for profiles, settings, and summaries.
 */
const KeyValuePair = ({ 
  label, 
  value, 
  icon,
  fallback = "N/A",
  layout = "vertical", // 'vertical' or 'horizontal'
  size = "md",
  className = ""
}) => {
  const isHorizontal = layout === 'horizontal';

  const sizes = {
    sm: { label: "text-[9px]", value: "text-xs" },
    md: { label: "text-[10px]", value: "text-sm" },
    lg: { label: "text-xs", value: "text-base" }
  };

  return (
    <div className={`flex ${isHorizontal ? 'flex-row items-center justify-between' : 'flex-col gap-1'} ${className}`}>
      <div className="flex items-center gap-1.5">
        {icon && <span className="material-symbols-outlined text-text-secondary text-[16px]">{icon}</span>}
        <p className={`text-text-secondary font-black uppercase tracking-widest ${sizes[size].label}`}>
          {label}
        </p>
      </div>
      <p className={`font-bold text-text-main dark:text-white ${sizes[size].value} ${isHorizontal ? 'text-right' : ''}`}>
        {value || fallback}
      </p>
    </div>
  );
};

export default KeyValuePair;
