import React, { useState, useEffect, useRef } from 'react';
import { SearchInput } from '../../../components/ui/filters';
import ButtonGroupFilter from '../../../components/ui/filters/ButtonGroupFilter';
import SelectGroupFilter from '../../../components/ui/filters/SelectGroupFilter';

/**
 * CourseFilters Component
 * Unifies search input, layout view mode toggles, segment selectors, and academic filters.
 * In mobile view, view toggles are hidden and filters are consolidated inside a toggleable dropdown box.
 */
const CourseFilters = ({ 
  searchQuery, 
  onSearchChange, 
  segmentFilter, 
  onSegmentChange,
  segmentOptions = [],
  viewMode,
  onViewModeChange,
  isMobile = false,
  languageFilter = '',
  onLanguageChange,
  languageOptions = [],
  boardFilter = '',
  onBoardChange,
  boardOptions = [],
  classFilter = '',
  onClassChange,
  classOptions = [],
  isAcademicFilterActive = true
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click-outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Calculate count of active filters
  const activeFiltersCount = [
    segmentFilter ? 1 : 0,
    languageFilter ? 1 : 0,
    boardFilter ? 1 : 0,
    classFilter ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  if (isMobile) {
    return (
      <div className="relative w-full space-y-3" ref={dropdownRef}>
        {/* Search Row + Toggle button */}
        <div className="flex gap-2 w-full">
          <div className="flex-grow">
            <SearchInput 
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search courses, codes..."
            />
          </div>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black shadow-sm transition-all active:scale-95 ${
              isDropdownOpen || activeFiltersCount > 0
                ? 'bg-primary border-primary text-white'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-text-main dark:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-[9px] font-black text-primary dark:text-white border border-primary/20">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {isDropdownOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 rounded-2xl bg-white dark:bg-[#122131]/95 dark:backdrop-blur-md border border-slate-200 dark:border-white/8 shadow-2xl z-50 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <h4 className="text-xs font-black text-text-main dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2">
              Filter Options
            </h4>

            {/* Segment Selector */}
            <div className="space-y-1">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Segment:</span>
              <select
                value={segmentFilter}
                onChange={(e) => {
                  onSegmentChange(e.target.value);
                  if (e.target.value === '' && onLanguageChange && onBoardChange && onClassChange) {
                    onLanguageChange('');
                    onBoardChange('');
                    onClassChange('');
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-text-main dark:text-white outline-none focus:ring-1 focus:ring-primary"
              >
                {segmentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Selectors */}
            {isAcademicFilterActive && (
              <div className="grid grid-cols-1 gap-4 pt-2 border-t border-slate-100 dark:border-white/5">
                {/* Medium Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Medium:</span>
                  <select
                    value={languageFilter}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-text-main dark:text-white outline-none focus:ring-1 focus:ring-primary"
                  >
                    {languageOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Board Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Board:</span>
                  <select
                    value={boardFilter}
                    onChange={(e) => onBoardChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-text-main dark:text-white outline-none focus:ring-1 focus:ring-primary"
                  >
                    {boardOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Class:</span>
                  <select
                    value={classFilter}
                    onChange={(e) => onClassChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-text-main dark:text-white outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">ALL CLASSES</option>
                    {classOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Clear All / Close Row */}
            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-white/5">
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onSegmentChange('');
                    if (onLanguageChange) onLanguageChange('');
                    if (onBoardChange) onBoardChange('');
                    if (onClassChange) onClassChange('');
                    setIsDropdownOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(false)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs font-black text-text-main dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop View
  return (
    <div className="space-y-4">
      {/* Segment & Academic Filters Row */}
      <div className="flex flex-wrap items-center gap-6">
        {segmentOptions.length > 0 && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <ButtonGroupFilter
              options={segmentOptions}
              value={segmentFilter}
              variant="secondary"
              onChange={(val) => {
                onSegmentChange(val);
                if (val === '' && onLanguageChange && onBoardChange && onClassChange) {
                  onLanguageChange('');
                  onBoardChange('');
                  onClassChange('');
                }
              }}
            />
          </div>
        )}

        {isAcademicFilterActive && (
          <div className="flex flex-wrap items-center gap-4 animate-in zoom-in duration-300">
            {languageOptions.length > 0 && (
              <ButtonGroupFilter
                label="Medium"
                options={languageOptions}
                value={languageFilter}
                size="sm"
                variant="secondary"
                onChange={onLanguageChange}
              />
            )}

            {boardOptions.length > 0 && (
              <ButtonGroupFilter
                label="Board"
                options={boardOptions}
                value={boardFilter}
                size="sm"
                onChange={onBoardChange}
              />
            )}

            {classOptions.length > 0 && (
              <SelectGroupFilter
                label="Class"
                options={classOptions}
                value={classFilter}
                onChange={onClassChange}
                defaultLabel="All Classes"
              />
            )}
          </div>
        )}
      </div>

      {/* Search Input & View Toggles Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 shadow-sm">
        {/* Search Input */}
        <div className="md:col-span-5 lg:col-span-4 relative">
          <SearchInput 
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search courses, codes..."
          />
        </div>

        {/* View Mode Toggles & Advanced Settings */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-wrap gap-3 items-center justify-end">
          {/* View Mode Toggles */}
          <div className="flex items-center gap-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl p-1 shadow-inner">
            <button 
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                  : 'text-text-secondary hover:text-text-main'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
            <button 
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                  : 'text-text-secondary hover:text-text-main'
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-[20px]">view_list</span>
            </button>
          </div>

          <button className="flex items-center gap-2 rounded-lg text-xs font-bold text-primary hover:underline px-2">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Advanced
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;
