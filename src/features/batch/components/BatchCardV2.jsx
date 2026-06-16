import React from 'react';
import { 
  LowDensityCard, 
  MediumDensityCard, 
  HighDensityCard 
} from '../../../components/ui/v2/cards';
import Button from '../../../components/ui/v2/Button';
import { Tag, Badge } from '../../../components/ui/v2/indicators';

const BatchCardV2 = ({
  batch = {},
  density = 'medium',
  onClick,
  onEdit,
  onSchedule,
  onRoster,
  onDelete,
  icon,
  onMoreClick, // Action options trigger
  className = ''
}) => {
  const name = batch.batch_name || 'Physics 12th - Morning A';
  const id = batch.batch_id || batch.id || 'BAT-PHY-12A';
  const capacityLabel = `${batch.enrollment_count || 18}/${batch.capacity || 30} Seats`;

  // Low Density
  if (density === 'low') {
    const isSelectionActive = !!icon;
    const statusColor = batch.status === 'active' ? 'success' : batch.status === 'completed' ? 'neutral' : 'default';

    const titleElement = (
      <span className="inline-flex items-center gap-2 flex-wrap">
        <span className="font-bold text-text-main dark:text-white text-xs sm:text-sm">{name}</span>
        {batch.status && (
          <Badge
            variant="status"
            color={statusColor}
            content={batch.status}
            size="sm"
            className="scale-90 origin-left py-0"
          />
        )}
      </span>
    );

    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const subtitle1 = batch.teacher_name || batch.instructor_name || '—';

    const hasDays = batch.schedule?.days_of_week?.length > 0;
    const daysOfWeeks = hasDays ? batch.schedule.days_of_week : [];
    const subtitle2 = daysOfWeeks.length > 0 ? (
      <div className="flex flex-wrap gap-1 mt-1">
        {daysOfWeeks.map((day, idx) => (
          <span key={idx} className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md border border-border-light dark:border-border-dark uppercase tracking-wider">
            {day.substring(0, 3)}
          </span>
        ))}
      </div>
    ) : null;

    const hasTime = batch.schedule?.start_time && batch.schedule?.end_time;
    const bodyText = (
      <div className="flex flex-col gap-0.5 items-start md:items-end text-[10px] text-text-secondary font-medium w-full min-w-0">
        <div className="font-semibold text-text-main dark:text-slate-300 truncate w-full md:text-right">
          {batch.course_name}
        </div>
        {hasTime && (
          <div className="text-[10px] text-text-secondary dark:text-slate-400 truncate">
            {`${batch.schedule.start_time} - ${batch.schedule.end_time}`}
          </div>
        )}
      </div>
    );

    const actions = [
      { label: 'View', icon: 'visibility', priority: 'primary', onClick: (e) => { e.stopPropagation(); onClick && onClick(); } },
      { label: 'Edit', icon: 'edit', priority: 'secondary', onClick: (e) => { e.stopPropagation(); onEdit && onEdit(); } }
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

    return (
      <LowDensityCard
        icon={icon}
        avatarText={!icon ? initials : undefined}
        title={titleElement}
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
    const tags = [
      { label: batch.course_name || 'Advanced Quantum Physics', variant: 'primary' },
      { label: batch.teacher_name || 'Prof. Marcus Aurelius', variant: 'neutral' }
    ];

    const metrics = [
      { label: 'Teacher', value: batch.teacher_name || 'Prof. Marcus Aurelius' },
      { label: 'Location', value: batch.branch_name || 'Main Campus' }
    ];

    return (
      <MediumDensityCard
        icon="school"
        title={name}
        subtitle={batch.timing || 'Mon-Wed-Fri 08:00 AM'}
        tags={tags}
        metrics={metrics}
        badgeText={
          <Tag 
            variant="subtle" 
            color="neutral" 
            label={batch.branch_name || 'Main Campus'} 
            size="sm"
          />
        }
        badgeClass="border-0 bg-transparent p-0 inline-flex"
        progress={{
          label: 'Class Capacity',
          value: batch.enrollment_count || 18,
          max: batch.capacity || 30
        }}
        actionText="Manage Batch"
        onAction={onClick}
        onClick={onClick}
        className={className}
      />
    );
  }

  // High Density
  const headerActions = (
    <>
      <Button variant="outlined" size="sm" onClick={onSchedule} className="text-xs font-bold uppercase tracking-wider py-1.5 px-3">Schedule</Button>
      <Button variant="contained" size="sm" onClick={onClick} className="text-xs font-bold uppercase tracking-wider py-1.5 px-3">Roster</Button>
    </>
  );

  const metrics = [
    { label: 'Assigned Teacher', value: batch.teacher_name || 'Prof. Marcus Aurelius' },
    { label: 'Weekly Timing', value: batch.timing || 'Mon-Wed-Fri 08:00 AM' },
    { label: 'Campus Branch', value: batch.branch_name || 'Main Campus' }
  ];

  const checklist = [
    { label: 'Syllabus Alignment Checked', checked: true },
    { label: 'Exam Schedule Announced', checked: true },
    { label: 'Weekly Assignments Posted', checked: false }
  ];

  const fillRate = Math.round(((batch.enrollment_count || 18) / (batch.capacity || 30)) * 100);

  return (
    <HighDensityCard
      icon="forum"
      title={name}
      subtitle={batch.course_name || 'Advanced Quantum Physics'}
      idText={id}
      headerActions={headerActions}
      metrics={metrics}
      checklist={checklist}
      progress={{
        label: 'Capacity Fill Rate',
        value: capacityLabel,
        percent: fillRate,
        colorClass: 'text-primary font-mono',
        barColorClass: 'bg-primary'
      }}
      className={className}
    />
  );
};

export default BatchCardV2;
