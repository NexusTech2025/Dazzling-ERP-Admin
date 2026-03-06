import React from 'react';
import Card from '../../../../components/ui/Card';

const BatchActivityLog = () => {
  return (
    <Card className="p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold leading-tight text-text-main dark:text-white mb-6">Recent Activity</h3>
      <div className="relative border-l-2 border-border-light dark:border-border-dark ml-3 space-y-8 pb-4">
        <LogItem 
          color="bg-primary" 
          time="Today, 09:30 AM" 
          title="Attendance Marked" 
          desc="42 students present, 3 absent." 
        />
        <LogItem 
          color="bg-slate-400" 
          time="Yesterday, 02:15 PM" 
          title="Test Results Published" 
          desc="Weekly Mock Test 4 results are now available." 
        />
        <LogItem 
          color="bg-amber-500" 
          time="Oct 12, 10:00 AM" 
          title="Material Uploaded" 
          desc="Study Notes Chapter 3 uploaded." 
        />
      </div>
      <button className="w-full mt-auto pt-4 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
        View Full History
      </button>
    </Card>
  );
};

const LogItem = ({ color, time, title, desc }) => (
  <div className="relative pl-6">
    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${color} ring-4 ring-white dark:ring-slate-800`}></div>
    <p className="text-xs font-black uppercase tracking-tighter text-text-secondary mb-1">{time}</p>
    <p className="text-sm font-bold text-text-main dark:text-white">{title}</p>
    <p className="text-sm text-text-secondary mt-1">{desc}</p>
  </div>
);

export default BatchActivityLog;
