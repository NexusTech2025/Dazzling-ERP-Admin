import React from 'react';

/**
 * @component Chip
 * @description An interactive, compact element representing choice inputs, filters, or active selections.
 * 
 * DESIGN VARIANTS:
 * 1. Action Chips: Triggers a contextual action on click (e.g., "Add filter").
 * 2. Choice Chips: Represents single/multiple toggle selections (e.g. selecting categories).
 * 3. Filter Chips: Represents active filter tags, removable via a close button.
 * 4. Input Chips: Displays entity inputs (e.g., tokenized email addresses).
 * 5. Icon/Text Chips: Combines left-aligned icons/avatars with label text.
 * 
 * @param {Object} props
 * @param {string} props.label - Text descriptor inside the chip.
 * @param {'filled'|'outlined'|'subtle'} [props.variant='subtle'] - Outline/Fill format.
 * @param {'primary'|'secondary'|'success'|'warning'|'error'|'neutral'} [props.color='neutral'] - Base HSL color scheme.
 * @param {boolean} [props.active=false] - If true, applies active state border and background.
 * @param {boolean} [props.clickable=true] - If true, adds pointer cursors, tabIndex focus, and scale transitions.
 * @param {'sm'|'md'|'lg'} [props.size='sm'] - Dimensions and font scale.
 * @param {string|React.ReactNode} [props.avatar] - Initials text, image URL, or React node.
 * @param {Function} [props.onClick] - Click trigger callback.
 * @param {Function} [props.onDelete] - Close callback. Renders an interactive 'close' icon on the right if passed with appropriate aria-labels.
 * @param {string} [props.className] - Extended CSS rules.
 */
