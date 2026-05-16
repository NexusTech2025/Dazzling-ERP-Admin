import React, { useState, useMemo, useEffect } from 'react';
import { useTeacherAttendanceQuery, useUpdateTeacherAttendanceMutation } from '../../hooks/useTeacherQueries';
import Card from '../../../../components/ui/Card';

/**
 * TeachersAttendance Component
 * Renders a comprehensive, interactive attendance dashboard for a specific teacher.
 */
const TeachersAttendance = ({ teacherId }) => {
  const { data: attendance = [], isLoading } = useTeacherAttendanceQuery(teacherId);
  const updateMutation = useUpdateTeacherAttendanceMutation();
  
  const [currentMonth, setCurrentMonth] = useState(1); // 0 = Jan, 1 = Feb (based on mock data)
  const [currentYear, setCurrentYear] = useState(2026);
  const [activeMenu, setActiveMenu] = useState(null);

  // Close menu when clicking outside could be added here, but omitted for simplicity
  
  // --- Logic & Calculations ---

  const monthData = useMemo(() => {
    return attendance.filter(record => {
      if (!record.attendance_date) return false;
      const [year, month] = record.attendance_date.split('-');
      return parseInt(month, 10) - 1 === currentMonth && parseInt(year, 10) === currentYear;
    });
  }, [attendance, currentMonth, currentYear]);

  const stats = useMemo(() => {
    const presentDays = monthData.filter(r => r.status === 'present').length;
    const totalWorkingDays = 24; // Mock standard
    const lateArrivals = monthData.filter(r => {
      if (r.status !== 'present' || !r.check_in_time) return false;
      const [hours, minutes] = r.check_in_time.split(':').map(Number);
      return hours > 9 || (hours === 9 && minutes > 0);
    }).length;
    const absentCount = monthData.filter(r => r.status === 'absent' || r.status === 'leave').length;
    
    const totalHours = monthData.reduce((acc, r) => acc + (r.working_hours || 0), 0);
    const avgHours = presentDays > 0 ? (totalHours / presentDays).toFixed(1) : 0;

    return { presentDays, totalWorkingDays, lateArrivals, absentCount, avgHours };
  }, [monthData]);

  const efficiencyScore = useMemo(() => {
    if (attendance.length === 0) return 0;
    const presentTotal = attendance.filter(r => r.status === 'present').length;
    return ((presentTotal / attendance.length) * 100).toFixed(1);
  }, [attendance]);

  // --- Render Helpers ---

  const handleUpdateDay = (dateStr, updates) => {
    updateMutation.mutate({
      teacherId,
      date: dateStr,
      data: updates
    });
  };

  if (isLoading) return <div className="py-20 text-center text-text-secondary">Loading records...</div>;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let firstDay = new Date(currentYear, currentMonth, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust so Monday is 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Working Days" 
          value={stats.presentDays} 
          subValue={`/ ${stats.totalWorkingDays} days`}
          icon="event_available"
          color="blue"
          progress={(stats.presentDays / stats.totalWorkingDays) * 100}
        />
        <StatCard 
          label="Late Arrivals" 
          value={stats.lateArrivals} 
          subValue="-12% vs last mo."
          icon="schedule"
          color="amber"
          footer={`Avg. Delay: 8 mins`}
        />
        <StatCard 
          label="Absent Counts" 
          value={stats.absentCount} 
          subValue="Paid Leaves"
          icon="event_busy"
          color="rose"
          footer="Remaining Leaves: 14"
        />
        <StatCard 
          label="Avg. Work Hours" 
          value={stats.avgHours} 
          subValue="Hrs/Day"
          icon="timer"
          color="emerald"
          showAvatars
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Interactive Attendance Matrix */}
        <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
          <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
            <h3 className="text-lg font-black text-text-main dark:text-white">Attendance Matrix</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                  else setCurrentMonth(m => m - 1);
                }}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-text-secondary transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="text-sm font-black px-2 uppercase tracking-tight">
                {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => {
                  if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                  else setCurrentMonth(m => m + 1);
                }}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-text-secondary transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-7 mb-4 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-text-secondary uppercase tracking-widest">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells before 1st of month */}
              {[...Array(firstDay)].map((_, i) => (
                <div key={`empty-${i}`} className="h-24" />
              ))}
              
              {/* Actual days */}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const record = monthData.find(r => r.attendance_date === dateStr);
                const isOpen = activeMenu === dateStr;
                
                return (
                  <CalendarDay 
                    key={day} 
                    day={day} 
                    dateStr={dateStr}
                    record={record} 
                    isOpen={isOpen}
                    onToggleMenu={() => setActiveMenu(isOpen ? null : dateStr)}
                    onUpdate={(updates) => handleUpdateDay(dateStr, updates)}
                    onClose={() => setActiveMenu(null)}
                    isToday={day === 12 && currentMonth === 2 && currentYear === 2026} // Mock today
                  />
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 flex flex-wrap gap-6 border-t border-border-light dark:border-border-dark">
            <LegendItem color="bg-emerald-500" label="On Time" />
            <LegendItem color="bg-amber-500" label="Late Arrival" />
            <LegendItem color="bg-rose-500" label="Absent / Leave" />
            <LegendItem color="bg-slate-300" label="No Record" />
          </div>
        </div>

        {/* 3. Sidebar: Exceptions & Efficiency */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xs font-black text-text-main dark:text-white mb-6 uppercase tracking-widest">Exception Log</h3>
            <div className="space-y-6">
              <ExceptionItem 
                icon="warning" 
                color="amber" 
                title="Late Arrival (15m)" 
                date="Feb 06, 2026" 
                note="Subway delay on Line 4. Notified principal via mobile." 
              />
              <ExceptionItem 
                icon="medical_services" 
                color="rose" 
                title="Full Day Sick Leave" 
                date="Feb 08, 2026" 
                note="Approved by: Admin (Dr. Michael)" 
              />
              <ExceptionItem 
                icon="add_task" 
                color="emerald" 
                title="Overtime Approved" 
                date="Feb 11, 2026" 
                note="+1.5 hours for parent conference." 
              />
            </div>
            <button className="w-full mt-8 py-2.5 px-4 border border-border-light dark:border-border-dark rounded-xl text-[10px] font-black text-text-secondary hover:text-primary hover:border-primary transition-all uppercase tracking-widest">
              View All Exceptions
            </button>
          </Card>

          <div className="bg-gradient-to-br from-primary to-blue-700 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined">stars</span>
              <h3 className="text-xs font-black uppercase tracking-widest">Efficiency Badge</h3>
            </div>
            <p className="text-4xl font-black mb-1">{efficiencyScore}%</p>
            <p className="text-[10px] text-blue-100 font-bold opacity-80 mb-4 uppercase tracking-wider">Consistency Score this Quarter</p>
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="bg-white h-full" style={{ width: `${efficiencyScore}%` }}></div>
            </div>
            <p className="mt-5 text-[10px] leading-relaxed text-blue-50 font-medium">This teacher is in the top 5% of staff for consistency. High eligibility for the 'Teacher of the Month' grant.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Internal Sub-components ---

const StatCard = ({ label, value, subValue, icon, color, progress, footer, showAvatars }) => {
  const colors = {
    blue: 'bg-blue-50 text-primary dark:bg-blue-900/30',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-text-secondary tracking-widest uppercase">{label}</span>
        <div className={`size-8 rounded-xl ${colors[color]} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-sm">{icon}</span>
        </div>
      </div>
      <div>
        <span className="text-3xl font-black text-text-main dark:text-white">{value}</span>
        <span className="text-xs font-bold text-text-secondary ml-1">{subValue}</span>
      </div>
      {progress !== undefined && (
        <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {footer && <p className="text-[10px] text-text-secondary mt-4 uppercase font-black tracking-tighter">{footer}</p>}
      {showAvatars && (
        <div className="mt-4 flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`size-6 rounded-full bg-emerald-${i * 100} border-2 border-white dark:border-slate-900`}></div>
          ))}
        </div>
      )}
    </div>
  );
};

const CalendarDay = ({ day, record, isOpen, onToggleMenu, onUpdate, onClose, isToday }) => {
  const isPresent = record?.status === 'present';
  const isLeave = record?.status === 'leave' || record?.status === 'absent';
  
  // Determine if late based on check_in_time
  let isLate = false;
  if (isPresent && record.check_in_time) {
     const [hours, minutes] = record.check_in_time.split(':').map(Number);
     isLate = hours > 9 || (hours === 9 && minutes > 0);
  }

  // Format HH:mm:ss to HH:mm for display
  const formatTime = (timeStr) => {
    if (!timeStr) return null;
    return timeStr.slice(0, 5); 
  };

  const baseClasses = "h-24 p-2 rounded-lg flex flex-col relative transition-all";
  
  let stateClasses = "bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark border-l-4 border-l-slate-300";
  
  if (isPresent) {
    stateClasses = isLate 
      ? "bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 border-l-4 border-l-amber-500"
      : "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 border-l-4 border-l-emerald-500";
  } else if (record?.status === 'absent') {
    stateClasses = "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 border-l-4 border-l-red-500";
  } else if (record?.status === 'leave') {
    stateClasses = "bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 border-l-4 border-l-rose-500";
  }

  if (isToday) stateClasses += " ring-2 ring-primary";

  // Default values for edit menu
  const currentStatus = record?.status || 'present';
  const currentIn = formatTime(record?.check_in_time) || '09:00';
  const currentOut = formatTime(record?.check_out_time) || '17:00';

  return (
    <div className={`${baseClasses} ${stateClasses}`}>
      <div className="flex justify-between items-start">
        <span className={`font-bold text-sm ${record ? 'text-text-main dark:text-white' : 'text-text-secondary opacity-50'}`}>
          {String(day).padStart(2, '0')}
        </span>

        <button
          onClick={onToggleMenu}
          className="p-1 text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">more_vert</span>
        </button>
      </div>

      {/* Status Display */}
      <div className="mt-auto text-[10px] text-text-secondary font-medium">
        {(!record) ? (
           <div className="text-slate-400 italic">No Record</div>
        ) : (isLeave) ? (
          <div className="font-black uppercase tracking-wide">
            {record.status === 'absent' ? 'Absent' : 'On Leave'}
          </div>
        ) : (
          <>
            <div className={isLate ? "text-amber-600 font-bold" : ""}>In: {formatTime(record.check_in_time)}</div>
            <div>Out: {formatTime(record.check_out_time)}</div>
          </>
        )}
      </div>

      {/* Editable Popover Menu */}
      {isOpen && (
        <div className="absolute z-50 top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg shadow-xl p-3 w-48 space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Status</label>
            <select
              value={currentStatus}
              onChange={(e) => onUpdate({ status: e.target.value })}
              className="w-full text-xs border border-border-light dark:border-border-dark rounded-md px-2 py-1.5 bg-surface-light dark:bg-surface-dark outline-none focus:border-primary"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
            </select>
          </div>

          {currentStatus === 'present' && (
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase">In</label>
                <input
                  type="time"
                  value={currentIn}
                  onChange={(e) => onUpdate({ check_in_time: `${e.target.value}:00` })}
                  className="w-full text-xs border border-border-light dark:border-border-dark rounded-md px-1 py-1.5 bg-surface-light dark:bg-surface-dark outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Out</label>
                <input
                  type="time"
                  value={currentOut}
                  onChange={(e) => onUpdate({ check_out_time: `${e.target.value}:00` })}
                  className="w-full text-xs border border-border-light dark:border-border-dark rounded-md px-1 py-1.5 bg-surface-light dark:bg-surface-dark outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary rounded-md py-1.5 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

const ExceptionItem = ({ icon, color, title, date, note }) => {
  const colors = {
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'
  };

  return (
    <div className="flex gap-4">
      <div className={`flex-shrink-0 size-10 rounded-full ${colors[color]} flex items-center justify-center`}>
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-text-main dark:text-white truncate">{title}</p>
        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{date}</p>
        {note && (
          <div className="mt-2 p-3 bg-background-light dark:bg-background-dark/50 rounded-xl text-[11px] text-text-secondary leading-relaxed italic border border-border-light dark:border-border-dark">
            "{note}"
          </div>
        )}
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <span className={`size-2.5 rounded-full ${color}`}></span>
    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{label}</span>
  </div>
);

export default TeachersAttendance;