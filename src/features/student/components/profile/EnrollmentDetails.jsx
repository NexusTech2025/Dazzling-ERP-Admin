import React from 'react';
import { parseISO, format, isValid } from 'date-fns';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import { enrollmentRepo } from '../../utils/enrollmentCacheHelper';

/**
 * Safely formats date string using date-fns parseISO.
 */
function safeFormatDate(dateStr, formatPattern = 'MMM d, yyyy') {
  if (!dateStr) return 'N/A';
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return 'N/A';
    return format(parsed, formatPattern);
  } catch {
    return 'N/A';
  }
}

/**
 * Extracts fee summary for a single enrollment item.
 */
function extractEnrollmentFeeSummary(enr) {
  const enrId = enr.enrollment_id || enr.id;
  const repoEnr = enrollmentRepo.getByEnrollmentId(enrId);
  const feeAccounts = (enr.studentfeeaccounts && enr.studentfeeaccounts.length > 0)
    ? enr.studentfeeaccounts
    : (enr.StudentFeeAccount && enr.StudentFeeAccount.length > 0)
      ? enr.StudentFeeAccount
      : (repoEnr?.studentfeeaccounts || repoEnr?.StudentFeeAccount || []);

  if (!Array.isArray(feeAccounts) || feeAccounts.length === 0) {
    return null;
  }

  let totalDue = 0;
  feeAccounts.forEach((acc) => {
    totalDue += Number(acc.balance_due || 0);
  });

  return {
    totalDue,
    isPaid: totalDue === 0,
    label: totalDue === 0 ? 'Paid in Full' : `₹${totalDue.toLocaleString()} Due`
  };
}

const EnrollmentDetails = ({ enrollments = [], allocations = [] }) => {
  const activeCount = enrollments.filter(e => (e.status || '').toLowerCase() === 'active').length;

  return (
    <Card className="p-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-text-main dark:text-white text-xl font-bold">Enrollment History</h3>
          <Badge variant="primary">{activeCount || enrollments.length || 0} Active Enrollments</Badge>
        </div>

        <div className="space-y-4">
          {enrollments?.length > 0 ? (
            enrollments.map((enr, idx) => {
              const enrId = enr.enrollment_id || enr.id || `ENR-${idx}`;
              const feeSummary = extractEnrollmentFeeSummary(enr);
              const enrAllocations = enr.allocations || allocations.filter(a => a.enrollment_id === enrId);

              return (
                <div
                  key={enrId}
                  className="group flex flex-col p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark hover:border-primary/30 transition-all space-y-4"
                >
                  {/* Top Enrollment Header Block */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <span className="material-symbols-outlined">auto_stories</span>
                      </div>
                      <div>
                        <p className="font-bold text-text-main dark:text-white text-base">
                          {enr.course_name || enr.enrollment_type || 'Active Enrollment'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-text-secondary font-medium">
                          <span>ID: {enrId}</span>
                          <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <span>Enrolled: {safeFormatDate(enr.enrollment_date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {feeSummary && (
                        <Badge variant={feeSummary.isPaid ? 'success' : 'warning'}>
                          {feeSummary.label}
                        </Badge>
                      )}
                      <Badge variant={(enr.status || '').toLowerCase() === 'active' ? 'success' : 'default'}>
                        {(enr.status || 'ACTIVE').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Sub-allocations linked to this enrollment */}
                  {enrAllocations.length > 0 && (
                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Assigned Allocations
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {enrAllocations.map((alloc, aIdx) => (
                          <div
                            key={alloc.allocation_id || aIdx}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="material-symbols-outlined text-indigo-500 text-sm shrink-0">menu_book</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                                {alloc.course_name || alloc.courseId || 'Course'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="material-symbols-outlined text-blue-500 text-sm shrink-0">groups</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                                {alloc.batch_name || alloc.batchId || 'Batch'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-xl">
              <span className="material-symbols-outlined text-text-secondary/20 text-4xl mb-2">history_edu</span>
              <p className="text-sm text-text-secondary italic">No active enrollments found for this student.</p>
            </div>
          )}
        </div>
      </div>

      {/* Course & Batch Allocations Global Section */}
      {allocations && allocations.length > 0 && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-text-main dark:text-white text-lg font-bold">Assigned Courses & Batches Overview</h4>
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

                <Badge variant={(alloc.status || '').toLowerCase() === 'active' ? 'success' : 'default'} className="shrink-0 scale-90">
                  {(alloc.status || 'ACTIVE').toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default EnrollmentDetails;
