import React, { useMemo } from 'react';
import { formatTime } from '../../../lib/formatTime';

/**
 * Pure stateless display primitive for uniform time presentation across structural views.
 */
export const Time = ({
  value,
  format = '12h',
  showSeconds = false,
  locale = 'en-US',
  fallback = 'N/A',
  className = ''
}) => {
  // Performance isolation cache boundary: prevent string re-parsing cycles on render passes
  const formattedString = useMemo(() => {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    return formatTime(value, { format, showSeconds, locale });
  }, [value, format, showSeconds, locale]);

  if (formattedString === null) {
    return (
      <span className={`text-text-secondary dark:text-slate-500 font-mono italic ${className}`}>
        {fallback}
      </span>
    );
  }

  return (
    <span className={`font-mono text-text-main dark:text-white tabular-nums tracking-tight ${className}`}>
      {formattedString}
    </span>
  );
};

export default Time;
