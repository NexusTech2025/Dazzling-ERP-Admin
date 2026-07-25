import React from 'react';
import Button from '../../../../components/ui/v2/Button';
import { useEnrollmentsQuery } from '../../hooks/useEnrollmentQueries';
import FeeAccountCard from './fee/FeeAccountCard';

/**
 * Top-level Student Fee Tab profile view.
 * Fetches hydrated master enrollments and maps each into an expanded fee account card.
 *
 * @param {object} props - Component properties.
 * @param {string} props.studentId - Target student identifier.
 * @returns {JSX.Element} Student Fee Tab layout.
 */
export const StudentFeeTab = ({ studentId }) => {
  const { data: enrollments = [], isLoading, error } = useEnrollmentsQuery(
    studentId ? { student_id: studentId } : null,
    { enabled: !!studentId }
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
        <div className="h-24 bg-slate-100 dark:bg-slate-800/30 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-sm">
        <h4 className="font-bold">Failed to load fee accounts</h4>
        <p className="mt-1 text-xs">{error?.message || 'An unexpected error occurred while querying student enrollments.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Overview Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Fee Accounts
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            All financial fee accounts and installment schedules linked to student enrollments
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="contained"
            size="sm"
            startIcon="add"
            onClick={() => alert('Record Payment clicked...')}
            className="shadow-md shadow-primary/20 rounded-xl text-xs font-bold"
          >
            Record Payment
          </Button>

          <Button
            variant="outlined"
            size="sm"
            startIcon="download"
            onClick={() => alert('Exporting fee statement...')}
            className="rounded-xl text-xs font-bold"
          >
            Export Statement
          </Button>

          <button
            type="button"
            onClick={() => alert('More actions menu...')}
            className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
          >
            <span>More</span>
            <span className="material-symbols-outlined text-base">expand_more</span>
          </button>
        </div>
      </div>

      {/* Enrollment Fee Account List */}
      {enrollments.length > 0 ? (
        <div className="space-y-6">
          {enrollments.map((enrollment, index) => (
            <FeeAccountCard
              key={enrollment.enrollment_id || enrollment.id || index}
              enrollment={enrollment}
              defaultExpanded={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 text-center space-y-3">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700">folder_off</span>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Enrollment Fee Accounts Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              This student does not have any active or completed course/package enrollments registered in the ERP database.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeTab;
