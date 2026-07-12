import React from 'react';
import PropTypes from 'prop-types';

// --- Shared Design System CSS Token Variables ---
const SHARED_ICON_CLASSES = "material-symbols-outlined text-text-secondary leading-none select-none";
const SHARED_VALUE_CLASSES = "font-semibold text-text-main dark:text-white truncate";
const SHARED_LABEL_CLASSES = "font-bold tracking-wider text-text-secondary uppercase select-none";

/**
 * Sub-Component: KeyValuePairIcon
 * Renders the Material Icon with calculated relative bounds.
 */
export const KeyValuePairIcon = ({ icon, size, className = "" }) => {
  if (!icon) return null;
  const hasColor = className.includes('text-');
  return (
    <div className={`flex items-center justify-center shrink-0 ${className}`}>
      <span
        className={`material-symbols-outlined leading-none select-none ${hasColor ? "" : "text-text-secondary"}`}
        style={{ fontSize: size }}
      >
        {icon}
      </span>
    </div>
  );
};

KeyValuePairIcon.propTypes = {
  icon: PropTypes.string,
  size: PropTypes.string.isRequired,
  className: PropTypes.string,
};

/**
 * Sub-Component: LabelValue
 * Renders the structural stack containing the label and metadata value.
 */
const LabelValue = ({ label, value, fallback, labelSize, valueSize, isHorizontal }) => (
  <div className={`flex flex-col min-w-0 ${isHorizontal ? 'leading-tight' : 'leading-none'}`}>
    <span
      className={`${SHARED_LABEL_CLASSES} ${isHorizontal ? 'mt-0.5' : 'mt-1'}`}
      style={{ fontSize: labelSize }}
    >
      {label}
    </span>
    <span
      className={`${SHARED_VALUE_CLASSES} ${!isHorizontal ? 'max-w-full' : ''}`}
      style={{ fontSize: valueSize }}
    >
      {value || fallback}
    </span>
  </div>
);

LabelValue.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fallback: PropTypes.string.isRequired,
  labelSize: PropTypes.string.isRequired,
  valueSize: PropTypes.string.isRequired,
  isHorizontal: PropTypes.bool.isRequired,
};

/**
 * KeyValuePair: Foundational primitive component for displaying metadata structures.
 */
const KeyValuePair = ({
  label,
  value,
  icon,
  fallback = "—",
  layout = "vertical",
  sizeProp = "14px",
  minWidth,
  maxWidth,
  className = ""
}) => {
  const isHorizontal = layout === 'horizontal';

  // Extract base numerical values to dynamically calculate relative sub-scales
  const baseNumericValue = parseFloat(sizeProp);
  const unit = sizeProp.replace(/[0-9.]/g, '') || 'px';

  // Compute three distinctly relative typography sizes based on sizeProp anchoring
  const computedValueSize = `${baseNumericValue}${unit}`;
  const computedLabelSize = `${Math.round(baseNumericValue * 0.85)}${unit}`;

  let iconsize = Math.round(baseNumericValue * 2);
  iconsize = iconsize % 2 === 0 ? iconsize : iconsize + 1;
  const computedIconSize = `${iconsize}${unit}`;

  // Layout orchestrator classes
  const layoutClasses = isHorizontal
    ? `flex items-center text-left gap-2 w-full min-w-0`
    : `flex flex-col items-center justify-center text-center gap-0.5 w-full min-w-0`;

  // Inline styles for min/max width control
  const inlineStyles = {};
  if (minWidth) inlineStyles.minWidth = minWidth;
  if (maxWidth) inlineStyles.maxWidth = maxWidth;

  return (
    <div className={`${layoutClasses} ${className}`} style={inlineStyles}>
      <KeyValuePairIcon
        icon={icon}
        size={computedIconSize}
        className={isHorizontal ? "" : "mb-0.5"}
      />
      <LabelValue
        label={label}
        value={value}
        fallback={fallback}
        labelSize={computedLabelSize}
        valueSize={computedValueSize}
        isHorizontal={isHorizontal}
      />
    </div>
  );
};

KeyValuePair.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.string,
  fallback: PropTypes.string,
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  sizeProp: PropTypes.string,
  minWidth: PropTypes.string,
  maxWidth: PropTypes.string,
  className: PropTypes.string,
};

export default KeyValuePair;
