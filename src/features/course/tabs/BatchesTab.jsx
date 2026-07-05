import React, { memo } from 'react';

/**
 * BatchesTab Component - Renders assigned batches list.
 * Supports isMobile layout variant.
 */
export const BatchesTab = ({ 
  batches = [], 
  isBatchesLoading, 
  statusColors = {}, 
  onUnassignBatch, 
  onDeleteBatch, 
  isUpdatePending, 
  isDeletePending,
  isMobile = false
}) => {
  if (isBatchesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-2xl border border-border-light dark:border-border-dark shadow-sm text-center flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-text-secondary/30 mb-3">calendar_today</span>
        <p className="text-text-secondary font-medium text-sm">No batches assigned to this course yet.</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-2 animate-in fade-in duration-200">
        {batches.map(batch => {
          const statusStyle = statusColors[batch.status?.toLowerCase()] || 'bg-gray-50 dark:bg-gray-800 text-text-secondary border-border-light dark:border-border-dark';

          return (
            <div 
              key={batch.batch_id} 
              className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex items-center justify-between min-h-[52px]"
            >
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-text-main dark:text-white truncate">{batch.batch_name}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-secondary font-medium uppercase">
                  <span>Cap: {batch.capacity}</span>
                  <span>•</span>
                  <span>{batch.batch_type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${statusStyle} shrink-0`}>
                  {batch.status}
                </span>
                <button
                  type="button"
                  onClick={() => onUnassignBatch(batch.batch_id)}
                  disabled={isUpdatePending}
                  className="p-1 rounded-lg text-text-secondary hover:text-primary transition-all disabled:opacity-50 shrink-0"
                  title="Unassign Batch"
                >
                  <span className="material-symbols-outlined text-base">link_off</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
      {batches.map(batch => {
        const statusStyle = statusColors[batch.status?.toLowerCase()] || 'bg-gray-50 dark:bg-gray-800 text-text-secondary border-border-light dark:border-border-dark';

        return (
          <div 
            key={batch.batch_id} 
            className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark hover:border-primary/20 transition-all duration-300 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start gap-4 mb-2">
                <h4 className="font-bold text-text-main dark:text-white text-base truncate">{batch.batch_name}</h4>
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${statusStyle}`}>
                  {batch.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
                <span className="px-2 py-0.5 bg-background-light dark:bg-background-dark rounded border border-border-light dark:border-border-dark text-[10px] font-bold uppercase">
                  {batch.batch_type}
                </span>
                <span>•</span>
                <span className="truncate">Instructor: {batch.instructor_name || 'N/A'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border-light dark:border-border-dark text-xs mb-4">
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Capacity</p>
                <p className="font-bold text-text-main dark:text-white mt-0.5">{batch.capacity} Students</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Start Date</p>
                <p className="font-bold text-text-main dark:text-white mt-0.5">
                  {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">End Date</p>
                <p className="font-bold text-text-main dark:text-white mt-0.5">
                  {batch.end_date ? new Date(batch.end_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-dashed border-border-light dark:border-border-dark">
              <button
                type="button"
                onClick={() => onUnassignBatch(batch.batch_id)}
                disabled={isUpdatePending}
                className="px-3 py-1.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary/30 rounded-lg text-xs font-bold text-text-secondary hover:text-primary transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50"
                title="Remove connection between batch and this course without deleting the batch"
              >
                <span className="material-symbols-outlined text-[15px]">link_off</span>
                Unassign
              </button>
              <button
                type="button"
                onClick={() => onDeleteBatch(batch.batch_id)}
                disabled={isDeletePending}
                className="px-3 py-1.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/30 rounded-lg text-xs font-bold text-red-700 dark:text-red-400 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50"
                title="Permanently delete this batch"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(BatchesTab);
