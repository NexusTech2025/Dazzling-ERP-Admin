import React from 'react';
import { useSelect } from './hooks/useSelect';

/**
 * MultiSelect: Advanced multi-selection with tag rendering.
 * Built on top of useSelect hook.
 */
const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  label,
  error,
  searchable = true,
  className = "",
  containerClassName = "",
  variant = "default"
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
  } = useSelect({ options, value, onChange, multiple: true, searchable });

  const removeOption = (val, e) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== val));
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
          flex flex-wrap items-center gap-2 px-4 py-2 min-h-[38px] border rounded-lg cursor-pointer transition-all duration-200
          ${isOpen ? 'ring-2 ring-primary/10 border-primary' : ''}
          ${error ? 'border-red-500' : 'border-border-light dark:border-border-dark'}
          ${variant === 'filled' ? 'bg-background-light dark:bg-background-dark' : 'bg-surface-light dark:bg-surface-dark'}
          ${className}
        `}
      >
        {value.length > 0 ? (
          value.map(val => {
            const opt = options.find(o => o.value === val);
            return (
              <div 
                key={val}
                className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg animate-in zoom-in-95"
              >
                {opt?.label || val}
                <button 
                  onClick={(e) => removeOption(val, e)}
                  className="hover:text-primary-dark transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            );
          })
        ) : (
          <span className="text-sm text-text-secondary/50">{placeholder}</span>
        )}
        
        <div className="flex-1 min-w-[20px] flex justify-end">
          <span className={`material-symbols-outlined text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl overflow-hidden">
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
                    ${isSelected(option) ? 'bg-primary/5 text-primary font-medium' : 'hover:bg-background-light dark:hover:bg-background-dark'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${isSelected(option) ? 'bg-primary border-primary' : 'border-border-light dark:border-border-dark'}`}>
                      {isSelected(option) && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
                    </div>
                    {option.label}
                  </div>
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

export default MultiSelect;
