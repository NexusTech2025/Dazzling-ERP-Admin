import React from 'react';
import { 
  LowDensityCard, 
  MediumDensityCard, 
  HighDensityCard 
} from '../../../components/ui/v2/cards';
import Button from '../../../components/ui/v2/Button';
import { Tag, Badge } from '../../../components/ui/v2/indicators';

const CourseCardV2 = ({
  course = {},
  density = 'medium',
  onClick,
  onEdit,
  onAssign,
  onMoreClick, // Action options trigger
  className = ''
}) => {
  const name = course.name || '';
  const id = course.course_id || course.id || '';
  const priceLabel = course.base_fee ? `₹ ${course.base_fee.toLocaleString()}` : '—';


  // Low Density
  if (density === 'low') {
    const bodyText = (
      <div className="flex flex-col gap-1 items-start md:items-end text-left md:text-right w-full">
        <Tag
          variant="subtle"
          color="neutral"
          label="Academic"
          size="sm"
          className="hidden sm:inline-block self-start md:self-end"
        />
        <p className="font-mono text-xs sm:text-sm font-bold text-secondary">{priceLabel}</p>
      </div>
    );

    const actions = [
      { label: 'Assign Task', icon: 'pending_actions', priority: 'primary', onClick: (e) => { e.stopPropagation(); onAssign && onAssign(); } },
      { label: 'Edit Course', icon: 'edit', priority: 'secondary', onClick: (e) => { e.stopPropagation(); onEdit && onEdit(); } }
    ];

    return (
      <LowDensityCard
        icon="calculate"
        title={name}
        subtitle1={id}
        subtitle2={course.instructor_name || 'Dr. Emily Blunt'}
        bodyText={bodyText}
        actions={actions}
        onClick={onClick}
        className={className}
      />
    );
  }

  // Medium Density
  if (density === 'medium') {
    // Resolve segment icon from segment_id
    const segmentIcons = { 'SEG-CMP': 'computer', 'SEG-FND': 'star' };
    const iconName = segmentIcons[course.segment_id] || 'auto_stories';

    // Tags: only from real schema fields
    const tags = [
      course.language_medium ? { label: course.language_medium, variant: 'neutral' } : null,
      course.metadata?.class ? { label: `Class ${course.metadata.class}`, variant: 'primary' } : null,
      course.metadata?.board ? { label: course.metadata.board, variant: 'warning' } : null
    ].filter(Boolean);

    const metrics = [
      { label: 'Base Fee', value: priceLabel, colorClass: 'text-secondary' },
      { label: 'Duration', value: course.duration_value ? `${course.duration_value} ${course.duration_unit || 'months'}` : '—' },
      { label: 'Installments', value: course.default_installment_count ? `${course.default_installment_count} steps` : '—' }
    ];

    // Status color mapping
    const statusColor = course.status === 'active' ? 'success' : 'error';

    return (
      <MediumDensityCard
        icon={iconName}
        title={name}
        subtitle={course.segment_name || course.entity_type || ''}
        badgeText={course.short_code || id}
        tags={tags}
        metrics={metrics}
        onClick={onClick}
        className={className}
      >
        {/* Status + Action row */}
        <div className="flex items-center justify-between gap-3 pt-3 mt-1 border-t border-border-light/40 dark:border-border-dark/40">
          <Badge
            variant="status"
            color={statusColor}
            content={course.status || 'active'}
            size="sm"
          />
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                Edit
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-secondary dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">analytics</span>
              Details
            </button>
          </div>
        </div>
      </MediumDensityCard>
    );
  }


  // High Density
  const headerActions = (
    <>
      <Button variant="outlined" size="sm" onClick={onAssign} className="text-xs font-bold uppercase tracking-wider py-1.5 px-3">Assign Task</Button>
      <Button variant="contained" size="sm" onClick={onClick} className="text-xs font-bold uppercase tracking-wider py-1.5 px-3">Curriculum</Button>
    </>
  );

  const metrics = [
    { label: 'Base Tuition Fee', value: priceLabel, colorClass: 'text-secondary' },
    { label: 'Instructor', value: course.instructor_name || 'Dr. Emily Blunt' },
    { label: 'Duration', value: `${course.duration_value || 12} ${course.duration_unit || 'Weeks'}` }
  ];

  const checklist = [
    { label: 'Binary Search Trees Completed', checked: true },
    { label: 'Dynamic Programming (Next Module)', checked: false }
  ];

  return (
    <HighDensityCard
      icon="data_object"
      title={name}
      subtitle={`Instructor: ${course.instructor_name || 'Dr. Emily Blunt'}`}
      idText={id}
      headerActions={headerActions}
      metrics={metrics}
      checklist={checklist}
      progress={{
        label: 'Syllabus Completion',
        value: `${course.syllabus_completion || 78}%`,
        percent: course.syllabus_completion || 78,
        colorClass: 'text-emerald-500 font-mono',
        barColorClass: 'bg-emerald-500'
      }}
      className={className}
    />
  );
};

export default CourseCardV2;
