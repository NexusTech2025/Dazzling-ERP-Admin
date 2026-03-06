import React from 'react';
import Card from '../../../../components/ui/Card';

const AttendanceSummaryCards = ({ registry = [] }) => {
  const total = registry.length;
  const present = registry.filter(r => r.status === 'Present').length;
  const absent = registry.filter(r => r.status === 'Absent').length;
  const late = registry.filter(r => r.status === 'Late').length;
  const unmarked = registry.filter(r => r.status === 'Unmarked').length;
  
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <SummaryCard 
        label="Total Students" 
        value={total} 
        icon="groups" 
        color="text-primary" 
      />
      <SummaryCard 
        label="Today's Present" 
        value={present} 
        icon="check_circle" 
        color="text-emerald-500" 
        border="border-l-4 border-l-emerald-500"
      />
      <SummaryCard 
        label="Absentees" 
        value={absent} 
        icon="cancel" 
        color="text-rose-500" 
      />
      <SummaryCard 
        label="Late / Delayed" 
        value={late} 
        icon="schedule" 
        color="text-amber-500" 
      />
      <SummaryCard 
        label="Attendance Rate" 
        value={`${rate}%`} 
        icon="trending_up" 
        color="text-indigo-500" 
      />
    </div>
  );
};

const SummaryCard = ({ label, value, icon, color, border = "" }) => (
  <Card className={`p-4 flex flex-col justify-between h-24 ${border}`}>
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{label}</span>
      <span className={`material-symbols-outlined text-[18px] ${color} opacity-70`}>{icon}</span>
    </div>
    <p className="text-2xl font-black text-text-main dark:text-white leading-none">{value}</p>
  </Card>
);

export default AttendanceSummaryCards;
