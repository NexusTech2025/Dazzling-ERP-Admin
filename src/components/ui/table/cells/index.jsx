import React from 'react';

export const ProfileCell = ({ name, subtitle, avatarUrl, fallbackIcon = 'person' }) => (
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        name ? name.charAt(0) : <span className="material-symbols-outlined text-lg">{fallbackIcon}</span>
      )}
    </div>
    <div className="flex flex-col overflow-hidden">
      <span className="font-medium text-text-main dark:text-white truncate" title={name}>{name || 'Unknown'}</span>
      {subtitle && <span className="text-xs text-text-secondary truncate" title={subtitle}>{subtitle}</span>}
    </div>
  </div>
);

export const BadgeCell = ({ status }) => {
  const styles = {
    Active: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-green-600/20',
    'On Hold': 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 ring-yellow-600/20',
    Suspended: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-red-600/20',
    Lead: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-blue-600/20',
    'On Leave': 'bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-500 ring-orange-600/20',
    Retired: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ring-gray-600/20',
  };

  const currentStyle = styles[status] || styles.Active;

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${currentStyle}`}>
      {status || 'Active'}
    </span>
  );
};

export const ActionCell = ({ onView, onEdit, onDelete, isDeleting }) => (
  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
    {onView && (
      <button 
        onClick={onView} 
        className="p-1 hover:text-primary transition-colors" 
        title="View Details"
      >
        <span className="material-symbols-outlined text-xl">visibility</span>
      </button>
    )}
    {onEdit && (
      <button 
        onClick={onEdit} 
        className="p-1 hover:text-primary transition-colors" 
        title="Edit Record"
      >
        <span className="material-symbols-outlined text-xl">edit</span>
      </button>
    )}
    {onDelete && (
      <button 
        disabled={isDeleting}
        onClick={onDelete}
        className="p-1 hover:text-red-600 transition-colors disabled:opacity-50" 
        title="Delete Record"
      >
        <span className="material-symbols-outlined text-xl text-red-400">delete</span>
      </button>
    )}
  </div>
);
