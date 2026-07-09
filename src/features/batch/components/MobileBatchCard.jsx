import React from 'react';
import Badge from '../../../components/ui/Badge';

/**
 * MobileBatchCard: Renders a specialized list card for mobile viewports
 * matching the wireframe and mockup layout exactly.
 */
export const MobileBatchCard = ({
  batch = {},
  isSelected = false,
  onSelectToggle,
  onView,
  onEdit,
  onDelete,
  onActivate
}) => {
  const name = batch.batch_name || 'Physics 11th';
  const id = batch.batch_id || batch.id || 'BTH-001';
  const teacher = batch.teacher_name || batch.instructor_name || 'Not Assigned';
  const room = batch.schedule?.room || 'TBD';
  const startTime = batch.schedule?.start_time || '08:00';
  const endTime = batch.schedule?.end_time || '13:00';
  const capacity = batch.capacity || 30;
  const enrollments = batch.enrollment_count || 0;
  
  const hasDays = batch.schedule?.days_of_week?.length > 0;
  const days = hasDays ? batch.schedule.days_of_week : [];

  // Match status variant colors
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'upcoming': return 'warning';
      case 'completed': return 'info';
      case 'inactive':
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className={`bg-surface-light dark:bg-[#122131] border ${
      isSelected ? 'border-primary shadow-sm bg-primary/[0.02]' : 'border-border-light dark:border-white/8'
    } rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all duration-200`}>
      
      {/* Upper Main Body Roster info */}
      <div className="p-4 flex gap-3.5 items-start">
        
        {/* Selection Switch / Avatar */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onSelectToggle && onSelectToggle();
          }}
          className="size-11 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-sm select-none cursor-pointer flex-shrink-0"
        >
          {isSelected ? (
            <span className="material-symbols-outlined text-[20px] font-black text-primary">check_circle</span>
          ) : (
            initials || 'BC'
          )}
        </div>

        {/* Details stack */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Status badge row */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant={getStatusVariant(batch.status)}>
              {batch.status}
            </Badge>
            
            {/* Delete shortcut action */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete();
              }}
              className="p-1 text-text-secondary hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] block">delete_outline</span>
            </button>
          </div>

          {/* Title & Code */}
          <div>
            <h3 className="font-bold text-text-main dark:text-white text-sm leading-tight truncate">
              {name}
            </h3>
            <p className="text-[9px] text-text-secondary dark:text-slate-400 font-mono tracking-wider uppercase mt-0.5">
              {id}
            </p>
          </div>

          {/* Teacher Info */}
          <div className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-slate-400 font-medium">
            <span className="material-symbols-outlined text-[16px] text-text-secondary dark:text-slate-500">person</span>
            <span>{teacher}</span>
          </div>

          {/* Timings details */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-[10px] text-text-secondary dark:text-slate-400 font-semibold">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-text-secondary dark:text-slate-500">location_on</span>
              <span>{room}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-text-secondary dark:text-slate-500">schedule</span>
              <span>{`${startTime} - ${endTime}`}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-text-secondary dark:text-slate-500">group</span>
              <span>{`${enrollments}/${capacity} Students`}</span>
            </div>
          </div>

          {/* Days Capsules */}
          {days.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {days.map((day, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 text-[8px] font-black bg-primary/5 text-primary rounded border border-primary/10 uppercase tracking-widest"
                >
                  {day.substring(0, 3)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3-Column Action Grid Footer */}
      <div className="grid grid-cols-3 border-t border-border-light dark:border-white/8 divide-x divide-border-light dark:divide-white/8 bg-slate-50/50 dark:bg-black/10">
        
        {/* VIEW */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView && onView();
          }}
          className="py-2.5 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/[0.05] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">visibility</span>
          <span>View</span>
        </button>

        {/* EDIT */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit();
          }}
          className="py-2.5 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/[0.05] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          <span>Edit</span>
        </button>

        {/* ATTENDANCE / ACTIVATE */}
        {batch.status?.toLowerCase() === 'inactive' || batch.status?.toLowerCase() === 'cancelled' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActivate && onActivate();
            }}
            className="py-2.5 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-500 hover:bg-rose-500/[0.05] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            <span>Activate</span>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView && onView();
            }}
            className="py-2.5 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/[0.05] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">event</span>
            <span>Attendance</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileBatchCard;
