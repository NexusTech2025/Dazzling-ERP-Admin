import React, { forwardRef } from 'react';
import BaseInput from './BaseInput';

/**
 * PhoneInput: Composable phone input with country code support.
 */
const PhoneInput = forwardRef(({ 
  countryCode = "+91", 
  onCountryCodeChange,
  ...props 
}, ref) => {
  return (
    <div className="flex items-center">
      <div className="w-20">
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange && onCountryCodeChange(e.target.value)}
          className="w-full h-[42px] bg-background-light dark:bg-background-dark border border-r-0 border-border-light dark:border-border-dark rounded-l-lg px-2 text-sm outline-none focus:border-primary transition-all appearance-none"
        >
          <option value="+91">+91 (IN)</option>
          <option value="+1">+1 (US)</option>
          <option value="+44">+44 (UK)</option>
          <option value="+971">+971 (AE)</option>
        </select>
      </div>
      <BaseInput
        ref={ref}
        type="tel"
        leftIcon="call"
        className="rounded-l-none"
        containerClassName="flex-1"
        {...props}
      />
    </div>
  );
});

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
