import React, { memo } from 'react';
import Badge from '../../../components/ui/Badge';
import PackageEnrollmentCard from '../components/PackageEnrollmentCard';

/**
 * Skeleton Loader Component for Package Enrollments
 */
export const EnrollmentsLoadingSkeleton = memo(() => (
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
));

EnrollmentsLoadingSkeleton.displayName = 'EnrollmentsLoadingSkeleton';

/**
 * Empty State Component for Package Enrollments
 */
export const EnrollmentsEmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-text-secondary">
    <span className="material-symbols-outlined text-5xl opacity-30">person_search</span>
    <p className="font-black text-lg">No Enrollments Yet</p>
    <p className="text-sm font-medium opacity-70">Students enrolled in this package will appear here.</p>
  </div>
));

EnrollmentsEmptyState.displayName = 'EnrollmentsEmptyState';

/**
 * PackageEnrollmentsTab Component - Renders enrolled student profiles using PackageEnrollmentCard.
 * Supports layout adaptation via the isMobile prop.
 */
export const PackageEnrollmentsTab = ({ 
  enrollments = [], 
  isLoading = false, 
  isMobile = false 
}) => {
  if (isLoading) {
    return <EnrollmentsLoadingSkeleton />;
  }

  if (enrollments.length === 0) {
    return <EnrollmentsEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 animate-in fade-in duration-300">
      {enrollments.map((enrollment) => (
        <PackageEnrollmentCard
          key={enrollment.enrollment_id || enrollment.id}
          enrollment={enrollment}
        />
      ))}
    </div>
  );
};

export default memo(PackageEnrollmentsTab);
