import React from 'react';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/v2/Button';
import { useBatchesQuery } from '../../../batch/hooks/useBatchQueries';

const TeacherAssignedClasses = ({ teacherId }) => {
  // Query only the batches assigned to this specific teacher
  const { data: batches = [], isLoading } = useBatchesQuery({ teacher_id: teacherId });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        <span className="material-symbols-outlined text-text-secondary/30 text-5xl mb-3">class</span>
        <h4 className="text-base font-bold text-text-main dark:text-white">No Assigned Classes</h4>
        <p className="text-xs text-text-secondary mt-1 max-w-xs">
          This teacher is not currently assigned to teach any active or upcoming student batches.
        </p>
      </div>
    );
  }

  // Helper to format days array
  const formatDays = (days) => {
    if (!days || days.length === 0) return 'TBD';
    const shortDaysMap = {
      'Monday': 'M',
      'Tuesday': 'T',
      'Wednesday': 'W',
      'Thursday': 'Th',
      'Friday': 'F',
      'Saturday': 'Sa',
      'Sunday': 'Su'
    };
    return days.map(d => shortDaysMap[d] || d.substring(0, 2)).join(', ');
  };

  // Helper to format 12h time
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const [hourStr, minuteStr] = timeStr.split(':');
      const hour = parseInt(hourStr, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minuteStr} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {batches.map((batch) => {
        const enrollmentRatio = batch.capacity > 0 ? (batch.enrolled_students / batch.capacity) * 100 : 0;
        const startFormatted = batch.start_date 
          ? new Date(batch.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
          : 'TBD';
        const endFormatted = batch.end_date 
          ? new Date(batch.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
          : 'Ongoing';

        return (
          <Card key={batch.batch_id} className="hover:shadow-md transition-all duration-300 flex flex-col h-full group border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden">
            {/* Batch Header */}
            <Card.Header className="flex justify-between items-start gap-2 border-b border-border-light dark:border-border-dark pb-3">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase text-primary tracking-widest truncate">
                  {batch.course_name}
                </span>
                <h4 className="text-base font-bold text-text-main dark:text-white truncate group-hover:text-primary transition-colors mt-0.5">
                  {batch.batch_name}
                </h4>
              </div>
              <div className="flex flex-col gap-1 items-end shrink-0">
                <Badge variant={batch.is_active ? 'success' : 'default'} className="text-[10px] px-2 py-0.5 capitalize font-bold">
                  {batch.status}
                </Badge>
                {batch.batch_type && (
                  <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">
                    {batch.batch_type}
                  </span>
                )}
              </div>
            </Card.Header>

            <Card.Body className="flex-grow pt-4 pb-2 space-y-4">
              {/* Enrollment meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-text-secondary">
                  <span>Enrollment</span>
                  <span className="text-text-main dark:text-white">{batch.enrolled_students} / {batch.capacity} Students</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-border-light dark:border-border-dark/50">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      enrollmentRatio >= 90 
                        ? 'bg-rose-500' 
                        : enrollmentRatio >= 75 
                          ? 'bg-amber-500' 
                          : 'bg-primary'
                    }`} 
                    style={{ width: `${Math.min(enrollmentRatio, 100)}%` }}
                  />
                </div>
              </div>

              {/* Schedule and Timings */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Weekly Schedule</span>
                  <div className="flex items-center gap-1.5 text-text-main dark:text-slate-300 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-text-secondary">calendar_today</span>
                    <span>{formatDays(batch.schedule?.days_of_week)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Class Timings</span>
                  <div className="flex items-center gap-1.5 text-text-main dark:text-slate-300 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-text-secondary">schedule</span>
                    <span>
                      {batch.schedule?.start_time ? `${formatTime(batch.schedule.start_time)} - ${formatTime(batch.schedule.end_time)}` : 'TBD'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Location / Room</span>
                  <div className="flex items-center gap-1.5 text-text-main dark:text-slate-300 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-text-secondary">meeting_room</span>
                    <span>{batch.schedule?.room || 'TBD'} ({batch.branch_name || 'TBD'})</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Batch Duration</span>
                  <div className="flex items-center gap-1.5 text-text-main dark:text-slate-300 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-text-secondary">date_range</span>
                    <span className="truncate">{startFormatted} - {endFormatted}</span>
                  </div>
                </div>
              </div>
            </Card.Body>

            {/* Actions Footer */}
            <Card.Footer className="border-t border-border-light dark:border-border-dark pt-3 pb-3 flex justify-between gap-2 items-center bg-slate-50/50 dark:bg-slate-800/20">
              <span className="text-[10px] font-mono text-text-secondary">
                ID: {batch.batch_id}
              </span>
              <div className="flex gap-2">
                <Button variant="outlined" size="xs" startIcon="group">
                  Students
                </Button>
                <Button variant="contained" size="xs" startIcon="visibility">
                  Details
                </Button>
              </div>
            </Card.Footer>
          </Card>
        );
      })}
    </div>
  );
};

export default TeacherAssignedClasses;
