import React from 'react';
import { ProfileCell, ActionCell } from '../../../components/ui/table/cells';
import { format, parseISO } from 'date-fns';

/**
 * Creates columns configuration for the user list directory.
 * @param {object} callbacks - Action handler callbacks.
 * @param {Function} callbacks.onEdit - Edit action handler.
 * @param {Function} callbacks.onDelete - Delete action handler.
 * @param {string} callbacks.deletingId - ID of user currently being deleted.
 * @returns {Array<object>} Column configuration list.
 */
export const createUsersColumns = ({ onEdit, onDelete, deletingId } = {}) => {
  return [
    {
      header: 'Username',
      accessor: 'username',
      render: (u) => (
        <ProfileCell
          name={u.username}
          subtitle={u.role}
          fallbackIcon="manage_accounts"
        />
      )
    },
    {
      header: 'User ID',
      accessor: 'user_id',
      className: 'font-mono text-xs font-bold text-slate-500'
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: (u) => {
        const statusMap = {
          active: { label: 'Active', style: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-green-600/20' },
          locked: { label: 'Locked', style: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-red-600/20' },
          disabled: { label: 'Disabled', style: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ring-gray-600/20' }
        };
        const st = statusMap[u.status?.toLowerCase()] || statusMap.active;
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${st.style}`}>
            {st.label}
          </span>
        );
      }
    },
    {
      header: 'Last Login',
      accessor: 'last_login',
      render: (u) => {
        if (!u.last_login) return <span className="text-slate-400 text-xs">-</span>;
        try {
          return <span className="text-text-secondary text-xs">{format(parseISO(u.last_login), 'MMM d, yyyy h:mm a')}</span>;
        } catch {
          return <span className="text-text-secondary text-xs">{u.last_login}</span>;
        }
      }
    },
    {
      header: 'Failed Attempts',
      accessor: 'failed_attempts',
      align: 'center',
      className: 'text-text-secondary text-xs font-semibold'
    },
    {
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <ActionCell
          onEdit={onEdit ? () => onEdit(u) : null}
          onDelete={onDelete ? () => onDelete(u.user_id, u.username) : null}
          isDeleting={deletingId === u.user_id}
        />
      )
    }
  ];
};
