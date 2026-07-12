import React from 'react';
import PropTypes from 'prop-types';
import { useDate } from './useDate';

/**
 * Headless semantic display container for standard calendar dates.
 * Disconnects raw server values from rendering implementations completely.
 */
export const DateComponent = ({
  value,
  inputFormat,
  outputFormat,
  fallback,
  locale,
  children
}) => {
  const dateState = useDate({
    value,
    inputFormat,
    outputFormat,
    fallback,
    locale
  });

  // Render Prop Pattern: Defer control directly up to consumer framework if callback exists
  if (typeof children === 'function') {
    return <React.Fragment>{children(dateState)}</React.Fragment>;
  }

  // Presentation Base Mode: Render clean formatted string literal
  return <React.Fragment>{dateState.formatted}</React.Fragment>;
};

DateComponent.displayName = 'HeadlessDate';

DateComponent.propTypes = {
  value: PropTypes.any,
  inputFormat: PropTypes.string,
  outputFormat: PropTypes.string,
  fallback: PropTypes.node,
  locale: PropTypes.object,
  children: PropTypes.func
};

export default DateComponent;
