import React from 'react';
import Card from '../../../../components/ui/Card';
import { useStudentAttendanceStatsQuery } from '../../../batch/hooks/useAttendanceQueries';

const ProfileSidebar = ({ studentId, education = [], enrollments = [] }) => {
  const { data: stats, isLoading: isAttendanceLoading } = useStudentAttendanceStatsQuery(studentId);

  // Determine overall attendance value
  const attendanceVal = stats?.percentage !== undefined ? `${stats.percentage}%` : 'N/A';

  // Determine CGPA/Grade from the education record with the highest year_of_passing
  const sortedEdu = [...education].sort((a, b) => Number(b.year_of_passing || 0) - Number(a.year_of_passing || 0));
  const latestEdu = sortedEdu[0];
  const cgpaVal = latestEdu ? latestEdu.percentage_or_cgpa : 'N/A';

  // Determine enrollment timeline activity if enrollments are present
  const firstEnrollment = enrollments.length > 0 
    ? [...enrollments].sort((a, b) => new Date(a.enrollment_date) - new Date(b.enrollment_date))[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatPill label="Attendance" value={isAttendanceLoading ? '...' : attendanceVal} />
        <StatPill label="CGPA/Grade" value={cgpaVal} />
      </div>

      {/* Activity Log */}
      <Card className="flex flex-col h-full">
        <div className="p-6 pb-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
          <h3 className="text-text-main dark:text-white text-lg font-bold tracking-tight">Activity Log</h3>
          <button className="text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md uppercase tracking-widest transition-colors">View All</button>
        </div>
        <div className="p-6">
          <div className="relative pl-4 border-l-2 border-border-light dark:border-border-dark space-y-8">
            {firstEnrollment ? (
              <TimelineItem 
                color="bg-primary" 
                time={new Date(firstEnrollment.enrollment_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} 
                title="Enrolled in Program" 
                desc={`Admitted into ${firstEnrollment.course_name} (${firstEnrollment.batch_name})`} 
              />
            ) : (
              <TimelineItem color="bg-orange-400" time="Pending" title="No Active Enrollments" desc="No course registrations found." />
            )}
            <TimelineItem color="bg-green-500" time="Recent Update" title="Profile Synchronized" desc="Verified database connection and schemas." />
          </div>
        </div>
      </Card>

      {/* Tags */}
      <Card className="p-6">
        <h3 className="text-text-main dark:text-white text-lg font-bold mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {enrollments.length > 0 && <Tag label="Enrolled Student" />}
          {education.length > 0 && <Tag label="Academic Details Verified" />}
          <Tag label="Regular" />
          <button className="px-3 py-1 border border-dashed border-border-light dark:border-border-dark text-text-secondary text-xs font-bold rounded-full hover:border-primary hover:text-primary transition-all">
            + Add Tag
          </button>
        </div>
      </Card>
    </div>
  );
};

const StatPill = ({ label, value }) => (
  <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center border border-primary/10 shadow-sm transition-all hover:shadow-md">
    <span className="text-3xl font-black text-primary mb-1">{value}</span>
    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{label}</span>
  </div>
);

const TimelineItem = ({ color, time, title, desc }) => (
  <div className="relative group">
    <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${color}`}></div>
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">{time}</span>
      <p className="text-sm font-bold text-text-main dark:text-white">{title}</p>
      <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Tag = ({ label }) => (
  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-full border border-border-light dark:border-border-dark">
    {label}
  </span>
);

export default ProfileSidebar;
