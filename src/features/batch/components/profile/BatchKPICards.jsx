import React from 'react';
import Card from '../../../../components/ui/Card';

const BatchKPICards = ({ batch, studentsCount }) => {
  const fillPercentage = Math.round((studentsCount / (batch.capacity || 1)) * 100);
  let colorClass = 'bg-primary';
  if (fillPercentage > 90) colorClass = 'bg-red-500';
  else if (fillPercentage > 70) colorClass = 'bg-amber-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4"></div>
        <div className="flex justify-between items-start">
          <p className="text-text-secondary text-sm font-black uppercase tracking-widest">Total Enrolled</p>
          <span className="material-symbols-outlined text-primary/70">groups</span>
        </div>
        <div className="flex items-baseline gap-3 mt-2">
          <p className="text-3xl font-black leading-tight text-text-main dark:text-white">{studentsCount}</p>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4">
          <div className={`${colorClass} h-1.5 rounded-full`} style={{ width: `${Math.min(fillPercentage, 100)}%` }}></div>
        </div>
        <p className="text-xs font-medium text-text-secondary mt-2">{fillPercentage}% of capacity ({batch.capacity})</p>
      </Card>

      <Card className="p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -mr-4 -mt-4"></div>
        <div className="flex justify-between items-start">
          <p className="text-text-secondary text-sm font-black uppercase tracking-widest">Available Seats</p>
          <span className="material-symbols-outlined text-amber-500/70">event_seat</span>
        </div>
        <div className="flex items-baseline gap-3 mt-2">
          <p className="text-3xl font-black leading-tight text-text-main dark:text-white">
            {Math.max(0, (batch.capacity || 0) - studentsCount)}
          </p>
        </div>
        <p className="text-xs font-medium text-text-secondary mt-auto pt-6">Based on current capacity</p>
      </Card>

      <Card className="p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4"></div>
        <div className="flex justify-between items-start">
          <p className="text-text-secondary text-sm font-black uppercase tracking-widest">Attendance Avg</p>
          <span className="material-symbols-outlined text-emerald-500/70">how_to_reg</span>
        </div>
        <div className="flex items-baseline gap-3 mt-2">
          <p className="text-3xl font-black leading-tight text-text-main dark:text-white">92%</p>
          <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
            <span className="material-symbols-outlined text-[16px]">trending_up</span> +2%
          </span>
        </div>
        <p className="text-xs font-medium text-text-secondary mt-auto pt-4">Compared to last week</p>
      </Card>
    </div>
  );
};

export default BatchKPICards;
