import React from 'react';

/**
 * @component Tag
 * @description A static or clickable categorization label used to organize or label content.
 * 
 * DESIGN VARIANTS:
 * 1. Static Tags: Purely informational, non-clickable categorization.
 * 2. Clickable Tags: Handles filters or routing on click.
 * 3. Colored Tags: Color-coded categories (e.g., "Urgent" in rose, "Completed" in emerald).
 * 4. Outlined vs. Filled: Light border emphasis vs bold background fill.
 * 5. Icon Tags: Prefixes text with a visual symbol for instant recognition.
 * 
 * @param {Object} props
 * @param {string} props.label - Text content of the tag.
 * @param {'filled'|'outlined'|'subtle'} [props.variant='subtle'] - Border/Background combination format.
 * @param {'primary'|'secondary'|'success'|'warning'|'error'|'neutral'|'amber'|'emerald'|'rose'} [props.color='neutral'] - HSL color code.
 * @param {'sm'|'md'|'lg'} [props.size='sm'] - Dimensions and font scale.
 * @param {string|React.ReactNode} [props.icon] - Icon symbol name or JSX node.
 * @param {Function} [props.onClick] - Optional click handler (enables hover scaling, keyboard triggers and role="button").
 * @param {string} [props.className] - Custom styling injection.
 */
const Tag = ({
  label,
  variant = 'subtle',
  color = 'neutral',
  size = 'sm',
  icon,
  onClick,
  className = ''
}) => {
  const isClickable = typeof onClick === 'function';

  // Theme color maps for variants
  const getThemeClass = (v, themeColor) => {
    const colorMap = {
      primary: {
        subtle: 'bg-primary/10 text-primary border-primary/20',
        outlined: 'bg-transparent text-primary border-primary/45',
        filled: 'bg-primary text-white border-transparent'
      },
      secondary: {
        subtle: 'bg-secondary/10 text-emerald-500 border-secondary/20',
        outlined: 'bg-transparent text-emerald-500 border-emerald-500/45',
        filled: 'bg-emerald-600 text-white border-transparent'
      },
      success: {
        subtle: 'bg-secondary/10 text-emerald-500 border-secondary/20',
        outlined: 'bg-transparent text-emerald-500 border-emerald-500/45',
        filled: 'bg-emerald-600 text-white border-transparent'
      },
      warning: {
        subtle: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        outlined: 'bg-transparent text-amber-500 border-amber-500/45',
        filled: 'bg-amber-505 bg-amber-500 text-white border-transparent'
      },
      error: {
        subtle: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        outlined: 'bg-transparent text-rose-500 border-rose-500/45',
        filled: 'bg-rose-500 text-white border-transparent'
      },
      neutral: {
        subtle: 'bg-slate-100 dark:bg-slate-800/80 text-text-secondary dark:text-slate-400 border-border-light dark:border-border-dark',
        outlined: 'bg-transparent text-text-secondary dark:text-slate-400 border-border-light dark:border-border-dark',
        filled: 'bg-slate-700 text-white border-transparent dark:bg-slate-650'
      },
      amber: {
        subtle: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        outlined: 'bg-transparent text-amber-500 border-amber-500/45',
        filled: 'bg-amber-500 text-white border-transparent'
      },
      emerald: {
        subtle: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        outlined: 'bg-transparent text-emerald-500 border-emerald-500/45',
        filled: 'bg-emerald-600 text-white border-transparent'
      },
      rose: {
        subtle: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        outlined: 'bg-transparent text-rose-500 border-rose-500/45',
        filled: 'bg-rose-500 text-white border-transparent'
      }
    };
    
    const colorConfig = colorMap[themeColor] || colorMap.neutral;
    return colorConfig[v] || colorConfig.subtle;
  };

  // Sizing maps
  const sizeMap = {
    sm: 'text-[9px] px-1.5 py-0.5 rounded gap-1 tracking-wide font-extrabold uppercase',
    md: 'text-[10px] px-2 py-0.5 rounded-md gap-1.5 tracking-wider font-semibold uppercase',
    lg: 'text-[11px] px-2.5 py-1 rounded-md gap-1.5 tracking-wider font-semibold uppercase'
  };

  const themeClass = getThemeClass(variant, color);
  const sizeClass = sizeMap[size] || sizeMap.sm;

  // Icon sizing helper
  const renderIcon = () => {
    if (!icon) return null;
    const iconSize = size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-[14px]' : 'text-[12px]';
    
    if (typeof icon === 'string') {
      return (
        <span className={`material-symbols-outlined ${iconSize} shrink-0 select-none`}>
          {icon}
        </span>
      );
    }
    return <span className="shrink-0 flex items-center">{icon}</span>;
  };

  const handleKeyDown = (e) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  const clickableClasses = isClickable 
    ? 'cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-all duration-200' 
    : '';

  return (
    <span
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      className={`inline-flex items-center border select-none whitespace-nowrap shrink-0 ${themeClass} ${sizeClass} ${clickableClasses} ${className}`}
    >
      {renderIcon()}
      <span>{label}</span>
    </span>
  );
};

export default Tag;
