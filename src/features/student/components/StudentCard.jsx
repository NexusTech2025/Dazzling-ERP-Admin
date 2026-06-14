import React from 'react';
import {
  LowDensityCard,
  MediumDensityCard,
  HighDensityCard
} from '../../../components/ui/v2/cards';
import Button from '../../../components/ui/v2/Button';
import { Badge, Tag } from '../../../components/ui/v2/indicators';

const StudentCard = ({
  student = {},
  density = 'medium',
  onClick,
  onMessage,
  onEdit,
  onHistory,
  onMoreClick, // Action options trigger
  className = ''
}) => {
  const name = student.student_name || student.name || 'Anonymous Student';
  const id = student.student_id || student.id || 'STU-000';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Low Density
  if (density === 'low') {
    const subtitle1 = student.joined_date ? `${student.joined_date}` : '';
    const subtitle2 = student.phone || student.email || 'No Contact Info';

    const bodyText = (
      <div className="flex flex-wrap gap-1 justify-start md:justify-end w-full">
        {student.current_class && (
          <Tag variant="subtle" color="primary" label={`${student.current_class}`} size="sm" />
        )}
        {student.board && (
          <Tag variant="subtle" color="neutral" label={`${student.board}`} size="sm" />
        )}
      </div>
    );

    const actions = [
      { label: 'Message', icon: 'chat', priority: 'primary', onClick: (e) => { e.stopPropagation(); onMessage && onMessage(); } },
      { label: 'Edit', icon: 'edit_note', priority: 'secondary', onClick: (e) => { e.stopPropagation(); onEdit && onEdit(); } },
      { label: 'History', icon: 'history', priority: 'tertiary', onClick: (e) => { e.stopPropagation(); onHistory && onHistory(); } }
    ];

    return (
      <LowDensityCard
        avatar={student.avatar}
        avatarText={initials}
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
    const tags = [
      student.current_class ? { label: `Class ${student.current_class}`, variant: 'neutral' } : null,
      student.stream ? { label: student.stream, variant: 'primary' } : null
    ].filter(Boolean);

    const metrics = [
      { label: 'Batch', value: student.current_batch || 'Science-A' },
      { label: 'Dues', value: student.outstanding_balance ? `₹${student.outstanding_balance.toLocaleString()}` : '₹45,200', colorClass: 'text-rose-500' }
    ];

    return (
      <MediumDensityCard
        avatar={student.avatar}
        title={name}
        subtitle={student.email || student.phone || 'No Contact Info'}
        tags={tags}
        metrics={metrics}
        badgeText={
          <Badge
            variant="status"
            color={student.is_registered !== false ? 'success' : 'primary'}
            content={student.status || 'Active'}
            size="sm"
          />
        }
        badgeClass="border-0 bg-transparent p-0 inline-flex"
        progress={student.attendance_percentage || 94.2}
        actionText="View Profile"
        onAction={onClick}
        onClick={onClick}
        className={className}
      />
    );
  }

  // High Density
  const headerActions = (
    <>
      <Button variant="outlined" size="sm" startIcon="mail" onClick={onMessage} className="p-2 min-w-0 rounded-lg" />
      <Button variant="contained" size="sm" onClick={onClick}>View Profile</Button>
    </>
  );

  const metrics = [
    { label: 'Attendance', value: `${student.attendance_percentage || 94.2}%`, colorClass: 'text-emerald-500' },
    { label: 'Joined Date', value: student.joined_date || 'Aug 12, 2021' },
    { label: 'Grade Average', value: student.grade_average || '8.5/10' }
  ];

  const footerActions = [
    { label: 'Message', icon: 'chat', onClick: onMessage },
    { label: 'Edit', icon: 'edit_note', onClick: onEdit },
    { label: 'History', icon: 'history', onClick: onHistory }
  ];

  return (
    <HighDensityCard
      avatar={student.avatar}
      avatarText={initials}
      title={name}
      subtitle={`${student.current_class ? 'Class ' + student.current_class : 'Student'} • ${student.stream || 'General Science'}`}
      idText={id}
      headerActions={headerActions}
      metrics={metrics}
      progress={{
        label: 'Outstanding Balance',
        value: `₹ ${student.outstanding_balance ? student.outstanding_balance.toLocaleString() : '45,200'}`,
        percent: student.balance_percent || 65,
        colorClass: 'text-rose-500 font-mono',
        barColorClass: 'bg-rose-500'
      }}
      footerActions={footerActions}
      className={className}
    />
  );
};

export default StudentCard;
