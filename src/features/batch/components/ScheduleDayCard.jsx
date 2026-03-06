import React from 'react';
import Card from '../../../components/ui/Card';
import ScheduleSlot from './ScheduleSlot';

const ScheduleDayCard = ({ day, slots = [] }) => {
  const isOffDay = slots.length === 0;

  return (
    <div className={`flex flex-col md:flex-row rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5 shadow-sm transition-all duration-300 ${isOffDay ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-md hover:border-primary/20'}`}>
      <div className="mb-4 md:mb-0 md:w-48 shrink-0 flex items-center md:items-start pt-2">
        <h4 className={`text-lg font-black tracking-tight ${isOffDay ? 'text-text-secondary' : 'text-text-main dark:text-white'} w-24 uppercase`}>
          {day}
        </h4>
      </div>
      
      <div className="flex flex-1 flex-col gap-3">
        {isOffDay ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/30 py-8">
            <p className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">weekend</span> 
              Self Study / No Classes
            </p>
          </div>
        ) : (
          slots.map(slot => (
            <ScheduleSlot key={slot.id} slot={slot} />
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduleDayCard;
