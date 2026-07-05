import React from 'react';

/**
 * DescriptionSection component grouping KeyValuePair components into card-based read-only grids.
 * @param {Object} props - Component properties.
 * @param {string} props.title - Section title.
 * @param {string} [props.icon] - Optional Material symbol icon name.
 * @param {React.ReactNode} props.children - KeyValuePair elements.
 * @param {function} [props.onActionClick] - Optional callback triggered on action button click.
 * @param {string} [props.actionLabel="Edit"] - Label for action button (e.g. "Edit").
 * @returns {React.ReactElement} Section container card with grid children.
 */
export default function DescriptionSection({ title, icon, children, onActionClick, actionLabel = 'Edit' }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>
          )}
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {title}
          </h3>
        </div>
        {onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {actionLabel}
          </button>
        )}
      </div>

      {/* High-Density Grid Content Body */}
      {/* - Changed 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' to 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4' to lock mobile baseline to 2 columns.
          - Set 'sm:grid-cols-2' and 'md:grid-cols-4' to scale beautifully on wider devices.
          - Adjusted 'gap-x-4' and 'gap-y-4' to prevent column overlap on small viewports.
          - Added 'break-words' and 'min-w-0' for text wrapping overflow safety.
      */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 break-words min-w-0 font-sans">
        {children}
      </div>
    </div>
  );
}
