import React, { useState, useCallback } from 'react';
import { StudentMobileCard } from './StudentMobileCard';

/**
 * Renders a list of student cards optimized for mobile display with inline expandable bars.
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.students - Filtered and sorted students list.
 * @param {Array<string>} props.selectedIds - List of checked row IDs.
 * @param {Function} props.onSelectRow - Checkbox toggle callback.
 * @param {Object} props.handlers - User event trigger handler callbacks.
 * @param {Function} props.handlers.onView - Navigation callback to profile page.
 * @param {Function} props.handlers.onEdit - Edit modal trigger callback.
 * @param {Function} props.handlers.onDelete - Deletion trigger callback.
 * @returns {React.JSX.Element} Low-density mobile-optimized student card list.
 */
export function StudentsMobileView({
  students,
  selectedIds,
  onSelectRow,
  handlers
}) {
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = useCallback((e, id) => {
    e.stopPropagation();
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const isSelectionMode = selectedIds.length > 0;

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <StudentMobileCard
          key={student.student_id}
          student={student}
          isChecked={selectedIds.includes(student.student_id)}
          isExpanded={!!expandedIds[student.student_id]}
          isSelectionMode={isSelectionMode}
          onSelectRow={onSelectRow}
          onToggleExpand={toggleExpand}
          handlers={handlers}
        />
      ))}
    </div>
  );
}
