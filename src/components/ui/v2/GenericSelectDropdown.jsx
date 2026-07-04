import React, { useState, useEffect, useRef, useMemo } from 'react';
import FormField from './FormField';

/**
 * HiddenNativeSelect: Helper component to mirror options in a hidden native select element.
 * Ensures compatibility with default HTML forms and standard form submit handshakes.
 */
function HiddenNativeSelect({ name, value, onChange, disabled, placeholder, items, idProp, labelProp }) {
  return (
    <select
      name={name}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
    >
      <option value="">{placeholder}</option>
      {items.map((item, idx) => (
        <option key={idx} value={String(item[idProp])}>
          {String(item[labelProp])}
        </option>
      ))}
    </select>
  );
}

/**
 * DropdownTrigger: The visual button element acting as the combobox toggle control.
 */
function DropdownTrigger({
  disabled,
  isOpen,
  listboxId,
  onClick,
  leftIcon,
  selectedItem,
  selectedViewMode,
  labelProp,
  placeholder,
  renderSelectedCard,
  renderItem,
  className,
  heightStyles
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={listboxId}
      onClick={onClick}
      className={`w-full flex items-center justify-between text-left border bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10 ${
        isOpen 
          ? "border-primary ring-2 ring-primary/10" 
          : "hover:border-slate-300 dark:hover:border-slate-700"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} p-2 ${heightStyles} ${className}`}
    >
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {leftIcon && (
          <span className="material-symbols-outlined text-text-secondary text-lg">
            {leftIcon}
          </span>
        )}
        {selectedItem ? (
          selectedViewMode === 'one-line' ? (
            <div className="py-1 px-2 text-sm font-semibold truncate text-text-main dark:text-white">
              {String(selectedItem[labelProp])}
            </div>
          ) : (
            renderSelectedCard ? renderSelectedCard(selectedItem) : renderItem(selectedItem, true)
          )
        ) : (
          <div className="py-1 px-2 text-sm text-text-secondary/50 font-medium">
            {placeholder}
          </div>
        )}
      </div>
      
      <div className="px-2 border-l border-border-light dark:border-border-dark/80 text-text-secondary shrink-0">
        <span className={`material-symbols-outlined text-lg transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </div>
    </button>
  );
}

/**
 * OptionListItem: Individual drop-down choice list elements wrapping polymorphic render hooks.
 */
function OptionListItem({ item, index, selectedId, activeIndex, idProp, renderItem, onSelect, onMouseEnter }) {
  const isSelected = String(item[idProp]) === String(selectedId);
  const isKeyboardActive = index === activeIndex;

  return (
    <li
      role="option"
      aria-selected={isSelected}
      onMouseEnter={onMouseEnter}
      onClick={onSelect}
      className={`cursor-pointer transition-colors ${
        isSelected ? "bg-primary/10" : ""
      } ${
        isKeyboardActive ? "bg-background-light dark:bg-background-dark text-primary" : ""
      }`}
    >
      {renderItem(item, isSelected)}
    </li>
  );
}

/**
 * GenericSelectDropdown: Main compound selector component.
 */
export function GenericSelectDropdown({
  items = [],
  selectedId,
  onChange,
  idProp,
  labelProp,
  searchFields = [],
  selectedViewMode = 'one-line',
  placeholder = "Select an option...",
  disabled = false,
  name,
  label,
  required,
  error,
  helperText,
  leftIcon,
  className = "",
  containerClassName = "",
  renderItem,
  renderSelectedCard,
  
  // Sizing and alignment configs
  dropdownWidth = "min-w-full"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const [horizontalAlign, setHorizontalAlign] = useState("left"); // "left" | "right"
  const [verticalAlign, setVerticalAlign] = useState("bottom"); // "bottom" | "top"
  
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listboxId = useMemo(() => `dropdown-listbox-${Math.random().toString(36).substring(2, 9)}`, []);

  const selectedItem = useMemo(() => {
    return items.find(item => String(item[idProp]) === String(selectedId)) || null;
  }, [items, selectedId, idProp]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const cleanTerm = searchTerm.toLowerCase().trim();
    
    return items.filter(item => 
      searchFields.some(field => {
        const val = item[field];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(cleanTerm);
      })
    );
  }, [items, searchTerm, searchFields]);

  // Adjust menu placement dynamically whenever listbox is opened
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Horizontal placement: Check if dropdown goes beyond right viewport boundary
      const thresholdWidth = 380; 
      if (rect.left + thresholdWidth > viewportWidth) {
        setHorizontalAlign("right");
      } else {
        setHorizontalAlign("left");
      }
      
      // Vertical placement: Check if dropdown goes beyond bottom viewport boundary
      const thresholdHeight = 320; 
      if (rect.bottom + thresholdHeight > viewportHeight && rect.top > thresholdHeight) {
        setVerticalAlign("top");
      } else {
        setVerticalAlign("bottom");
      }
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchTerm]);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (isOpen && selectedViewMode !== 'native-fallback' && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, selectedViewMode]);

  const handleKeyDown = (e) => {
    if (disabled || selectedViewMode === 'native-fallback') return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setActiveIndex(prev => (prev + 1 < filteredItems.length ? prev + 1 : 0));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : filteredItems.length - 1));
        }
        break;
      case "Enter":
      case " ":
        if (e.key === " " && searchTerm.length > 0) break;
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (activeIndex >= 0 && activeIndex < filteredItems.length) {
          onChange(filteredItems[activeIndex][idProp]);
          setIsOpen(false);
          setSearchTerm("");
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        containerRef.current?.querySelector('button')?.focus();
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const hasHeightClass = className.split(' ').some(c => c.startsWith('h-') || c.startsWith('min-h-'));
  const heightStyles = hasHeightClass ? "" : "h-[38px]";

  // Define position absolute classes
  const verticalClass = verticalAlign === "top" ? "bottom-full mb-2" : "top-full mt-2";
  const horizontalClass = horizontalAlign === "right" ? "right-0" : "left-0";
  const originClass = `${verticalAlign === "top" ? "origin-bottom" : "origin-top"} ${horizontalAlign === "right" ? "origin-right" : "origin-left"}`;

  const triggerContent = (
    <div 
      ref={containerRef} 
      className={`relative w-full text-text-main dark:text-white font-sans ${containerClassName}`}
      onKeyDown={handleKeyDown}
    >
      <HiddenNativeSelect 
        name={name}
        value={selectedId}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        items={items}
        idProp={idProp}
        labelProp={labelProp}
      />

      {selectedViewMode === 'native-fallback' ? (
        <div className="relative w-full">
          <select
            value={selectedId || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full appearance-none bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg px-4 py-2 pr-10 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary disabled:opacity-60 cursor-pointer h-[38px]"
          >
            <option value="" disabled>{placeholder}</option>
            {items.map((item, idx) => (
              <option key={idx} value={String(item[idProp])}>
                {String(item[labelProp])}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </div>
        </div>
      ) : (
        <>
          <DropdownTrigger 
            disabled={disabled}
            isOpen={isOpen}
            listboxId={listboxId}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            leftIcon={leftIcon}
            selectedItem={selectedItem}
            selectedViewMode={selectedViewMode}
            labelProp={labelProp}
            placeholder={placeholder}
            renderSelectedCard={renderSelectedCard}
            renderItem={renderItem}
            className={className}
            heightStyles={heightStyles}
          />

          {isOpen && (
            <div 
              id={listboxId}
              role="listbox"
              className={`absolute z-50 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl overflow-hidden animate-in fade-in-40 zoom-in-95 duration-100 ${dropdownWidth} ${verticalClass} ${horizontalClass} ${originClass}`}
            >
              <div className="p-3 border-b border-border-light dark:border-border-dark/80 bg-background-light dark:bg-background-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-text-secondary text-sm">search</span>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent border-0 p-0 text-xs focus:ring-0 focus:outline-none text-text-main dark:text-white placeholder-text-secondary/50"
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    onClick={() => setSearchTerm("")}
                    className="p-1 rounded text-text-secondary hover:text-text-main dark:hover:text-white"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              <ul className="max-h-64 overflow-y-auto divide-y divide-border-light dark:divide-border-dark/40">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <OptionListItem 
                      key={String(item[idProp])}
                      item={item}
                      index={index}
                      selectedId={selectedId}
                      activeIndex={activeIndex}
                      idProp={idProp}
                      renderItem={renderItem}
                      onMouseEnter={() => setActiveIndex(index)}
                      onSelect={() => {
                        onChange(item[idProp]);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-text-secondary">
                    No matching records found.
                  </div>
                )}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <FormField
      label={label}
      name={name}
      required={required}
      error={error}
      helperText={helperText}
    >
      {triggerContent}
    </FormField>
  );
}
