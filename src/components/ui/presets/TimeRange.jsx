import React from 'react';
import PropTypes from 'prop-types';
import Badge from '../Badge';
import Time from '../v2/Time';

/**
 * TimeRange: Styled presenter for a start and end time range, with optional badge wrapping.
 */
export const TimeRange = ({
  start,
  end,
  useBadge = false,
  badgeVariant = 'success',
  layout = 'horizontal',
  className = '',
  ...props
}) => {
  const isVertical = layout === 'vertical';
  const rangeContent = (
    <span className={`inline-flex ${isVertical ? 'flex-col items-start gap-0.5' : 'items-center'}`}>
      <Time value={start} {...props} />
      {!isVertical && <>&nbsp;-&nbsp;</>}
      <Time value={end} {...props} />
    </span>
  );

  if (useBadge) {
    return (
      <Badge variant={badgeVariant} className={className}>
        {rangeContent}
      </Badge>
    );
  }

  return <span className={className}>{rangeContent}</span>;
};

TimeRange.propTypes = {
  start: PropTypes.any,
  end: PropTypes.any,
  useBadge: PropTypes.bool,
  badgeVariant: PropTypes.string,
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  className: PropTypes.string
};

export default TimeRange;
