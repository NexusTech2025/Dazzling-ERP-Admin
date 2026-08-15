import React from 'react';
import PropTypes from 'prop-types';

/**
 * Variant configurations for icons, color tokens, and borders for AlertCard.
 */
const VARIANT_CONFIGS = {
  success: {
    icon: 'check_circle',
    titleColor: 'text-emerald-800 dark:text-emerald-300',
    descColor: 'text-emerald-700/90 dark:text-emerald-400/90',
    bg: 'bg-emerald-50/90 dark:bg-emerald-950/60',
    border: 'border-emerald-500/30 dark:border-emerald-500/40',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
  },
  error: {
    icon: 'error',
    titleColor: 'text-rose-800 dark:text-rose-300',
    descColor: 'text-rose-700/90 dark:text-rose-400/90',
    bg: 'bg-rose-50/90 dark:bg-rose-950/60',
    border: 'border-rose-500/30 dark:border-rose-500/40',
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
  },
  danger: {
    icon: 'report_problem',
    titleColor: 'text-rose-800 dark:text-rose-300',
    descColor: 'text-rose-700/90 dark:text-rose-400/90',
    bg: 'bg-rose-50/90 dark:bg-rose-950/60',
    border: 'border-rose-500/30 dark:border-rose-500/40',
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
  },
  warning: {
    icon: 'warning',
    titleColor: 'text-amber-800 dark:text-amber-300',
    descColor: 'text-amber-700/90 dark:text-amber-400/90',
    bg: 'bg-amber-50/90 dark:bg-amber-950/60',
    border: 'border-amber-500/30 dark:border-amber-500/40',
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
  },
  info: {
    icon: 'info',
    titleColor: 'text-sky-800 dark:text-sky-300',
    descColor: 'text-sky-700/90 dark:text-sky-400/90',
    bg: 'bg-sky-50/90 dark:bg-sky-950/60',
    border: 'border-sky-500/30 dark:border-sky-500/40',
    iconBg: 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400'
  },
  neutral: {
    icon: 'notifications',
    titleColor: 'text-slate-800 dark:text-slate-200',
    descColor: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-50/90 dark:bg-slate-900/80',
    border: 'border-slate-300 dark:border-slate-700',
    iconBg: 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
  }
};

/**
 * Static V2 Alert Card component displaying stateful status banners.
 * Designed to react dynamically to state updates in forms and drawers.
 * 
 * @component
 * @param {object} props
 * @param {('info'|'success'|'warning'|'error'|'danger'|'neutral')} [props.variant='info'] - Visual theme variant.
 * @param {string} [props.icon] - Optional Material Symbols icon override.
 * @param {string} [props.title] - Optional headline title text.
 * @param {React.ReactNode} props.message - Main message text or elements.
 * @param {string} [props.className=''] - Custom container class override.
 */
export default function AlertCard({
  variant = 'info',
  icon,
  title,
  message,
  className = ''
}) {
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.info;
  const activeIcon = icon || config.icon;

  if (!message && !title) return null;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-300
        p-3.5 sm:p-4 w-full animate-in fade-in
        ${config.bg} ${config.border} ${className}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon Container */}
        <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${config.iconBg}`}>
          <span className="material-symbols-outlined text-[20px]">{activeIcon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <h5 className={`text-sm font-bold leading-snug ${config.titleColor}`}>
              {title}
            </h5>
          )}
          {message && (
            <div className={`text-xs mt-0.5 leading-relaxed ${config.descColor}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

AlertCard.propTypes = {
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'danger', 'neutral']),
  icon: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.node,
  className: PropTypes.string
};
