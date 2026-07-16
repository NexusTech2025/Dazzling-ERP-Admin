import React, { memo, forwardRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable, memoized and optimized Action component matching the ERP V2 design tokens.
 * Supports standard button triggers (onClick) or navigation links (to).
 * Supports different layout variants: 'menu' (for dropdown list items) and 'button' (for standard button displays).
 */
const Action = memo(forwardRef(({
  to,
  onClick,
  icon,
  children,
  variant = 'menu',
  className = '',
  ...props
}, ref) => {
  const baseClasses = variant === 'menu'
    ? "flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-805 text-left transition-colors w-full first:rounded-t-xl last:rounded-b-xl"
    : "flex items-center justify-center gap-2 rounded-xl h-10 px-4 border border-slate-200 dark:border-slate-850/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-semibold shadow-sm shrink-0";

  const content = (
    <>
      {icon && (
        <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0 select-none">
          {icon}
        </span>
      )}
      <span className="font-semibold truncate">{children}</span>
    </>
  );

  if (to) {
    return (
      <Link
        ref={ref}
        to={to}
        onClick={onClick}
        className={`${baseClasses} ${className}`}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
}));

Action.displayName = 'Action';

export default Action;
