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
  onDelete,
  onMoreClick, // Action options trigger
  icon,
  className = ''
}) => {
  const name = course.name || '';
  const id = course.course_id || course.id || '';
  const priceLabel = course.base_fee ? `₹${course.base_fee.toLocaleString()}` : '—';


  // Low Density
  if (density === 'low') {
    const discount = course.discount_percent || 0;
    const hasDiscount = discount > 0;
    const offerPrice = hasDiscount ? course.base_fee * (1 - discount / 100) : course.base_fee;
    const offerPriceLabel = course.base_fee ? `₹${offerPrice.toLocaleString()}` : '—';

    // Segment specific icon
    const segmentIcons = { 'SEG-CMP': 'computer', 'SEG-FND': 'star' };
    const iconName = icon || segmentIcons[course.segment_id] || 'auto_stories';

    // Subtitle 2: Class • Board • Language Medium
    const sub2Parts = [
      course.metadata?.class ? `Class ${course.metadata.class}` : null,
      course.metadata?.board || null,
      course.language_medium || null
    ].filter(Boolean);
    const subtitle2 = sub2Parts.length > 0 ? sub2Parts.join(' • ') : (course.instructor_name || 'Dr. Emily Blunt');

    const bodyText = (
      <div className="flex flex-col gap-0.5 items-start md:items-end text-left md:text-right w-full min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap md:justify-end">
          {hasDiscount && (
            <span className="text-[10px] font-mono line-through text-text-secondary">
              {priceLabel}
            </span>
          )}
          <span className="font-mono text-xs sm:text-sm font-black text-secondary">
            {offerPriceLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1 text-[10px] text-text-secondary font-medium md:justify-end">
          {hasDiscount && (
            <Badge
              variant="status"
              color="success"
              content={`${discount}% OFF`}
              size="sm"
              className="py-0 px-1 text-[9px] font-bold"
            />
          )}
          {hasDiscount && <span>•</span>}
          <span>{course.duration_value || 12} {course.duration_unit || 'months'}</span>
          <span>•</span>
          <span>{course.default_installment_count || 1} Inst.</span>
        </div>
      </div>
    );

    const actions = [
      { label: 'Details', icon: 'analytics', priority: 'primary', onClick: (e) => { e.stopPropagation(); onClick && onClick(); } },
      { label: 'Edit Course', icon: 'edit', priority: 'secondary', onClick: (e) => { e.stopPropagation(); onEdit && onEdit(); } }
    ];

    if (onDelete) {
      actions.push({
        label: 'Delete',
        icon: 'delete',
        priority: 'tertiary',
        onClick: (e) => {
          e.stopPropagation();
          onDelete();
        }
      });
    }

    const segmentName = course.segment_name || '';
    const entityType = course.entity_type ? (course.entity_type.charAt(0).toUpperCase() + course.entity_type.slice(1)) : 'Subject';
    const shortCode = course.short_code || '';

    const subtitle1 = (
      <span className="inline-flex flex-wrap items-center gap-1 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest ${
          course.entity_type === 'subject'
            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/15'
            : 'bg-purple-500/10 text-purple-500 border border-purple-500/15'
        }`}>
          {entityType}
        </span>
        {segmentName && (
          <>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-text-main dark:text-slate-300 normal-case">{segmentName}</span>
          </>
        )}
        {shortCode && (
          <>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
              {shortCode}
            </span>
          </>
        )}
      </span>
    );

    return (
      <LowDensityCard
        icon={iconName}
        title={name}
        subtitle1={subtitle1}
        subtitle2={subtitle2}
        bodyText={bodyText}
        actions={actions}
        onClick={onClick}
        className={className}
      />
    );
  }

  // Medium Density
  if (density === 'medium') {
    const discount = course.discount_percent || 0;
    const hasDiscount = discount > 0;
    const offerPrice = hasDiscount ? course.base_fee * (1 - discount / 100) : course.base_fee;
    const offerPriceLabel = course.base_fee ? `₹${offerPrice.toLocaleString()}` : '—';

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
      { label: 'Base Fee', value: priceLabel, colorClass: hasDiscount ? 'line-through opacity-60 text-text-secondary' : 'text-secondary' },
      hasDiscount ? { label: 'Offer Price', value: offerPriceLabel, colorClass: 'text-emerald-500 font-bold' } : null,
      { label: 'Duration', value: course.duration_value ? `${course.duration_value} ${course.duration_unit || 'months'}` : '—' },
      { label: 'Installments', value: course.default_installment_count ? `${course.default_installment_count} steps` : '—' }
    ].filter(Boolean);

    // Status color mapping
    const statusColor = course.status === 'active' ? 'success' : 'error';

    return (
      <MediumDensityCard
        icon={iconName}
        title={name}
        subtitle={course.segment_name || course.entity_type || ''}
        badgeText={hasDiscount ? `${discount}% OFF` : (course.short_code || id)}
        badgeClass={hasDiscount ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : undefined}
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
