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
          name={student.student_name} 
          subtitle={student.email} 
          avatarUrl={student.avatarUrl} 
        />
      )
    },
    {
      header: 'ID',
      accessor: 'student_id',
      className: 'font-mono text-xs'
    },
    {
      header: 'Branch',
      accessor: 'branch_id',
      className: 'text-text-secondary'
    },
    {
      header: 'Status',
      align: 'center',
      render: (student) => <BadgeCell status={student.status === 'active' ? 'Active' : 'Suspended'} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (student) => (
        <ActionCell 
          onView={onView ? () => onView(student) : null}
          onEdit={onEdit ? () => onEdit(student) : null}
          onDelete={onDelete ? () => onDelete(student.student_id, student.student_name) : null}
          isDeleting={isDeleting}
        />
      )
    }
  ];
};
