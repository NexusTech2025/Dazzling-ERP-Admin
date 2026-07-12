import React from 'react';
import PropTypes from 'prop-types';
import { isToday, isBefore, startOfToday } from 'date-fns';
import { Date as HeadlessDate } from '../../headless/Date';
import Badge from '../Badge';

/**
 * Design Token Mappings decoupled from the component lifecycle
 * to guarantee zero memory reallocations during high-frequency table renders.
 */
const INTENT_TEXT_STYLES = {
  default: 'text-text-main dark:text-white',
  muted: 'text-text-secondary dark:text-slate-400',
  primary: 'text-blue-600 dark:text-blue-400',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-rose-600 dark:text-rose-400'
};

const INTENT_STACK_STYLES = {
  default: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-text-main',
  muted: 'border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-text-secondary',
  primary: 'border-blue-100 dark:border-blue-900 bg-blue-50/10 text-blue-600 dark:text-blue-400',
  success: 'border-emerald-100 dark:border-emerald-900 bg-emerald-50/10 text-emerald-600 dark:text-emerald-400',
  warning: 'border-amber-100 dark:border-amber-900 bg-amber-50/10 text-amber-600 dark:text-amber-400',
  danger: 'border-rose-100 dark:border-rose-900 bg-rose-50/10 text-rose-600 dark:text-rose-400'
};

const MAP_INTENT_TO_BADGE_VARIANT = {
  default: 'default',
  muted: 'default',
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info'
};

/**
 * Styled Presentational Wrapper Component for consistent Date visualization.
 * Maps data directly to corporate layouts (Badges, High-Density Table Cells, Micro-lines).
 */
export const DateDisplay = ({
  value,
  variant = 'text',
  intent = 'default',
  autoContext = false,
  inputFormat,
  outputFormat,
  fallback = '--',
  locale,
  className = ''
}) => {
  return (
    <HeadlessDate
      value={value}
      inputFormat={inputFormat}
      outputFormat={outputFormat}
      fallback={fallback}
      locale={locale}
    >
      {(state) => {
        // Guard pass: Handle empty metadata scenarios instantly
        if (state.isEmpty || !state.isValid) {
          return (
            <span className="text-text-secondary dark:text-slate-500 italic text-xs tracking-wide">
              {state.rawValue === '' || state.rawValue === null ? fallback : '⚠️ Invalid Date'}
            </span>
          );
        }

        // Context Engine Strategy mapping
        let computedIntent = intent;
        if (autoContext && state.date) {
          const today = startOfToday();
          if (isToday(state.date)) {
            computedIntent = 'warning'; // Item targets active present frame deadline
          } else if (isBefore(state.date, today)) {
            computedIntent = 'danger';  // Chronological boundary violated (Overdue)
          } else {
            computedIntent = 'success'; // Safe prospective timeline parameter
          }
        }

        // Variant UI Layout Selection Trees
        switch (variant) {
          case 'badge':
            return (
              <Badge
                variant={MAP_INTENT_TO_BADGE_VARIANT[computedIntent] || 'default'}
                className={className}
              >
                {state.formatted}
              </Badge>
            );

          case 'micro':
            // High-density space configuration matching token framework definitions
            return (
              <span
                className={`text-[9px] font-black uppercase tracking-widest block font-mono leading-none ${INTENT_TEXT_STYLES[computedIntent]} ${className}`}
              >
                {state.formatted}
              </span>
            );

          case 'stack':
            // Vertical structural calendar widget representation box
            return (
              <div
                className={`inline-flex flex-col items-center justify-center w-12 h-12 rounded-lg border text-center font-mono ${INTENT_STACK_STYLES[computedIntent]} ${className}`}
              >
                <span className="text-[8px] font-black uppercase tracking-wider block opacity-70 leading-tight">
                  <HeadlessDate value={state.date} outputFormat="MMM" />
                </span>
                <span className="text-sm font-extrabold tracking-tighter block leading-none my-0.5">
                  <HeadlessDate value={state.date} outputFormat="dd" />
                </span>
                <span className="text-[7px] font-medium block opacity-60">
                  <HeadlessDate value={state.date} outputFormat="yyyy" />
                </span>
              </div>
            );

          case 'text':
          default:
            const sizeClass = className.includes('text-') ? '' : 'text-sm';
            const weightClass = className.includes('font-') ? '' : 'font-medium';
            return (
              <span className={`${sizeClass} ${weightClass} tracking-tight ${INTENT_TEXT_STYLES[computedIntent]} ${className}`}>
                {state.formatted}
              </span>
            );
        }
      }}
    </HeadlessDate>
  );
};

DateDisplay.propTypes = {
  value: PropTypes.any,
  variant: PropTypes.oneOf(['text', 'badge', 'micro', 'stack']),
  intent: PropTypes.oneOf(['default', 'muted', 'primary', 'success', 'warning', 'danger', 'info']),
  autoContext: PropTypes.bool,
  inputFormat: PropTypes.string,
  outputFormat: PropTypes.string,
  fallback: PropTypes.node,
  locale: PropTypes.object,
  className: PropTypes.string
};

export default DateDisplay;

