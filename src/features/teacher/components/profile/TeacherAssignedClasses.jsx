import React from 'react';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/v2/Button';
import { useBatchesQuery } from '../../../batch/hooks/useBatchQueries';
import { useTeacherAttendanceQuery } from '../../hooks/useTeacherQueries';
import { formatDays, formatTime } from '../../../../lib/dateUtils';

const TeacherAssignedClasses = ({ teacherId }) => {
  // Query only the batches assigned to this specific teacher
  const { data: batches = [], isLoading } = useBatchesQuery(
    { teacher_id: teacherId },
    { enabled: !!teacherId && teacherId !== '' }
  );

  // Fetch local teacher attendance history (reads directly from active Query Cache)
  const { data: attendanceList = [] } = useTeacherAttendanceQuery(teacherId);

  console.log(batches)

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {batches.map((batch) => {
        const enrollmentRatio = batch.capacity > 0 ? (batch.enrolled_students / batch.capacity) * 100 : 0;
        const startFormatted = batch.start_date
          ? new Date(batch.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
          : 'TBD';
        const endFormatted = batch.end_date
          ? new Date(batch.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
          : 'Ongoing';

        return (
          <Card key={batch.batch_id} className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col h-full group border-slate-200/60 dark:border-slate-800/60 bg-surface-light dark:bg-surface-dark overflow-hidden">
            <Card.Header className="flex justify-between items-start gap-2 border-b border-border-light dark:border-border-dark py-2.5 px-4">
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-bold uppercase text-primary tracking-wider truncate">
                  {batch.course_name} {batch.course?.language_medium}
                </span>
                <h4 className="text-sm font-bold text-text-main dark:text-white truncate group-hover:text-primary transition-colors mt-0.5">
                  {batch.batch_name}<br />
                  <Badge variant="info" className="!text-[7px] px-1.5 py-0.5 font-bold leading-none capitalize">
                    {`• ${batch.course.language_medium} Medium`}
                  </Badge>
                </h4>



              </div>
              <div className="flex flex-col gap-1 items-end shrink-0">
                <div className="flex gap-1 items-center">
                  {batch.branch_name && (
                    <Badge variant="info" className="!text-[8px] px-1.5 py-0.5 font-bold leading-none capitalize">
                      {batch.branch_name}
                    </Badge>
                  )}
                  <Badge variant={batch.is_active ? 'success' : 'default'} className="!text-[8px] px-1.5 py-0.5 capitalize font-bold leading-none">
                     {batch.status}
                  </Badge>
                </div>
                {batch.batch_type && (
                  <span className="text-[8px] font-bold text-text-secondary uppercase tracking-widest">
                    {batch.batch_type}
                  </span>
                )}
              </div>
            </Card.Header>

            <Card.Body className="flex-grow py-2.5 px-4 space-y-2.5">
              {/* Enrollment meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-medium text-text-secondary">
                  <span>Enrollment</span>
                  <span className="text-text-main dark:text-white font-medium">{batch.enrolled_students} / {batch.capacity} Students</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden border border-border-light dark:border-border-dark/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${enrollmentRatio >= 90
                      ? 'bg-rose-500'
                      : enrollmentRatio >= 75
                        ? 'bg-amber-500'
                        : 'bg-primary'
                      }`}
                    style={{ width: `${Math.min(enrollmentRatio, 100)}%` }}
                  />
                </div>
              </div>

              {/* Schedule and Timings Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] pt-0.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-medium text-text-secondary uppercase tracking-wider">Weekly Schedule</span>
                  <div className="flex items-center gap-1 text-text-main dark:text-slate-300 font-medium">
                    <span className="material-symbols-outlined !text-[13px] text-blue-500">calendar_today</span>
                    <span>{formatDays(batch.schedule?.days_of_week)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-medium text-text-secondary uppercase tracking-wider">Class Timings</span>
                  <div className="flex items-center gap-1 text-text-main dark:text-slate-300 font-medium">
                    <span className="material-symbols-outlined !text-[13px] text-purple-500">schedule</span>
                    <span>
                      {batch.schedule?.start_time ? `${formatTime(batch.schedule.start_time)} - ${formatTime(batch.schedule.end_time)}` : 'TBD'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-medium text-text-secondary uppercase tracking-wider">My Attendance</span>
                  <div className="flex items-center gap-1 text-[9px]">
                    {(() => {
                      const batchLogs = attendanceList.filter(r => r.batch_id === batch.batch_id);
                      const presentCount = batchLogs.filter(r => r.status === 'P' || r.status === 'present').length;
                      const absentCount = batchLogs.filter(r => r.status === 'A' || r.status === 'absent').length;
                      const leaveCount = batchLogs.filter(r => r.status === 'L' || r.status === 'Late' || r.status === 'leave').length;
                      return (
                        <div className="flex gap-1 font-mono">
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 px-1 py-0.5 rounded font-bold">
                            P {presentCount}
                          </span>
                          <span className="bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 px-1 py-0.5 rounded font-bold">
                            A {absentCount}
                          </span>
                          <span className="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 px-1 py-0.5 rounded font-bold">
                            L {leaveCount}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>


                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-medium text-text-secondary uppercase tracking-wider">Batch Duration</span>
                  <div className="flex items-center gap-1 text-text-main dark:text-slate-300 font-medium">
                    <span className="material-symbols-outlined !text-[13px] text-amber-500">date_range</span>
                    <span className="truncate">{startFormatted} - {endFormatted}</span>
                  </div>
                </div>
              </div>
            </Card.Body>

            {/* Actions Footer */}
            <Card.Footer className="border-t border-border-light dark:border-border-dark py-2 px-4 flex justify-between gap-2 items-center bg-slate-50/50 dark:bg-slate-800/10">
              <span className="text-[9px] font-mono text-text-secondary">
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
    </div >
  );
};

export default TeacherAssignedClasses;
