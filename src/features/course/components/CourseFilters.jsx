import React from 'react';
import { SearchInput, SelectFilter } from '../../../components/ui/filters';

const CourseFilters = ({ 
  searchQuery, 
  onSearchChange, 
  segmentFilter, 
  onSegmentChange,
  viewMode,
  onViewModeChange,
  availableSegments = [] 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 shadow-sm">
      {/* Search Input */}
      <div className="md:col-span-5 lg:col-span-4 relative">
        <SearchInput 
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search courses, codes..."
        />
      </div>

      {/* Segment / Department Filter */}
      <div className="md:col-span-7 lg:col-span-8 flex flex-wrap gap-3 items-center">
        <div className="min-w-[160px]">
          <SelectFilter 
            value={segmentFilter}
            onChange={onSegmentChange}
            options={availableSegments}
            defaultLabel="All Segments"
          />
        </div>

        {/* View Mode Toggles */}
        <div className="ml-auto flex items-center gap-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl p-1 shadow-inner">
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
  );
};

export default CourseFilters;
