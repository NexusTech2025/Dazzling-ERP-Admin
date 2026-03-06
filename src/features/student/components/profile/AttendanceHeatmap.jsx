import React from 'react';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import { useStudentAttendanceStatsQuery } from '../../../batch/hooks/useAttendanceQueries';

const AttendanceHeatmap = ({ studentId }) => {
  const { data: stats, isLoading } = useStudentAttendanceStatsQuery(studentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="size-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col items-center justify-center text-center border-b-4 border-b-primary">
          <span className="text-3xl font-black text-primary">{stats.percentage}%</span>
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">Overall Attendance</span>
        </Card>
        <Card className="p-5 flex flex-col items-center justify-center text-center border-b-4 border-b-emerald-500">
          <span className="text-3xl font-black text-emerald-600">{stats.present_count}</span>
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">Total Present</span>
        </Card>
        <Card className="p-5 flex flex-col items-center justify-center text-center border-b-4 border-b-slate-400">
          <span className="text-3xl font-black text-text-main dark:text-white">{stats.total_sessions}</span>
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">Sessions Tracked</span>
        </Card>
      </div>

      {/* History List */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="font-bold text-text-main dark:text-white">Detailed Attendance Log</h3>
          <button className="text-xs font-bold text-primary hover:underline">Download PDF</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-border-light dark:border-border-dark bg-slate-50/30 dark:bg-slate-800/20">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
              {stats.history.length > 0 ? stats.history.map((record, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-text-main dark:text-white">
                    {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      record.status === 'Present' ? 'success' : 
                      record.status === 'Absent' ? 'danger' : 
                      record.status === 'Late' ? 'warning' : 'default'
                    }>
                      {record.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-text-secondary italic">
                    {record.remarks || '--'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-text-secondary italic">
                    No attendance history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceHeatmap;
