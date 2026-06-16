import React, { useState, useMemo, useEffect } from 'react';
import CourseCardV2 from './CourseCardV2';
import { Tag, Badge } from '../../../components/ui/v2/indicators';

// --- Filter Options ---
const segmentOptions = [
  { label: 'All', value: '', icon: 'apps' },
  { label: 'Academic', value: 'SEG-ACA', icon: 'menu_book' },
  { label: 'Computer', value: 'SEG-CMP', icon: 'computer' },
  { label: 'Foundation', value: 'SEG-FND', icon: 'foundation' }
];

const languageOptions = [
  { label: 'All', value: '' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'English', value: 'English' }
];

const boardOptions = [
  { label: 'All', value: '' },
  { label: 'CBSE', value: 'CBSE' },
  { label: 'RBSE', value: 'RBSE' },
  { label: 'ICSE', value: 'ICSE' }
];

const classOptions = [...Array(12)].map((_, i) => ({
  label: `Class ${i + 1}`,
  value: String(i + 1)
}));

// Reusable active/inactive filter button class helper (design system tokens)
const filterBtnClass = (isActive) =>
  `rounded-xl font-black text-xs py-1.5 px-3 flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
    isActive
      ? 'bg-primary text-white shadow-md shadow-primary/25'
      : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
  }`;

/**
 * CourseDesktopView - Handles the 2-column sidebar-grid layout for desktop screens.
 */
