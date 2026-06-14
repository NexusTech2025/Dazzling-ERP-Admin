import React from 'react';
import { Link } from 'react-router-dom';
import { MediumDensityCard } from '../../../components/ui/v2/cards';

const CourseCard = ({ course, onDelete }) => {
  if (!course) return null;

  // Segment icons & color variations
  const segmentIcons = {
    'SEG-CMP': 'computer',
    'SEG-FND': 'star',
    'default': 'school'
  };

  const iconName = segmentIcons[course.segment_id] || segmentIcons.default;

  // Construct tags list
  const tags = [
    course.language_medium ? { label: course.language_medium, variant: 'neutral' } : null,
    course.metadata?.class ? { label: `Class ${course.metadata.class}`, variant: 'primary' } : null
  ].filter(Boolean);

  return (
    <div className="group relative">
      <MediumDensityCard
        icon={iconName}
        title={course.name}
        subtitle={`${course.segment_name || 'Academic'} • ${course.duration_value} ${course.duration_unit}`}
        badgeText={course.short_code || course.course_id}
        tags={tags}
      >
        {/* Course details grid (Fee & Installments) */}
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-border-light/40 dark:border-border-dark/40 my-3">
          <div>
            <p className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wider">Base Fee</p>
            <p className="text-sm font-black text-text-main dark:text-white mt-0.5">₹{course.base_fee?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wider">Installments</p>
            <p className="text-sm font-black text-text-main dark:text-white mt-0.5">{course.default_installment_count} Steps</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-3 w-full">
          <Link
            to={`/admin/courses/${course.course_id}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-text-secondary dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            Details
          </Link>
          <Link
            to={`/admin/courses/edit/${course.course_id}`}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Edit
          </Link>
        </div>
      </MediumDensityCard>

      {/* Delete button (displays on hover) */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(course.course_id, course.name);
          }}
          className="absolute top-3 left-3 p-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm flex items-center justify-center"
          title="Delete Course"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      )}
    </div>
  );
};

export default CourseCard;
