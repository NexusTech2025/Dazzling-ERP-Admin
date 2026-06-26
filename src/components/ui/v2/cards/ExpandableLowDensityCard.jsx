import React from 'react';
import CardContainer from './CardContainer';

/**
 * A highly-customizable low density list card with a slide-down expandable detailed panel.
 * Designed for mobile viewports to preserve key actions and layout spaces cleanly.
 * 
 * @param {Object} props - Component properties.
 * @param {boolean} props.isChecked - Flags if the card checkbox is selected.
 * @param {Function} props.onSelect - Callback triggered on toggling the selection checkbox.
 * @param {boolean} props.isExpanded - Flags if the detailed panel is currently visible.
 * @param {Function} props.onToggleExpand - Callback triggered on clicking the expansion chevron.
 * @param {React.ReactNode} props.leftHeader - Left slot layout containing primary text, links, or badges.
 * @param {React.ReactNode} props.rightHeader - Right slot layout containing metrics, status icons, and dates.
 * @param {React.ReactNode} props.expandedContent - Nested panel elements showing full details and action buttons.
 * @param {Function} [props.onCardClick] - Optional full-card click handler callback.
 * @param {string} [props.className] - Container layout style overrides.
 * @returns {React.JSX.Element} Low-density expandable card component.
 */
export const ExpandableLowDensityCard = ({
  isChecked,
  onSelect,
  isExpanded,
  onToggleExpand,
  leftHeader,
  rightHeader,
  expandedContent,
  onCardClick,
  className = ''
}) => {
  return (
    <CardContainer
      onClick={onCardClick}
      density="low"
      hoverable={true}
      className={`transition-all duration-200 ${
        isChecked ? 'border-primary bg-primary/5' : ''
      } ${className}`}
    >
      {/* Primary Card Top Header Row */}
      <div className="p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {onSelect && (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={onSelect}
                className="rounded border-border-light dark:border-border-dark text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
            </div>
          )}
          <div className="min-w-0">
            {leftHeader}
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {rightHeader}

          {/* Collapsible Panel Trigger Chevron */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(e);
            }}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-text-secondary dark:text-slate-400"
          >
            <span className={`material-symbols-outlined transition-transform duration-200 block ${isExpanded ? 'rotate-180' : ''}`}>
              keyboard_arrow_down
            </span>
          </button>
        </div>
      </div>

      {/* Slide-down Expandable Panel */}
      {isExpanded && (
        <div
          className="px-4 pb-4 pt-2 border-t border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/10 text-[11px] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {expandedContent}
        </div>
      )}
    </CardContainer>
  );
};

export default ExpandableLowDensityCard;
