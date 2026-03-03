import React from 'react';
import { ProfileCell, BadgeCell, ActionCell } from '../../../components/ui/table/cells';

/**
 * Creates the column schema for the Teacher table.
 * 
 * @param {Object} handlers - Callbacks for user interactions.
 * @param {Function} [handlers.onView] - (teacher) => void
 * @param {Function} [handlers.onEdit] - (teacher) => void
 * @param {Function} [handlers.onDelete] - (id, name) => void
 * @param {boolean} [handlers.isDeleting] - Global loading state for delete mutation
 * @returns {Array} Array of column configuration objects compatible with DataTable.
 */
export const createTeacherColumns = ({ onView, onEdit, onDelete, isDeleting } = {}) => {
  return [
    {
      header: 'Faculty Name',
      render: (teacher) => (
        <ProfileCell 
          name={teacher.name} 
          subtitle={teacher.email} 
          avatarUrl={teacher.avatarUrl} 
          fallbackIcon="person"
        />
      )
    },
    {
      header: 'ID',
      accessor: (teacher) => teacher.employee_id || teacher.id,
      className: 'font-mono text-xs'
    },
    {
      header: 'Department',
      accessor: (teacher) => teacher.department || teacher.subject_code,
      className: 'text-text-main dark:text-white'
    },
    {
      header: 'Qualification',
      accessor: (teacher) => teacher.qualification || 'N/A'
    },
    {
      header: 'Status',
      align: 'center',
      render: (teacher) => <BadgeCell status={teacher.status || 'Active'} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (teacher) => (
        <ActionCell 
          onView={onView ? () => onView(teacher) : null}
          onEdit={onEdit ? () => onEdit(teacher) : null}
          onDelete={onDelete ? () => onDelete(teacher.id, teacher.name) : null}
          isDeleting={isDeleting}
        />
      )
    }
  ];
};
