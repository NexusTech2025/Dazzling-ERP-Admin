import React, { useState } from 'react';
import ExpandableLowDensityCard from '../../../components/ui/v2/cards/ExpandableLowDensityCard';
import { format, parseISO } from 'date-fns';

/**
 * Mobile view layout displaying users in low density expandable card structures.
 * @param {object} props - Component properties.
 * @param {Array<object>} props.users - List of user records.
 * @param {Function} props.onEdit - Trigger edit handler.
 * @param {Function} props.onDelete - Trigger delete handler.
 * @param {string} props.deletingId - ID of user currently being deleted.
 * @returns {React.JSX.Element} Mobile layout card listing.
 */
export const UsersMobileView = ({ users, onEdit, onDelete, deletingId }) => {
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (userId) => {
    setExpandedIds(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: 'bg-green-500/10 text-green-500 border border-green-500/20',
      locked: 'bg-red-500/10 text-red-500 border border-red-500/20',
      disabled: 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
    };
    return statusMap[status?.toLowerCase()] || statusMap.active;
  };

  return (
    <div className="flex flex-col gap-3.5 pb-20 animate-in fade-in duration-200">
      {users.map(u => {
        const isExpanded = !!expandedIds[u.user_id];
        
        const leftHeader = (
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {u.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-text-main dark:text-white text-xs truncate">{u.username}</span>
              <span className="text-[10px] text-text-secondary capitalize">{u.role}</span>
            </div>
          </div>
        );

        const rightHeader = (
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${getStatusBadge(u.status)}`}>
            {u.status}
          </span>
        );

        const formattedLogin = (() => {
          if (!u.last_login) return '-';
          try {
            return format(parseISO(u.last_login), 'MMM d, yyyy h:mm a');
          } catch {
            return u.last_login;
          }
        })();

        const expandedContent = (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary">
              <div>
                <span className="font-bold">User ID:</span>
                <span className="font-mono ml-1 block">{u.user_id}</span>
              </div>
              <div>
                <span className="font-bold">Last Login:</span>
                <span className="block">{formattedLogin}</span>
              </div>
              <div>
                <span className="font-bold">Failed Attempts:</span>
                <span className="block font-semibold">{u.failed_attempts}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border-light dark:border-border-dark">
              <button
                onClick={() => onEdit(u)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-main dark:text-white rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">edit</span>
                Edit
              </button>
              <button
                onClick={() => onDelete(u.user_id, u.username)}
                disabled={deletingId === u.user_id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg font-bold text-[10px] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">delete</span>
                Delete
              </button>
            </div>
          </div>
        );

        return (
          <ExpandableLowDensityCard
            key={u.user_id}
            isChecked={false}
            isExpanded={isExpanded}
            onToggleExpand={() => toggleExpand(u.user_id)}
            leftHeader={leftHeader}
            rightHeader={rightHeader}
            expandedContent={expandedContent}
          />
        );
      })}
    </div>
  );
};

export default UsersMobileView;
