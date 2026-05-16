import React, { forwardRef } from 'react';

/**
 * BaseInput: The core, production-grade input component.
 * It provides the foundation for all other input types (TextInput, PhoneInput, etc.).
 * Separates UI (styling, variants) from logic.
 */
const BaseInput = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = "",
  containerClassName = "",
  variant = "default",
  inputSize = "md",
  disabled,
  id,
  required,
  ...props
}, ref) => {
  const inputId = id || props.name;

  const baseStyles = "w-full rounded-lg border outline-none transition-all duration-200 flex items-center gap-2 px-4";
  
  const variants = {
    default: "bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
    filled: "bg-background-light dark:bg-background-dark border-transparent focus-within:border-primary focus-within:bg-surface-light dark:focus-within:bg-surface-dark",
    ghost: "bg-transparent border-transparent hover:bg-background-light/50 dark:hover:bg-background-dark/50 focus-within:bg-background-light dark:focus-within:bg-background-dark"
  };

  const sizes = {
    sm: "py-1.5 text-xs",
    md: "py-2 text-sm",
    lg: "py-3 text-base"
  };

  const errorStyles = error ? "border-red-500 focus-within:ring-red-500/10" : "";

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {/* Label and Required Indicator handled here or by FormField wrapper */}
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className={`relative flex items-center group ${baseStyles} ${variants[variant]} ${sizes[inputSize]} ${errorStyles} ${className}`}>
        {/* Left Icon */}
        {leftIcon && (
          <span className="material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors text-lg">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-inherit placeholder:text-text-secondary/50 disabled:cursor-not-allowed"
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <span className="material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors text-lg">
            {rightIcon}
          </span>
        )}
      </div>

      {/* Error or Helper Text */}
      {error ? (
        <p className="text-[10px] font-medium text-red-500 pl-1">{error}</p>
      ) : helperText ? (
        <p className="text-[10px] text-text-secondary pl-1">{helperText}</p>
      ) : null}
    </div>
  );
});

BaseInput.displayName = "BaseInput";

export default BaseInput;
