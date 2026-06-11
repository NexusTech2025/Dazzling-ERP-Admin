import React from 'react';

/**
 * SelectionActionBar: A floating multi-action bar displayed at the bottom of the screen.
 * Appears when one or more items are selected in list/grid views.
 */
const SelectionActionBar = ({
  selectedCount = 0,
  onClear,
  onDeleteSelected,
  onDeleteAll,
  itemName = 'item',
  className = ''
}) => {
  if (selectedCount === 0) return null;

  return (
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-slate-950/95 border border-slate-800 text-white rounded-3xl shadow-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-[calc(100%-2rem)] max-w-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 ${className}`}
    >
      {/* Left Pane: Selection Summary count and clear button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onClear}
          className="size-8 rounded-full hover:bg-slate-850 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          title="Clear Selection"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
        <div className="flex flex-col">
          <p className="text-sm font-black text-white">
            {selectedCount} {itemName}{selectedCount !== 1 ? 's' : ''} selected
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
            Bulk actions available
          </p>
        </div>
      </div>

      {/* Right Pane: Action Buttons */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {onDeleteAll && (
          <button
            onClick={onDeleteAll}
            type="button"
            className="flex-1 sm:flex-initial px-4 py-2 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
            Delete All
          </button>
        )}
        
        <button
          onClick={onDeleteSelected}
          type="button"
          className="flex-1 sm:flex-initial px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-rose-650/20 hover:shadow-rose-600/40 flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
          Delete Selected ({selectedCount})
        </button>
      </div>
    </div>
  );
};

export default SelectionActionBar;
