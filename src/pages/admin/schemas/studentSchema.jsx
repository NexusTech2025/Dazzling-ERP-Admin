import React from 'react';
import { ProfileCell, BadgeCell, ActionCell } from '../../../components/ui/table/cells';
import Badge from '../../../components/ui/Badge';
import AllocatedBatchesBadgeGroup from '../../../features/student/components/AllocatedBatchesBadgeGroup';
import { getStudentAllocationsViewModel } from '../../../features/student/utils/enrollmentCacheHelper';

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
      header: 'Assigned Batches',
      render: (student) => {
        const allocations = getStudentAllocationsViewModel(student);
        return <AllocatedBatchesBadgeGroup allocations={allocations} />;
      }
    },
    {
      header: 'Enrollment ID',
      render: (student) => {
        const enr = student.enrollments?.[0];
        if (!enr) {
          return <span className="text-xs text-text-secondary italic font-mono">No Enrollment</span>;
        }
        return (
          <div className="flex flex-col text-xs">
            <span className="font-mono font-semibold text-text-main dark:text-white">{enr.enrollment_id}</span>
            <span className="text-[10px] text-text-secondary uppercase">{enr.enrollment_type || 'Active'}</span>
          </div>
        );
      }
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
