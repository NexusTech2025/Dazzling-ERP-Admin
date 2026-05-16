import React, { forwardRef } from 'react';
import BaseInput from './BaseInput';

/**
 * MaskedInput: Input with formatting logic (e.g. 999-999-9999).
 * Reuses BaseInput and applies mask on change.
 */
const MaskedInput = forwardRef(({ mask, onChange, ...props }, ref) => {
  const applyMask = (value) => {
    let result = "";
    let valueIndex = 0;
    
    // Simple mask logic: replace '9' with digits
    for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
      if (mask[i] === "9") {
        if (/\d/.test(value[valueIndex])) {
          result += value[valueIndex];
          valueIndex++;
        } else {
          break;
        }
      } else {
        result += mask[i];
        if (value[valueIndex] === mask[i]) valueIndex++;
      }
    }
    return result;
  };

  const handleChange = (e) => {
    if (!mask) {
      if (onChange) onChange(e);
      return;
    }

    const rawValue = e.target.value.replace(/\D/g, "");
    const maskedValue = applyMask(rawValue);
    
    // Create synthetic event
    const event = {
      ...e,
      target: {
        ...e.target,
        name: props.name,
        value: maskedValue
      }
    };
    
    if (onChange) onChange(event);
  };

  return (
    <BaseInput
      ref={ref}
      onChange={handleChange}
      {...props}
    />
  );
});

MaskedInput.displayName = "MaskedInput";

export default MaskedInput;
