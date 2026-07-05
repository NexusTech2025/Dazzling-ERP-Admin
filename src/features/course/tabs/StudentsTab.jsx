import React, { memo } from 'react';

/**
 * StudentsTab Component - Renders enrolled student profiles.
 * Supports isMobile layout variant.
 */
export const StudentsTab = ({ allocations = [], isAllocationsLoading, isMobile = false }) => {
  if (isAllocationsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-2xl border border-border-light dark:border-border-dark shadow-sm text-center flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-text-secondary/30 mb-3">group</span>
        <p className="text-text-secondary font-medium text-sm">No students enrolled in this course yet.</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-2 animate-in fade-in duration-200">
        {allocations.map((alloc) => {
          const student = alloc.student || {};
          const initials = (student.student_name || 'N A')
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
          return (
            <div 
              key={alloc.allocation_id} 
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-border-light dark:border-border-dark shadow-sm active:bg-slate-50 dark:active:bg-slate-800 transition-all min-h-[52px]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary/5 text-primary text-xs font-black flex items-center justify-center border border-primary/10 select-none">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-text-main dark:text-white truncate">{student.student_name || 'N/A'}</h4>
                  <p className="text-[10px] text-text-secondary truncate mt-0.5">{alloc.batch?.batch_name || 'No Batch'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  alloc.status?.toLowerCase() === 'active' 
                    ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {alloc.status || 'Active'}
                </span>
                <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
      {allocations.map(alloc => {
        const student = alloc.student || {};
        const batch = alloc.batch || {};
        const initials = (student.student_name || 'N A')
          .split(' ')
          .map(n => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        const statusColors = {
          active: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50',
          suspended: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50',
          completed: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
          dropped: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50'
        };

        const statusStyle = statusColors[alloc.status?.toLowerCase()] || 'bg-gray-50 dark:bg-gray-800 text-text-secondary border-border-light dark:border-border-dark';

        return (
          <div 
            key={alloc.allocation_id} 
            className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark hover:border-primary/20 transition-all duration-300 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.student_name} className="w-12 h-12 rounded-full object-cover border border-border-light dark:border-border-dark" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/5 text-primary text-sm font-black flex items-center justify-center border border-primary/10">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-text-main dark:text-white truncate">{student.student_name || 'N/A'}</h4>
                <p className="text-xs text-text-secondary truncate mt-0.5">{student.email || 'No email'}</p>
                <p className="text-xs text-text-secondary mt-0.5">{student.phone || 'No phone'}</p>
              </div>
              <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${statusStyle}`}>
                {alloc.status || 'Active'}
              </span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Assigned Batch</p>
                <p className="font-bold text-text-main dark:text-white truncate mt-0.5">{batch.batch_name || 'No Batch'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Enrolled On</p>
                <p className="font-bold text-text-main dark:text-white mt-0.5">
                  {alloc.assigned_at ? new Date(alloc.assigned_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(StudentsTab);
