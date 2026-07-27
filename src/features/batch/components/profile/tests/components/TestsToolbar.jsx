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
  isRefreshing = false
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
        <div className="w-full sm:w-72">
          <TextInput
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search test by title..."
            startIcon="search"
          />
        </div>
        <div className="w-full sm:w-48">
          <SelectInput
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
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
