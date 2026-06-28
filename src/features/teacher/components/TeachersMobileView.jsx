import React, { useState } from 'react';
import ExpandableLowDensityCard from '../../../components/ui/v2/cards/ExpandableLowDensityCard';
import { Badge } from '../../../components/ui/v2/indicators';

/**
 * Renders a list of teacher cards optimized for mobile display with inline expandable bars.
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.teachers - Filtered and sorted teachers list.
 * @param {Array<string>} props.selectedIds - List of checked row IDs.
 * @param {Function} props.onSelectRow - Checkbox toggle callback.
 * @param {Object} props.handlers - User event trigger handler callbacks.
 * @param {Function} props.handlers.onView - Navigation callback to profile page.
 * @param {Function} props.handlers.onEdit - Edit modal trigger callback.
 * @param {Function} props.handlers.onDelete - Deletion trigger callback.
 * @returns {React.JSX.Element} Low-density mobile-optimized teacher card list.
 */
export function TeachersMobileView({
  teachers,
  selectedIds,
  onSelectRow,
  handlers
}) {
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isSelectionMode = selectedIds.length > 0;

  const formatType = (type) => {
    if (!type) return '';
    return type.replace(/_/g, '-').replace(/\b\w/g, l => l.toUpperCase());
  };

  console.time('[Teachers Mobile View] Render List');

  const content = (
    <div className="space-y-4">
      {teachers.map((teacher) => {
        const isExpanded = !!expandedIds[teacher.teacher_id];
        const isChecked = selectedIds.includes(teacher.teacher_id);

        const name = teacher.full_name || teacher.teacher_name || teacher.name || 'Faculty Member';
        const initials = name
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        const statusColor = teacher.status === 'active' 
          ? 'success' 
          : teacher.status === 'pending' 
            ? 'primary' 
            : 'default';

        const teacherBadge = teacher.department || teacher.specialization;

        // Interactive avatar container that overlays checkbox when pressed or in selection mode
        const avatarSection = (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onSelectRow(teacher.teacher_id);
            }}
            className="size-8 rounded-full flex-shrink-0 cursor-pointer relative flex items-center justify-center transition-all duration-200"
          >
            {isSelectionMode || isChecked ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-primary shadow-sm animate-in zoom-in duration-150">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onSelectRow(teacher.teacher_id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-border-light dark:border-border-dark text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
              </div>
            ) : (
              <div className="absolute inset-0 size-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center font-bold text-xs transition-colors">
                {initials}
              </div>
            )}
          </div>
        );

        const leftHeader = (
          <div className="flex items-center gap-3 min-w-0">
            {avatarSection}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-text-main dark:text-white text-xs truncate">
                  {name}
                </span>
                {teacherBadge && (
                  <span className="flex-shrink-0 px-1 py-0.2 rounded text-[7.5px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-on-surface-variant border border-border-light dark:border-border-dark">
                    {teacherBadge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-text-secondary dark:text-on-surface-variant font-medium">
                {teacher.mobile_number || teacher.phone || 'No phone number'}
              </span>
              <div className="mt-0.5">
                <Badge
                  variant="status"
                  color={statusColor}
                  content={teacher.status === 'active' ? 'Active' : teacher.status === 'inactive' ? 'Suspended' : 'On Hold'}
                  size="sm"
                  className="scale-90 origin-left py-0"
                />
              </div>
            </div>
          </div>
        );

        const rightHeader = (
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">
              {teacher.experience_years ? `${teacher.experience_years} Yrs Exp` : 'General Faculty'}
            </span>
            <span className="text-[9px] text-text-secondary dark:text-on-surface-variant font-semibold">
              {formatType(teacher.teacher_type) || 'Full Time'}
            </span>
          </div>
        );

        const expandedContent = (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-text-secondary dark:text-on-surface-variant text-[10px]">
              <div>
                <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Email Address</span>
                <span className="font-semibold text-text-main dark:text-white truncate block">{teacher.email || '—'}</span>
              </div>
              <div>
                <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Faculty Identifier</span>
                <span className="font-semibold text-text-main dark:text-white font-mono">{teacher.teacher_id}</span>
              </div>
              <div className="col-span-2">
                <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Specialization Details</span>
                <span className="font-semibold text-text-main dark:text-white">{teacher.specialization || 'General Academics'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-light/50 dark:border-border-dark/50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onView(teacher);
                }}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-main dark:text-white text-[10px] font-bold rounded transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">person</span>
                Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onEdit(teacher);
                }}
                className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">edit</span>
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onDelete(teacher.teacher_id, name);
                }}
                className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold rounded transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">delete</span>
                Delete
              </button>
            </div>
          </>
        );

        return (
          <ExpandableLowDensityCard
            key={teacher.teacher_id}
            isChecked={isChecked}
            isExpanded={isExpanded}
            onToggleExpand={(e) => toggleExpand(e, teacher.teacher_id)}
            onCardClick={() => handlers.onView(teacher)}
            leftHeader={leftHeader}
            rightHeader={rightHeader}
            expandedContent={expandedContent}
          />
        );
      })}
    </div>
  );

  console.timeEnd('[Teachers Mobile View] Render List');
  return content;
}
