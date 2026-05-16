import React, { forwardRef, useState } from 'react';
import BaseInput from './BaseInput';

/**
 * PasswordInput: Secure input with a visibility toggle.
 * Reuses BaseInput structure with custom rightIcon action.
 */
const PasswordInput = forwardRef(({ showToggle = true, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="relative group">
      <BaseInput
        ref={ref}
        type={isVisible ? "text" : "password"}
        leftIcon="lock"
        {...props}
      />
      
      {showToggle && (
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-4 top-[38px] -translate-y-1/2 text-text-secondary hover:text-primary transition-colors focus:outline-none"
          tabIndex="-1"
        >
          <span className="material-symbols-outlined text-lg">
            {isVisible ? 'visibility' : 'visibility_off'}
          </span>
        </button>
      )}
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
