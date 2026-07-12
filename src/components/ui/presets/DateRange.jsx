import React from 'react';
import PropTypes from 'prop-types';
import Badge from '../Badge';
import DateDisplay from './DateDisplay';

/**
 * DateRange: Styled presenter for a start and end date range, with optional badge wrapping.
 */
export const DateRange = ({
  start,
  end,
  useBadge = false,
  badgeVariant = 'default',
  layout = 'horizontal',
  className = '',
  dateClassName = 'font-normal',
  fallback = '--',
  ...props
}) => {
  const isVertical = layout === 'vertical';
  const rangeContent = (
    <span className={`inline-flex ${isVertical ? 'flex-col items-start gap-0.5' : 'items-center'}`}>
      <DateDisplay value={start} fallback={fallback} className={dateClassName} {...props} />
      {!isVertical && <>&nbsp;-&nbsp;</>}
      <DateDisplay value={end} fallback={fallback} className={dateClassName} {...props} />
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

DateRange.propTypes = {
  start: PropTypes.any,
  end: PropTypes.any,
  useBadge: PropTypes.bool,
  badgeVariant: PropTypes.string,
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  className: PropTypes.string,
  dateClassName: PropTypes.string,
  fallback: PropTypes.node
};

export default DateRange;
