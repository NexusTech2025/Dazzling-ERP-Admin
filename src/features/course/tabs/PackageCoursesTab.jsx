import React, { memo } from 'react';
import { Link } from 'react-router-dom';

/**
 * PackageCoursesTab Component - Renders courses included in this package bundle.
 * Supports layout adaptation via the isMobile prop.
 */
export const PackageCoursesTab = ({ courses = [], isMobile = false }) => {
  if (courses.length === 0) {
    return (
      <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-2xl border border-border-light dark:border-border-dark shadow-sm text-center flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-text-secondary/30 mb-3">list_alt</span>
        <p className="text-text-secondary font-medium text-sm">No courses included in this package.</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-2 animate-in fade-in duration-200">
        {courses.map((item) => {
          const course = item.course;
          if (!course) {
            return (
              <div 
                key={item.item_id} 
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex items-center justify-between min-h-[52px]"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-rose-500 truncate">Unresolved Course</h4>
                  <p className="text-[10px] text-text-secondary mt-0.5">{item.entity_id}</p>
                </div>
              </div>
            );
          }
          return (
            <Link
              key={item.item_id}
              to={`/admin/courses/${item.entity_id}`}
              className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex items-center justify-between min-h-[52px] active:bg-slate-50 dark:active:bg-slate-800 transition-all block"
            >
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-text-main dark:text-white truncate">{course.name}</h4>
                <p className="text-[10px] text-text-secondary mt-0.5 uppercase font-medium">
                  {course.short_code} • {course.duration_value} {course.duration_unit || 'Months'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-secondary font-mono">₹{course.base_fee?.toLocaleString()}</span>
                <span className="material-symbols-outlined text-slate-300 text-lg shrink-0">chevron_right</span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  // Desktop view layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {courses.map((item) => {
        const course = item.course;
        if (!course) {
          return (
            <div key={item.item_id} className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-text-secondary">{item.item_id}</span>
                <span className="text-[9px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded uppercase tracking-wider">{item.entity_type}</span>
              </div>
              <h4 className="font-black text-text-main dark:text-white mb-2 text-base">Unresolved: {item.entity_id}</h4>
            </div>
          );
        }
        return (
          <Link
            key={item.item_id}
            to={`/admin/courses/${item.entity_id}`}
            className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark hover:border-primary transition-all group shadow-sm active:scale-95 block"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-text-secondary">{item.item_id}</span>
                <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-text-secondary uppercase tracking-widest">{course.short_code}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider">{item.entity_type}</span>
                <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors text-lg">open_in_new</span>
              </div>
            </div>
            <h4 className="font-black text-text-main dark:text-white mb-2 text-lg group-hover:text-primary transition-colors">{course.name}</h4>
            <p className="text-sm text-text-secondary font-medium mb-6 line-clamp-2">{course.description || 'No description provided.'}</p>
            <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark pt-5">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-sm">payments</span>
                </div>
                <span className="text-[11px] font-bold text-text-secondary">Fee: ₹{course.base_fee?.toLocaleString()}</span>
              </div>
              <span className="text-[10px] font-black text-primary group-hover:underline">Deep Dive Details →</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default memo(PackageCoursesTab);
