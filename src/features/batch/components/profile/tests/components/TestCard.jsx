import React from 'react';
import Card from '../../../../../../components/ui/Card';
import Badge from '../../../../../../components/ui/Badge';
import Button from '../../../../../../components/ui/v2/Button';
import { parseISO, format } from 'date-fns';

export default function TestCard({
  test,
  studentsCount = 0,
  onEnterMarks,
  onViewReport,
  onEdit,
  onDelete
}) {
  const getBadgeVariant = (status) => {
    switch (status) {
      case 'Published': return 'success';
      case 'Completed': return 'info';
      case 'Draft': default: return 'default';
    }
  };

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
        <Badge variant={getBadgeVariant(test.status)}>
          {test.status || 'Draft'}
        </Badge>
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
        <div className="flex items-center gap-2">
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
