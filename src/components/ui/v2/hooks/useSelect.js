import { useState, useRef, useEffect, useMemo } from 'react';

/**
 * useSelect: Headless logic for dropdown select.
 * Handles opening/closing, keyboard navigation, and selection.
 */
export function useSelect({ 
  options = [], 
  value, 
  onChange, 
  multiple = false, 
  searchable = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  const filteredOptions = useMemo(() => {
    if (!searchable || !search) return options;
    return options.filter(opt => 
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, searchable, search]);

  const isSelected = (option) => {
    if (multiple) {
      return Array.isArray(value) && value.some(v => v === option.value);
    }
    return value === option.value;
  };

  const selectOption = (option) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.indexOf(option.value);
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(option.value);
      }
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === "Enter" || e.key === "ArrowDown")) {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          selectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    highlightedIndex,
    filteredOptions,
    isSelected,
    selectOption,
    containerRef,
    handleKeyDown
  };
}
