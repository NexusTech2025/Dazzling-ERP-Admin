import React from 'react';
import TextInput from '../../../../../../components/ui/v2/TextInput';
import SelectInput from '../../../../../../components/ui/v2/SelectInput';
import Button from '../../../../../../components/ui/v2/Button';
import RefreshButton from '../../../../../../components/ui/btn/RefreshButton';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
  { value: 'Completed', label: 'Completed' },
];

export default function TestsToolbar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onCreateClick,
  onRefresh,
  isRefreshing = false,
  viewMode = 'list',
  onViewModeChange
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
        {/* View Switcher Toggle */}
        {onViewModeChange && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-border-light dark:border-border-dark text-xs font-semibold w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-main dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              Tests List
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('marksheet')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'marksheet'
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-main dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_on</span>
              Consolidated Marksheet
            </button>
          </div>
        )}

        {viewMode === 'list' && (
          <>
            <div className="w-full sm:w-64">
              <TextInput
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search test by title..."
                startIcon="search"
              />
            </div>
            <div className="w-full sm:w-44">
              <SelectInput
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                options={STATUS_OPTIONS}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <RefreshButton
          isFetching={isRefreshing}
          onRefresh={onRefresh}
        />

        <Button
          variant="contained"
          startIcon="add"
          onClick={onCreateClick}
          className="flex-1 sm:flex-none"
        >
          Create New Test
        </Button>
      </div>
    </div>
  );
}
