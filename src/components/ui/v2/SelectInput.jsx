import React from 'react';
import { useSelect } from './hooks/useSelect';

/**
 * SelectInput: A highly flexible dropdown selection component.
 * Uses a headless hook for logic and mirrors BaseInput styling.
 */
const SelectInput = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  error,
  multiple = false,
  searchable = false,
  leftIcon,
  className = "",
  containerClassName = "",
  variant = "default",
  inputSize = "md"
}) => {
  const {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    filteredOptions,
    isSelected,
    selectOption,
    containerRef,
    handleKeyDown
  } = useSelect({ options, value, onChange, multiple, searchable });

  const getDisplayValue = () => {
    if (multiple) {
      if (!Array.isArray(value) || value.length === 0) return placeholder;
      const selectedLabels = options
        .filter(opt => value.includes(opt.value))
        .map(opt => opt.label);
      return selectedLabels.join(", ");
    }
    const selected = options.find(opt => opt.value === value);
    return selected ? selected.label : placeholder;
  };

  const variants = {
    default: "bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark",
    filled: "bg-background-light dark:bg-background-dark border-transparent",
    ghost: "bg-transparent border-transparent"
  };

  const sizes = {
    sm: "py-1.5 text-xs",
    md: "py-2 text-sm",
    lg: "py-3 text-base"
  };

  return (
    <div 
      className={`flex flex-col gap-1.5 relative ${containerClassName}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">
          {label}
        </span>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 border rounded-lg cursor-pointer transition-all duration-200
          ${isOpen ? 'ring-2 ring-primary/10 border-primary' : ''}
          ${error ? 'border-red-500' : ''}
          ${variants[variant]}
          ${sizes[inputSize]}
          ${className}
        `}
      >
        {leftIcon && (
          <span className="material-symbols-outlined text-text-secondary text-lg">
            {leftIcon}
          </span>
        )}
        
        <span className={`flex-1 truncate ${!value ? 'text-text-secondary/50' : ''}`}>
          {getDisplayValue()}
        </span>

        <span className={`material-symbols-outlined text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {searchable && (
            <div className="p-2 border-b border-border-light dark:border-border-dark">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-background-light dark:bg-background-dark border-none outline-none rounded-lg px-3 py-2 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-center text-text-secondary">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectOption(option);
                  }}
                  className={`
                    px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-colors flex items-center justify-between
                    ${isSelected(option) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-background-light dark:hover:bg-background-dark'}
                  `}
                >
                  {option.label}
                  {isSelected(option) && (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-[10px] font-medium text-red-500 pl-1">{error}</p>
      )}
    </div>
  );
};

export default SelectInput;
