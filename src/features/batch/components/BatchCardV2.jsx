import React from 'react';
import { 
  LowDensityCard, 
  MediumDensityCard, 
  HighDensityCard 
} from '../../../components/ui/v2/cards';
import Button from '../../../components/ui/v2/Button';
import { Tag } from '../../../components/ui/v2/indicators';

const BatchCardV2 = ({
  batch = {},
  density = 'medium',
  onClick,
  onEdit,
  onSchedule,
  onRoster,
  onMoreClick, // Action options trigger
  className = ''
}) => {
  const name = batch.batch_name || 'Physics 12th - Morning A';
  const id = batch.batch_id || batch.id || 'BAT-PHY-12A';
  const capacityLabel = `${batch.enrollment_count || 18}/${batch.capacity || 30} Seats`;

  // Low Density
  if (density === 'low') {
    const batchDetails = [
      batch.course_name || 'Advanced Quantum Physics',
      batch.timing || 'Mon-Wed-Fri 08:00 AM'
    ].filter(Boolean).join(' • ');

    const bodyText = (
      <div className="flex flex-col gap-1 items-start md:items-end text-left md:text-right w-full">
        <Tag
          variant="subtle"
          color="warning"
          label={batch.branch_name || 'Main Campus'}
          size="sm"
          className="hidden sm:inline-block self-start md:self-end"
        />
        <p className="font-mono text-[10px] sm:text-xs text-text-secondary dark:text-slate-400 font-bold">{capacityLabel}</p>
      </div>
    );

    const actions = [
      { label: 'View Roster', icon: 'groups', priority: 'primary', onClick: (e) => { e.stopPropagation(); onRoster && onRoster(); } },
      { label: 'Schedule', icon: 'calendar_today', priority: 'secondary', onClick: (e) => { e.stopPropagation(); onSchedule && onSchedule(); } }
    ];

    return (
      <LowDensityCard
        icon="groups"
        title={name}
        subtitle1={id}
        subtitle2={batchDetails}
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
