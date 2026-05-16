import React from 'react';
import Card from '../../../../components/ui/Card';

const BatchUpcomingSchedule = ({ batch }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold leading-tight text-text-main dark:text-white mb-4">Upcoming Schedule</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark">
              <th className="pb-3 text-sm font-semibold text-text-secondary">Date/Time</th>
              <th className="pb-3 text-sm font-semibold text-text-secondary">Subject</th>
              <th className="pb-3 text-sm font-semibold text-text-secondary">Topic</th>
              <th className="pb-3 text-sm font-semibold text-text-secondary">Teacher</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-light dark:border-border-dark/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
              <td className="py-4">
                <div className="text-sm font-medium text-text-main dark:text-white">Today, {batch.schedule?.start_time || '08:00 AM'}</div>
              </td>
              <td className="py-4 text-sm text-text-secondary">{batch.course_name}</td>
              <td className="py-4 text-sm text-text-secondary">Module 1 Intro</td>
              <td className="py-4 text-sm text-text-secondary">{batch.instructor_name || batch.teacher_name}</td>
            </tr>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
              <td className="py-4">
                <div className="text-sm font-medium text-text-main dark:text-white">Tomorrow, {batch.schedule?.start_time || '08:00 AM'}</div>
              </td>
              <td className="py-4 text-sm text-text-secondary">{batch.course_name}</td>
              <td className="py-4 text-sm text-text-secondary">Review & Practice</td>
              <td className="py-4 text-sm text-text-secondary">{batch.instructor_name || batch.teacher_name}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default BatchUpcomingSchedule;