const CourseDesktopView = ({
  searchQuery,
  setSearchQuery,
  segmentFilter,
  setSegmentFilter,
  languageFilter,
  setLanguageFilter,
  boardFilter,
  setBoardFilter,
  classFilter,
  setClassFilter,
  filteredCourses,
  tempSelected,
  toggleCourse,
  handleResetFilters
}) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar: Filters */}
      <aside className="w-64 shrink-0 border-r border-slate-100 dark:border-slate-800 p-5 space-y-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
        {/* Search */}
        <div className="space-y-2">
          <h4 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">Search</h4>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary dark:text-slate-500 group-focus-within:text-primary transition-colors text-[18px]">search</span>
            <input
              type="text"
              placeholder="ID or course name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 dark:text-white placeholder:text-text-secondary"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <h4 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">Category</h4>
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60">
            {segmentOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSegmentFilter(opt.value)}
                className={filterBtnClass(segmentFilter === opt.value)}
              >
                {opt.icon && (
                  <span className="material-symbols-outlined text-[15px] leading-none">{opt.icon}</span>
                )}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Medium */}
        <div className="space-y-2">
          <h4 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">Instruction Medium</h4>
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60">
            {languageOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLanguageFilter(opt.value)}
                className={filterBtnClass(languageFilter === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Educational Board */}
        <div className="space-y-2">
          <h4 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">Educational Board</h4>
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60">
            {boardOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBoardFilter(opt.value)}
                className={filterBtnClass(boardFilter === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grade Level */}
        <div className="space-y-2">
          <h4 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">Grade Level</h4>
          <div className="relative">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2.5 px-4 text-sm focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 dark:text-white appearance-none cursor-pointer"
            >
              <option value="">All Classes</option>
              {classOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[18px]">unfold_more</span>
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
      </aside>

      {/* Right Content: Course Cards Grid */}
      <main className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900 custom-scrollbar">
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCourses.map((course) => {
              const isSelected = tempSelected.some(sc => sc.course_id === course.course_id);
              return (
                <div
                  key={course.course_id}
                  className={`relative rounded-2xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-primary shadow-lg shadow-primary/15'
                      : 'ring-1 ring-transparent hover:ring-primary/30 hover:shadow-md'
                  }`}
                  onClick={() => toggleCourse(course)}
                >
                  <CourseCardV2
                    course={course}
                    density="medium"
                    className="pointer-events-none !min-h-[100px] !pb-2.5 sm:!pb-3"
                  />
                  <div className={`absolute top-3 right-3 size-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-10 ${
                    isSelected
                      ? 'bg-primary border-primary shadow-md shadow-primary/30 scale-110'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[13px] text-white leading-none">check</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 border border-border-light dark:border-border-dark">
              <span className="material-symbols-outlined text-4xl text-text-secondary dark:text-slate-500">search_off</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">No courses found</h4>
            <p className="text-sm text-text-secondary max-w-xs mx-auto mt-2">
              Nothing matches your search or active filters. Try resetting.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 text-xs font-bold text-primary hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

/**
 * CourseMobileView - Handles the stacked, collapsible-accordion filter layout with Low-Density Cards for mobile.
 */
const CourseMobileView = ({
  searchQuery,
  setSearchQuery,
  segmentFilter,
  setSegmentFilter,
  languageFilter,
  setLanguageFilter,
  boardFilter,
  setBoardFilter,
  classFilter,
  setClassFilter,
  filteredCourses,
  tempSelected,
  toggleCourse,
  handleResetFilters
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-slate-900 p-4 space-y-4 custom-scrollbar">
      {/* Search Input */}
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary dark:text-slate-500 group-focus-within:text-primary transition-colors text-[18px]">search</span>
        <input
          type="text"
          placeholder="Search code or course name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 dark:text-white placeholder:text-text-secondary"
        />
      </div>

      {/* Horizontal Category Segment Pills */}
      <div className="flex overflow-x-auto whitespace-nowrap gap-2 pb-2 scrollbar-none border-b border-slate-100 dark:border-slate-800/60 shrink-0">
        {segmentOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSegmentFilter(opt.value)}
            className={filterBtnClass(segmentFilter === opt.value)}
          >
            {opt.icon && (
              <span className="material-symbols-outlined text-[15px] leading-none">{opt.icon}</span>
            )}
            {opt.label}
          </button>
        ))}
      </div>

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
          <span className="material-symbols-outlined text-base transition-transform duration-200" style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }}>
            expand_more
          </span>
        </button>

        {showFilters && (
          <div className="px-4 pb-4 space-y-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Medium */}
            <div className="space-y-1.5">
              <h5 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">Instruction Medium</h5>
              <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60">
                {languageOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLanguageFilter(opt.value)}
                    className={filterBtnClass(languageFilter === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Board */}
            <div className="space-y-1.5">
              <h5 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">Educational Board</h5>
              <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60">
                {boardOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBoardFilter(opt.value)}
                    className={filterBtnClass(boardFilter === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Class */}
            <div className="space-y-1.5">
              <h5 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">Grade Level</h5>
              <div className="relative">
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2.5 px-4 text-sm focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="">All Classes</option>
                  {classOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[18px]">unfold_more</span>
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
      <div className="flex-1 space-y-3">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => {
            const isSelected = tempSelected.some(sc => sc.course_id === course.course_id);
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
                  <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary border-primary shadow-md shadow-primary/30 scale-105'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[11px] text-white leading-none font-bold">check</span>
                    )}
                  </div>
                </div>

                {/* Low density Course Card */}
                <div className="flex-1 min-w-0 pointer-events-none">
                  <CourseCardV2
                    course={course}
                    density="low"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-border-light dark:border-border-dark">
              <span className="material-symbols-outlined text-3xl text-text-secondary dark:text-slate-500">search_off</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No courses found</h4>
            <p className="text-xs text-text-secondary max-w-xs mx-auto mt-1">
              Nothing matches your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * CourseSelectionModal - A premium responsive modal for selecting courses.
 */
const CourseSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedCourses = [],
  availableCourses = [],
  singleSelect = false
}) => {
  const [tempSelected, setTempSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Sync temp state when modal opens
  useEffect(() => {
    if (isOpen) {
      const initial = Array.isArray(selectedCourses)
        ? selectedCourses
        : (selectedCourses ? [selectedCourses] : []);
      setTempSelected(initial);
    }
  }, [isOpen, selectedCourses]);

  // --- Filter Logic ---
  const filteredCourses = useMemo(() => {
    return availableCourses.filter(c => {
      const name = c.name || '';
      const id = c.course_id || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSegment = !segmentFilter || c.segment_id === segmentFilter;
      const matchesBoard = !boardFilter || c.metadata?.board === boardFilter;
      const matchesClass = !classFilter || String(c.metadata?.class) === classFilter;
      const matchesLanguage = !languageFilter || c.language_medium === languageFilter;

      return matchesSearch && matchesSegment && matchesBoard && matchesClass && matchesLanguage;
    });
  }, [availableCourses, searchQuery, segmentFilter, boardFilter, classFilter, languageFilter]);

  if (!isOpen) return null;

  const toggleCourse = (course) => {
    if (singleSelect) {
      setTempSelected([course]);
      return;
    }
    const isAlreadySelected = tempSelected.find(sc => sc.course_id === course.course_id);
    if (isAlreadySelected) {
      setTempSelected(prev => prev.filter(sc => sc.course_id !== course.course_id));
    } else {
      setTempSelected(prev => [...prev, course]);
    }
  };

  const handleConfirm = () => {
    onSelect(singleSelect ? (tempSelected[0] || null) : tempSelected);
    onClose();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSegmentFilter('');
    setLanguageFilter('');
    setBoardFilter('');
    setClassFilter('');
  };

  const desktopProps = {
    searchQuery,
    setSearchQuery,
    segmentFilter,
    setSegmentFilter,
    languageFilter,
    setLanguageFilter,
    boardFilter,
    setBoardFilter,
    classFilter,
    setClassFilter,
    filteredCourses,
    tempSelected,
    toggleCourse,
    handleResetFilters
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 w-full h-[100dvh] sm:h-[85vh] md:max-w-[calc(100%-4rem)] rounded-none sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">
              {singleSelect ? 'Select Course' : 'Course Catalog'}
            </h3>
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1.5 leading-tight">
              {singleSelect
                ? 'Choose a course from the directory to assign to batch'
                : 'Build your package by selecting items below'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-lg leading-none">close</span>
          </button>
        </div>

        {/* Main Body - Conditional Viewports */}
        {/* Desktop View */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          <CourseDesktopView {...desktopProps} />
        </div>

        {/* Mobile View */}
        <div className="flex md:hidden flex-1 overflow-hidden">
          <CourseMobileView {...desktopProps} />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 z-10 shrink-0 sticky bottom-0">
          {/* Left: Selected count + avatar stack */}
          <div className="flex items-center gap-4">
            {tempSelected.length > 0 && (
              <div className="flex -space-x-3 overflow-hidden">
                {tempSelected.slice(0, 5).map((c, i) => (
                  <div
                    key={i}
                    className="inline-flex size-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-primary/10 text-primary items-center justify-center font-black text-[9px] border border-primary/20 shadow-sm shrink-0"
                    title={c.name}
                  >
                    {c.short_code?.substring(0, 2) || (c.name ? c.name.substring(0, 2).toUpperCase() : '??')}
                  </div>
                ))}
                {tempSelected.length > 5 && (
                  <div className="inline-flex size-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 text-text-secondary items-center justify-center font-black text-[9px] border border-border-light dark:border-border-dark shrink-0">
                    +{tempSelected.length - 5}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
                {singleSelect ? 'Selection Status' : 'Bundle Configuration'}
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Badge
                  variant="count"
                  color={tempSelected.length > 0 ? 'success' : 'neutral'}
                  content={tempSelected.length}
                  size="sm"
                />
                {singleSelect ? 'Course Selected' : `${tempSelected.length === 1 ? 'Course' : 'Courses'} Selected`}
                {singleSelect && tempSelected[0] && (
                  <span className="text-xs font-semibold text-text-secondary">
                    : {tempSelected[0].name} ({tempSelected[0].short_code || tempSelected[0].course_id})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 items-center justify-end">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold text-text-secondary dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-8 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-primary/25 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 border border-primary-dark/20"
            >
              <span className="material-symbols-outlined text-base leading-none">
                {singleSelect ? 'check_circle' : 'auto_awesome_motion'}
              </span>
              {singleSelect ? 'Confirm Selection' : 'Update Bundle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSelectionModal;
