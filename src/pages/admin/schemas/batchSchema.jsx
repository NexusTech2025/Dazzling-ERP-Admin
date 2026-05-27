import React from 'react';
import { BadgeCell, ActionCell } from '../../../components/ui/table/cells';

/**
 * Creates the column schema for the Batch table.
 */
export const createBatchColumns = ({ onView, onEdit, onDelete, isDeleting } = {}) => {
  return [
    {
      header: 'Batch Name',
      accessor: 'batch_name',
      className: 'font-medium text-slate-900 dark:text-slate-100'
    },
    {
      header: 'Course',
      accessor: 'course_name'
    },
    {
      header: 'Teacher',
      accessor: 'teacher_name'
    },
    {
      header: 'Days',
      render: (batch) => {
        const hasDays = batch.schedule?.days_of_week?.length > 0;
        return (
          <span className="text-slate-600 dark:text-slate-400">
            {hasDays ? batch.schedule.days_of_week.join(', ') : 'TBD'}
          </span>
        );
      }
    },
    {
      header: 'Timing',
      render: (batch) => {
        const hasTime = batch.schedule?.start_time && batch.schedule?.end_time;
        return (
          <span className="text-slate-600 dark:text-slate-400">
            {hasTime ? `${batch.schedule.start_time} - ${batch.schedule.end_time}` : 'TBD'}
          </span>
        );
      }
    },
    {
      header: 'Capacity',
      render: (batch) => {
        const capacity = batch.capacity || 0;
        return (
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {capacity} Seats
          </span>
        );
      }
    },
    {
      header: 'Status',
      align: 'center',
      render: (batch) => <BadgeCell status={batch.status} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (batch) => (
        <ActionCell 
          onView={onView ? () => onView(batch) : null}
          onEdit={onEdit ? () => onEdit(batch) : null}
          onDelete={onDelete ? () => onDelete(batch.batch_id, batch.batch_name) : null}
          isDeleting={isDeleting}
        />
      )
    }
  ];
};
