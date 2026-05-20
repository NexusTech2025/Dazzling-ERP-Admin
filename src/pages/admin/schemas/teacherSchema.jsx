import React from 'react';
import { ProfileCell, BadgeCell, ActionCell } from '../../../components/ui/table/cells';

/**
 * Creates the column schema for the Teacher table.
 * Aligned with Teacher Schema (full_name, mobile_number, status).
 */
export const createTeacherColumns = ({ onView, onEdit, onDelete, isDeleting } = {}) => {
  return [
    {
      header: 'Faculty Name',
      accessor: 'full_name',
      render: (teacher) => (
        <ProfileCell 
          name={teacher.full_name} 
          subtitle={teacher.email} 
          avatarUrl={teacher.profile_photo_url} 
          fallbackIcon="person"
        />
      )
    },
    {
      header: 'ID',
      accessor: 'teacher_id',
      className: 'font-mono text-xs font-bold text-slate-500'
    },
    {
      header: 'Contact',
      accessor: 'mobile_number',
      className: 'text-text-secondary'
    },
    {
      header: 'Type',
      accessor: 'teacher_type',
      className: 'capitalize text-text-main dark:text-white font-medium',
      render: (teacher) => teacher.teacher_type?.replace('_', ' ') || 'Full Time'
    },
    {
      header: 'Specialization',
      accessor: 'specialization',
      className: 'text-text-secondary text-xs'
    },
    {
      header: 'Status',
      align: 'center',
      render: (teacher) => {
        const statusMap = {
          active: 'Active',
          inactive: 'Suspended',
          pending: 'On Hold'
        };
        return <BadgeCell status={statusMap[teacher.status?.toLowerCase()] || 'Active'} />;
      }
    },
    {
      header: 'Actions',
      align: 'right',
      render: (teacher) => (
        <ActionCell 
          onView={onView ? () => onView(teacher) : null}
          onEdit={onEdit ? () => onEdit(teacher) : null}
          onDelete={onDelete ? () => onDelete(teacher.teacher_id, teacher.full_name) : null}
          isDeleting={isDeleting}
        />
      )
    }
  ];
};
