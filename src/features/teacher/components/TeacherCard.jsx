import React from 'react';
import {
  LowDensityCard,
  MediumDensityCard,
  HighDensityCard
} from '../../../components/ui/v2/cards';
import Button from '../../../components/ui/v2/Button';
import { Badge } from '../../../components/ui/v2/indicators';


const TeacherCard = ({
  teacher = {},
  density = 'medium',
  onClick,
  onMessage,
  onEdit,
  onHistory,
  onMoreClick, // Action options trigger
  className = '',
  actionText,
  onAction,
  slotClasses = {}
}) => {

  const name = teacher.full_name || teacher.teacher_name || teacher.name || 'Faculty Member';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Helper to format teacher_type (e.g. full_time -> Full-Time)
  const formatType = (type) => {
    if (!type) return '';
    return type.replace(/_/g, '-').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Low Density
  if (density === 'low') {
    const subtitle1 = teacher.experience_years ? `${teacher.experience_years} yrs exp` : null;
    const subtitle2 = teacher.specialization || teacher.qualification || null;

    const bodyText = (
      <div className="flex flex-col gap-1 items-start md:items-end text-left md:text-right w-full">
        {teacher.status && (
          <Badge
            variant="status"
            color={teacher.status === 'active' ? 'success' : 'error'}
            content={teacher.status.toUpperCase()}
            size="sm"
            className="self-start md:self-end"
          />
        )}
        <p className="hidden sm:block text-[10px] sm:text-[11px] text-text-secondary dark:text-slate-400 font-semibold truncate max-w-full">
          {teacher.email || teacher.mobile_number || 'No Contact Info'}
        </p>
      </div>
    );

    const actions = [
      onMessage && { label: 'Message', icon: 'chat', priority: 'primary', onClick: (e) => { e.stopPropagation(); onMessage(); } },
      onEdit && { label: 'Edit', icon: 'edit_note', priority: 'secondary', onClick: (e) => { e.stopPropagation(); onEdit(); } },
      onHistory && { label: 'History', icon: 'history', priority: 'tertiary', onClick: (e) => { e.stopPropagation(); onHistory(); } }
    ].filter(Boolean);

    return (
      <LowDensityCard
        avatar={teacher.profile_photo_url || undefined}
        avatarText={initials}
        title={name}
        subtitle1={subtitle1}
        subtitle2={subtitle2}
        bodyText={bodyText}
        actions={actions}
        onClick={onClick}
        className={className}
        slotClasses={slotClasses}
      />
    );
  }

  // Medium Density
  if (density === 'medium') {
    const tags = [
      teacher.specialization ? { label: teacher.specialization, variant: 'primary' } : null,
      teacher.teacher_type ? { label: formatType(teacher.teacher_type), variant: 'neutral' } : null
    ].filter(Boolean);

    const subtitleParts = [
      teacher.experience_years ? `${teacher.experience_years} yrs exp` : null,
      teacher.qualification || null
    ].filter(Boolean);

    const metrics = [
      { label: 'Experience', value: teacher.experience_years ? `${teacher.experience_years} Years` : 'Not Specified' },
      { label: 'Contract Type', value: formatType(teacher.teacher_type) || 'Not Specified' }
    ];

    return (
      <MediumDensityCard
        avatar={teacher.profile_photo_url || undefined}
        icon={
          !teacher.profile_photo_url
            ? (
              <span className="font-bold text-sm">
                {initials}
              </span>
            )
            : undefined
        }
        title={name}
        subtitle={subtitleParts.join(' \u2022 ')}
        tags={tags}
        metrics={metrics}
        badgeText={
          teacher.status ? (
            <Badge
              variant="status"
              color={teacher.status === 'active' ? 'success' : 'error'}
              content={teacher.status.toUpperCase()}
              size="sm"
            />
          ) : null
        }
        badgeClass="border-0 bg-transparent p-0 inline-flex"
        actionText={actionText}
        onAction={onAction}
        onClick={onClick}
        className={`min-h-[165px] ${className}`}
        slotClasses={slotClasses}
      />
    );
  }

  // High Density
  const headerActions = (
    <>
      {onMessage && <Button variant="outlined" size="sm" startIcon="mail" onClick={onMessage} className="p-2 min-w-0 rounded-lg" />}
      {onEdit && <Button variant="contained" size="sm" onClick={onEdit}>Edit Profile</Button>}
    </>
  );

  const metrics = [
    { label: 'Specialization', value: teacher.specialization || 'Not Specified' },
    { label: 'Qualification', value: teacher.qualification || 'Not Specified' },
    { label: 'Contract Type', value: formatType(teacher.teacher_type) || 'Not Specified' }
  ];

  const checklist = [
    { label: 'Active Faculty', checked: teacher.status === 'active', icon: 'check_circle' },
    { label: 'Profile Verified', checked: !!teacher.joining_date, icon: 'verified' }
  ];

  const footerActions = [
    onMessage && { label: 'Message', icon: 'chat', onClick: onMessage },
    onEdit && { label: 'Edit', icon: 'edit_note', onClick: onEdit },
    onHistory && { label: 'History', icon: 'history', onClick: onHistory }
  ].filter(Boolean);

  return (
    <HighDensityCard
      avatar={teacher.profile_photo_url || undefined}
      avatarText={initials}
      title={name}
      subtitle={teacher.specialization || 'Faculty Member'}
      headerActions={headerActions.props.children ? headerActions : undefined}
      metrics={metrics}
      description={teacher.biography || `${name} is a verified faculty member specializing in ${teacher.specialization || 'academics'}.`}
      checklist={checklist}
      footerActions={footerActions}
      className={className}
      slotClasses={slotClasses}
    />
  );
};

export default TeacherCard;
