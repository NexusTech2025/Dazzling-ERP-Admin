import React from 'react';
import Card from '../../../../components/ui/Card';

const TeacherProfessionalLog = () => (
  <Card className="flex flex-col h-full">
    <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
      <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-text-secondary">history</span>
        Professional Activity Log
      </h3>
    </div>
    <div className="p-6">
      <div className="relative pl-4 border-l-2 border-border-light dark:border-border-dark space-y-8">
        <TimelineItem 
          color="bg-primary" 
          time="Today, 09:30 AM" 
          title="Physics Assignment Posted" 
          desc="Quantum Mechanics Intro uploaded for Grade 11-A." 
        />
        <TimelineItem 
          color="bg-slate-400" 
          time="Yesterday, 2:15 PM" 
          title="Attendance Marked" 
          desc="Marked attendance for Grade 12-B batch." 
        />
        <TimelineItem 
          color="bg-green-500" 
          time="Oct 24, 2023" 
          title="Leave Request Approved" 
          desc="Sick leave request for Oct 25 approved by Admin." 
        />
        <TimelineItem 
          color="bg-amber-500" 
          time="Oct 15, 2023" 
          title="Performance Review" 
          desc="Quarterly review completed with HOD." 
        />
      </div>
      <button className="w-full mt-8 py-2.5 text-xs font-black uppercase tracking-widest text-text-secondary hover:text-primary border border-dashed border-border-light dark:border-border-dark rounded-xl hover:bg-primary/5 transition-all">
        View Full Activity Log
      </button>
    </div>
  </Card>
);

const TimelineItem = ({ color, time, title, desc }) => (
  <div className="relative group">
    <div className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 ${color} shadow-sm transition-transform group-hover:scale-125`}></div>
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">{time}</span>
      <p className="text-sm font-bold text-text-main dark:text-white">{title}</p>
      <p className="text-xs text-text-secondary leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

export default TeacherProfessionalLog;
