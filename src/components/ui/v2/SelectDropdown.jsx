/**
 * @file GenericSelectDropdown.jsx
 * @description Refactored Compound Select Dropdown with Headless hook state controller.
 */

import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import FormField from './FormField';

const DropdownContext = React.createContext(null);

export function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown compound components must be rendered inside a <Dropdown> provider');
  }
  return context;
}

// 1. HEADLESS STATE CONTROLLER HOOK
export function useDropdown({
  items = [],
  selectedId,
  onChange,
  idProp,
  labelProp,
  searchFields = [],
  disabled = false,
  selectedViewMode = 'one-line',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const [horizontalAlign, setHorizontalAlign] = useState("left");
  const [verticalAlign, setVerticalAlign] = useState("bottom");

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

  // Viewport placement calculation
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const thresholdWidth = 380;
      if (rect.left + thresholdWidth > viewportWidth) {
        setHorizontalAlign("right");
      } else {
        setHorizontalAlign("left");
      }

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

  // Click outside listener
  useEffect(() => {
    function handleOutsideClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Focus search input (avoiding mobile keyboard popup trigger)
  useEffect(() => {
    if (isOpen && selectedViewMode !== 'native-fallback' && searchInputRef.current) {
      const isMobileDevice = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
      if (!isMobileDevice) {
        searchInputRef.current.focus();
      }
    }
  }, [isOpen, selectedViewMode]);

  // Keyboard navigation controller
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

  return {
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    activeIndex,
    setActiveIndex,
    horizontalAlign,
    verticalAlign,
    containerRef,
    searchInputRef,
    listboxId,
    selectedItem,
    filteredItems,
    handleKeyDown,
    selectedViewMode,
  };
}

// 2. COMPOUND COMPONENT PROVIDER
export function Dropdown({
  children,
  items,
  selectedId,
  onChange,
  idProp,
  labelProp,
  searchFields,
  disabled,
  selectedViewMode,
}) {
  const value = useDropdown({
    items,
    selectedId,
    onChange,
    idProp,
    labelProp,
    searchFields,
    disabled,
    selectedViewMode,
  });

  return (
    <DropdownContext.Provider value={value}>
      <div
        ref={value.containerRef}
        className="relative w-full text-text-main dark:text-white font-sans"
        onKeyDown={value.handleKeyDown}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// 3. COMPOUND TRIGGER
Dropdown.Trigger = function DropdownTrigger({
  disabled,
  leftIcon,
  selectedViewMode,
  labelProp,
  placeholder,
  renderSelectedCard,
  renderItem,
  className = "",
  heightStyles = "h-[38px]",
}) {
  const { isOpen, setIsOpen, selectedItem, listboxId, selectedViewMode: contextSelectedViewMode } = useDropdownContext();
  const activeSelectedViewMode = selectedViewMode || contextSelectedViewMode || 'one-line';

  return (
    <button
      type="button"
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={listboxId}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      className={`w-full flex items-center justify-between text-left border bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10 ${isOpen
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
          activeSelectedViewMode === 'one-line' ? (
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
};

// 4. COMPOUND MENU
Dropdown.Menu = function DropdownMenu({ children, dropdownWidth = "min-w-full" }) {
  const { isOpen, verticalAlign, horizontalAlign, listboxId } = useDropdownContext();

  if (!isOpen) return null;

  const verticalClass = verticalAlign === "top" ? "bottom-full mb-2" : "top-full mt-2";
  const horizontalClass = horizontalAlign === "right" ? "right-0" : "left-0";
  const originClass = `${verticalAlign === "top" ? "origin-bottom" : "origin-top"} ${horizontalAlign === "right" ? "origin-right" : "origin-left"}`;

  return (
    <div
      id={listboxId}
      role="listbox"
      className={`absolute z-50 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl overflow-hidden animate-in fade-in-40 zoom-in-95 duration-100 ${dropdownWidth} ${verticalClass} ${horizontalClass} ${originClass}`}
    >
      {children}
    </div>
  );
};

// 5. COMPOUND SEARCH BAR
Dropdown.Search = function DropdownSearch() {
  const { searchTerm, setSearchTerm, searchInputRef } = useDropdownContext();

  return (
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
  );
};

// 6. COMPOUND ITEM
Dropdown.Item = function DropdownItem({
  item,
  index,
  idProp,
  selectedId,
  onClick,
  children,
}) {
  const { activeIndex, setActiveIndex } = useDropdownContext();
  const isSelected = String(item[idProp]) === String(selectedId);
  const isKeyboardActive = index === activeIndex;

  return (
    <li
      role="option"
      aria-selected={isSelected}
      onMouseEnter={() => setActiveIndex(index)}
      onClick={onClick}
      className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/10" : ""} ${isKeyboardActive ? "bg-background-light dark:bg-background-dark text-primary" : ""
        }`}
    >
      {children}
    </li>
  );
};

// 7. COMPOUND ITEMS WRAPPER
Dropdown.Items = function DropdownItems({
  children,
  maxHeight,
  maxItems,
  itemHeight = 40 // Standard default row height in pixels across ERP configurations
}) {
  const context = useDropdownContext();
  const { filteredItems, setIsOpen, setSearchTerm, selectedId, idProp } = context;

  // 1. Calculate the real-time boundary ceiling safely
  let computedMaxHeight = '40rem'; // Default legacy fallback (equivalent to max-h-160 layout rule)

  if (maxHeight) {
    computedMaxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
  } else if (maxItems) {
    computedMaxHeight = `${maxItems * itemHeight}px`;
  }

  // 2. Render items based on invocation format (Function child vs Static child elements)
  const renderCollection = () => {
    if (typeof children === 'function') {
      return filteredItems.map((item, index) =>
        children(item, index, { setIsOpen, setSearchTerm, selectedId, idProp })
      );
    }
    return children;
  };

  return (
    <ul
      // Safely pass the calculated variable straight to DOM inline properties
      style={{ '--dropdown-max-height': computedMaxHeight }}
      // Tailwind uses a static string literal that safely extracts during the compilation step
      className="max-h-[var(--dropdown-max-height)] overflow-y-auto divide-y divide-border-light dark:divide-border-dark/40"
      role="listbox"
    >
      {filteredItems.length > 0 ? (
        renderCollection()
      ) : (
        <div className="p-8 text-center text-xs text-text-secondary">
          No matching records found.
        </div>
      )}
    </ul>
  );
};

// 8. HIDDEN NATIVE SELECT FOR FORM COMPATIBILITY
Dropdown.HiddenSelect = function DropdownHiddenSelect({
  name,
  value,
  onChange,
  disabled,
  placeholder,
  items,
  idProp,
  labelProp,
}) {
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
};

