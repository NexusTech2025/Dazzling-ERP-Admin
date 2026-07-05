import React, { memo } from 'react';
import {
  LowDensityCard,
  MediumDensityCard,
  HighDensityCard,
  HorizontalStatMetrics
} from '../../../components/ui/v2/cards';
import Button from '../../../components/ui/v2/Button';
import { Tag, Badge } from '../../../components/ui/v2/indicators';

/**
 * CourseCardV2 Component: Renders low, medium, or high density representation of a course.
 * Memoized using React.memo to prevent unnecessary re-renders.
 * Callbacks (onClick, onEdit, onDelete) pass back the course entity object.
 */
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
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

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
      { label: 'Details', icon: 'analytics', priority: 'primary', onClick: (e) => { e.stopPropagation(); onClick && onClick(course); } }
    ];

    if (onEdit) {
      actions.push({
        label: 'Edit Course',
        icon: 'edit',
        priority: 'secondary',
        onClick: (e) => { e.stopPropagation(); onEdit && onEdit(course); }
      });
    }

    if (onDelete) {
      actions.push({
        label: 'Delete',
        icon: 'delete',
        priority: 'tertiary',
        onClick: (e) => {
          e.stopPropagation();
          onDelete && onDelete(course);
        }
      });
    }

    const segmentName = course.segment_name || '';
    const entityType = course.entity_type ? (course.entity_type.charAt(0).toUpperCase() + course.entity_type.slice(1)) : 'Subject';
    const shortCode = course.short_code || '';

    const subtitle1 = (
      <span className="inline-flex flex-wrap items-center gap-1 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest ${course.entity_type === 'subject'
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
        onClick={() => onClick && onClick(course)}
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
      course.language_medium ? { label: course.language_medium, variant: 'primary' } : null,
      course.metadata?.class ? { label: `Class ${course.metadata.class}`, variant: 'success' } : null,
      course.metadata?.board ? { label: course.metadata.board, variant: 'warning' } : null
    ].filter(Boolean);

    // Grid details explicitly tailored for tight spacing layout matching the image
    const metrics = [
      {
        label: hasDiscount ? 'Offer Price' : 'Fee',
        value: hasDiscount ? offerPriceLabel : priceLabel,
        icon: 'payments'
      },
      {
        label: 'Duration',
        value: course.duration_value ? `${course.duration_value} ${course.duration_unit || 'months'}` : '12 months',
        icon: 'schedule'
      },
      {
        label: 'Chapters',
        value: course.chapters_count || 12,
        icon: 'import_contacts'
      }
    ];

    // Status color mapping
    const statusColor = course.status === 'active' ? 'success' : 'error';

    // Connected metrics mapping properties from sandbox script
    const horizontalMetricsData = [
      { icon: "layers", value: course.batches_count || 0, label: "Batches" },
      { icon: "inventory_2", value: course.packages_count || 0, label: "Packages" },
      { icon: "group", value: course.total_students || 0, label: "Students" }
    ];

    const headerAction = (
      <div className="flex items-center gap-1.5 relative">
        <Badge
          variant="status"
          color={statusColor}
          content={course.status || 'active'}
          size="sm"
        />
        {onDelete && (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(prev => !prev);
              }}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-base leading-none">
                more_vert
              </span>
            </button>
            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg z-[100] py-1.5 min-w-[130px] animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete(course);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Delete Course
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );

    return (
      <MediumDensityCard
        icon={iconName}
        title={name}
        subtitle={course.segment_name || course.entity_type || 'Subject'}
        badgeText={hasDiscount ? `${discount}% OFF` : undefined}
        badgeClass={hasDiscount ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : undefined}
        headerAction={headerAction}
        tags={tags}
        metrics={metrics}
        metricsLayout="row"
        onClick={() => onClick && onClick(course)}
        className={className}
        slotClasses={{
          title: "text-sm font-black tracking-tight text-text-main dark:text-white",
          subtitle: "text-xs text-text-secondary dark:text-slate-400 mt-0.5",
          body: "mt-3 pt-1 flex flex-col gap-2",
          footer: "mt-3.5 pt-3 border-t border-border-light dark:border-border-dark w-full"
        }}
      >
        <div className="flex flex-col gap-2.5 w-full">
          {/* Connected Metrics Section */}
          <div className="w-full">
            <HorizontalStatMetrics
              items={horizontalMetricsData}
              columns={3}
              allowWrap={true}
            />
          </div>

          {/* Operational Tray */}
          <div className="flex items-center justify-end gap-1.5 w-full mt-3">
            {onEdit && (
              <Button
                variant="outlined"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onEdit(course); }}
                startIcon="edit"
                className="!text-[10px] !py-1 !px-2 !min-h-0 h-auto cursor-pointer"
              >
                Edit
              </Button>
            )}
            <Button
              variant="outlined"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onClick && onClick(course); }}
              startIcon="analytics"
              className="!text-[10px] !py-1 !px-2 !min-h-0 h-auto cursor-pointer"
            >
              Analytics
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onClick && onClick(course); }}
              startIcon="visibility"
              className="!text-[10px] !py-1 !px-2 !min-h-0 h-auto cursor-pointer"
            >
              Details
            </Button>
          </div>
        </div>
      </MediumDensityCard>
    );
  }


  // High Density
  const headerActions = (
    <>
      <Button variant="outlined" size="sm" onClick={() => onAssign && onAssign(course)} className="text-xs font-bold uppercase tracking-wider py-1.5 px-3">Assign Task</Button>
      <Button variant="contained" size="sm" onClick={() => onClick && onClick(course)} className="text-xs font-bold uppercase tracking-wider py-1.5 px-3">Curriculum</Button>
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

export default memo(CourseCardV2);
