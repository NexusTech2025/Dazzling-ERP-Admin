import React, { useState, useMemo, useEffect } from 'react';
import CourseCardV2 from './CourseCardV2';
import { Tag, Badge } from '../../../components/ui/v2/indicators';
import { useCourseTypesQuery } from '../hooks/useCourseQueries';
import CourseDesktopView from './dektop/DesktopCourseSelectionModel';
import CourseMobileView from './mobile/MobileCourseSelectionModel';

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

// Reusable active/inactive filter button class helper (design system tokens)
const filterBtnClass = (isActive) =>
  `rounded-xl font-black text-xs py-1.5 px-3 flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${isActive
    ? 'bg-primary text-white shadow-md shadow-primary/25'
    : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
  }`;


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
  const { data: courseTypes = [] } = useCourseTypesQuery();
  const [tempSelected, setTempSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Dynamically map course types to segmentOptions to match database segment IDs (Rule N2)
  const segmentOptions = useMemo(() => {
    return [
      { label: 'All', value: '', icon: 'apps' },
      ...courseTypes.map(type => {
        let icon = 'school';
        const nameLower = type.segment_name?.toLowerCase() || '';
        if (nameLower.includes('computer')) icon = 'computer';
        else if (nameLower.includes('foundation')) icon = 'star';
        else if (nameLower.includes('academic') || type.entity_label === 'Subject') icon = 'menu_book';

        return {
          label: type.segment_name,
          value: type.segment_id,
          icon
        };
      })
    ];
  }, [courseTypes]);

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
    filters: {
      searchQuery,
      segmentFilter,
      languageFilter,
      boardFilter,
      classFilter
    },
    filterSetters: {
      setSearchQuery,
      setSegmentFilter,
      setLanguageFilter,
      setBoardFilter,
      setClassFilter
    },
    segmentOptions,
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
