import React from 'react';
import SlottedEntityCard from '../../../../components/ui/v2/cards/SlottedEntityCard';

/**
 * Static pill configuration map — derived from dayType enum.
 * Defined outside the component to avoid recreation on every render.
 */
const PILL_CONFIG = {
  today: {
    label: 'TODAY',
    classes: 'bg-primary/10 text-primary',
  },
  tomorrow: {
    label: 'TOMORROW',
    classes: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  },
  future: {
    // label is dynamic — uses dateLabel prop
    classes: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  },
};

/**
 * UpcomingScheduleRow renders a single schedule session row using SlottedEntityCard
 * as the structural shell. The date/time stack with color-coded pill is injected
 * into the card's left icon area via a custom renderSelectedCard approach.
 *
 * Memoized via React.memo to prevent re-renders when sibling rows or parent
 * state unrelated to this row's props updates.
 *
 * NOTE: The `onClick` prop MUST be wrapped in useCallback at the call site to
 * prevent React.memo bypass due to function identity change on every parent render.
 *
 * @param {Object} props
 * @param {'today'|'tomorrow'|'future'} props.dayType - Controls the pill color and label.
 * @param {string} props.dateLabel - Formatted date string for 'future' type (e.g. "FRI, 25 JUL").
 * @param {string} props.time - Session start time string (e.g. "09:00 AM").
 * @param {string} props.topic - Topic or lesson name.
 * @param {string} [props.chapter] - Chapter or sub-descriptor (e.g. "Chapter 2").
 * @param {function} [props.onClick] - Stable click callback (useCallback-wrapped at call site).
 * @returns {React.ReactElement} A single schedule row item.
 */
const UpcomingScheduleRow = React.memo(function UpcomingScheduleRow({
  dayType = 'future',
  dateLabel = '',
  time = '',
  topic = '',
  chapter,
  onClick,
}) {
  const pill = PILL_CONFIG[dayType] || PILL_CONFIG.future;
  const pillLabel = dayType === 'future' ? dateLabel : pill.label;

  /**
   * Custom left-side date node injected into the SlottedEntityCard icon area.
   * Renders: time (small, muted) above + colored date pill below.
   * Structured as a narrow fixed-width column to maintain grid alignment
   * across all rows in the list.
   */
  const dateNode = (
    <div className="flex flex-col items-center gap-1 w-16 shrink-0">
      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tight leading-none">
        {time}
      </span>
      <span
        className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md leading-none ${pill.classes}`}
      >
        {pillLabel}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer select-none"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Left: Date/time stack with pill */}
      {dateNode}

      {/* Center: Topic and chapter */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-main dark:text-white truncate">
          {topic}
        </p>
        {chapter && (
          <p className="text-[11px] font-semibold text-text-secondary truncate mt-0.5">
            {chapter}
          </p>
        )}
      </div>

      {/* Right: Navigation chevron */}
      <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0">
        chevron_right
      </span>
    </div>
  );
});

export default UpcomingScheduleRow;
