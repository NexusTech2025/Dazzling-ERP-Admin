import React, { useState, useEffect } from 'react';
import BaseInput from './BaseInput';
import { useDebounce } from './hooks/useDebounce';

/**
 * SearchInput: Debounced input specifically for searches.
 * Automatically clears and handles debounce logic internally.
 */
const SearchInput = ({ 
  onSearch, 
  debounceTime = 400, 
  placeholder = "Search...",
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, debounceTime);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm("");
  };

  return (
    <div className="relative group">
      <BaseInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        leftIcon="search"
        {...props}
      />
      
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-[22px] -translate-y-1/2 text-text-secondary hover:text-primary transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      )}
    </div>
  );
};

export default SearchInput;
