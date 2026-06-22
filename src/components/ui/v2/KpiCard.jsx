import React from 'react';

/**
 * A highly-dense KPI metric display card supporting color themes, icon indicators, 
 * size variations (small, medium, large), and micro-animations.
 * 
 * @component
 */
const KpiCard = ({
  label,
  value,
  icon,
  size = 'lg',
  variant = 'neutral',
  trend,
  isCount = false,
  className = ''
}) => {
  // Sizing definitions mapping to Tailwind utility classes
  const sizeConfig = {
    sm: {
      cardHeight: 'h-14',
      cardWidth: 'max-w-[140px]',
      padding: 'py-1.5 px-2',
      borderRadius: 'rounded-lg',
      labelSize: 'text-[7px]',
      valueSize: 'text-xs',
      iconContainer: 'p-0.5 rounded',
      iconSize: 'text-[10px]'
    },
    md: {
      cardHeight: 'h-18',
      cardWidth: 'max-w-[190px]',
      padding: 'py-2 px-3',
      borderRadius: 'rounded-xl',
      labelSize: 'text-[8px]',
      valueSize: 'text-sm',
      iconContainer: 'p-1 rounded-lg',
      iconSize: 'text-[12px]'
    },
    lg: {
      cardHeight: 'h-24',
      cardWidth: 'max-w-[260px]',
      padding: 'p-3.5',
      borderRadius: 'rounded-xl',
      labelSize: 'text-[10px]',
      valueSize: 'text-lg',
      iconContainer: 'p-1.5 rounded-lg',
      iconSize: 'text-[16px]'
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.lg;

  // Variant color definitions
  const variantConfig = {
    neutral: {
      text: 'text-slate-900',
      iconBg: 'bg-slate-50',
      borderColor: 'border-slate-200'
    },
    success: {
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-50/50',
      borderColor: 'border-emerald-200'
    },
    warning: {
      text: 'text-amber-800',
      iconBg: 'bg-amber-50/40',
      borderColor: 'border-amber-200'
    },
    danger: {
      text: 'text-rose-700',
      iconBg: 'bg-rose-50/50',
      borderColor: 'border-rose-200'
    },
    info: {
      text: 'text-blue-700',
      iconBg: 'bg-blue-50/40',
      borderColor: 'border-blue-200'
    }
  };

  const currentVariant = variantConfig[variant] || variantConfig.neutral;

  // Format metric value
  const displayValue = isCount 
    ? value 
    : (typeof value === 'number' ? `₹${value.toLocaleString()}` : value);

  return (
    <div 
      className={`
        bg-white border flex items-center justify-between shadow-sm transition-all duration-300 
        hover:shadow-md hover:-translate-y-0.5 w-full
        ${currentSize.cardHeight} ${currentSize.cardWidth} ${currentSize.padding} ${currentSize.borderRadius} ${currentVariant.borderColor}
        ${className}
      `}
    >
      <div className="flex flex-col min-w-0 justify-center leading-tight">
        <span className={`${currentSize.labelSize} font-bold text-slate-400 uppercase tracking-wider whitespace-normal break-words`}>
          {label}
        </span>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <h3 className={`${currentSize.valueSize} font-black ${currentVariant.text} whitespace-nowrap`}>
            {displayValue}
          </h3>
          {trend && (
            <div className="flex-shrink-0">
              {trend}
            </div>
          )}
        </div>
      </div>
      {icon && (
        <div className={`${currentSize.iconContainer} ${currentVariant.iconBg} flex items-center justify-center flex-shrink-0 ml-2`}>
          <span className={`material-symbols-outlined ${currentSize.iconSize} ${currentVariant.text}`}>
            {icon}
          </span>
        </div>
      )}
    </div>
  );
};

export default KpiCard;
