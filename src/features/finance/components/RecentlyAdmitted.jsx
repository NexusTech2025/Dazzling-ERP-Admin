import React from 'react';
import Card from '../../../components/ui/Card';

const RecentlyAdmitted = ({ students, onSelect }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-main dark:text-white flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-[18px] text-primary">history</span>
          Recently Admitted
        </h3>
      </div>
      
      <div className="flex flex-col gap-2">
        {students.length > 0 ? students.map((student) => (
          <div 
            key={student.student_id}
            onClick={() => onSelect(student)}
            className="flex items-center gap-3 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-2.5 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            {student.avatar ? (
              <img src={student.avatar} alt={student.student_name} className="h-9 w-9 rounded-full object-cover border border-border-light dark:border-border-dark" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
                {student.student_name ? student.student_name.substring(0, 2).toUpperCase() : '??'}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">{student.student_name}</span>
              <span className="truncate text-[10px] font-medium text-text-secondary uppercase tracking-tight">{student.student_id}</span>
            </div>
            <span className="material-symbols-outlined text-primary text-[16px] ml-auto opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
          </div>
        )) : (
          <div className="p-8 border-2 border-dashed border-border-light dark:border-border-dark rounded-xl flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-text-secondary/30 text-4xl mb-2">person_search</span>
            <p className="text-xs text-text-secondary">No recent admissions found</p>
          </div>
        )}
      </div>

      {/* Helpful tip */}
      <Card className="p-4 bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20">
        <div className="flex gap-2">
          <span className="material-symbols-outlined text-amber-500 text-[18px]">lightbulb</span>
          <p className="text-[10px] text-amber-800 dark:text-amber-400 leading-relaxed">
            Quickly select a student from the recent admissions list to save time during the enrollment process.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RecentlyAdmitted;
