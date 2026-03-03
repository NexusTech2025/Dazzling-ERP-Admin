import React from 'react';

/**
 * Standardized Loading State
 */
export const LoadingState = ({ message = 'Loading data...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-20 px-4 ${className}`}>
    <div className="relative size-12 mb-4">
      <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    <p className="text-text-secondary font-medium animate-pulse">{message}</p>
  </div>
);

/**
 * Standardized Error State with Retry
 */
export const ErrorState = ({ 
  title = 'Something went wrong', 
  message = 'We encountered an error while fetching the data. Please try again.',
  onRetry,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
    <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
      <span className="material-symbols-outlined text-3xl">error</span>
    </div>
    <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">{title}</h3>
    <p className="text-text-secondary text-sm max-w-md mb-6">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
      >
        <span className="material-symbols-outlined text-lg">refresh</span>
        Retry Now
      </button>
    )}
  </div>
);

/**
 * Standardized Empty State
 */
export const EmptyState = ({ 
  title = 'No records found', 
  message = 'There is no data to display at the moment.',
  icon = 'folder_open',
  action,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-20 px-4 text-center ${className}`}>
    <div className="size-16 bg-background-light dark:bg-background-dark rounded-full flex items-center justify-center text-text-secondary mb-4 border border-border-light dark:border-border-dark">
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </div>
    <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">{title}</h3>
    <p className="text-text-secondary text-sm max-w-md mb-6">{message}</p>
    {action}
  </div>
);

/**
 * Standardized Skeleton for Tables
 */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="w-full animate-pulse">
    <div className="h-10 bg-background-light dark:bg-background-dark rounded-lg mb-4"></div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4 mb-4">
        {[...Array(cols)].map((_, j) => (
          <div key={j} className="h-8 bg-background-light dark:bg-background-dark rounded flex-1"></div>
        ))}
      </div>
    ))}
  </div>
);
