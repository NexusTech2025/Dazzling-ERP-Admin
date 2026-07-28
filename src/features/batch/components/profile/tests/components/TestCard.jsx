import React from 'react';
import Card from '../../../../../../components/ui/Card';
import Badge from '../../../../../../components/ui/Badge';
import Button from '../../../../../../components/ui/v2/Button';
import { parseISO, format } from 'date-fns';

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft', variant: 'default' },
  { value: 'Published', label: 'Published', variant: 'success' },
  { value: 'Completed', label: 'Completed', variant: 'info' }
];

function TestStatusDropdown({ test, onStatusChange }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const currentStatus = test.status || 'Draft';

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'Published': return 'success';
      case 'Completed': return 'info';
      case 'Draft': default: return 'default';
    }
  };

  const handleSelectStatus = async (newStatus) => {
    if (newStatus === currentStatus || isUpdating) {
      setIsOpen(false);
      return;
    }
    setIsOpen(false);
    setIsUpdating(true);
    try {
      if (onStatusChange) {
        await onStatusChange(test.id || test.test_id, newStatus);
      }
    } catch (err) {
      console.error('[TestStatusDropdown] Failed to update test status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 focus:outline-none transition-all ${
          isUpdating ? 'opacity-70 pointer-events-none' : 'hover:scale-105'
        }`}
      >
        <Badge variant={getBadgeVariant(currentStatus)} className="cursor-pointer flex items-center gap-1">
          {isUpdating ? (
            <>
              <span className="material-symbols-outlined text-[13px] animate-spin">progress_activity</span>
              <span>Updating...</span>
            </>
          ) : (
            <>
              <span>{currentStatus}</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </>
          )}
        </Badge>
      </button>

      {isOpen && !isUpdating && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark shadow-lg z-40 py-1 text-xs font-semibold animate-in fade-in duration-150">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelectStatus(opt.value)}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors ${
                  currentStatus === opt.value ? 'text-primary font-bold' : 'text-text-main dark:text-white'
                }`}
              >
                <span>{opt.label}</span>
                {currentStatus === opt.value && (
                  <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function TestCard({
  test,
  studentsCount = 0,
  onEnterMarks,
  onViewReport,
  onShareWhatsApp,
  onEdit,
  onDelete,
  onStatusChange
}) {
  const formattedDate = React.useMemo(() => {
    if (!test.test_date) return 'N/A';
    try {
      return format(parseISO(test.test_date), 'dd MMM yyyy');
    } catch {
      return test.test_date;
    }
  }, [test.test_date]);

  return (
    <Card variant="default" className="transition-all hover:border-primary/40">
      <Card.Header border={true} className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-text-main dark:text-white">
            {test.title}
          </h4>
          {test.remarks && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-1">
              {test.remarks}
            </p>
          )}
        </div>
        <TestStatusDropdown
          test={test}
          onStatusChange={onStatusChange}
        />
      </Card.Header>

      <Card.Body className="py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-xs text-text-secondary block">Test Date</span>
            <span className="font-semibold text-text-main dark:text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
              {formattedDate}
            </span>
          </div>

          <div>
            <span className="text-xs text-text-secondary block">Total Marks</span>
            <span className="font-semibold text-text-main dark:text-white">
              {test.total_marks || 0} Marks
            </span>
          </div>

          <div>
            <span className="text-xs text-text-secondary block">Passing Marks</span>
            <span className="font-semibold text-text-main dark:text-white">
              {test.passing_marks || 0} Marks
            </span>
          </div>

          <div>
            <span className="text-xs text-text-secondary block">Students</span>
            <span className="font-semibold text-text-main dark:text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-text-secondary">groups</span>
              {studentsCount}
            </span>
          </div>
        </div>
      </Card.Body>

      <Card.Footer bg={true} className="flex flex-wrap items-center justify-between gap-2 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="contained"
            size="sm"
            startIcon="edit_note"
            onClick={() => onEnterMarks(test)}
          >
            {test.status === 'Published' ? 'View / Edit Marks' : 'Enter Marks'}
          </Button>

          <Button
            variant="outlined"
            size="sm"
            startIcon="analytics"
            onClick={() => onViewReport(test)}
          >
            View Report
          </Button>

          {onShareWhatsApp && (
            <Button
              variant="outlined"
              size="sm"
              startIcon="chat"
              onClick={() => onShareWhatsApp(test)}
              className="!text-emerald-600 !border-emerald-500/30 hover:!bg-emerald-500/10"
            >
              Share
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="text"
            size="sm"
            startIcon="edit"
            onClick={() => onEdit(test)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            startIcon="delete"
            onClick={() => onDelete(test)}
          >
            Delete
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
}
