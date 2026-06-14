import React, { forwardRef } from 'react';
import BaseInput from './BaseInput';

/**
 * PhoneInput: Composable phone input with country code support.
 */
const PhoneInput = forwardRef(({ 
  countryCode = "+91", 
  onCountryCodeChange,
  label,
  error,
  required,
  helperText,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const inputId = props.id || props.name;
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="flex items-center">
        <div className="w-20 flex-shrink-0">
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange && onCountryCodeChange(e.target.value)}
            className={`w-full h-[38px] bg-surface-light dark:bg-surface-dark border border-r-0 rounded-l-lg px-2 text-sm text-text-main dark:text-white outline-none transition-all cursor-pointer ${
              isFocused 
                ? 'border-primary ring-2 ring-primary/10' 
                : error 
                ? 'border-red-500' 
                : 'border-border-light dark:border-border-dark'
            }`}
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
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus && props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur && props.onBlur(e);
          }}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[10px] font-medium text-red-500 pl-1">{error}</p>
      ) : helperText ? (
        <p className="text-[10px] text-text-secondary pl-1">{helperText}</p>
      ) : null}
    </div>
  );
});

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
