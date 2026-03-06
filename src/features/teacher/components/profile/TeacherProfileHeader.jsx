import React from 'react';
import Badge from '../../../../components/ui/Badge';

const TeacherProfileHeader = ({ teacher, activeTab, onTabChange }) => {
  const tabs = ['Overview', 'Assigned Classes', 'Salary & Payroll', 'Documents', 'Performance'];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-900/20"></div>
      <div className="relative px-6 pt-16 pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative h-32 w-32 rounded-full border-4 border-white dark:border-slate-900 shadow-lg overflow-hidden bg-primary/5 flex items-center justify-center text-primary font-black text-4xl">
              {teacher.avatar ? (
                <img src={teacher.avatar} alt={teacher.teacher_name} className="h-full w-full object-cover" />
              ) : (
                teacher.teacher_name?.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex flex-col items-center md:items-start mb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white">{teacher.teacher_name}</h2>
              <div className="flex items-center gap-2 text-text-secondary mt-1">
                <span className="text-sm font-mono bg-background-light dark:bg-background-dark px-2 py-0.5 rounded border border-border-light dark:border-border-dark">{teacher.teacher_id}</span>
                <span className="text-sm">•</span>
                <span className="text-sm font-medium">{teacher.specialization || 'Department Faculty'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
            <Badge variant={teacher.status === 'active' ? 'success' : 'default'} className="px-4 py-1 text-xs">
              {teacher.status?.toUpperCase()}
            </Badge>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark px-4 py-2 text-sm font-bold text-text-secondary dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-[18px]">mail</span>
                Message
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border-light dark:border-border-dark px-6">
        <nav className="flex -mb-px space-x-6 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold transition-all ${
                activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-main dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TeacherProfileHeader;
