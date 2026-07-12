import React from 'react';
import PropTypes from 'prop-types';
import { useDateTime } from './useDateTime';

/**
 * Headless semantic display container for high-density timestamps.
 * Isolates data transformations completely from interface representations.
 */
export const DateTimeComponent = ({
  value,
  inputFormat,
  outputFormat,
  fallback,
  locale,
  children
}) => {
  const dateTimeState = useDateTime({
    value,
    inputFormat,
    outputFormat,
    fallback,
    locale
  });

  if (typeof children === 'function') {
    return <React.Fragment>{children(dateTimeState)}</React.Fragment>;
  }

  return <React.Fragment>{dateTimeState.formatted}</React.Fragment>;
};

DateTimeComponent.displayName = 'HeadlessDateTime';

DateTimeComponent.propTypes = {
  value: PropTypes.any,
  inputFormat: PropTypes.string,
  outputFormat: PropTypes.string,
  fallback: PropTypes.node,
  locale: PropTypes.object,
  children: PropTypes.func
};

export default DateTimeComponent;
