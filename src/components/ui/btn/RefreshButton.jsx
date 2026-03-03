import React from 'react';

const RefreshButton = ({ isFetching, onRefresh }) => {
  return (
    <button 
      onClick={onRefresh}
      disabled={isFetching}
      className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      title="Refresh Data"
    >
      <span className={`material-symbols-outlined text-lg ${isFetching ? 'animate-spin' : ''}`}>refresh</span>
      <span className="hidden sm:inline">Refresh</span>
    </button>
  );
};

export default RefreshButton;
