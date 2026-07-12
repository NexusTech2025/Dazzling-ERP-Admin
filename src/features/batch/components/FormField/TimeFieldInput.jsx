import React from 'react';
import TimeField from '../../../../components/ui/v2/TimeField/TimeField';

export const TimeFieldInput = ({
  label,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  is24Hour = false,
  hideSeconds = true,
  error = '',
  required = false,
  description
}) => {
  return (
    <TimeField
      value={value}
      onChange={onChange}
      is24Hour={is24Hour}
      hideSeconds={hideSeconds}
      disabled={disabled}
      readOnly={readOnly}
      error={error}
      required={required}
    >
      {label && <TimeField.Label>{label}</TimeField.Label>}
      <TimeField.Input>
        <TimeField.Segment type="hour" />
        <TimeField.Separator />
        <TimeField.Segment type="minute" />
        {!hideSeconds && (
          <>
            <TimeField.Separator />
            <TimeField.Segment type="second" />
          </>
        )}
        {!is24Hour && (
          <>
            <TimeField.Separator> </TimeField.Separator>
            <TimeField.Segment type="dayPeriod" />
          </>
        )}
      </TimeField.Input>
      {description && <TimeField.Description>{description}</TimeField.Description>}
      {error && <TimeField.Error />}
    </TimeField>
  );
};

export default TimeFieldInput;
