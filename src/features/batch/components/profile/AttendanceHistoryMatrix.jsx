import React from 'react';
import Card from '../../../../components/ui/Card';
import { useBatchAttendanceMatrixQuery } from '../../hooks/useAttendanceQueries';

const AttendanceHistoryMatrix = ({ batchId }) => {
  const { data, isLoading } = useBatchAttendanceMatrixQuery(batchId, 15);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
        <div className="size-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const { dateHeaders, matrix } = data;

  const getStatusChip = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500 text-white';
      case 'Absent': return 'bg-red-500 text-white';
      case 'Late': return 'bg-amber-500 text-white';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
    }
  };

  const getStatusLetter = (status) => {
    switch (status) {
      case 'Present': return 'P';
      case 'Absent': return 'A';
      case 'Late': return 'L';
      default: return '-';
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-text-main dark:text-white leading-tight">History Matrix</h2>
          <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mt-0.5">Last 15 Sessions</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider text-text-secondary">
          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500"></span> Present</div>
          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500"></span> Absent</div>
          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500"></span> Late</div>
        </div>
      </div>

      <div className="overflow-auto scrollbar-hide">
        <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-20">
            <tr>
              <th className="p-3 font-bold text-text-secondary uppercase tracking-widest text-[10px] border-b border-r border-border-light dark:border-border-dark sticky left-0 bg-slate-50 dark:bg-[#1e293b] z-30 min-w-[200px]">Student Info</th>
              {dateHeaders.map(date => (
                <th key={date} className="p-3 font-bold text-center text-text-secondary uppercase tracking-widest text-[9px] border-b border-border-light dark:border-border-dark min-w-[50px]">
                  {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </th>
              ))}
              <th className="p-3 font-bold text-center text-text-secondary uppercase tracking-widest text-[10px] border-b border-l border-border-light dark:border-border-dark sticky right-0 bg-slate-50 dark:bg-[#1e293b] z-30 min-w-[80px]">Total %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {matrix.map(row => (
              <tr key={row.enrollment_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                <td className="p-3 border-r border-border-light dark:border-border-dark sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 z-10">
                  <div className="flex flex-col">
                    <span className="font-bold text-text-main dark:text-white text-xs">{row.student_name}</span>
                    <span className="text-[9px] text-text-secondary uppercase tracking-tighter">ID: {row.student_id}</span>
                  </div>
                </td>
                {row.dailyStatuses.map((ds, idx) => (
                  <td key={idx} className="p-2 text-center">
                    <span className={`inline-flex size-6 rounded-lg items-center justify-center text-[10px] font-black shadow-sm transition-transform hover:scale-110 cursor-default ${getStatusChip(ds.status)}`}>
                      {getStatusLetter(ds.status)}
                    </span>
                  </td>
                ))}
                <td className="p-3 text-center border-l border-border-light dark:border-border-dark sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 z-10">
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full font-black text-[10px] border ${
                    row.total_percentage > 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    row.total_percentage > 70 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {row.total_percentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AttendanceHistoryMatrix;
