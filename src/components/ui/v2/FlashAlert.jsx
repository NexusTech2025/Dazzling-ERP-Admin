import React, { useEffect, useState } from 'react';

/**
 * Variant configurations for icons, color tokens, borders, progress bars, and animations.
 */
const VARIANT_CONFIGS = {
  success: {
    icon: 'check_circle',
    titleColor: 'text-emerald-800 dark:text-emerald-300',
    descColor: 'text-emerald-700/80 dark:text-emerald-400/80',
    bg: 'bg-emerald-50/95 dark:bg-emerald-950/80',
    border: 'border-emerald-500/30 dark:border-emerald-500/40',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    progressBg: 'bg-emerald-500'
  },
  error: {
    icon: 'error',
    titleColor: 'text-rose-800 dark:text-rose-300',
    descColor: 'text-rose-700/80 dark:text-rose-400/80',
    bg: 'bg-rose-50/95 dark:bg-rose-950/80',
    border: 'border-rose-500/30 dark:border-rose-500/40',
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400',
    progressBg: 'bg-rose-500'
  },
  danger: {
    icon: 'report_problem',
    titleColor: 'text-rose-800 dark:text-rose-300',
    descColor: 'text-rose-700/80 dark:text-rose-400/80',
    bg: 'bg-rose-50/95 dark:bg-rose-950/80',
    border: 'border-rose-500/30 dark:border-rose-500/40',
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400',
    progressBg: 'bg-rose-500'
  },
  warning: {
    icon: 'warning',
    titleColor: 'text-amber-800 dark:text-amber-300',
    descColor: 'text-amber-700/80 dark:text-amber-400/80',
    bg: 'bg-amber-50/95 dark:bg-amber-950/80',
    border: 'border-amber-500/30 dark:border-amber-500/40',
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
    progressBg: 'bg-amber-500'
  },
  info: {
    icon: 'info',
    titleColor: 'text-sky-800 dark:text-sky-300',
    descColor: 'text-sky-700/80 dark:text-sky-400/80',
    bg: 'bg-sky-50/95 dark:bg-sky-950/80',
    border: 'border-sky-500/30 dark:border-sky-500/40',
    iconBg: 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400',
    progressBg: 'bg-sky-500'
  },
  neutral: {
    icon: 'notifications',
    titleColor: 'text-slate-800 dark:text-slate-200',
    descColor: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-50/95 dark:bg-slate-900/90',
    border: 'border-slate-300 dark:border-slate-700',
    iconBg: 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    progressBg: 'bg-slate-500'
  }
};

/**
 * Decoupled standalone FlashAlert component for toast & status notifications.
 * Supports progress bar countdown, auto-dismiss, action buttons, and custom status variants.
 * 
 * @component
 * @param {Object} props
 * @param {('success'|'error'|'danger'|'warning'|'info'|'neutral')} [props.variant='info'] - Visual status theme variant.
 * @param {string} props.title - Headline notification text.
 * @param {string} [props.description] - Detailed message text.
 * @param {boolean} [props.isOpen=true] - Visibility control state.
 * @param {Function} [props.onClose] - Callback fired on dismiss or timer completion.
 * @param {number} [props.autoDismissMs=4000] - Duration in ms before auto-close (set 0 to disable).
 * @param {React.ReactNode} [props.action] - Optional action slot (e.g., Undo, Retry).
 * @param {boolean} [props.showProgress=true] - Displays auto-dismiss countdown bar.
 * @param {string} [props.className=''] - Custom container utility classes.
 */
export default function FlashAlert({
  variant = 'info',
  title,
  description,
  isOpen = true,
  onClose,
  autoDismissMs = 4000,
  action = null,
  showProgress = true,
  className = ''
}) {
  const [progress, setProgress] = useState(100);

  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.info;

  // Handle auto-dismiss timer & progress bar countdown animation
  useEffect(() => {
    if (!isOpen || !autoDismissMs || autoDismissMs <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / autoDismissMs) * 100);
      setProgress(remaining);

      if (elapsed >= autoDismissMs) {
        clearInterval(interval);
        if (onClose) onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, autoDismissMs, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300
        p-3.5 sm:p-4 max-w-md w-full animate-in slide-in-from-top-4 fade-in
        ${config.bg} ${config.border} ${className}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Variant Icon Container */}
        <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${config.iconBg}`}>
          <span className="material-symbols-outlined text-[20px]">{config.icon}</span>
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <h5 className={`text-sm font-bold leading-snug ${config.titleColor}`}>
              {title}
            </h5>
          )}
          {description && (
            <p className={`text-xs mt-0.5 leading-relaxed ${config.descColor}`}>
              {description}
            </p>
          )}

          {/* Action Slot (e.g. Retry or Undo button) */}
          {action && <div className="mt-2 flex items-center gap-2">{action}</div>}
        </div>

        {/* Dismiss Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${config.titleColor} shrink-0`}
            aria-label="Dismiss alert"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Auto-Dismiss Progress Bar */}
      {showProgress && autoDismissMs > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
          <div
            className={`h-full transition-all ease-linear ${config.progressBg}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
