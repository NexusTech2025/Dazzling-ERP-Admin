import React, { useState, useEffect } from 'react';
import { useBatchAttendanceQuery, useMarkAttendanceMutation } from '../../hooks/useAttendanceQueries';
import AttendanceHistoryMatrix from './AttendanceHistoryMatrix';

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

const EMPTY_ARRAY = Object.freeze([]);

const AttendanceMatrix = ({ batchId }) => {
  const [activeSubTab, setActiveSubTab] = useState('Registry'); // 'Registry' or 'Matrix'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: registry = EMPTY_ARRAY, isLoading } = useBatchAttendanceQuery(batchId, selectedDate);
  const markMutation = useMarkAttendanceMutation();

  // Local staged records before saving
  const [stagedRecords, setStagedRecords] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

  // Initialize staging state when registry loaded from React Query
  useEffect(() => {
    if (registry) {
      const initial = {};
      registry.forEach(rec => {
        let statusVal = 'P';
        if (rec.status === 'Absent' || rec.status === 'A') statusVal = 'A';
        else if (rec.status === 'Late' || rec.status === 'L') statusVal = 'L';
        else statusVal = 'P';

        const entryTimeStr = formatStructuredToTime(rec.entry_time) || '08:00';
        const exitTimeStr = formatStructuredToTime(rec.exit_time) || '13:00';

        initial[rec.student_id] = {
          student_id: rec.student_id,
          student_name: rec.student_name,
          roll_number: rec.roll_number,
          status: statusVal,
          entry_time: entryTimeStr,
          exit_time: exitTimeStr,
          remarks: rec.remarks || ''
        };
      });
      setStagedRecords(initial);
      setIsDirty(false);
    }
  }, [registry]);

  const handleStatusChange = (studentId, status) => {
    setStagedRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
    setIsDirty(true);
  };

  const handleTimeChange = (studentId, field, value) => {
    setStagedRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
    setIsDirty(true);
  };

  const handleRemarksChange = (studentId, value) => {
    setStagedRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
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
        student_id: rec.student_id,
        status: rec.status,
        entry_time: isAbsent ? null : parseTimeToStructured(rec.entry_time),
        exit_time: isAbsent ? null : parseTimeToStructured(rec.exit_time),
        remarks: rec.remarks || null
      };
    });

    const payload = {
      batch_id: batchId,
      attendance_date: selectedDate,
      attendance_mode: 'Manual',
      marked_by: 'Admin',
      records: recordsPayload
    };

    markMutation.mutate(payload, {
      onSuccess: () => {
        setSaveStatus('success');
        setIsDirty(false);
        setTimeout(() => setSaveStatus(null), 3000);
      },
      onError: (err) => {
        setSaveStatus('error');
        alert(`Failed to save attendance: ${err.message}`);
        setTimeout(() => setSaveStatus(null), 5000);
      }
    });
  };

  // Stats from stagedRecords
  const studentsList = Object.values(stagedRecords);
  const totalCount = studentsList.length;
  const presentCount = studentsList.filter(s => s.status === 'P').length;
  const absentCount = studentsList.filter(s => s.status === 'A').length;
  const leaveCount = studentsList.filter(s => s.status === 'L').length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + leaveCount) / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 text-text-main dark:text-slate-100">
      {/* Sub-navigation for Attendance */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-xl w-fit backdrop-blur-md">
        <button 
          onClick={() => setActiveSubTab('Registry')}
          className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeSubTab === 'Registry' 
              ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20' 
              : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
          }`}
        >
          Daily Registry
        </button>
        <button 
          onClick={() => setActiveSubTab('Matrix')}
          className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeSubTab === 'Matrix' 
              ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20' 
              : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
          }`}
        >
          History Matrix
        </button>
      </div>

      {activeSubTab === 'Registry' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md hover:border-border-dark dark:hover:border-white/15 transition-all shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Active Students</span>
                <span className="material-symbols-outlined text-[20px] text-indigo-500 dark:text-indigo-400">groups</span>
              </div>
              <p className="text-3xl font-black mt-3 leading-none text-text-main dark:text-white">{totalCount}</p>
            </div>

            <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md hover:border-border-dark dark:hover:border-white/15 transition-all shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Present Today</span>
                <span className="material-symbols-outlined text-[20px] text-emerald-500 dark:text-emerald-400">check_circle</span>
              </div>
              <p className="text-3xl font-black mt-3 leading-none text-emerald-500 dark:text-emerald-400">{presentCount}</p>
            </div>

            <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md hover:border-border-dark dark:hover:border-white/15 transition-all shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Absent Today</span>
                <span className="material-symbols-outlined text-[20px] text-rose-500 dark:text-rose-400">cancel</span>
              </div>
              <p className="text-3xl font-black mt-3 leading-none text-rose-500 dark:text-rose-400">{absentCount}</p>
            </div>

            <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md hover:border-border-dark dark:hover:border-white/15 transition-all shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Attendance Rate</span>
                <span className="material-symbols-outlined text-[20px] text-violet-500 dark:text-violet-400">analytics</span>
              </div>
              <p className="text-3xl font-black mt-3 leading-none text-violet-500 dark:text-violet-400">{attendanceRate}%</p>
            </div>
          </div>

          {/* Main Registry Form Sheet */}
          <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-2xl backdrop-blur-md overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border-light dark:border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-black/10">
              <div>
                <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400">fact_check</span>
                  Daily Registry
                </h3>
                <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">Staging changes before committing bulk register updates</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                <div className="relative">
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-auto bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-xl px-4 py-2 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  />
                </div>
                
                <button 
                  onClick={handleMarkAllPresent}
                  disabled={isLoading || studentsList.length === 0}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-border-light dark:border-white/8 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-text-main dark:text-white"
                >
                  Mark All Present
                </button>
              </div>
            </div>

            <div className="relative overflow-x-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                  <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-xs text-text-secondary dark:text-slate-400">Loading student registry...</p>
                </div>
              ) : studentsList.length === 0 ? (
                <div className="p-20 text-center text-text-secondary dark:text-slate-500 text-xs">
                  No student records found for this batch on the selected date.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-black/20 border-b border-border-light dark:border-white/8 text-text-secondary dark:text-slate-400 uppercase tracking-widest text-[9px]">
                      <th className="p-4 font-bold text-center w-16">Roll</th>
                      <th className="p-4 font-bold">Student Name</th>
                      <th className="p-4 font-bold text-center w-48">Attendance Status</th>
                      <th className="p-4 font-bold w-44">Check-In</th>
                      <th className="p-4 font-bold w-44">Check-Out</th>
                      <th className="p-4 font-bold">Remarks / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-white/4">
                    {studentsList.map((row) => {
                      const isAbsent = row.status === 'A';
                      return (
                        <tr key={row.student_id} className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors">
                          <td className="p-4 text-center font-mono font-bold text-text-secondary dark:text-slate-400">
                            {row.roll_number || '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-text-main dark:text-white text-sm">{row.student_name}</span>
                              <span className="text-[10px] text-text-secondary dark:text-slate-400 tracking-wider uppercase font-mono mt-0.5">{row.student_id}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-black/30 border border-border-light dark:border-white/5 rounded-xl w-fit mx-auto">
                              <button 
                                onClick={() => handleStatusChange(row.student_id, 'P')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                  row.status === 'P' 
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105' 
                                    : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
                                }`}
                              >
                                P
                              </button>
                              <button 
                                onClick={() => handleStatusChange(row.student_id, 'A')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                  row.status === 'A' 
                                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105' 
                                    : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
                                }`}
                              >
                                A
                              </button>
                              <button 
                                onClick={() => handleStatusChange(row.student_id, 'L')}
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
                              onChange={(e) => handleTimeChange(row.student_id, 'entry_time', e.target.value)}
                              className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all"
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              type="time" 
                              value={row.exit_time}
                              disabled={isAbsent}
                              onChange={(e) => handleTimeChange(row.student_id, 'exit_time', e.target.value)}
                              className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all"
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              type="text" 
                              value={row.remarks}
                              placeholder="e.g. Doctor appointment, late check-in"
                              onChange={(e) => handleRemarksChange(row.student_id, e.target.value)}
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

          {/* Bottom Sticky Bulk Action Bar */}
          {isDirty && (
            <div className="fixed bottom-6 left-6 right-6 lg:left-72 z-50 animate-in slide-in-from-bottom-8 duration-300">
              <div className="bg-surface-light/95 dark:bg-[#122131]/95 border border-border-light dark:border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-lg flex items-center justify-between gap-4 max-w-5xl mx-auto">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-lg animate-pulse">warning</span>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-text-main dark:text-white">Unsaved Staged Entries</p>
                    <p className="text-[10px] text-text-secondary dark:text-slate-400">You have modified registers. Commit changes to update the database.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      if (registry) {
                        const initial = {};
                        registry.forEach(rec => {
                          let statusVal = 'P';
                          if (rec.status === 'Absent' || rec.status === 'A') statusVal = 'A';
                          else if (rec.status === 'Late' || rec.status === 'L') statusVal = 'L';
                          else statusVal = 'P';

                          const entryTimeStr = formatStructuredToTime(rec.entry_time) || '08:00';
                          const exitTimeStr = formatStructuredToTime(rec.exit_time) || '13:00';

                          initial[rec.student_id] = {
                            student_id: rec.student_id,
                            student_name: rec.student_name,
                            roll_number: rec.roll_number,
                            status: statusVal,
                            entry_time: entryTimeStr,
                            exit_time: exitTimeStr,
                            remarks: rec.remarks || ''
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
                        Save Attendance
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
                  <p className="text-xs font-bold">Attendance Saved</p>
                  <p className="text-[10px] opacity-80">Daily registry transaction was successfully committed.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <AttendanceHistoryMatrix batchId={batchId} />
        </div>
      )}
    </div>
  );
};

export default AttendanceMatrix;
