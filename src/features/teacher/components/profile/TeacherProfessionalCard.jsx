import React from 'react';
import Card from '../../../../components/ui/Card';

/**
 * TeacherProfessionalCard: Displays HR and professional history details.
 */
const TeacherProfessionalCard = ({ teacher }) => {
  const profItems = [
    { 
      label: 'Qualification', 
      value: teacher.qualification, 
      icon: 'school',
      colorClasses: 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 border-blue-100/30 dark:border-blue-900/10'
    },
    { 
      label: 'Preferred Slot', 
      value: teacher.prefered_time_slot, 
      icon: 'schedule',
      colorClasses: 'text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20 border-purple-100/30 dark:border-purple-900/10'
    },
    { 
      label: 'Specialization', 
      value: teacher.specialization || 'Not specified', 
      icon: 'psychology',
      colorClasses: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100/30 dark:border-emerald-900/10'
    }
  ];

  return (
    <Card className="h-full">
      <Card.Header border={true} className="flex items-center gap-2 border-b border-border-light dark:border-border-dark bg-slate-50/20 dark:bg-slate-800/20">
        <span className="material-symbols-outlined text-text-secondary text-xl">work</span>
        <h3 className="text-lg font-bold text-text-main dark:text-white">
          Professional Details
        </h3>
      </Card.Header>

      <Card.Body className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profItems.map((item) => (
            <div key={item.label} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2 border border-border-light/40 dark:border-border-dark/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/75 transition-all">
              <div className="flex items-center gap-2 text-text-secondary">
                <div className={`h-7 w-7 rounded-md border flex items-center justify-center ${item.colorClasses}`}>
                  <span className="material-symbols-outlined text-sm">{item.icon}</span>
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase">{item.label}</span>
              </div>
              <p className="text-sm font-bold text-text-main dark:text-white">{item.value || 'Not specified'}</p>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TeacherProfessionalCard;
