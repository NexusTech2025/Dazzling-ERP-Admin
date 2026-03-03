import React from 'react';
import { ProfileCell, BadgeCell, ActionCell } from '../../../components/ui/table/cells';

/**
 * Creates the column schema for the Student table.
 * 
 * @param {Object} handlers - Callbacks for user interactions.
 * @param {Function} [handlers.onView] - (student) => void
 * @param {Function} [handlers.onEdit] - (student) => void
 * @param {Function} [handlers.onDelete] - (id, name) => void
 * @param {boolean} [handlers.isDeleting] - Global loading state for delete mutation
 * @returns {Array} Array of column configuration objects compatible with DataTable.
 */
export const createStudentColumns = ({ onView, onEdit, onDelete, isDeleting } = {}) => {
  return [
    {
      header: 'Student Name',
      render: (student) => (
        <ProfileCell 
          name={student.name} 
          subtitle={student.email} 
          avatarUrl={student.avatarUrl} 
        />
      )
    },
    {
      header: 'ID',
      accessor: (student) => student.enrollment_no || student.id,
      className: 'font-mono text-xs'
    },
    {
      header: 'Course',
      accessor: (student) => student.course || student.class || student.grade,
      className: 'text-text-main dark:text-white'
    },
    {
      header: 'Batch',
      render: (student) => (
        <span className="inline-flex items-center rounded-md bg-background-light dark:bg-background-dark px-2 py-1 text-xs font-medium ring-1 ring-inset ring-border-light dark:ring-border-dark">
          {student.batch || student.grade || student.class}
        </span>
      )
    },
    {
      header: 'Status',
      align: 'center',
      render: (student) => <BadgeCell status={student.feeStatus || student.status || 'Active'} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (student) => (
        <ActionCell 
          onView={onView ? () => onView(student) : null}
          onEdit={onEdit ? () => onEdit(student) : null}
          onDelete={onDelete ? () => onDelete(student.id, student.name) : null}
          isDeleting={isDeleting}
        />
      )
    }
  ];
};
