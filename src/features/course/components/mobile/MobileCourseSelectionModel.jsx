import React, { useState, useMemo } from 'react';
import CourseCardV2 from '../CourseCardV2';
import MobileBaseLayout from '../../../../components/layout/MobileBaseLayout';
import Chip from '../../../../components/ui/v2/indicators/Chip';

// --- Filter Options ---
const languageOptions = [
  { label: 'All', value: '' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'English', value: 'English' }
];

const boardOptions = [
  { label: 'All', value: '' },
  { label: 'CBSE', value: 'CBSE' },
  { label: 'RBSE', value: 'RBSE' },
  { label: 'ICSE', value: 'ICSE' },
  { label: 'IB', value: 'IB' }
];

const classOptions = [...Array(12)].map((_, i) => ({
  label: `Class ${i + 1}`,
  value: String(i + 1)
}));

/**
 * CourseMobileView - Handles the stacked, collapsible-accordion filter layout with Low-Density Cards for mobile.
 *
 * @param {Object} props - React props.
 */
export const CourseMobileView = ({
  filters = {},
  filterSetters = {},
  segmentOptions = [],
  filteredCourses,
  tempSelected,
  toggleCourse,
  handleResetFilters
}) => {
  const { searchQuery, segmentFilter, languageFilter, boardFilter, classFilter } = filters;
  const { setSearchQuery, setSegmentFilter, setLanguageFilter, setBoardFilter, setClassFilter } = filterSetters;
  const [showFilters, setShowFilters] = useState(false);

  return (
    <MobileBaseLayout>
      {/* Search Input Filter Slot */}
      <MobileBaseLayout.FilterSlot>
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary dark:text-slate-500 group-focus-within:text-primary transition-colors text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search code or course name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 dark:text-white placeholder:text-text-secondary"
          />
        </div>
      </MobileBaseLayout.FilterSlot>

      {/* Horizontal Category Segment Pills using Tabs Slot and Chip Component */}
      <MobileBaseLayout.TabsSlot>
        <div className="flex gap-2 py-2 overflow-x-auto scrollbar-none w-full shrink-0">
          {segmentOptions.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              active={segmentFilter === opt.value}
              onClick={() => setSegmentFilter(opt.value)}
              variant="subtle"
              color="primary"
              size="sm"
            />
          ))}
        </div>
      </MobileBaseLayout.TabsSlot>

      {/* List Slot containing Advanced Filters Accordion and Courses list */}
      <MobileBaseLayout.ListSlot
        isEmpty={filteredCourses.length === 0}
        renderEmptyState={
          <div className="space-y-4 w-full">
            {/* Advanced Filters Accordion */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-wider text-text-secondary hover:text-text-main"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">filter_alt</span>
                  Advanced Filters
                  {(languageFilter || boardFilter || classFilter) && (
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                  )}
                </span>
                <span
                  className="material-symbols-outlined text-base transition-transform duration-200"
                  style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }}
                >
                  expand_more
                </span>
              </button>

              {showFilters && (
                <div className="px-4 pb-4 space-y-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  {/* Medium */}
                  <div className="space-y-1.5">
                    <h5 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">
                      Instruction Medium
                    </h5>
                    <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60">
                      {languageOptions.map((opt) => (
                        <Chip
                          key={opt.value}
                          label={opt.label}
                          active={languageFilter === opt.value}
                          onClick={() => setLanguageFilter(opt.value)}
                          variant="subtle"
                          color="neutral"
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Board */}
                  <div className="space-y-1.5">
                    <h5 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">
                      Educational Board
                    </h5>
                    <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60">
                      {boardOptions.map((opt) => (
                        <Chip
                          key={opt.value}
                          label={opt.label}
                          active={boardFilter === opt.value}
                          onClick={() => setBoardFilter(opt.value)}
                          variant="subtle"
                          color="neutral"
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Class */}
                  <div className="space-y-1.5">
                    <h5 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">
                      Grade Level
                    </h5>
                    <div className="relative">
                      <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2.5 px-4 text-sm focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 dark:text-white appearance-none cursor-pointer"
                      >
                        <option value="">All Classes</option>
                        {classOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[18px]">
                        unfold_more
                      </span>
                    </div>
                  </div>

                  {/* Reset */}
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2.5 border border-border-light dark:border-border-dark rounded-xl text-[9px] font-black uppercase tracking-[0.18em] text-text-secondary hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-800 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px] leading-none">filter_alt_off</span>
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-border-light dark:border-border-dark">
                <span className="material-symbols-outlined text-3xl text-text-secondary dark:text-slate-500">
                  search_off
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No courses found</h4>
              <p className="text-xs text-text-secondary max-w-xs mx-auto mt-1">
                Nothing matches your filters.
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Advanced Filters Accordion */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-wider text-text-secondary hover:text-text-main"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">filter_alt</span>
                Advanced Filters
                {(languageFilter || boardFilter || classFilter) && (
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                )}
              </span>
              <span
                className="material-symbols-outlined text-base transition-transform duration-200"
                style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }}
              >
                expand_more
              </span>
            </button>

            {showFilters && (
              <div className="px-4 pb-4 space-y-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Medium */}
                <div className="space-y-1.5">
                  <h5 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">
                    Instruction Medium
                  </h5>
                  <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60">
                    {languageOptions.map((opt) => (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        active={languageFilter === opt.value}
                        onClick={() => setLanguageFilter(opt.value)}
                        variant="subtle"
                        color="neutral"
                        size="sm"
                      />
                    ))}
                  </div>
                </div>

                {/* Board */}
                <div className="space-y-1.5">
                  <h5 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">
                    Educational Board
                  </h5>
                  <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60">
                    {boardOptions.map((opt) => (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        active={boardFilter === opt.value}
                        onClick={() => setBoardFilter(opt.value)}
                        variant="subtle"
                        color="neutral"
                        size="sm"
                      />
                    ))}
                  </div>
                </div>

                {/* Class */}
                <div className="space-y-1.5">
                  <h5 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">
                    Grade Level
                  </h5>
                  <div className="relative">
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2.5 px-4 text-sm focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="">All Classes</option>
                      {classOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[18px]">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* Reset */}
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2.5 border border-border-light dark:border-border-dark rounded-xl text-[9px] font-black uppercase tracking-[0.18em] text-text-secondary hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-800 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px] leading-none">filter_alt_off</span>
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Courses Stack List */}
          <div className="space-y-3 pb-4">
            {filteredCourses.map((course) => {
              const isSelected = tempSelected.some((sc) => sc.course_id === course.course_id);
              return (
                <div
                  key={course.course_id}
                  className={`flex items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-primary/50 bg-primary/5 dark:bg-primary/5 shadow-sm'
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                  onClick={() => toggleCourse(course)}
                >
                  {/* Left radio / checkbox indicator */}
                  <div className="mr-3 shrink-0 flex items-center justify-center">
                    <div
                      className={`size-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary border-primary shadow-md shadow-primary/30 scale-105'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-[11px] text-white leading-none font-bold">
                          check
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Low density Course Card */}
                  <div className="flex-1 min-w-0 pointer-events-none">
                    <CourseCardV2 course={course} density="low" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </MobileBaseLayout.ListSlot>
    </MobileBaseLayout>
  );
};

export default CourseMobileView;
