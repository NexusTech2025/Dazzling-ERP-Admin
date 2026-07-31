import React from 'react';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';

const EnrollmentDetails = ({ enrollments, allocations }) => (
  <Card className="p-6 space-y-6">
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-main dark:text-white text-xl font-bold">Enrollment History</h3>
        <Badge variant="primary">{enrollments?.length || 0} Active Enrollments</Badge>
      </div>
      
      <div className="space-y-4">
        {enrollments?.length > 0 ? enrollments.map((enr, idx) => (
          <div 
            key={enr.enrollment_id || idx} 
            className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <span className="material-symbols-outlined">auto_stories</span>
              </div>
              <div>
                <p className="font-bold text-text-main dark:text-white">{enr.course_name || enr.enrollment_type || 'Active Enrollment'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-secondary font-medium">Roll #: {enr.roll_number || 'N/A'}</span>
                  <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <span className="text-xs text-text-secondary font-medium">Enrolled: {enr.enrollment_date ? new Date(enr.enrollment_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <div className="flex flex-col items-end gap-1">
                <Badge variant={enr.status === 'active' ? 'success' : 'default'}>
                  {enr.status?.toUpperCase()}
                </Badge>
                <span className="text-[9px] font-mono text-text-secondary opacity-50 uppercase tracking-tighter">
                  {enr.enrollment_id}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-6 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-xl">
            <span className="material-symbols-outlined text-text-secondary/20 text-4xl mb-2">history_edu</span>
            <p className="text-sm text-text-secondary italic">No active enrollments found for this student.</p>
          </div>
        )}
      </div>
    </div>

    {/* Course & Batch Allocations */}
    {allocations && allocations.length > 0 && (
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-text-main dark:text-white text-lg font-bold">Assigned Courses & Batches</h4>
          <Badge variant="info">{allocations.length} Allocations</Badge>
        </div>
        <div className="space-y-2.5">
          {allocations.map((alloc, idx) => (
            <div
              key={alloc.allocation_id || idx}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">menu_book</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {alloc.course_name || 'Unassigned Course'}
                  </span>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />

              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">groups</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Batch</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {alloc.batch_name || 'Unassigned Batch'}
                  </span>
                </div>
              </div>

              <Badge variant={alloc.status === 'active' ? 'success' : 'default'} className="shrink-0 scale-90">
                {(alloc.status || 'ACTIVE').toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    )}
  </Card>
);

export default EnrollmentDetails;
