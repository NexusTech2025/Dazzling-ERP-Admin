import React, { useState, useEffect, useRef } from 'react';

/**
 * FilterButton - Simple stateless button element.
 * @param {Object} props
 * @param {string} props.label - Text label.
 * @param {string} [props.icon] - Optional Google symbol identifier.
 * @param {string} [props.rightIcon] - Optional Google symbol for expand/collapse chevron.
 * @param {function} props.onClick - Click event callback.
 * @param {string} props.className - Tailwind styling classes.
 */
const FilterButton = ({ label, icon, rightIcon, onClick, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={className}
  >
    <div className="flex items-center gap-2 truncate">
      {icon && <span className="material-symbols-outlined text-base shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </div>
    {rightIcon && <span className="material-symbols-outlined text-base shrink-0 transition-transform duration-200">{rightIcon}</span>}
  </button>
);

/**
 * ButtonGroupFilter - Replaced with a unified Custom Dropdown component
 * Displays a single dropdown selector for all viewports/scenarios.
 */
const ButtonGroupFilter = ({ 
  options = [], 
  value, 
  onChange, 
  size = 'md',
  variant = 'primary',
  label = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isSm = size === 'sm';
  const buttonBase = `rounded-xl font-black transition-all flex items-center justify-between gap-3 whitespace-nowrap active:scale-95 text-left`;

  // Close dropdown on click-outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeOption = options.find(opt => opt.value === value) || options[0] || { label: 'Select...', value: '' };

  const getButtonClasses = () => {
    const sizeClasses = isSm ? 'px-3 py-1 text-[10px] min-h-[28px]' : 'px-4 py-1.5 text-xs min-h-[36px]';
    
    if (variant === 'primary') {
      return `${buttonBase} ${sizeClasses} bg-primary text-white shadow-lg min-w-[140px]`;
    }
    return `${buttonBase} ${sizeClasses} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-text-main hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm min-w-[140px]`;
  };

  return (
    <div ref={dropdownRef} className="flex flex-col gap-1.5 relative w-fit">
      {label && (
        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">
          {label}:
        </span>
      )}

      <FilterButton
        label={activeOption.label}
        icon={activeOption.icon}
        rightIcon={isOpen ? 'expand_less' : 'expand_more'}
        onClick={() => setIsOpen(!isOpen)}
        className={getButtonClasses()}
      />

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 min-w-[180px] w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left font-black text-xs px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between gap-2 ${
                  value === opt.value
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-text-main'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && <span className="material-symbols-outlined text-base shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </div>
                {value === opt.value && (
                  <span className="material-symbols-outlined text-sm shrink-0">check</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonGroupFilter;
