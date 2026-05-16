import React, { forwardRef } from 'react';
import BaseInput from './BaseInput';

/**
 * DateInput: A semantic wrapper for date selection.
 * Reuses BaseInput styling while fixing type="date".
 */
const DateInput = forwardRef((props, ref) => {
  return (
    <BaseInput
      ref={ref}
      type="date"
      leftIcon="calendar_today"
      {...props}
    />
  );
});

DateInput.displayName = "DateInput";

export default DateInput;
