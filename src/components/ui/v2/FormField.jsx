import React, { cloneElement, isValidElement } from 'react';

/**
 * FormField: The backbone of the form system.
 * It manages the layout (vertical/horizontal), labels, required indicators, 
 * and error/helper text for any input component it wraps.
 */
const FormField = ({
  label,
  name,
  required,
  error,
  helperText,
  children,
  layout = "vertical",
  labelWidth = "150px",
  className = "",
  containerClassName = ""
}) => {
  const fieldId = name;

  // Inject props into child input (BaseInput, Select, etc.)
  const enhancedChild = isValidElement(children) 
    ? cloneElement(children, {
        id: fieldId,
        name,
        error: error,
        "aria-invalid": !!error,
        "aria-describedby": error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined,
      })
    : children;

  const isHorizontal = layout === "horizontal";

  return (
    <div className={`flex ${isHorizontal ? 'flex-row items-start gap-4' : 'flex-col gap-1.5'} ${containerClassName} ${className}`}>
      {/* Label section */}
      {label && (
        <label 
          htmlFor={fieldId} 
          className={`text-xs font-bold uppercase tracking-wider text-text-secondary ${isHorizontal ? 'pt-3' : 'pl-1'}`}
          style={isHorizontal ? { width: labelWidth, flexShrink: 0 } : {}}
        >
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Input and Feedback section */}
      <div className="flex-1 flex flex-col gap-1.5 w-full">
        {enhancedChild}
        
        {/* Render error text if child is a Controller, div, or custom element that does not handle its own errors */}
        {error && (
          !isValidElement(children) || 
          (
            children.type !== "input" &&
            children.type !== "select" &&
            children.type !== "textarea" &&
            children.type?.displayName !== "BaseInput" &&
            children.type?.displayName !== "TextInput" &&
            children.type?.displayName !== "PhoneInput" &&
            children.type?.name !== "SelectInput"
          )
        ) && (
          <p id={`${fieldId}-error`} className="text-[10px] font-medium text-red-500 pl-1">{error}</p>
        )}
      </div>
    </div>
  );
};

export default FormField;
