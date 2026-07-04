import React, { useState, useMemo, useEffect } from 'react';
import { useTeacherAttendanceQuery, useUpdateTeacherAttendanceMutation } from '../../hooks/useTeacherQueries';
import { useAuth } from '../../../../context/AuthContextCore';
import { isPastLocalDate } from '../../../../lib/dateUtils';
import KpiCard from '../../../../components/ui/v2/KpiCard';
import KpiGrid from '../../../../components/ui/v2/KpiGrid';
import { normalizeAttendanceList, calculateMonthlyStats } from '../../utils/teacher_workspace';

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
  const [editingDay, setEditingDay] = useState(null);

  // Normalize attendance array to a local YYYY-MM-DD keyed map
  const normalizedAttendance = useMemo(() => {
    return normalizeAttendanceList(attendance);
  }, [attendance]);

  // Dynamic Metrics using pure workspace logic
  const stats = useMemo(() => {
    return calculateMonthlyStats(normalizedAttendance, currentYear, currentMonth);
  }, [normalizedAttendance, currentYear, currentMonth]);

  // Consistency / Efficiency score (present + late / total logs)
  const efficiencyScore = useMemo(() => {
    const totalRecords = Object.values(normalizedAttendance);
    const logs = totalRecords.length;
    if (logs === 0) return 100;
    const positiveLogs = totalRecords.filter(r => {
      const status = r.status?.toUpperCase();
      return status === 'P' || status === 'PRESENT' || status === 'L' || status === 'LATE';
    }).length;
    return Math.round((positiveLogs / logs) * 100);
  }, [normalizedAttendance]);

  // Extract exceptions (Late or Absent records)
  const exceptions = useMemo(() => {
    return Object.values(normalizedAttendance)
      .filter(r => {
        const recordDate = r._localDateInstance;
        if (!recordDate) return false;
        const isSelectedMonth = recordDate.getFullYear() === currentYear && recordDate.getMonth() === currentMonth;
        const status = r.status?.toUpperCase();
        const isException = status === 'A' || status === 'ABSENT' || status === 'L' || status === 'LATE';
        return isSelectedMonth && isException;
      })
      .map(r => ({
        id: r.attendance_id || r.attendance_date,
        date: r._localDateInstance.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        title: (r.status?.toUpperCase() === 'A' || r.status?.toUpperCase() === 'ABSENT') ? 'Absent Register' : 'Late Arrival Exception',
        status: r.status,
        remarks: r.remarks || 'No remarks provided.'
      }))
      .slice(0, 5); // display top 5
  }, [normalizedAttendance, currentYear, currentMonth]);

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

  // Monthly grid calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let firstDay = new Date(currentYear, currentMonth, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust so Monday is 0

  const { daysArray, weeks } = useMemo(() => {
    const totalGridCells = firstDay + daysInMonth;
    const totalNeededCells = Math.ceil(totalGridCells / 7) * 7;
    const days = [];
    for (let i = 0; i < totalNeededCells; i++) {
      if (i < firstDay || i >= firstDay + daysInMonth) {
        days.push(null);
      } else {
        days.push(i - firstDay + 1);
      }
    }
    const wks = [];
    for (let i = 0; i < days.length; i += 7) {
      wks.push(days.slice(i, i + 7));
    }
    return { daysArray: days, weeks: wks };
  }, [firstDay, daysInMonth]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-xs text-text-secondary dark:text-slate-400">Loading attendance profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-text-main dark:text-slate-100">

      {/* Metrics Row */}
      <KpiGrid cols={2} mdCols={4} lgCols={4} gap={4}>
        <KpiCard
          label="Working Days"
          value={`${stats.presentDays + stats.lateDays} days`}
          icon="calendar_today"
          variant="info"
          size="md"
          isCount={true}
        />
        <KpiCard
          label="Late Registries"
          value={`${stats.lateDays} days`}
          icon="schedule"
          variant="warning"
          size="md"
          isCount={true}
        />
        <KpiCard
          label="Absence logs"
          value={`${stats.absentDays} days`}
          icon="do_not_disturb_on"
          variant="danger"
          size="md"
          isCount={true}
        />
        <KpiCard
          label="Average Shift"
          value={`${stats.avgHours} hrs`}
          icon="timer"
          variant="success"
          size="md"
          isCount={true}
        />
      </KpiGrid>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Calendar Grid Sheet */}
        <div className="lg:col-span-2 relative bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col justify-between shadow-sm">
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

          {/* Desktop Calendar Grid */}
          <div className="hidden md:block p-6">
            <DesktopCalendarGrid
              daysArray={daysArray}
              normalizedAttendance={normalizedAttendance}
              setEditingDay={setEditingDay}
              currentYear={currentYear}
              currentMonth={currentMonth}
              user={user}
            />
          </div>

          {/* Mobile Transposed Calendar Grid */}
          <div className="block md:hidden p-4">
            <MobileTransposedCalendarGrid
              weeks={weeks}
              normalizedAttendance={normalizedAttendance}
              setEditingDay={setEditingDay}
              currentYear={currentYear}
              currentMonth={currentMonth}
              user={user}
            />
          </div>


          <div className="p-4 bg-slate-50 dark:bg-black/15 flex flex-wrap gap-6 border-t border-border-light dark:border-white/8 justify-center">
            <LegendItem color="bg-emerald-500" label="Present" />
            <LegendItem color="bg-amber-500" label="Late" />
            <LegendItem color="bg-rose-500" label="Absent" />
            <LegendItem color="bg-slate-400 dark:bg-slate-500" label="Not Recorded (NR)" />
            <LegendItem color="bg-slate-355 dark:bg-slate-700" label="Unmarked" />
          </div>

          {/* Centered Parent-Level Modal Overlay */}
          {editingDay && (
            <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 rounded-2xl animate-in fade-in duration-200">
              <PunchEditorPanel
                day={parseInt(editingDay.split('-')[2], 10)}
                status={normalizedAttendance[editingDay]?.status}
                inTimeStr={normalizedAttendance[editingDay]?.entry_time ? formatStructuredToTime(normalizedAttendance[editingDay].entry_time) : ''}
                outTimeStr={normalizedAttendance[editingDay]?.exit_time ? formatStructuredToTime(normalizedAttendance[editingDay].exit_time) : ''}
                remarks={normalizedAttendance[editingDay]?.remarks || ''}
                onClose={() => setEditingDay(null)}
                onUpdate={(updates) => handleUpdateDay(editingDay, updates)}
              />
            </div>
          )}
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
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${exc.status === 'L' || exc.status === 'Late' ? 'bg-amber-500/10 text-amber-655 dark:text-amber-400' : 'bg-rose-500/10 text-rose-550 dark:text-rose-400'
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
const CalendarDayCellCell = ({ day, record, dateStr, onEditClick, isToday, isPastRecordLocked }) => {
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

  return (
    <div className={`h-20 p-2 rounded-xl flex flex-col justify-between relative border border-l-4 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-white/[0.04] ${colorClasses} ${isToday ? 'ring-1 ring-indigo-500 border-indigo-500' : ''}`}>
      <div className="flex justify-between items-start">
        <span className={`font-mono font-bold text-xs ${record ? 'text-text-main dark:text-white' : 'text-text-secondary opacity-50'}`}>
          {String(day).padStart(2, '0')}
        </span>

        {!isPastRecordLocked ? (
          <button
            onClick={onEditClick}
            className="p-0.5 text-text-secondary dark:text-slate-500 hover:text-text-main dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[13px]">edit_note</span>
          </button>
        ) : (
          <span style={{ fontSize: "14px" }} className="material-symbols-outlined  text-slate-350 dark:text-slate-600 pointer-events-none" title="Locked">
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
    </div>
  );
};


/**
 * Localized popover form editor for daily clock-in/out records.
 */
const PunchEditorPanel = ({ day, status, inTimeStr, outTimeStr, remarks, onClose, onUpdate }) => {
  const [localStatus, setLocalStatus] = useState('');
  const [localIn, setLocalIn] = useState(inTimeStr || '08:00');
  const [localOut, setLocalOut] = useState(outTimeStr || '16:00');
  const [localRemarks, setLocalRemarks] = useState(remarks || '');

  useEffect(() => {
    // Keep unselected by default
    setLocalStatus('');
    setLocalIn(inTimeStr || '08:00');
    setLocalOut(outTimeStr || '16:00');
    setLocalRemarks(remarks || '');
  }, [status, inTimeStr, outTimeStr, remarks]);

  return (
    <div className="relative z-50 bg-white/95 dark:bg-[#122131]/98 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 w-[95%] sm:w-100 space-y-4 animate-in zoom-in-95 duration-150">
      <div className="flex justify-between items-center border-b border-border-light dark:border-white/5 pb-1.5">
        <span className="text-[10px] font-black uppercase text-text-secondary dark:text-slate-400">Day {day} punches</span>
        <button onClick={onClose} className="text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white text-xs">
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      </div>

      {/* P, A, L Toggling Buttons */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wide">Status</label>
        <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-black/30 border border-border-light dark:border-white/5 rounded-xl w-full">
          <button 
            type="button"
            onClick={() => setLocalStatus('present')}
            className={`flex-1 h-10 rounded-lg text-base font-black uppercase transition-all duration-200 cursor-pointer flex items-center justify-center ${localStatus === 'present' || localStatus === 'P'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105'
              : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
              }`}
          >
            P
          </button>
          <button 
            type="button"
            onClick={() => setLocalStatus('absent')}
            className={`flex-1 h-10 rounded-lg text-base font-black uppercase transition-all duration-200 cursor-pointer flex items-center justify-center ${localStatus === 'absent' || localStatus === 'A'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105'
              : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
              }`}
          >
            A
          </button>
          <button 
            type="button"
            onClick={() => setLocalStatus('leave')}
            className={`flex-1 h-10 rounded-lg text-base font-black uppercase transition-all duration-200 cursor-pointer flex items-center justify-center ${localStatus === 'leave' || localStatus === 'L'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-550/20 scale-105'
              : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
              }`}
          >
            L
          </button>
        </div>
      </div>

      {localStatus !== 'absent' && (
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wide">In</label>
            <input
              type="time"
              value={localIn}
              onChange={(e) => setLocalIn(e.target.value)}
              className="w-full text-sm bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-xl px-3 py-2 text-text-main dark:text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wide">Out</label>
            <input
              type="time"
              value={localOut}
              onChange={(e) => setLocalOut(e.target.value)}
              className="w-full text-sm bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-xl px-3 py-2 text-text-main dark:text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wide">Remarks</label>
        <input
          type="text"
          placeholder="e.g. Late due to traffic"
          value={localRemarks}
          onChange={(e) => setLocalRemarks(e.target.value)}
          className="w-full text-sm bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-xl px-3 py-2 text-text-main dark:text-white outline-none focus:border-indigo-500"
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
        disabled={!localStatus}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Update Punch
      </button>
    </div>
  );
};




const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-2 h-2 rounded-full ${color}`}></span>
    <span className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wider">{label}</span>
  </div>
);

/**
 * Desktop layout: standard 7-column calendar grid
 */
const DesktopCalendarGrid = ({ daysArray, normalizedAttendance, setEditingDay, currentYear, currentMonth, user }) => {
  return (
    <>
      <div className="grid grid-cols-7 mb-3 gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {daysArray.map((dayVal, idx) => {
          if (dayVal === null) {
            return <div key={`empty-${idx}`} className="h-20 bg-slate-50 dark:bg-white/[0.01] border border-border-light dark:border-white/[0.02] rounded-xl" />;
          }
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;
          const record = normalizedAttendance[dateStr];
          const isPastRecordLocked = isPastLocalDate(dateStr) && user?.role !== 'superadmin';
          return (
            <CalendarDayCellCell
              key={dayVal}
              day={dayVal}
              dateStr={dateStr}
              record={record}
              onEditClick={() => setEditingDay(dateStr)}
              isToday={dayVal === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()}
              isPastRecordLocked={isPastRecordLocked}
            />
          );
        })}
      </div>
    </>
  );
};

/**
 * Mobile layout: transposed weekdays in vertical column (sticky left) and weeks in horizontal columns
 */
const MobileTransposedCalendarGrid = ({ weeks, normalizedAttendance, setEditingDay, currentYear, currentMonth, user }) => {
  return (
    <div className="overflow-x-auto pb-4 select-none scrollbar-thin">
      <div className="flex gap-2 min-w-max relative">
        {/* Sticky Weekdays Left Column */}
        <div className="sticky left-0 z-20 bg-surface-light dark:bg-[#122131] pr-2 border-r border-border-light dark:border-white/8 flex flex-col gap-2 w-12 min-w-[3rem]">
          <div className="h-6 flex items-center justify-center text-[8px] font-black text-text-secondary dark:text-slate-500 uppercase">Day</div>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="h-20 flex items-center justify-center text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-wider">{day}</div>
          ))}
        </div>

        {/* Scrollable Week Columns */}
        {weeks.map((weekDays, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-2 w-32 min-w-[8rem]">
            <div className="h-6 flex items-center justify-center text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest border-b border-border-light dark:border-white/5 pb-1">
              Wk {weekIdx + 1}
            </div>
            {weekDays.map((dayVal, dayIdx) => {
              if (dayVal === null) {
                return (
                  <div key={`empty-cell-${weekIdx}-${dayIdx}`} className="h-20 bg-slate-50/20 dark:bg-white/[0.005] border border-dashed border-border-light/40 dark:border-white/[0.01] rounded-xl" />
                );
              }
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;
              const record = normalizedAttendance[dateStr];
              const isPastRecordLocked = isPastLocalDate(dateStr) && user?.role !== 'superadmin';
              return (
                <CalendarDayCellCell
                  key={dayVal}
                  day={dayVal}
                  dateStr={dateStr}
                  record={record}
                  onEditClick={() => setEditingDay(dateStr)}
                  isToday={dayVal === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()}
                  isPastRecordLocked={isPastRecordLocked}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeachersAttendance;