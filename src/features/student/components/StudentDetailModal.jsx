import React from 'react';
import Badge from '../../../components/ui/Badge';

const StudentDetailModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const detailFields = [
    { label: 'Student ID', value: student.student_id, icon: 'badge' },
    { label: 'Full Name', value: student.student_name, icon: 'person' },
    { label: 'Father\'s Name', value: student.father_name, icon: 'family_history' },
    { label: 'Mother\'s Name', value: student.mother_name, icon: 'family_history' },
    { label: 'Email', value: student.email, icon: 'mail' },
    { label: 'Phone', value: student.phone, icon: 'phone' },
    { label: 'Gender', value: student.gender, icon: 'wc' },
    { label: 'Date of Birth', value: student.date_of_birth, icon: 'calendar_today' },
    { label: 'Admission Date', value: student.admission_date, icon: 'event_available' },
    { label: 'Branch ID', value: student.branch_id, icon: 'location_on' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-border-light dark:border-border-dark w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-xl font-bold text-text-main dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Student Details
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="size-32 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-4xl border-4 border-white dark:border-slate-800 shadow-md">
                {student.student_name ? student.student_name.substring(0, 2).toUpperCase() : '??'}
              </div>
              <Badge variant={student.status === 'active' ? 'success' : 'default'} className="px-4 py-1 text-xs">
                {student.status?.toUpperCase()}
              </Badge>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {detailFields.map((field, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">{field.icon}</span>
                    {field.label}
                  </span>
                  <span className="text-sm font-bold text-text-main dark:text-white truncate">
                    {field.value || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-border-light dark:border-border-dark flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
