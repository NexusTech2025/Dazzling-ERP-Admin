import React from 'react';
import PropTypes from 'prop-types';
import KeyValuePair from '../KeyValuePair';

/**
 * HorizontalStatMetrics: A horizontal system of stats/indicators separated by vertical dividers.
 * Fully refactored to reuse the unified KeyValuePair component tokens.
 */
const HorizontalStatMetrics = ({
  items = [],
  columns = 4,
  allowWrap = true,
  className = ""
}) => {
  if (!items || items.length === 0) return null;

  const layoutClasses = allowWrap
    ? "flex flex-wrap items-center justify-between gap-y-3"
    : "flex flex-row items-center overflow-x-auto overflow-y-hidden gap-4 w-full select-none [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent";

  return (
    <div className={`w-full ${layoutClasses} ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <div
            className={`flex flex-col items-center justify-center text-center shrink-0 ${allowWrap ? "flex-1 px-1.5" : ""}`}
            style={{
              minWidth: item.minWidth || (allowWrap ? undefined : "140px"),
              maxWidth: item.maxWidth
            }}
          >
            {/* Reusing KeyValuePair component:
              - Mapping item.label (amount string/number) to value
              - Mapping item.value (descriptor title) to label
            */}
            <KeyValuePair
              icon={item.icon}
              value={item.value}
              label={item.label}
              layout="horizontal"
              sizeProp="10px"
              minWidth={item.minWidth}
              maxWidth={item.maxWidth}
              className={`items-center text-center ${item.className || ''}`}
            />
          </div>

          {/* Vertical Separator lines between items */}
          {index < items.length - 1 && (
            <div
              className="h-5 w-[1px] bg-slate-100 dark:bg-slate-800 shrink-0"
              aria-hidden="true"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
HorizontalStatMetrics.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // The metric data/amount
      value: PropTypes.string, // The uppercase descriptor name
      minWidth: PropTypes.string,
      maxWidth: PropTypes.string,
    })
  ),
  columns: PropTypes.number,
  allowWrap: PropTypes.bool,
  className: PropTypes.string,
};
export default HorizontalStatMetrics;