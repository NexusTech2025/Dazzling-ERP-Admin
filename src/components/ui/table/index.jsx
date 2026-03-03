import React from 'react';

export const TableContainer = ({ children, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full text-left text-sm text-text-secondary">
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '' }) => (
  <thead className={`bg-background-light dark:bg-background-dark/50 text-xs uppercase text-text-secondary ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-border-light dark:divide-border-dark ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '' }) => (
  <tr className={`hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors group ${className}`}>
    {children}
  </tr>
);

export const TableHead = ({ children, align = 'left', className = '' }) => {
  const alignmentClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th className={`px-6 py-4 font-semibold ${alignmentClass} ${className}`}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, align = 'left', className = '', colSpan }) => {
  const alignmentClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td colSpan={colSpan} className={`px-6 py-4 ${alignmentClass} ${className}`}>
      {children}
    </td>
  );
};

export const TableLoading = ({ message = "Loading..." }) => (
  <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20">
    <div className="animate-spin size-10 border-4 border-primary border-t-transparent rounded-full"></div>
    <p className="text-text-secondary text-sm font-medium">{message}</p>
  </div>
);

export const TableError = ({ error, onRetry, message = "Failed to load data" }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center py-20">
    <div className="size-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
      <span className="material-symbols-outlined text-3xl">error</span>
    </div>
    <h3 className="text-lg font-bold text-text-main dark:text-white">{message}</h3>
    <p className="text-text-secondary text-sm mt-1 max-w-xs mx-auto">{error?.message || error || 'Unexpected error'}</p>
    {onRetry && (
      <button 
        onClick={onRetry} 
        className="mt-6 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

export const TableEmpty = ({ message = "No records found.", icon = "person_off" }) => (
  <div className="flex flex-col items-center justify-center text-text-secondary py-10">
    <span className="material-symbols-outlined text-5xl mb-2 opacity-20">{icon}</span>
    <p className="font-medium">{message}</p>
  </div>
);
