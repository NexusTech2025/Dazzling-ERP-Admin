import React, { useState, useEffect } from 'react';
import { 
  useTeachersQuery, 
  useTeacherAttendanceListQuery, 
  useMarkTeacherAttendanceBulkMutation 
} from '../hooks/useTeacherQueries';

// Helper utilities for structured time objects
const parseTimeToStructured = (timeStr) => {
  if (!timeStr) return null;
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour = hour - 12;
  if (hour === 0) hour = 12;
  return { hour, minute, period };
};

const formatStructuredToTime = (structTime) => {
  if (!structTime || typeof structTime !== 'object') return '';
  let { hour, minute, period } = structTime;
  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const calculateDuration = (entry, exit) => {
  if (!entry || !exit) return '0.0';
  const [eH, eM] = entry.split(':').map(Number);
  const [xH, xM] = exit.split(':').map(Number);
  const entryTotal = eH * 60 + eM;
  const exitTotal = xH * 60 + xM;
  if (exitTotal <= entryTotal) return '0.0';
  return ((exitTotal - entryTotal) / 60).toFixed(1);
};

const EMPTY_ARRAY = Object.freeze([]);

const TeacherAttendanceManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'P', 'A', 'L'
  const [searchQuery, setSearchQuery] = useState('');

  // Load all teachers and selected date attendance logs
  const { data: teachers = EMPTY_ARRAY, isLoading: isLoadingTeachers } = useTeachersQuery();
  const { data: dailyLogs = EMPTY_ARRAY, isLoading: isLoadingLogs } = useTeacherAttendanceListQuery(selectedDate);
  const bulkMarkMutation = useMarkTeacherAttendanceBulkMutation();

  const [stagedRecords, setStagedRecords] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

  // Merge teachers list with dailyLogs whenever either changes
  useEffect(() => {
    if (teachers && dailyLogs) {
      const initial = {};
      
      teachers.forEach(teacher => {
        const matchingLog = dailyLogs.find(log => log.teacher_id === teacher.teacher_id);
        
        let statusVal = 'P';
        let entryTimeStr = '08:00';
        let exitTimeStr = '16:00';
        let remarksStr = '';
        
        if (matchingLog) {
          if (matchingLog.status === 'Absent' || matchingLog.status === 'A') statusVal = 'A';
          else if (matchingLog.status === 'Late' || matchingLog.status === 'L') statusVal = 'L';
          else statusVal = 'P';
          
          entryTimeStr = formatStructuredToTime(matchingLog.entry_time) || '08:00';
          exitTimeStr = formatStructuredToTime(matchingLog.exit_time) || '16:00';
          remarksStr = matchingLog.remarks || '';
        }
        
        initial[teacher.teacher_id] = {
          teacher_id: teacher.teacher_id,
          full_name: teacher.full_name,
          phone: teacher.mobile_number,
          status: statusVal,
          entry_time: entryTimeStr,
          exit_time: exitTimeStr,
          remarks: remarksStr
        };
      });
      
      setStagedRecords(initial);
      setIsDirty(false);
    }
  }, [teachers, dailyLogs]);

  const handleStatusChange = (teacherId, status) => {
    setStagedRecords(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        status
      }
    }));
    setIsDirty(true);
  };

  const handleTimeChange = (teacherId, field, value) => {
    setStagedRecords(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        [field]: value
      }
    }));
    setIsDirty(true);
  };

  const handleRemarksChange = (teacherId, value) => {
    setStagedRecords(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        remarks: value
      }
    }));
    setIsDirty(true);
  };

  const handleMarkAllPresent = () => {
    setStagedRecords(prev => {
      const updated = {};
      Object.keys(prev).forEach(id => {
        updated[id] = {
          ...prev[id],
          status: 'P'
        };
      });
      return updated;
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    const recordsPayload = Object.values(stagedRecords).map(rec => {
      const isAbsent = rec.status === 'A';
      return {
        teacher_id: rec.teacher_id,
        status: rec.status,
        entry_time: isAbsent ? null : parseTimeToStructured(rec.entry_time),
        exit_time: isAbsent ? null : parseTimeToStructured(rec.exit_time),
        remarks: rec.remarks || null
      };
    });

    const payload = {
      attendance_date: selectedDate,
      attendance_mode: 'Manual',
      records: recordsPayload
    };

    bulkMarkMutation.mutate(payload, {
      onSuccess: () => {
        setSaveStatus('success');
        setIsDirty(false);
        setTimeout(() => setSaveStatus(null), 3000);
      },
      onError: (err) => {
        setSaveStatus('error');
        alert(`Failed to save teacher attendance: ${err.message}`);
        setTimeout(() => setSaveStatus(null), 5000);
      }
    });
  };

  // Stats calculation
  const teachersList = Object.values(stagedRecords);
  const totalCount = teachersList.length;
  const presentCount = teachersList.filter(t => t.status === 'P').length;
  const absentCount = teachersList.filter(t => t.status === 'A').length;
  const lateCount = teachersList.filter(t => t.status === 'L').length;
  const fillRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  // Filtered List
  const filteredTeachers = teachersList.filter(t => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch = t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.teacher_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const isLoading = isLoadingTeachers || isLoadingLogs;

  return (
    <div className="p-6 space-y-6 text-text-main dark:text-slate-100 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-text-main dark:text-white">
          Teacher Attendance Register
        </h1>
        <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">Manage daily check-ins, check-outs, status registers, and shift tracking for all teachers.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Total Faculty</span>
            <span className="material-symbols-outlined text-[20px] text-indigo-500 dark:text-indigo-400 font-bold">supervisor_account</span>
          </div>
          <p className="text-3xl font-black mt-3 leading-none text-text-main dark:text-white">{totalCount}</p>
        </div>

        <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Present Today</span>
            <span className="material-symbols-outlined text-[20px] text-emerald-500 dark:text-emerald-400">check_circle</span>
          </div>
          <p className="text-3xl font-black mt-3 leading-none text-emerald-500 dark:text-emerald-400">{presentCount}</p>
        </div>

        <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Late Arrivals</span>
            <span className="material-symbols-outlined text-[20px] text-amber-500 dark:text-amber-400">schedule</span>
          </div>
          <p className="text-3xl font-black mt-3 leading-none text-amber-500 dark:text-amber-400">{lateCount}</p>
        </div>

        <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">On Leave / Absent</span>
            <span className="material-symbols-outlined text-[20px] text-rose-500 dark:text-rose-400">cancel</span>
          </div>
          <p className="text-3xl font-black mt-3 leading-none text-rose-500 dark:text-rose-400">{absentCount}</p>
        </div>
      </div>

      {/* Main Register Sheet */}
      <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-2xl backdrop-blur-md overflow-hidden shadow-sm">
        
        {/* Controls Bar */}
        <div className="p-6 border-b border-border-light dark:border-white/8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-black/10">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined text-[16px] text-text-secondary dark:text-slate-400 absolute left-3 top-2.5">search</span>
              <input 
                type="text"
                placeholder="Search teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-xl pl-9 pr-4 py-2 text-xs text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 transition-all w-48"
              />
            </div>
            
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/20 p-1 border border-border-light dark:border-white/5 rounded-xl">
              {['ALL', 'P', 'A', 'L'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                    statusFilter === st 
                      ? 'bg-white dark:bg-slate-700 text-text-main dark:text-white shadow-sm ring-1 ring-black/5' 
                      : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'P' ? 'Present' : st === 'A' ? 'Absent' : 'Late'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Date Input */}
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-xl px-4 py-2 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all cursor-pointer"
            />
            
            <button 
              onClick={handleMarkAllPresent}
              disabled={isLoading || teachersList.length === 0}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-border-light dark:border-white/8 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-text-main dark:text-white"
            >
              Mark All Present
            </button>
          </div>
        </div>

        {/* Attendance Registry Table */}
        <div className="relative overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-xs text-text-secondary dark:text-slate-400">Loading daily teacher registers...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-20 text-center text-text-secondary dark:text-slate-500 text-xs">
              No teacher registers match your search/filters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-black/25 border-b border-border-light dark:border-white/8 text-text-secondary dark:text-slate-400 uppercase tracking-widest text-[9px]">
                  <th className="p-4 font-bold">Teacher Details</th>
                  <th className="p-4 font-bold text-center w-48">Status</th>
                  <th className="p-4 font-bold w-36">Punch In</th>
                  <th className="p-4 font-bold w-36">Punch Out</th>
                  <th className="p-4 font-bold text-center w-28">Shift Hours</th>
                  <th className="p-4 font-bold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-white/4">
                {filteredTeachers.map((row) => {
                  const isAbsent = row.status === 'A';
                  const duration = isAbsent ? '0.0' : calculateDuration(row.entry_time, row.exit_time);
                  
                  return (
                    <tr key={row.teacher_id} className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
                            {row.full_name?.charAt(0) || 'T'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-text-main dark:text-white text-sm">{row.full_name}</span>
                            <span className="text-[10px] text-text-secondary dark:text-slate-400 tracking-wider uppercase font-mono mt-0.5">{row.teacher_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-black/30 border border-border-light dark:border-white/5 rounded-xl w-fit mx-auto">
                          <button 
                            onClick={() => handleStatusChange(row.teacher_id, 'P')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                              row.status === 'P' 
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105' 
                                : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
                            }`}
                          >
                            P
                          </button>
                          <button 
                            onClick={() => handleStatusChange(row.teacher_id, 'A')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                              row.status === 'A' 
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105' 
                                : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
                            }`}
                          >
                            A
                          </button>
                          <button 
                            onClick={() => handleStatusChange(row.teacher_id, 'L')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                              row.status === 'L' 
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105' 
                                : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
                            }`}
                          >
                            L
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <input 
                          type="time" 
                          value={row.entry_time}
                          disabled={isAbsent}
                          onChange={(e) => handleTimeChange(row.teacher_id, 'entry_time', e.target.value)}
                          className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all"
                        />
                      </td>
                      <td className="p-4">
                        <input 
                          type="time" 
                          value={row.exit_time}
                          disabled={isAbsent}
                          onChange={(e) => handleTimeChange(row.teacher_id, 'exit_time', e.target.value)}
                          className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all"
                        />
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-sm">
                        <span className={isAbsent ? 'text-rose-500' : 'text-text-main dark:text-slate-200'}>
                          {duration} hrs
                        </span>
                      </td>
                      <td className="p-4">
                        <input 
                          type="text" 
                          value={row.remarks}
                          placeholder="e.g. Approved half-day, late arrival"
                          onChange={(e) => handleRemarksChange(row.teacher_id, e.target.value)}
                          className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-3 py-1.5 text-xs text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      {isDirty && (
        <div className="fixed bottom-6 left-6 right-6 lg:left-72 z-50 animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-surface-light/95 dark:bg-[#122131]/95 border border-border-light dark:border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-lg flex items-center justify-between gap-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-lg animate-pulse">warning</span>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-text-main dark:text-white">Unsaved Faculty Entries</p>
                <p className="text-[10px] text-text-secondary dark:text-slate-400">You have modified registers. Commit changes to update the database.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  // Re-run the merge logic by triggering state reset
                  if (teachers && dailyLogs) {
                    const initial = {};
                    teachers.forEach(teacher => {
                      const matchingLog = dailyLogs.find(log => log.teacher_id === teacher.teacher_id);
                      let statusVal = 'P';
                      let entryTimeStr = '08:00';
                      let exitTimeStr = '16:00';
                      let remarksStr = '';
                      
                      if (matchingLog) {
                        if (matchingLog.status === 'Absent' || matchingLog.status === 'A') statusVal = 'A';
                        else if (matchingLog.status === 'Late' || matchingLog.status === 'L') statusVal = 'L';
                        else statusVal = 'P';
                        
                        entryTimeStr = formatStructuredToTime(matchingLog.entry_time) || '08:00';
                        exitTimeStr = formatStructuredToTime(matchingLog.exit_time) || '16:00';
                        remarksStr = matchingLog.remarks || '';
                      }
                      
                      initial[teacher.teacher_id] = {
                        teacher_id: teacher.teacher_id,
                        full_name: teacher.full_name,
                        phone: teacher.mobile_number,
                        status: statusVal,
                        entry_time: entryTimeStr,
                        exit_time: exitTimeStr,
                        remarks: remarksStr
                      };
                    });
                    setStagedRecords(initial);
                    setIsDirty(false);
                  }
                }}
                className="px-4 py-2 border border-border-light dark:border-white/8 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-xs font-bold transition-all cursor-pointer text-text-main dark:text-slate-300"
              >
                Reset
              </button>
              
              <button 
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:opacity-90 disabled:opacity-50 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all text-white flex items-center gap-2 cursor-pointer"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Save Faculty Attendance
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Status Notification Banner */}
      {saveStatus === 'success' && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-md">
            <span className="material-symbols-outlined">check_circle</span>
            <div>
              <p className="text-xs font-bold">Faculty Registers Saved</p>
              <p className="text-[10px] opacity-80">Bulk attendance transaction completed successfully.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceManager;
