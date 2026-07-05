import React, { memo } from 'react';
import Badge from '../../../components/ui/Badge';

/**
 * PackageEnrollmentsTab Component - Renders enrolled student profiles.
 * Supports layout adaptation via the isMobile prop.
 */
export const PackageEnrollmentsTab = ({ 
  enrollments = [], 
  isLoading = false, 
  isMobile = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-background-light dark:bg-background-dark rounded-2xl p-6 border border-border-light dark:border-border-dark animate-pulse">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-text-secondary">
        <span className="material-symbols-outlined text-5xl opacity-30">person_search</span>
        <p className="font-black text-lg">No Enrollments Yet</p>
        <p className="text-sm font-medium opacity-70">Students enrolled in this package will appear here.</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-2 animate-in fade-in duration-200">
        {enrollments.map((enrollment) => {
          const student = enrollment.student;
          const initials = student?.student_name
            ? student.student_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            : '?';
          return (
            <div 
              key={enrollment.enrollment_id} 
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-border-light dark:border-border-dark shadow-sm active:bg-slate-50 dark:active:bg-slate-800 transition-all min-h-[52px]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary/5 text-primary text-xs font-black flex items-center justify-center border border-primary/10 select-none shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-text-main dark:text-white truncate">{student?.student_name || 'Unknown Student'}</h4>
                  <p className="text-[10px] text-text-secondary truncate mt-0.5">{student?.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  enrollment.status?.toLowerCase() === 'active' 
                    ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {enrollment.status}
                </span>
                <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop view layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
      {enrollments.map((enrollment) => {
        const student = enrollment.student;
        const initials = student?.student_name
          ? student.student_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          : '?';
        const enrollDate = enrollment.enrollment_date
          ? new Date(enrollment.enrollment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—';
        return (
          <div
            key={enrollment.enrollment_id}
            className="bg-background-light dark:bg-background-dark rounded-2xl p-6 border border-border-light dark:border-border-dark hover:border-primary/40 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-text-main dark:text-white truncate">{student?.student_name || 'Unknown Student'}</p>
                <p className="text-xs text-text-secondary font-medium truncate">{student?.email || '—'}</p>
              </div>
              <Badge variant={enrollment.status === 'active' ? 'success' : enrollment.status === 'completed' ? 'info' : 'warning'}>
                {enrollment.status}
              </Badge>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-text-secondary font-medium border-t border-border-light dark:border-border-dark pt-4">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                {enrollDate}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">tag</span>
                {enrollment.enrollment_id}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(PackageEnrollmentsTab);
