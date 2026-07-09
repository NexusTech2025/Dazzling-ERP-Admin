import React from 'react';
import SlottedEntityCard from '../../../../components/ui/v2/cards/SlottedEntityCard';

/**
 * Static icon color configuration map — derived from iconVariant enum.
 * Defined outside the component to avoid recreation on every render.
 * Maps each variant to the Tailwind color string accepted by SlottedEntityCard's
 * `iconColor` prop.
 */
const ICON_COLOR_MAP = {
  primary: 'text-primary',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
  danger: 'text-rose-600 dark:text-rose-400',
};

/**
 * Maps iconVariant to a custom icon tile background class.
 * SlottedEntityCard's default icon container uses `bg-slate-100 dark:bg-slate-800/80`.
 * We override via className injection on a wrapping element to achieve tinted tiles.
 */
const ICON_BG_MAP = {
  primary: 'bg-primary/10 dark:bg-primary/15',
  success: 'bg-emerald-50 dark:bg-emerald-900/20',
  warning: 'bg-amber-50 dark:bg-amber-900/20',
  info: 'bg-blue-50 dark:bg-blue-900/20',
  danger: 'bg-rose-50 dark:bg-rose-900/20',
};

/**
 * RecentActivityRow renders a single recent activity entry for the Batch Profile
 * mobile Overview tab's Recent Activity list.
 *
 * Composes SlottedEntityCard as the structural row shell:
 *   - icon + iconColor → left icon tile with variant-themed color
 *   - title → primary activity label
 *   - subtitle → muted timestamp
 *   - badge → right-aligned detail text (e.g. "29 Present / 30")
 *
 * Since SlottedEntityCard's icon container background cannot be directly overridden
 * via its public API, the tinted bg is applied by wrapping the icon slot content.
 * Activity rows are non-navigable (no onClick), so the card's chevron is suppressed
 * by omitting the onClick prop.
 *
 * Memoized via React.memo to prevent re-renders when sibling rows or parent
 * state unrelated to this row's props updates.
 *
 * NOTE: This component has no onClick — activity log rows are read-only displays.
 *
 * @param {Object} props
 * @param {string} props.icon - Material Symbol icon name (e.g. "how_to_reg").
 * @param {'primary'|'success'|'warning'|'info'|'danger'} [props.iconVariant='primary'] - Icon tile color theme.
 * @param {string} props.title - Activity label (e.g. "Attendance Taken").
 * @param {string} props.timestamp - Time string (e.g. "Today, 09:15 AM").
 * @param {string} [props.detail] - Right-aligned detail text (e.g. "29 Present / 30").
 * @returns {React.ReactElement} A single recent activity row item.
 */
const RecentActivityRow = React.memo(function RecentActivityRow({
  icon = 'circle',
  iconVariant = 'primary',
  title = '',
  timestamp = '',
  detail,
}) {
  const iconColor = ICON_COLOR_MAP[iconVariant] || ICON_COLOR_MAP.primary;
  const iconBg = ICON_BG_MAP[iconVariant] || ICON_BG_MAP.primary;

  /**
   * The detail badge rendered in SlottedEntityCard's right badge slot.
   * Only mounted when `detail` is provided.
   */
  const detailBadge = detail ? (
    <span className="text-[10px] font-bold text-text-secondary text-right leading-tight">
      {detail}
    </span>
  ) : undefined;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0`}>
      {/* Left: Tinted icon tile */}
      <div className={`shrink-0 flex items-center justify-center size-9 rounded-xl ${iconBg}`}>
        <span className={`material-symbols-outlined text-xl ${iconColor}`}>
          {icon}
        </span>
      </div>

      {/* Center: Title + timestamp stack */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-main dark:text-white truncate">
          {title}
        </p>
        <p className="text-[11px] font-semibold text-text-secondary truncate mt-0.5">
          {timestamp}
        </p>
      </div>

      {/* Right: Detail text */}
      {detailBadge}
    </div>
  );
});

export default RecentActivityRow;
