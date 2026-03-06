import React, { useState } from 'react';
import { useBatchesQuery, useMasterTimetableQuery } from './hooks/useBatchQueries';
import MasterTimetableGrid from './components/MasterTimetableGrid';
import { LoadingState } from '../../components/ui/QueryStatus';

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const { data: batches = [], isLoading: isBatchesLoading } = useBatchesQuery();
  const { data: masterData, isLoading: isMasterLoading } = useMasterTimetableQuery(selectedDay);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (isBatchesLoading) return <LoadingState message="Initializing schedules..." />;

  return (
    <div className="mx-auto max-w-[1400px] flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-light dark:border-border-dark pb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black text-text-main dark:text-white tracking-tight">Academic Schedule</h2>
          <p className="text-sm text-text-secondary font-medium tracking-wide">Monitor master weekly slots and faculty allocations across all batches.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Quick Stats or Actions */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">System Sync</span>
            <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-500 uppercase tracking-widest">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live: {masterData?.matrix?.length || 0} Batches Tracked
            </span>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 h-11 text-[11px] font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
            Master Edit
          </button>
        </div>
      </div>

      {/* Day Selection Tabs - The "Week Selection" Requested */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
          {days.map(day => (
            <button 
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`shrink-0 rounded-xl px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                selectedDay === day 
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-md scale-105' 
                  : 'text-text-secondary hover:text-text-main dark:hover:text-white'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Schedule Table View */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-text-main dark:text-white flex items-center gap-2 uppercase tracking-tight">
            <span className="material-symbols-outlined text-primary text-2xl">grid_view</span>
            {selectedDay}'s Master Timetable
          </h3>
          {isMasterLoading && (
            <div className="flex items-center gap-2">
              <span className="size-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Computing Matrix...</span>
            </div>
          )}
        </div>

        <div className={`transition-opacity duration-300 ${isMasterLoading ? 'opacity-50' : 'opacity-100'}`}>
          <MasterTimetableGrid 
            timeSlots={masterData?.timeSlots || []} 
            matrix={masterData?.matrix || []} 
          />
        </div>
      </div>
    </div>
  );
};

export default Schedule;
