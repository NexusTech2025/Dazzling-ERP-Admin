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
      header: 'Schedule',
      render: (batch) => (
        <span className="text-slate-600 dark:text-slate-400">
          {batch.schedule_days}, {batch.schedule_time}
        </span>
      )
    },
    {
      header: 'Capacity',
      render: (batch) => {
        // Mock a current enrollment count for visual purposes, or use 0
        const currentCount = Math.floor(Math.random() * batch.capacity);
        const percentage = Math.round((currentCount / batch.capacity) * 100);
        let colorClass = 'bg-primary';
        if (percentage > 90) colorClass = 'bg-red-500';
        else if (percentage > 70) colorClass = 'bg-amber-500';

        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
            </div>
            <span className="text-xs">{currentCount}/{batch.capacity}</span>
          </div>
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
