import React from 'react';

/**
 * @component Badge
 * @description A status or achievement indicator used to show counts, states, overlays, or progress signals.
 * 
 * DESIGN VARIANTS:
 * 1. Numeric Badges: Displays counts/metrics (e.g. notifications 🔔 5).
 * 2. Status Badges: Displays active/inactive states (e.g. "Online", "Draft").
 * 3. Achievement Badges: Gamified status highlights (e.g. "Level 10", "PRO").
 * 4. Icon Badges: Small overlay dots positioned relative to a parent container (e.g., green dot on Avatar).
 * 5. Progress Badges: Displays completion percentages or milestones.
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Target element to attach the badge to as an overlay.
 * @param {'dot'|'count'|'status'|'achievement'} [props.variant='status'] - Visual layout style.
 * @param {'primary'|'secondary'|'success'|'warning'|'error'|'neutral'} [props.color='neutral'] - Theme color mapping.
 * @param {string|number} [props.content] - Numeric count or status text to render.
 * @param {boolean} [props.pulsing=false] - If true, adds a glowing pulsing animation.
 * @param {'sm'|'md'|'lg'} [props.size='sm'] - Dimensions and scale of the badge.
 * @param {'top-right'|'top-left'|'inline'} [props.placement='inline'] - Relative positioning of the badge.
 * @param {string} [props.className] - Extended CSS classes.
 */
const Badge = ({
  children,
  variant = 'status',
  color = 'neutral',
  content,
  pulsing = false,
  size = 'sm',
  placement = 'inline',
  className = ''
}) => {
  // Map color schemes to theme variables
  const getThemeClass = (themeColor) => {
    const maps = {
      primary: 'bg-primary/10 text-primary border border-primary/20',
      secondary: 'bg-secondary/10 text-emerald-500 border border-secondary/20',
      success: 'bg-secondary/10 text-emerald-500 border border-secondary/20',
      warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      error: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
      neutral: 'bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-slate-400 border border-border-light dark:border-border-dark',
    };
    return maps[themeColor] || maps.neutral;
  };

  const themeClass = getThemeClass(color);

  // Sizing definitions
  const sizes = {
    dot: {
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3'
    },
    badge: {
      sm: 'text-[8px] sm:text-[9px] px-1.5 py-[1px] font-extrabold uppercase tracking-wide',
      md: 'text-[9px] sm:text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider',
      lg: 'text-[10px] sm:text-[11px] px-2.5 py-1 font-bold uppercase tracking-widest'
    }
  };

  const badgeSizeClass = variant === 'dot' 
    ? (sizes.dot[size] || sizes.dot.sm)
    : (sizes.badge[size] || sizes.badge.sm);

  // Absolute placement classes if children are present
  const placements = {
    'top-right': 'absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 z-10',
    'top-left': 'absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 z-10',
    'inline': 'relative inline-flex'
  };

  const positionClass = children ? (placements[placement] || placements['top-right']) : '';

  let badgeEl = null;

  if (variant === 'dot') {
    // Split the background color part for the pulsing overlay
    const bgOnly = themeClass.split(' ')[0] || 'bg-neutral';
    badgeEl = (
      <span className={`relative flex shrink-0 ${badgeSizeClass} ${positionClass} ${className}`}>
        {pulsing && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${bgOnly}`} />
        )}
        <span className={`relative inline-flex rounded-full ${badgeSizeClass} ${themeClass}`} />
      </span>
    );
  } else {
    const baseStyle = 'rounded-full inline-flex items-center justify-center font-bold select-none whitespace-nowrap border shrink-0';
    badgeEl = (
      <span className={`${baseStyle} ${themeClass} ${badgeSizeClass} ${positionClass} ${className}`}>
        {content}
      </span>
    );
  }

  if (children) {
    return (
      <div className="relative inline-flex shrink-0">
        {children}
        {badgeEl}
      </div>
    );
  }

  return badgeEl;
};

export default Badge;
