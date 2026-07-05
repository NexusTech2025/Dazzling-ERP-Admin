import React, { memo } from 'react';

/**
 * PackagesTab Component - Renders connected course packages.
 * Supports isMobile layout variant.
 */
export const PackagesTab = ({ connectedPackages = [], isPackagesLoading, isMobile = false }) => {
  if (isPackagesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
      </div>
    );
  }

  if (connectedPackages.length === 0) {
    return (
      <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-2xl border border-border-light dark:border-border-dark shadow-sm text-center flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-text-secondary/30 mb-3">inventory_2</span>
        <p className="text-text-secondary font-medium text-sm">No connected packages found for this course.</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-2 animate-in fade-in duration-200">
        {connectedPackages.map(pkg => {
          return (
            <div 
              key={pkg.package_id} 
              className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex items-center justify-between min-h-[52px]"
            >
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-text-main dark:text-white truncate">{pkg.name}</h4>
                <p className="text-[10px] text-text-secondary mt-0.5 uppercase font-medium">{pkg.month} Months • Class {pkg.target_class || 'N/A'}</p>
              </div>
              <span className="text-xs font-black text-secondary font-mono ml-2 shrink-0">₹{Number(pkg.package_fee).toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
      {connectedPackages.map(pkg => {
        const statusColors = {
          active: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50',
          inactive: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50',
          draft: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50'
        };
        const statusStyle = statusColors[pkg.status?.toLowerCase()] || 'bg-gray-50 dark:bg-gray-800 text-text-secondary border-border-light dark:border-border-dark';

        return (
          <div 
            key={pkg.package_id} 
            className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark hover:border-primary/20 transition-all duration-300 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start gap-4 mb-2">
                <h4 className="font-bold text-text-main dark:text-white text-base truncate">{pkg.name}</h4>
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${statusStyle}`}>
                  {pkg.status}
                </span>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2 mb-4">{pkg.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border-light dark:border-border-dark text-xs">
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Target Class</p>
                <p className="font-bold text-text-main dark:text-white mt-0.5 truncate">{pkg.target_class || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Duration</p>
                <p className="font-bold text-text-main dark:text-white mt-0.5">{pkg.month} Months</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Package Fee</p>
                <p className="font-bold text-primary mt-0.5">₹{Number(pkg.package_fee).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(PackagesTab);
