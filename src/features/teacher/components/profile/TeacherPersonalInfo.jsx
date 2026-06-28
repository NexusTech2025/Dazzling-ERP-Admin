import React from 'react';
import Card from '../../../../components/ui/Card';
import { formatProfileDate } from '../../utils/teacher_workspace';

/**
 * TeacherPersonalInfo: Specific domain component for teacher demographics.
 */
const TeacherPersonalInfo = ({ teacher }) => {
  const infoItems = [
    { 
      label: 'Gender', 
      value: teacher.gender, 
      icon: 'wc',
      colorClasses: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100/50 dark:border-blue-900/30'
    },
    { 
      label: 'Birthday', 
      value: formatProfileDate(teacher.date_of_birth), 
      icon: 'cake',
      colorClasses: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100/50 dark:border-rose-900/30'
    },
    { 
      label: 'Joined', 
      value: formatProfileDate(teacher.joining_date), 
      icon: 'calendar_today',
      colorClasses: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/30'
    },
    { 
      label: 'Type', 
      value: teacher.teacher_type?.replace('_', ' '), 
      icon: 'schedule',
      colorClasses: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border-teal-100/50 dark:border-teal-900/30'
    }
  ];

  return (
    <Card className="h-full">
      <Card.Header border={true} className="flex justify-between items-center bg-slate-50/20 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary text-xl">person</span>
          <h3 className="text-lg font-bold text-text-main dark:text-white">
            Personal Information
          </h3>
        </div>
        <button className="text-xs font-bold text-primary hover:underline">Update</button>
      </Card.Header>
      
      <Card.Body className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infoItems.map((item) => (
            <div key={item.label} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl flex items-center gap-4 border border-border-light/40 dark:border-border-dark/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/75 transition-all">
              <div className={`h-10 w-10 rounded-lg border flex items-center justify-center ${item.colorClasses}`}>
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-text-secondary uppercase">{item.label}</p>
                <p className="text-sm font-bold text-text-main dark:text-white capitalize">{item.value || 'Not specified'}</p>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TeacherPersonalInfo;
