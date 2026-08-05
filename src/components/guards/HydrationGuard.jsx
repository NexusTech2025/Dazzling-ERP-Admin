import React from 'react';
import { useErpHydration } from '../../hooks/useErpHydration';
import { useStudentsQuery } from '../../features/student/hooks/useStudentQueries';
import { useEnrollmentsQuery } from '../../features/student/hooks/useEnrollmentQueries';
import { EMPTY_FILTER } from '../../lib/react-query/queryKeys';
import FullScreenSplash from '../ui/v2/loaders/FullScreenSplash';

/**
 * HydrationGuard: App Initialization Guard
 * Sequentially triggers ERP master lookup, hydrated student query (+1s), and enrollment query (+2s).
 */
const HydrationGuard = ({ children }) => {
  // 1. Initial Master Lookup Hydration
  const { isLoading: isErpLoading, isSuccess: isErpSuccess, isError: isErpError, error: erpError } = useErpHydration();

  // 2. Hydrated Students Query (1-second queue delay after master lookup succeeds)
  const { isLoading: isStudentsLoading, isError: isStudentsError, error: studentsError } = useStudentsQuery(
    EMPTY_FILTER,
    { enabled: isErpSuccess, delayMs: 1000 }
  );

  // 3. Hydrated Enrollments Query (2-second queue delay after master lookup succeeds)
  const { isLoading: isEnrollmentsLoading, isError: isEnrollmentsError, error: enrollmentsError } = useEnrollmentsQuery(
    EMPTY_FILTER,
    { enabled: isErpSuccess, delayMs: 2000 }
  );

  const isLoading = isErpLoading || isStudentsLoading || isEnrollmentsLoading;
  const isError = isErpError || isStudentsError || isEnrollmentsError;
  const error = erpError || studentsError || enrollmentsError;

  // 1. Loading State: Show the Splash Screen
  if (isLoading) {
    return <FullScreenSplash message="Syncing your institute data..." />;
  }

  // 2. Error State: Show a recovery/error UI
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-6">
        <div className="max-w-md w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-8 shadow-xl text-center">
          <div className="size-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">error</span>
          </div>
          <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">Initialization Failed</h2>
          <p className="text-text-secondary mb-8">
            {error?.message || "We couldn't load the initial ERP data. Please check your connection and try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // 3. Success State: Render the protected App
  return <>{children}</>;
};

export default HydrationGuard;
