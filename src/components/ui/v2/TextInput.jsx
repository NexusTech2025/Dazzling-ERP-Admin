import React, { forwardRef } from 'react';
import BaseInput from './BaseInput';

/**
 * TextInput: A thin wrapper around BaseInput for standard text entry.
 * Follows the "Separation of Concerns" principle from the design system.
 */
const TextInput = forwardRef(({ type = "text", trim = false, onBlur, ...props }, ref) => {
  const handleBlur = (e) => {
    if (trim && e.target.value) {
      e.target.value = e.target.value.trim();
    }
    if (onBlur) onBlur(e);
  };

  return (
    <BaseInput
      ref={ref}
      type={type}
      onBlur={handleBlur}
      {...props}
    />
  );
});

TextInput.displayName = "TextInput";

export default TextInput;
