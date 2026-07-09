import React, { useState } from 'react';
import { parseISO, format } from 'date-fns';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import TextInput from '../../../../components/ui/v2/TextInput';
import { useBatchAttendanceMatrixQuery } from '../../hooks/useAttendanceQueries';

const AttendanceHistoryMatrix = ({ batchId }) => {
  const { data, isLoading } = useBatchAttendanceMatrixQuery(batchId, 15);
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
        <div className="size-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Ensure data is parsed as an array
  const logsList = Array.isArray(data) ? data : [];

  // Filter logs by student name or ID
  const filteredLogs = logsList.filter(log => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      (log.student_name || '').toLowerCase().includes(term) ||
      (log.student_id || '').toLowerCase().includes(term)
    );
  });

  const getStatusVariant = (status) => {
    switch (status) {
      case 'P':
      case 'Present': return 'success';
      case 'A':
      case 'Absent': return 'danger';
      case 'L':
      case 'Late': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'P':
      case 'Present': return 'Present';
      case 'A':
      case 'Absent': return 'Absent';
      case 'L':
      case 'Late': return 'Late';
      default: return status || '—';
    }
  };

  const formatLogDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return '—';
    }
  };

  const formatLogTime = (timeObj) => {
    if (!timeObj || typeof timeObj !== 'object') return '—';
    const { hour, minute, period } = timeObj;
    if (hour === undefined || minute === undefined || !period) return '—';
    return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <Card.Header border={true} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-text-main dark:text-white leading-tight">Attendance Logs</h2>
          <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mt-0.5">Historical Check-ins</p>
        </div>
        <div className="w-full sm:w-64">
          <TextInput
            placeholder="Search by student name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        <div className="overflow-auto scrollbar-hide">
          {filteredLogs.length === 0 ? (
            <div className="p-16 text-center text-xs text-text-secondary">
              No historical check-in logs found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-20">
                <tr className="border-b border-border-light dark:border-border-dark text-text-secondary uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Student Info</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Timing Details</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Remarks / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {filteredLogs.map((log) => {
                  const hasEntry = log.entry_time && typeof log.entry_time === 'object';
                  const hasExit = log.exit_time && typeof log.exit_time === 'object';
                  const hasDuration = log.duration && typeof log.duration === 'object';

                  return (
                    <tr key={log.attendance_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-text-main dark:text-white">
                        {formatLogDate(log.attendance_date)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-text-main dark:text-white text-xs">{log.student_name}</span>
                          <span className="text-[9px] text-text-secondary uppercase tracking-tighter">ID: {log.student_id}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={getStatusVariant(log.status)}>
                          {getStatusLabel(log.status)}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium">
                        {hasEntry || hasExit ? (
                          <span className="text-text-main dark:text-slate-300">
                            {formatLogTime(log.entry_time)} – {formatLogTime(log.exit_time)}
                          </span>
                        ) : (
                          <span className="text-text-secondary dark:text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {hasDuration ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-text-secondary dark:text-slate-400">
                            {log.duration.hours}h {log.duration.minutes}m
                          </span>
                        ) : (
                          <span className="text-text-secondary dark:text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-4 max-w-xs truncate text-text-secondary dark:text-slate-400" title={log.remarks}>
                        {log.remarks || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default AttendanceHistoryMatrix;
