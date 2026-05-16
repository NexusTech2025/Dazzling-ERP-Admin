import React from 'react';
import { useErpHydration } from '../../hooks/useErpHydration';
import FullScreenSplash from '../ui/v2/loaders/FullScreenSplash';

/**
 * HydrationGuard: Strategy 1 - App Initialization Guard
 * Blocks rendering of protected routes until critical ERP data is cached.
 */
const HydrationGuard = ({ children }) => {
  const { isLoading, isError, error } = useErpHydration();

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
