import React from 'react';
import CardContainer from '../../../../components/ui/v2/cards/CardContainer';
import AttendanceSummaryPanel from './AttendanceSummaryPanel';
import AcademicProgressPanel from './AcademicProgressPanel';
import UpcomingScheduleRow from './UpcomingScheduleRow';
import RecentActivityRow from './RecentActivityRow';

/**
 * BatchOverviewTab renders the full mobile-first "Overview" tab stack.
 *
 * Composes domain components inside a VerticalSectionContainer (flex-col gap-4)
 * to prevent scrolling fatigue. All list item components use React.memo and stable callbacks.
 *
 * @param {Object} props
 * @param {Object} props.batch - Hydrated batch record.
 * @param {Array}  props.scheduleItems - Preprocessed upcoming schedule rows.
 * @param {Array}  props.activityItems - Preprocessed recent activity rows.
 * @param {Object} props.attendanceStats - Attendance indicators.
 * @param {Object} props.academicStats - Academic progress markers.
 * @param {function} [props.onViewAttendance] - Stable navigation selector trigger.
 * @param {function} [props.onViewPerformance] - Stable navigation selector trigger.
 * @param {function} [props.onScheduleRowClick] - Stable schedule item selector trigger.
 * @returns {React.ReactElement} Overview tab mobile container stack.
 */
export default function BatchOverviewTab({
  batch = {},
  scheduleItems = [],
  activityItems = [],
  attendanceStats = { overallPercent: 0, lastWeekPercent: 0, presentToday: '—', totalClasses: 0 },
  academicStats = { syllabusPercent: 0, testsConducted: 0, averageScore: 0, highestScore: 0 },
  onViewAttendance,
  onViewPerformance,
  onScheduleRowClick,
}) {
  const isAllEmpty = scheduleItems.length === 0 && activityItems.length === 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 2. Side-by-Side Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full shrink-0">
        <AttendanceSummaryPanel
          overallPercent={attendanceStats.overallPercent}
          lastWeekPercent={attendanceStats.lastWeekPercent}
          presentToday={attendanceStats.presentToday}
          totalClasses={attendanceStats.totalClasses}
          onViewDetails={onViewAttendance}
        />
        <AcademicProgressPanel
          syllabusPercent={academicStats.syllabusPercent}
          testsConducted={academicStats.testsConducted}
          averageScore={academicStats.averageScore}
          highestScore={academicStats.highestScore}
          onViewPerformance={onViewPerformance}
        />
      </div>

      {/* 3. Upcoming Schedule Section */}
      <CardContainer hoverable={false} className="p-0">
        <div className="px-4 py-3 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-text-secondary">
            Upcoming Schedule
          </p>
          <span className="material-symbols-outlined text-text-secondary text-[18px]">
            calendar_month
          </span>
        </div>
        {scheduleItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-secondary">
            No upcoming schedule classes configured.
          </div>
        ) : (
          <div className="flex flex-col">
            {scheduleItems.map((item, idx) => (
              <UpcomingScheduleRow
                key={item.id || idx}
                dayType={item.dayType}
                dateLabel={item.dateLabel}
                time={item.time}
                topic={item.topic}
                chapter={item.chapter}
                onClick={onScheduleRowClick}
              />
            ))}
          </div>
        )}
      </CardContainer>

      {/* 4. Recent Activity Section */}
      <CardContainer hoverable={false} className="p-0">
        <div className="px-4 py-3 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-text-secondary">
            Recent Activity
          </p>
          <span className="material-symbols-outlined text-text-secondary text-[18px]">
            history
          </span>
        </div>
        {activityItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-secondary">
            No recent activity logged for this batch.
          </div>
        ) : (
          <div className="flex flex-col">
            {activityItems.map((item, idx) => (
              <RecentActivityRow
                key={item.id || idx}
                icon={item.icon}
                iconVariant={item.iconVariant}
                title={item.title}
                timestamp={item.timestamp}
                detail={item.detail}
              />
            ))}
          </div>
        )}
      </CardContainer>
    </div>
  );
}
