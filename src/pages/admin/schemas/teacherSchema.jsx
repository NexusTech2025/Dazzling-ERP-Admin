import React from 'react';
import { ProfileCell, BadgeCell, ActionCell } from '../../../components/ui/table/cells';

/**
 * Creates the column schema for the Teacher table.
 */
export const createTeacherColumns = ({ onView, onEdit, onDelete, isDeleting } = {}) => {
  return [
    {
      header: 'Faculty Name',
      render: (teacher) => (
        <ProfileCell 
          name={teacher.teacher_name} 
          subtitle={teacher.email} 
          avatarUrl={teacher.avatarUrl} 
          fallbackIcon="person"
        />
      )
    },
    {
      header: 'ID',
      accessor: 'teacher_id',
      className: 'font-mono text-xs'
    },
    {
      header: 'Contact',
      accessor: 'mobile',
      className: 'text-text-secondary'
    },
    {
      header: 'Department',
      accessor: 'department',
      className: 'text-text-main dark:text-white font-medium'
    },
    {
      header: 'Designation',
      accessor: 'designation'
    },
    {
      header: 'Status',
      align: 'center',
      render: (teacher) => <BadgeCell status={teacher.status === 'active' ? 'Active' : 'Inactive'} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (teacher) => (
        <ActionCell 
          onView={onView ? () => onView(teacher) : null}
          onEdit={onEdit ? () => onEdit(teacher) : null}
          onDelete={onDelete ? () => onDelete(teacher.teacher_id, teacher.teacher_name) : null}
          isDeleting={isDeleting}
        />
      )
    }
  ];
};
