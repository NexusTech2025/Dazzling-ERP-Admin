import React from 'react';
import CardContainer from '../../../../components/ui/v2/cards/CardContainer';
import ProgressBar from '../../../../components/ui/v2/ProgressBar';
import KeyValuePair from '../../../../components/ui/v2/KeyValuePair';
import Button from '../../../../components/ui/v2/Button';

/**
 * AcademicProgressPanel displays a compact, read-only academic progress card
 * for the Batch Profile mobile Overview tab.
 *
 * Follows the SlottedEntityCard slot-injection pattern:
 *   - Outer visual shell = CardContainer (hoverable=false, no domain knowledge)
 *   - Inner content = slot-injected primitives (ProgressBar, KeyValuePair, Button)
 *
 * All slot content is fully self-contained and renders cleanly in isolation.
 *
 * @param {Object} props
 * @param {number} props.syllabusPercent - Syllabus completion percentage (0–100).
 * @param {number} props.testsConducted - Number of tests conducted.
 * @param {number} props.averageScore - Class average test score percentage (0–100).
 * @param {number} props.highestScore - Highest individual score percentage (0–100).
 * @param {function} [props.onViewPerformance] - Stable callback (useCallback-wrapped at
 *   call site) for the "View Test Performance" footer action.
 * @returns {React.ReactElement} Academic progress panel card.
 */
export default function AcademicProgressPanel({
  syllabusPercent = 0,
  testsConducted = 0,
  averageScore = 0,
  highestScore = 0,
  onViewPerformance,
}) {
  return (
    <CardContainer hoverable={false} className="p-4">
      {/* Header Slot */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black uppercase tracking-widest text-text-secondary">
          Academic Progress
        </p>
        <span className="material-symbols-outlined text-primary text-[18px]">
          auto_graph
        </span>
      </div>

      {/* Stats Slot — Stacked ProgressBar with inline labels */}
      <div className="mb-4">
        <ProgressBar
          value={syllabusPercent}
          max={100}
          color="primary"
          size="md"
          variant="stacked"
          label="Syllabus Completed"
          showPercentage
        />
      </div>

      {/* Metadata Slot — 3-Row Stat Divider List */}
      <div className="flex flex-row gap-3 gap-x-10 border-t border-border-light dark:border-border-dark pt-3 mb-3">
        <div className="flex items-center justify-between">
          <KeyValuePair
            label="Tests Conducted"
            value={String(testsConducted)}
            layout="horizontal"
            sizeProp="12px"
          />
        </div>
        <div className="flex items-center justify-between">
          <KeyValuePair
            label="Average Score"
            value={`${averageScore}%`}
            layout="horizontal"
            sizeProp="12px"
          />
        </div>
        <div className="flex items-center justify-between">
          <KeyValuePair
            label="Highest Score"
            value={`${highestScore}%`}
            layout="horizontal"
            sizeProp="12px"
          />
        </div>
      </div>

      {/* Footer Slot — Action Link */}
      {onViewPerformance && (
        <div className="border-t border-border-light dark:border-border-dark pt-2">
          <Button
            variant="text"
            size="sm"
            endIcon="chevron_right"
            onClick={onViewPerformance}
            className="w-full justify-between"
          >
            View Test Performance
          </Button>
        </div>
      )}
    </CardContainer>
  );
}
