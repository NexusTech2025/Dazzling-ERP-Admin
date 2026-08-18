import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

/**
 * High-Performance Search Input with Local Keystroke State Isolation.
 * Maintains internal state to guarantee 0ms input latency without triggering parent re-renders.
 * Propagates debounced search queries upward to parent handlers only after typing settles.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {string} [props.value=''] - Externally controlled search query string.
 * @param {Function} props.onChange - Callback fired with the debounced search text `(text) => void`.
 * @param {string} [props.placeholder='Search...'] - Placeholder text.
 * @param {number} [props.delay=300] - Debounce delay in milliseconds.
 * @param {string} [props.className=''] - Optional styling class extension for input element.
 * @param {string} [props.containerClassName=''] - Optional styling class extension for outer wrapper.
 * @returns {React.JSX.Element} Isolated search input element with clear action.
 */
export const SearchInput = ({ 
  value = '', 
  onChange, 
  placeholder = "Search...", 
  delay = 300,
  className = '',
  containerClassName = '',
  ...rest 
}) => {
  const [localValue, setLocalValue] = useState(value ?? '');
  const [debouncedValue] = useDebounce(localValue, delay);
  const isInitialMount = useRef(true);
  const lastPropValueRef = useRef(value);

  // Sync internal state if external value changes programmatically (e.g. "Clear Filters", reset button)
  useEffect(() => {
    if (value !== lastPropValueRef.current) {
      lastPropValueRef.current = value;
      setLocalValue(value ?? '');
    }
  }, [value]);

  // Propagate debounced search text upward to parent
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (onChange && debouncedValue !== value) {
      lastPropValueRef.current = debouncedValue;
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  // Instant clear handler
  const handleClear = useCallback(() => {
    setLocalValue('');
    lastPropValueRef.current = '';
    if (onChange) {
      onChange('');
    }
  }, [onChange]);

  return (
    <div className={`relative w-full ${containerClassName}`}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl pointer-events-none select-none">
        search
      </span>
      <input 
        type="text" 
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className={`w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg py-2 pl-10 pr-9 text-sm focus:ring-1 focus:ring-primary outline-none transition-colors ${className}`}
        {...rest}
      />
      {localValue ? (
        <button
          type="button"
          onClick={handleClear}
          title="Clear search"
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center focus:outline-none"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      ) : null}
    </div>
  );
};

export const SelectFilter = ({ value, onChange, options = [], defaultLabel = "All" }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg py-2 px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
  >
    {options.map((option, index) => {
      // Handle both array of strings or array of objects {value, label}
      const val = typeof option === 'object' ? option.value : option;
      const label = typeof option === 'object' ? option.label : option;
      
      // If it's the "All" option, use the defaultLabel for clearer context
      const displayLabel = val === 'All' ? defaultLabel : label;
      
      return (
        <option key={index} value={val}>{displayLabel}</option>
      );
    })}
  </select>
);
