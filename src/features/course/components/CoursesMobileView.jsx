import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpandableLowDensityCard from '../../../components/ui/v2/cards/ExpandableLowDensityCard';
import { Badge } from '../../../components/ui/v2/indicators';

/**
 * Renders a list of course cards optimized for mobile display with inline expandable bars.
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.courses - Filtered and sorted courses list.
 * @param {Object} props.selection - Selection control hook outputs.
 * @param {Array<string>} props.selection.selectedIds - List of checked row IDs.
 * @param {Function} props.selection.toggleSelect - Checkbox toggle callback.
 * @param {Function} props.onDelete - Deletion trigger callback.
 * @returns {React.JSX.Element} Low-density mobile-optimized course card list.
 */
export function CoursesMobileView({
  courses,
  selection,
  onDelete
}) {
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectedIds = selection?.selectedIds || [];
  const onSelectRow = selection?.toggleSelect;
  const isSelectionMode = selectedIds.length > 0;

  console.time('[Courses Mobile View] Render List');

  const content = (
    <div className="space-y-4">
      {courses.map((course) => {
        const isExpanded = !!expandedIds[course.course_id];
        const isChecked = selectedIds.includes(course.course_id);

        const name = course.name || 'Unnamed Course';
        const initials = name.substring(0, 2).toUpperCase();

        const segmentIcons = { 'SEG-CMP': 'computer', 'SEG-FND': 'star' };
        const iconName = segmentIcons[course.segment_id] || 'auto_stories';

        const discount = course.discount_percent || 0;
        const hasDiscount = discount > 0;
        const offerPrice = hasDiscount ? course.base_fee * (1 - discount / 100) : course.base_fee;

        const priceLabel = course.base_fee ? `₹${course.base_fee.toLocaleString()}` : '—';
        const offerPriceLabel = course.base_fee ? `₹${offerPrice.toLocaleString()}` : '—';

        const studentClass = course.metadata?.class || course.class || course.grade;
        const boardVal = course.metadata?.board || course.board;
        const segmentName = course.segment_name;
        const entityType = course.entity_type ? (course.entity_type.charAt(0).toUpperCase() + course.entity_type.slice(1)) : 'Subject';

        // Subtitle 2: Medium and short_code
        const sub2Parts = [
          course.language_medium ? `${course.language_medium} Medium` : null,
          course.short_code || null
        ].filter(Boolean);
        const subtitle2 = sub2Parts.join(' • ');

        // Interactive avatar container that overlays checkbox when pressed or in selection mode
        const avatarSection = (
          <div 
            onClick={(e) => {
              if (onSelectRow) {
                e.stopPropagation();
                onSelectRow(course.course_id);
              }
            }}
            className="size-8 rounded-full flex-shrink-0 cursor-pointer relative flex items-center justify-center transition-all duration-200"
          >
            {isSelectionMode || isChecked ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-primary shadow-sm animate-in zoom-in duration-150">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onSelectRow && onSelectRow(course.course_id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-border-light dark:border-border-dark text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
              </div>
            ) : (
              <div className="absolute inset-0 size-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-sm">{iconName}</span>
              </div>
            )}
          </div>
        );

        const leftHeader = (
          <div className="flex items-center gap-3 min-w-0">
            {avatarSection}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-text-main dark:text-white text-xs truncate">
                {name}
              </span>
              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                {studentClass && (
                  <span className="flex-shrink-0 px-1 py-0.2 rounded text-[7.5px] font-black uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Class {studentClass}
                  </span>
                )}
                {boardVal && boardVal !== 'N/A' && (
                  <span className="flex-shrink-0 px-1 py-0.2 rounded text-[7.5px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {boardVal}
                  </span>
                )}
                {segmentName && (
                  <span className="flex-shrink-0 px-1 py-0.2 rounded text-[7.5px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {segmentName}
                  </span>
                )}
                <span className={`flex-shrink-0 px-1 py-0.2 rounded text-[7.5px] font-black uppercase ${
                  course.entity_type === 'subject'
                    ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                    : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                }`}>
                  {entityType}
                </span>
              </div>
              {subtitle2 && (
                <span className="text-[10px] text-text-secondary dark:text-on-surface-variant font-medium mt-0.5">
                  {subtitle2}
                </span>
              )}
            </div>
          </div>
        );

        const rightHeader = (
          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {hasDiscount && (
                <span className="text-[9px] font-mono line-through text-text-secondary">
                  {priceLabel}
                </span>
              )}
              <span className="font-mono text-[11px] font-black text-secondary">
                {offerPriceLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-[9px] text-text-secondary font-medium justify-end">
              {hasDiscount && (
                <Badge
                  variant="status"
                  color="success"
                  content={`${discount}% OFF`}
                  size="sm"
                  className="py-0 px-1 text-[8px] font-bold"
                />
              )}
              {hasDiscount && <span>•</span>}
              <span>{course.duration_value || 12} {course.duration_unit || 'months'}</span>
            </div>
          </div>
        );

        const expandedContent = (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-text-secondary dark:text-on-surface-variant text-[10px]">
              <div>
                <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Course Identifier</span>
                <span className="font-semibold text-text-main dark:text-white font-mono">{course.course_id}</span>
              </div>
              <div>
                <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Short Code</span>
                <span className="font-semibold text-text-main dark:text-white font-mono">{course.short_code || '—'}</span>
              </div>
              <div>
                <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Installments</span>
                <span className="font-semibold text-text-main dark:text-white">{course.default_installment_count || 1} steps</span>
              </div>
              <div>
                <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Segment</span>
                <span className="font-semibold text-text-main dark:text-white truncate block">{course.segment_name || 'General'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-light/50 dark:border-border-dark/50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/courses/${course.course_id}`);
                }}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-main dark:text-white text-[10px] font-bold rounded transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">analytics</span>
                Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/courses/edit/${course.course_id}`);
                }}
                className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">edit</span>
                Edit
              </button>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(course.course_id, course.name);
                  }}
                  className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold rounded transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">delete</span>
                  Delete
                </button>
              )}
            </div>
          </>
        );

        return (
          <ExpandableLowDensityCard
            key={course.course_id}
            isChecked={isChecked}
            isExpanded={isExpanded}
            onToggleExpand={(e) => toggleExpand(e, course.course_id)}
            onCardClick={() => navigate(`/admin/courses/${course.course_id}`)}
            leftHeader={leftHeader}
            rightHeader={rightHeader}
            expandedContent={expandedContent}
          />
        );
      })}
    </div>
  );

  console.timeEnd('[Courses Mobile View] Render List');
  return content;
}
