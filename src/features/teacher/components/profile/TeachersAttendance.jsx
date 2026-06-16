import React, { useState, useMemo, useEffect } from 'react';
import { useTeacherAttendanceQuery, useUpdateTeacherAttendanceMutation } from '../../hooks/useTeacherQueries';
import { useAuth } from '../../../../context/AuthContextCore';
import { isPastLocalDate } from '../../../../lib/dateUtils';

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

const TeachersAttendance = ({ teacherId }) => {
  const { user } = useAuth();
  const { data: attendance = [], isLoading } = useTeacherAttendanceQuery(teacherId);
  const updateMutation = useUpdateTeacherAttendanceMutation();
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeMenu, setActiveMenu] = useState(null);

  // Filter attendance for selected month & year
  const monthData = useMemo(() => {
    return attendance.filter(record => {
      if (!record.attendance_date) return false;
      const [year, month] = record.attendance_date.split('-');
      return parseInt(month, 10) - 1 === currentMonth && parseInt(year, 10) === currentYear;
    });
  }, [attendance, currentMonth, currentYear]);

  // Dynamic Metrics
  const stats = useMemo(() => {
    const presentDays = monthData.filter(r => r.status === 'P' || r.status === 'present').length;
    const lateDays = monthData.filter(r => r.status === 'L' || r.status === 'Late').length;
    const absentDays = monthData.filter(r => r.status === 'A' || r.status === 'absent').length;
    const totalWorkingDays = presentDays + lateDays + absentDays || 22; // Default to 22 standard days

    // Sum of duration hours
    const totalHours = monthData.reduce((acc, r) => acc + (r.duration || 0), 0);
    const avgHours = (presentDays + lateDays) > 0 ? (totalHours / (presentDays + lateDays)).toFixed(1) : '0.0';

    return {
      presentDays,
      lateDays,
      absentDays,
      totalWorkingDays,
      totalHours: totalHours.toFixed(1),
      avgHours
    };
  }, [monthData]);

  // Consistency / Efficiency score (present + late / total logs)
  const efficiencyScore = useMemo(() => {
    const logs = attendance.length;
    if (logs === 0) return 100;
    const positiveLogs = attendance.filter(r => r.status === 'P' || r.status === 'present' || r.status === 'L' || r.status === 'Late').length;
    return Math.round((positiveLogs / logs) * 100);
  }, [attendance]);

  // Extract exceptions (Late or Absent records)
  const exceptions = useMemo(() => {
    return monthData
      .filter(r => r.status === 'A' || r.status === 'absent' || r.status === 'L' || r.status === 'Late')
      .map(r => ({
        id: r.attendance_id || r.attendance_date,
        date: new Date(r.attendance_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        title: (r.status === 'A' || r.status === 'absent') ? 'Absent Register' : 'Late Arrival Exception',
        status: r.status,
        remarks: r.remarks || 'No remarks provided.'
      }))
      .slice(0, 5); // display top 5
  }, [monthData]);

  const handleUpdateDay = (dateStr, updates) => {
    const finalUpdates = {};
    
    // Status mapping
    if (updates.status === 'present') finalUpdates.status = 'P';
    else if (updates.status === 'absent') finalUpdates.status = 'A';
    else if (updates.status === 'leave') finalUpdates.status = 'L';
    else finalUpdates.status = updates.status;

    // Time fields parsing
    if (updates.check_in_time) {
      finalUpdates.entry_time = parseTimeToStructured(updates.check_in_time);
    }
    if (updates.check_out_time) {
      finalUpdates.exit_time = parseTimeToStructured(updates.check_out_time);
    }
    if (updates.remarks !== undefined) {
      finalUpdates.remarks = updates.remarks;
    }

    // If status is Absent, clear entry/exit times
    if (finalUpdates.status === 'A') {
      finalUpdates.entry_time = null;
      finalUpdates.exit_time = null;
    }

    updateMutation.mutate({
      teacherId,
      date: dateStr,
      data: finalUpdates
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-xs text-text-secondary dark:text-slate-400">Loading attendance profile...</p>
      </div>
    );
  }

  // Monthly grid calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let firstDay = new Date(currentYear, currentMonth, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust so Monday is 0

  return (
    <div className="space-y-6 text-text-main dark:text-slate-100">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Working Days</span>
            <span className="material-symbols-outlined text-[18px] text-blue-500 dark:text-blue-400">calendar_today</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black">{stats.presentDays + stats.lateDays} days</p>
            <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-1">out of {stats.totalWorkingDays} working days</p>
          </div>
        </div>

        <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Late Registries</span>
            <span className="material-symbols-outlined text-[18px] text-amber-500 dark:text-amber-400">schedule</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-550 dark:text-amber-400">{stats.lateDays} days</p>
            <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-1">delayed entries this month</p>
          </div>
        </div>

        <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Absence logs</span>
            <span className="material-symbols-outlined text-[18px] text-rose-500 dark:text-rose-400">do_not_disturb_on</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-rose-500 dark:text-rose-400">{stats.absentDays} days</p>
            <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-1">unpunched / absent days</p>
          </div>
        </div>

        <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Average Shift</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-500 dark:text-emerald-400">timer</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-500 dark:text-emerald-400">{stats.avgHours} hrs</p>
            <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-1">total: {stats.totalHours} hours</p>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid Sheet */}
        <div className="lg:col-span-2 bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col justify-between shadow-sm">
          <div className="p-6 border-b border-border-light dark:border-white/8 flex items-center justify-between">
            <h3 className="text-base font-bold text-text-main dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400">calendar_month</span>
              Monthly punches
            </h3>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                  else setCurrentMonth(m => m - 1);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 border border-border-light dark:border-white/5 rounded-lg text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="text-xs font-black uppercase tracking-wider px-2">
                {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => {
                  if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                  else setCurrentMonth(m => m + 1);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 border border-border-light dark:border-white/5 rounded-lg text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-7 mb-3 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {/* Padding days */}
              {[...Array(firstDay)].map((_, i) => (
                <div key={`empty-${i}`} className="h-20 bg-slate-50 dark:bg-white/[0.01] border border-border-light dark:border-white/[0.02] rounded-xl" />
              ))}
              
              {/* Day cells */}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const record = monthData.find(r => r.attendance_date === dateStr);
                const isOpen = activeMenu === dateStr;
                const isPastRecordLocked = isPastLocalDate(dateStr) && user?.role !== 'superadmin';
                
                return (
                  <CalendarDayCellCell 
                    key={day} 
                    day={day} 
                    dateStr={dateStr}
                    record={record} 
                    isOpen={isOpen}
                    onToggleMenu={() => setActiveMenu(isOpen ? null : dateStr)}
                    onUpdate={(updates) => handleUpdateDay(dateStr, updates)}
                    onClose={() => setActiveMenu(null)}
                    isToday={day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()}
                    isPastRecordLocked={isPastRecordLocked}
                  />
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-black/15 flex flex-wrap gap-6 border-t border-border-light dark:border-white/8 justify-center">
            <LegendItem color="bg-emerald-500" label="Present" />
            <LegendItem color="bg-amber-500" label="Late" />
            <LegendItem color="bg-rose-500" label="Absent" />
            <LegendItem color="bg-slate-400 dark:bg-slate-500" label="Not Recorded (NR)" />
            <LegendItem color="bg-slate-355 dark:bg-slate-700" label="Unmarked" />
          </div>
        </div>

        {/* Sidebar: Exceptions & Consistency */}
        <div className="space-y-6">
          
          {/* Consistency Gauge */}
          <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-6 rounded-2xl shadow-sm backdrop-blur-md text-text-main dark:text-white relative overflow-hidden flex flex-col items-center text-center">
            <div className="flex items-center gap-2 self-start mb-6">
              <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400">stars</span>
              <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Consistency gauge</h3>
            </div>
            
            {/* Radial SVG Gauge */}
            <div className="relative flex items-center justify-center mt-2">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle cx="56" cy="56" r="46" className="stroke-slate-100 dark:stroke-white/5" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="46" 
                  className="stroke-indigo-500" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 46} 
                  strokeDashoffset={2 * Math.PI * 46 * (1 - efficiencyScore / 100)} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-text-main dark:text-white leading-none">{efficiencyScore}%</span>
                <span className="text-[9px] text-text-secondary dark:text-slate-400 uppercase font-black tracking-widest mt-1">Score</span>
              </div>
            </div>
            
            <p className="mt-6 text-xs text-text-secondary dark:text-slate-300 px-2 leading-relaxed">
              Based on overall daily registries. Consistency target is above 92.5%.
            </p>
          </div>

          {/* Exception Log */}
          <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-6 rounded-2xl backdrop-blur-md shadow-sm">
            <h3 className="text-xs font-black text-text-secondary dark:text-slate-400 mb-5 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-sm">warning</span>
              Exception Log
            </h3>
            
            {exceptions.length === 0 ? (
              <div className="py-8 text-center text-text-secondary dark:text-slate-500 text-xs">
                No exceptions logged this month. Excellent consistency!
              </div>
            ) : (
              <div className="space-y-4">
                {exceptions.map((exc) => (
                  <div key={exc.id} className="flex gap-3 items-start border-l-2 border-slate-300 dark:border-slate-700 pl-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-text-main dark:text-white">{exc.title}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                          exc.status === 'L' || exc.status === 'Late' ? 'bg-amber-500/10 text-amber-655 dark:text-amber-400' : 'bg-rose-500/10 text-rose-550 dark:text-rose-400'
                        }`}>
                          {exc.status === 'L' || exc.status === 'Late' ? 'Late' : 'Absent'}
                        </span>
                      </div>
                      <p className="text-[9px] text-text-secondary dark:text-slate-400 tracking-wider font-mono mt-0.5">{exc.date}</p>
                      <p className="text-[10px] text-text-secondary dark:text-slate-300 mt-1.5 italic bg-slate-50 dark:bg-black/10 p-2 rounded border border-border-light dark:border-white/5">
                        "{exc.remarks}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Day Cell Component
const CalendarDayCellCell = ({ day, record, dateStr, isOpen, onToggleMenu, onUpdate, onClose, isToday, isPastRecordLocked }) => {
  const isPresent = record?.status === 'P' || record?.status === 'present';
  const isLate = record?.status === 'L' || record?.status === 'Late';
  const isAbsent = record?.status === 'A' || record?.status === 'absent';
  const isUnmarkedPastDate = !record && isPastLocalDate(dateStr);
  
  let colorClasses = "bg-slate-50/50 dark:bg-white/[0.02] border-border-light dark:border-white/5 border-l-slate-400 dark:border-l-slate-600";
  if (isPresent) {
    colorClasses = "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20 border-l-emerald-500";
  } else if (isLate) {
    colorClasses = "bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/20 border-l-amber-500";
  } else if (isAbsent) {
    colorClasses = "bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/20 border-l-rose-500";
  }

  const inTimeStr = record?.entry_time ? formatStructuredToTime(record.entry_time) : '';
  const outTimeStr = record?.exit_time ? formatStructuredToTime(record.exit_time) : '';

  const [localStatus, setLocalStatus] = useState(record?.status || 'present');
  const [localIn, setLocalIn] = useState(inTimeStr || '08:00');
  const [localOut, setLocalOut] = useState(outTimeStr || '16:00');
  const [localRemarks, setLocalRemarks] = useState(record?.remarks || '');

  useEffect(() => {
    let s = 'present';
    if (record?.status === 'P' || record?.status === 'present') s = 'present';
    else if (record?.status === 'A' || record?.status === 'absent') s = 'absent';
    else if (record?.status === 'L' || record?.status === 'Late') s = 'leave';
    setLocalStatus(s);
    setLocalIn(inTimeStr || '08:00');
    setLocalOut(outTimeStr || '16:00');
    setLocalRemarks(record?.remarks || '');
  }, [record, inTimeStr, outTimeStr]);

  return (
    <div className={`h-20 p-2 rounded-xl flex flex-col justify-between relative border border-l-4 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-white/[0.04] ${colorClasses} ${isToday ? 'ring-1 ring-indigo-500 border-indigo-500' : ''}`}>
      <div className="flex justify-between items-start">
        <span className={`font-mono font-bold text-xs ${record ? 'text-text-main dark:text-white' : 'text-text-secondary opacity-50'}`}>
          {String(day).padStart(2, '0')}
        </span>

        {!isPastRecordLocked ? (
          <button
            onClick={onToggleMenu}
            className="p-0.5 text-text-secondary dark:text-slate-500 hover:text-text-main dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[13px]">edit_note</span>
          </button>
        ) : (
          <span className="material-symbols-outlined text-[12px] text-slate-350 dark:text-slate-600 pointer-events-none" title="Locked">
            lock
          </span>
        )}
      </div>

      <div className="text-[9px] font-semibold text-text-secondary dark:text-slate-400 mt-1 leading-tight">
        {isAbsent ? (
          <span className="text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Absent</span>
        ) : isPresent || isLate ? (
          <div className="flex flex-col gap-0.5">
            <span className={isLate ? "text-amber-650 dark:text-amber-400" : ""}>In: {inTimeStr}</span>
            <span>Out: {outTimeStr}</span>
          </div>
        ) : isUnmarkedPastDate ? (
          <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold text-[8px] uppercase tracking-wider">
            <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500"></span>
            NR
          </span>
        ) : (
          <span className="text-text-secondary/50 dark:text-slate-500 italic">Unmarked</span>
        )}
      </div>

      {/* Popover Editor Panel */}
      {isOpen && !isPastRecordLocked && (
        <div className="absolute z-50 top-7 left-1/2 -translate-x-1/2 bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/10 rounded-2xl shadow-2xl p-4 w-52 space-y-3 animate-in zoom-in-95 duration-150">
          <div className="flex justify-between items-center border-b border-border-light dark:border-white/5 pb-1.5">
            <span className="text-[10px] font-black uppercase text-text-secondary dark:text-slate-400">Day {day} punches</span>
            <button onClick={onClose} className="text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white text-xs">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wide">Status</label>
            <select
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value)}
              className="w-full text-xs bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-2.5 py-1.5 text-text-main dark:text-white outline-none focus:border-indigo-500"
            >
              <option value="present">Present</option>
              <option value="leave">Late / Leave</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          {localStatus !== 'absent' && (
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wide">In</label>
                <input
                  type="time"
                  value={localIn}
                  onChange={(e) => setLocalIn(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-1.5 py-1 text-text-main dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wide">Out</label>
                <input
                  type="time"
                  value={localOut}
                  onChange={(e) => setLocalOut(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-1.5 py-1 text-text-main dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wide">Remarks</label>
            <input
              type="text"
              placeholder="e.g. Late due to traffic"
              value={localRemarks}
              onChange={(e) => setLocalRemarks(e.target.value)}
              className="w-full text-xs bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-2 py-1 text-text-main dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => {
              onUpdate({
                status: localStatus,
                check_in_time: localIn,
                check_out_time: localOut,
                remarks: localRemarks
              });
              onClose();
            }}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            Update Punch
          </button>
        </div>
      )}
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-2 h-2 rounded-full ${color}`}></span>
    <span className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wider">{label}</span>
  </div>
);

export default TeachersAttendance;