import React, { useState, useMemo, useEffect } from 'react';
import CourseCardV2 from '../CourseCardV2';


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
 * CourseDesktopView - Handles the 2-column sidebar-grid layout for desktop screens.
 */
const CourseDesktopView = ({
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
                                    className={`relative rounded-2xl cursor-pointer transition-all duration-200 ${isSelected
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
                                    <div className={`absolute top-3 right-3 size-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-10 ${isSelected
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



export default CourseDesktopView;
