import React, { useMemo } from 'react';
import CardContainer from '../../../../components/ui/v2/cards/CardContainer';
import ProgressBar from '../../../../components/ui/v2/ProgressBar';
import KeyValuePair from '../../../../components/ui/v2/KeyValuePair';
import Button from '../../../../components/ui/v2/Button';

/**
 * AttendanceSummaryPanel displays a compact, read-only attendance statistics card
 * for the Batch Profile mobile Overview tab.
 *
 * Follows the SlottedEntityCard slot-injection pattern:
 *   - Outer visual shell = CardContainer (hoverable=false, no domain knowledge)
 *   - Inner content = slot-injected primitives (ProgressBar, KeyValuePair, Button)
 *
 * Color derivation for ProgressBar is memoized to prevent re-computation on
 * unrelated parent re-renders.
 *
 * @param {Object} props
 * @param {number} props.overallPercent - Overall attendance rate (0–100).
 * @param {number} props.lastWeekPercent - Last week's attendance percentage.
 * @param {string} props.presentToday - Present/Total string (e.g. "29 / 30").
 * @param {number} props.totalClasses - Total classes conducted so far.
 * @param {function} [props.onViewDetails] - Stable callback (useCallback-wrapped at
 *   call site) for the "View Attendance Details" footer action.
 * @returns {React.ReactElement} Attendance summary panel card.
 */
export default function AttendanceSummaryPanel({
  overallPercent = 0,
  lastWeekPercent = 0,
  presentToday = '—',
  totalClasses = 0,
  onViewDetails,
}) {
  // Memoized color derivation — avoids recomputation on unrelated parent re-renders
  const progressColor = useMemo(() => {
    if (overallPercent >= 90) return 'success';
    if (overallPercent >= 70) return 'warning';
    return 'danger';
  }, [overallPercent]);

  return (
    <CardContainer hoverable={false} className="p-4">
      {/* Header Slot */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black uppercase tracking-widest text-text-secondary">
          Attendance Summary
        </p>
        <span className="material-symbols-outlined text-emerald-500 text-[18px]">
          trending_up
        </span>
      </div>

      {/* Hero Slot — Large Headline Percentage */}
      <div className="mb-3">
        <p className="text-4xl font-black text-text-main dark:text-white leading-none">
          {overallPercent}%
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mt-1">
          Overall Attendance
        </p>
      </div>

      {/* Stats Slot — Progress Bar */}
      <div className="mb-4">
        <ProgressBar
          value={overallPercent}
          max={100}
          color={progressColor}
          size="md"
        />
      </div>

      {/* Metadata Slot — 3-Row Stat Divider List */}
      <div className="flex flex-row gap-x-15 border-t border-border-light dark:border-border-dark pt-3 mb-3">
        <div className="flex items-center justify-between">
          <KeyValuePair
            label="Last Week"
            value={`${lastWeekPercent}%`}
            layout="horizontal"
            sizeProp="12px"
          />
        </div>
        <div className="flex items-center justify-between">
          <KeyValuePair
            label="Present Today"
            value={presentToday}
            layout="horizontal"
            sizeProp="12px"
          />
        </div>
        <div className="flex items-center justify-between">
          <KeyValuePair
            label="Total Classes"
            value={String(totalClasses)}
            layout="horizontal"
            sizeProp="12px"
          />
        </div>
      </div>

      {/* Footer Slot — Action Link */}
      {onViewDetails && (
        <div className="border-t border-border-light dark:border-border-dark pt-2">
          <Button
            variant="text"
            size="sm"
            endIcon="chevron_right"
            onClick={onViewDetails}
            className="w-full justify-between"
          >
            View Attendance Details
          </Button>
        </div>
      )}
    </CardContainer>
  );
}
