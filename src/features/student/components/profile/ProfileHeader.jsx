import React from 'react';
import Badge from '../../../../components/ui/Badge';

const ProfileHeader = ({ student, activeTab, onTabChange }) => {
  const tabs = ['Overview', 'Attendance', 'Fees', 'Performance', 'Documents'];

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="size-24 md:size-32 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-4xl border-4 border-white dark:border-slate-800 shadow-md overflow-hidden shrink-0">
              {student.avatar ? (
                <img src={student.avatar} alt={student.student_name} className="h-full w-full object-cover" />
              ) : (
                student.student_name?.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white leading-tight">
                {student.student_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                <span>ID: {student.student_id}</span>
                <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <Badge variant={student.status === 'active' ? 'success' : 'default'}>
                  {student.status?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-text-secondary font-medium mt-1">Enrollment Date: {new Date(student.admission_date).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-text-main dark:text-white text-sm font-bold transition-colors flex-1 md:flex-auto border border-border-light dark:border-border-dark">
              <span className="material-symbols-outlined text-[20px]">edit</span>
              <span>Edit Profile</span>
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-colors flex-1 md:flex-auto shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">mail</span>
              <span>Message</span>
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-border-light dark:border-border-dark px-6">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex items-center justify-center border-b-[3px] pb-3 pt-4 min-w-fit transition-all ${
                activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-main dark:hover:text-white'
              }`}
            >
              <span className="text-sm font-bold">{tab}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
