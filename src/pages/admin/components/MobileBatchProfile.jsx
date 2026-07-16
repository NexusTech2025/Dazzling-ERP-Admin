import React, { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ScrollableTabSegment from '../../../features/batch/components/profile/ScrollableTabSegment';
import BatchOverviewTab from '../../../features/batch/components/profile/BatchOverviewTab';
import BatchStudentRoster from '../../../features/batch/components/profile/BatchStudentRoster';
import AttendanceMatrix from '../../../features/batch/components/profile/AttendanceMatrix';
import ProfileHero from '../../../components/domain/ProfileHero';
import NavHeader from '../../../components/domain/NavHeader';
import { DateRange } from '../../../components/ui/presets/DateRange';
import { TimeRange } from '../../../components/ui/presets/TimeRange';
import { KeyValuePairIcon } from '../../../components/ui/v2/KeyValuePair';

import Badge from '../../../components/ui/Badge';
import Action from '../../../components/ui/v2/Action';

const MOBILE_TABS = [
  { key: 'Overview', label: 'Overview', icon: 'dashboard' },
  { key: 'Students', label: 'Roster', icon: 'group' },
  { key: 'Attendance', label: 'Attendance', icon: 'co_present' },
];

const MobileBatchProfile = React.memo(({
  id,
  batch,
  students,
  activeTab,
  handleMobileTabNavigation,
  handleViewAttendanceLink,
  handleViewPerformanceLink,
  mobileScheduleItems,
  mobileActivityItems,
  mobileAttendanceStats,
  mobileAcademicStats,
  mobileStatsItems,
  navigate
}) => {

  const handleScheduleActionClick = useCallback(() => {
    navigate(`/admin/batches/schedule/${id}`);
  }, [navigate, id]);

  const handleStudentsActionClick = useCallback(() => {
    handleMobileTabNavigation('Students');
  }, [handleMobileTabNavigation]);

  const avatarNode = useMemo(() => (
    <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-primary border border-primary/20 shrink-0">
      <span className="material-symbols-outlined text-[32px]">menu_book</span>
    </div>
  ), []);

  const statusBadge = useMemo(() => {
    const status = batch.status?.toLowerCase();
    const variant = status === 'active' ? 'success' : status === 'inactive' ? 'warning' : 'danger';
    return (
      <Badge variant={variant}>{batch.status || 'UNKNOWN'}</Badge>
    );
  }, [batch.status]);

  const mobileMetaLines = useMemo(() => {
    if (!batch) return [];

    const daysLabel = batch.schedule?.days_of_week?.join(', ') || 'No days configured';
    const timingsLabel = batch.schedule?.start_time && batch.schedule?.end_time
      ? `${batch.schedule.start_time} - ${batch.schedule.end_time}`
      : 'TBD';

    const startEndDates = batch.start_date ? (
      <DateRange start={batch.start_date} end={batch.end_date} />
    ) : (
      'No dates configured'
    );

    return [
      {
        icon: 'calendar_month',
        text: (
          <span className="flex flex-wrap items-center gap-1 select-none">
            <span>{startEndDates}</span>
            <span className="text-slate-300 dark:text-slate-700 mx-0.5">•</span>
            <span className="material-symbols-outlined text-[13px] text-slate-400">schedule</span>
            <span>{timingsLabel}</span>
            <span className="text-slate-300 dark:text-slate-700 mx-0.5">•</span>
            <span className="material-symbols-outlined text-[13px] text-slate-400">event_note</span>
            <span>{daysLabel}</span>
          </span>
        )
      },
      {
        icon: 'person',
        text: (
          <span className="flex flex-wrap items-center gap-1 select-none">
            <span>{batch.instructor_name || 'Unassigned Instructor'}</span>
            <span className="text-slate-300 dark:text-slate-700 mx-0.5">•</span>
            <span className="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
            <span>{batch.branch_name || 'Main Branch'}</span>
          </span>
        )
      }
    ];
  }, [batch]);

  // Mobile Shared Visibility Map - Keeps scroll deep values locked across rosters and sheets
  const mobileTabRegistry = useMemo(() => ({
    Overview: (
      <BatchOverviewTab
        batch={batch}
        scheduleItems={mobileScheduleItems}
        activityItems={mobileActivityItems}
        attendanceStats={mobileAttendanceStats}
        academicStats={mobileAcademicStats}
        statsItems={mobileStatsItems}
        onViewAttendance={handleViewAttendanceLink}
        onViewPerformance={handleViewPerformanceLink}
      />
    ),
    Students: (
      <div className="animate-in fade-in duration-300">
        <BatchStudentRoster batchId={id} />
      </div>
    ),
    Attendance: (
      <div className="animate-in fade-in duration-300">
        <AttendanceMatrix batchId={id} />
      </div>
    )
  }), [batch, id, mobileScheduleItems, mobileActivityItems, mobileAttendanceStats, mobileAcademicStats, mobileStatsItems, handleViewAttendanceLink, handleViewPerformanceLink]);

  return (
    <div className="flex flex-col gap-4 pb-10 w-full min-h-screen">
      <NavHeader title={batch.batch_name} subtitle="Batch Details" statusBadge={statusBadge} backPath="/admin/batches" />

      <div className="px-4 shrink-0">
        <ProfileHero>
          {/* Header Row (Top Tier) */}
          <ProfileHero.Header>
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {avatarNode}
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap">
                  <ProfileHero.Title className="text-xl md:text-2xl font-extrabold !mb-0 ">{batch.batch_name}
                    &nbsp; {statusBadge}
                  </ProfileHero.Title>
                  <ProfileHero.Identity idText={`Batch ID: ${batch.batch_id || id}`} />
                </div>
              </div>
            </div>
            {/* Overflow Action Button */}
            <ProfileHero.HeaderActions>
              <Action to={`/admin/batches/edit/${id}`} icon="edit">
                Edit Batch
              </Action>
              <Action onClick={handleScheduleActionClick} icon="calendar_today">
                Schedule
              </Action>
              <Action onClick={handleStudentsActionClick} icon="group">
                Students
              </Action>
            </ProfileHero.HeaderActions>
          </ProfileHero.Header>

          {/* Divider Line */}
          <hr className="-mx-5 border-slate-100 dark:border-slate-800/60" />

          {/* Logistics Grid (Middle Tier) */}
          <div className="flex flex-col gap-x-4 py-1">
            {/* Row 1: Start/End Date and Timings */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <KeyValuePairIcon
                  icon="calendar_today"
                  size="20px"
                  className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
                />
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <DateRange start={batch.start_date} end={batch.end_date} dateClassName="font-semibold" layout='vertical' />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <KeyValuePairIcon
                  icon="schedule"
                  size="20px"
                  className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {batch.schedule?.start_time && batch.schedule?.end_time
                    ? <TimeRange start={batch.schedule.start_time} end={batch.schedule.end_time} className="font-semibold" />
                    : 'TBD'}
                </span>
              </div>
            </div>

            {/* Row 2: Instructor and Branch */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <KeyValuePairIcon
                  icon="person"
                  size="20px"
                  className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {batch.instructor_name || 'Unassigned Instructor'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <KeyValuePairIcon
                  icon="location_on"
                  size="20px"
                  className="size-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {batch.branch_name || 'Main Branch'}
                </span>
              </div>
            </div>

            {/* Row 3: Days of Week */}
            {batch.schedule?.days_of_week?.length > 0 && (
              <div className="flex items-center gap-3">
                <KeyValuePairIcon
                  icon="calendar_month"
                  size="20px"
                  className="size-10 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  {batch.schedule.days_of_week.map((day, idx) => (
                    <React.Fragment key={day}>
                      {idx > 0 && <span className="text-slate-350 dark:text-slate-600 text-xs font-bold">•</span>}
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border border-violet-100/10">
                        {day}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ProfileHero>
      </div>

      <ScrollableTabSegment
        activeTab={activeTab}
        onTabChange={handleMobileTabNavigation}
        tabs={MOBILE_TABS}
      />

      <div className="px-4">
        {Object.entries(mobileTabRegistry).map(([key, contentNode]) => (
          <div
            key={key}
            className={activeTab === key ? 'block' : 'hidden'}
          >
            {contentNode}
          </div>
        ))}
      </div>
    </div>
  );
});

MobileBatchProfile.displayName = 'MobileBatchProfile';
export default MobileBatchProfile;