const Chip = ({
  label,
  variant = 'subtle',
  color = 'neutral',
  active = false,
  clickable = true,
  size = 'sm',
  avatar,
  onClick,
  onDelete,
  className = ''
}) => {
  const isClickable = clickable && typeof onClick === 'function';

  // Theme color maps supporting active elevations and focus styling
  const getThemeClass = (v, themeColor, isActive) => {
    const colorMap = {
      primary: {
        subtle: isActive 
          ? 'bg-primary/20 text-primary border-primary/40' 
          : 'bg-primary/5 text-primary/80 border-primary/15 hover:bg-primary/10 hover:text-primary hover:border-primary/25',
        outlined: isActive 
          ? 'bg-primary/10 text-primary border-primary font-bold' 
          : 'bg-transparent text-primary/85 border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary/50',
        filled: isActive 
          ? 'bg-primary-dark text-white border-transparent' 
          : 'bg-primary text-white border-transparent hover:bg-primary-dark'
      },
      secondary: {
        subtle: isActive 
          ? 'bg-secondary/20 text-emerald-500 border-secondary/40' 
          : 'bg-secondary/10 text-emerald-500/80 border-secondary/20 hover:bg-secondary/20 hover:text-emerald-500 hover:border-secondary/30',
        outlined: isActive 
          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500 font-bold' 
          : 'bg-transparent text-emerald-500/85 border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-500 hover:border-emerald-500/50',
        filled: isActive 
          ? 'bg-emerald-700 text-white border-transparent' 
          : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700'
      },
      success: {
        subtle: isActive 
          ? 'bg-secondary/20 text-emerald-500 border-secondary/40' 
          : 'bg-secondary/10 text-emerald-500/80 border-secondary/20 hover:bg-secondary/20 hover:text-emerald-500 hover:border-secondary/30',
        outlined: isActive 
          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500 font-bold' 
          : 'bg-transparent text-emerald-500/85 border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-500 hover:border-emerald-500/50',
        filled: isActive 
          ? 'bg-emerald-700 text-white border-transparent' 
          : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700'
      },
      warning: {
        subtle: isActive 
          ? 'bg-amber-500/20 text-amber-600 border-amber-500/40' 
          : 'bg-amber-500/5 text-amber-500 border-amber-500/15 hover:bg-amber-500/10 hover:border-amber-500/25',
        outlined: isActive 
          ? 'bg-amber-500/10 text-amber-500 border-amber-500 font-bold' 
          : 'bg-transparent text-amber-500 border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-500 hover:border-amber-500/50',
        filled: isActive 
          ? 'bg-amber-600 text-white border-transparent' 
          : 'bg-amber-500 text-white border-transparent hover:bg-amber-600'
      },
      error: {
        subtle: isActive 
          ? 'bg-rose-500/20 text-rose-600 border-rose-500/40' 
          : 'bg-rose-500/5 text-rose-500 border-rose-500/15 hover:bg-rose-500/10 hover:border-rose-500/25',
        outlined: isActive 
          ? 'bg-rose-500/10 text-rose-500 border-rose-500 font-bold' 
          : 'bg-transparent text-rose-500 border-rose-500/30 hover:bg-rose-500/5 hover:text-rose-500 hover:border-rose-500/50',
        filled: isActive 
          ? 'bg-rose-600 text-white border-transparent' 
          : 'bg-rose-500 text-white border-transparent hover:bg-rose-600'
      },
      neutral: {
        subtle: isActive 
          ? 'bg-slate-200 dark:bg-slate-700 text-text-main dark:text-white border-slate-350 dark:border-slate-600' 
          : 'bg-slate-100 dark:bg-slate-800/80 text-text-secondary dark:text-slate-400 border-border-light dark:border-border-dark hover:bg-slate-200 dark:hover:bg-slate-700/80 hover:text-text-main dark:hover:text-white',
        outlined: isActive 
          ? 'bg-slate-150 dark:bg-slate-700 text-text-main dark:text-white border-slate-450 dark:border-slate-500' 
          : 'bg-transparent text-text-secondary dark:text-slate-400 border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-350 dark:hover:border-slate-650',
        filled: isActive 
          ? 'bg-slate-850 text-white border-transparent dark:bg-slate-500' 
          : 'bg-slate-700 text-white border-transparent dark:bg-slate-600 hover:bg-slate-850 dark:hover:bg-slate-500'
      }
    };
    
    const colorConfig = colorMap[themeColor] || colorMap.neutral;
    return colorConfig[v] || colorConfig.subtle;
  };

  // Sizing definitions: height constraints & alignment styling
  const sizeMap = {
    sm: 'text-[10px] h-6 px-2 rounded-full gap-1.5 tracking-wide font-extrabold uppercase',
    md: 'text-[11px] h-8 px-3 rounded-full gap-2 tracking-wider font-semibold uppercase',
    lg: 'text-[12px] h-10 px-4.5 rounded-full gap-2.5 tracking-wider font-semibold uppercase'
  };

  const avatarSizes = {
    sm: 'w-4 h-4 text-[7px]',
    md: 'w-6 h-6 text-[9px]',
    lg: 'w-8 h-8 text-[11px]'
  };

  const themeClass = getThemeClass(variant, color, active);
  const sizeClass = sizeMap[size] || sizeMap.sm;

  // Render square shape rounded-full avatar
  const renderAvatar = () => {
    if (!avatar) return null;
    const sizeClass = avatarSizes[size] || avatarSizes.sm;

    if (typeof avatar === 'string') {
      if (avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('.')) {
        return (
          <img
            src={avatar}
            alt={label}
            className={`${sizeClass} rounded-full object-cover shrink-0 select-none`}
          />
        );
      }
      return (
        <span className={`${sizeClass} rounded-full bg-primary/20 text-primary flex items-center justify-center font-extrabold uppercase shrink-0 select-none`}>
          {avatar.substring(0, 2)}
        </span>
      );
    }
    return <span className="shrink-0 flex items-center justify-center">{avatar}</span>;
  };

  // Render delete button with full key controls and screen reader descriptions
  const renderDelete = () => {
    if (!onDelete) return null;
    const iconSize = size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-[15px]' : 'text-[13px]';

    const handleDeleteClick = (e) => {
      e.stopPropagation();
      onDelete(e);
    };

    const handleDeleteKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.stopPropagation();
        e.preventDefault();
        onDelete(e);
      }
    };

    return (
      <span
        role="button"
        tabIndex={0}
        onClick={handleDeleteClick}
        onKeyDown={handleDeleteKeyDown}
        aria-label={`Remove ${label}`}
        className="ml-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-current transition-colors duration-150 inline-flex items-center justify-center shrink-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-current"
      >
        <span className={`material-symbols-outlined ${iconSize}`}>close</span>
      </span>
    );
  };

  const handleKeyDown = (e) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  const interactiveClasses = isClickable
    ? 'cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40'
    : '';

  return (
    <span
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      className={`inline-flex items-center justify-center border font-bold select-none whitespace-nowrap shrink-0 transition-all duration-200 ${themeClass} ${sizeClass} ${interactiveClasses} ${className}`}
    >
      {renderAvatar()}
      <span>{label}</span>
      {renderDelete()}
    </span>
  );
};

export default Chip;
