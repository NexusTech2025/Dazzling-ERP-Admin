import React from 'react';
import Button from '../../../../../../components/ui/v2/Button';
import Badge from '../../../../../../components/ui/Badge';
import RefreshButton from '../../../../../../components/ui/btn/RefreshButton';

export default function MarksEntryHeader({
  test,
  batch,
  onBack,
  onSave,
  onRefresh,
  isRefreshing = false,
  isSaving = false
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="outlined"
          size="sm"
          startIcon="arrow_back"
          onClick={onBack}
        >
          Back to Tests
        </Button>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-text-main dark:text-white">
              {test.title}
            </h3>
            <Badge variant={test.status === 'Published' ? 'success' : 'default'}>
              {test.status || 'Draft'}
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Batch: <span className="font-semibold text-text-main dark:text-white">{batch?.batch_name || 'N/A'}</span> • Max Marks: <span className="font-semibold text-text-main dark:text-white">{test.total_marks}</span> • Passing: <span className="font-semibold text-text-main dark:text-white">{test.passing_marks}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <RefreshButton
          isFetching={isRefreshing}
          onRefresh={onRefresh}
        />

        <Button
          variant="outlined"
          onClick={onBack}
          disabled={isSaving}
        >
          Cancel
        </Button>

        <Button
          variant="success"
          startIcon="save"
          onClick={onSave}
          loading={isSaving}
        >
          Save All Marks
        </Button>
      </div>
    </div>
  );
}
