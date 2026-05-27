import React from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

export const StudentSearchCard = ({ student, onSelect, active }) => (
  <li 
    onClick={() => onSelect(student)}
    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all border ${
      active 
        ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' 
        : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'
    }`}
  >
    {student.avatarUrl ? (
      <img src={student.avatarUrl} alt={student.student_name} className="h-10 w-10 rounded-full object-cover border border-border-light dark:border-border-dark" />
    ) : (
      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-text-secondary font-bold text-sm">
        {student.student_name ? student.student_name.substring(0, 2).toUpperCase() : '??'}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-main dark:text-white truncate">{student.student_name}</h4>
        <Badge variant={student.status === 'active' ? 'success' : 'default'}>{student.status}</Badge>
      </div>
      <div className="flex items-center gap-3 mt-1 text-[11px] text-text-secondary">
        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">badge</span> {student.student_id}</span>
        <span className="truncate flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">school</span> {student.course_name || 'General'}</span>
      </div>
    </div>
    <div className={`transition-opacity ${active ? 'text-primary' : 'opacity-0'}`}>
      <span className="material-symbols-outlined">keyboard_return</span>
    </div>
  </li>
);

export const SelectedStudentCard = ({ student, onClear }) => (
  <Card variant="background" className="p-4 flex items-center gap-4 relative overflow-hidden">
    {/* Decorative background icon */}
    <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-6xl text-text-secondary/5 rotate-12 pointer-events-none">person</span>
    
    {student.avatarUrl ? (
      <img src={student.avatarUrl} alt={student.student_name} className="h-12 w-12 rounded-full object-cover border border-border-light dark:border-border-dark" />
    ) : (
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
        {student.student_name ? student.student_name.substring(0, 2).toUpperCase() : '??'}
      </div>
    )}
    
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-bold text-text-main dark:text-white">{student.student_name}</h3>
        <Badge variant={student.status === 'active' ? 'success' : 'default'}>{student.status || 'active'}</Badge>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">badge</span> {student.student_id}</span>
        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">mail</span> {student.email}</span>
        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">phone</span> {student.phone}</span>
      </div>
    </div>
    
    {onClear && (
      <button 
        onClick={onClear}
        className="text-xs font-medium text-text-secondary hover:text-red-500 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/10 z-10"
      >
        <span className="material-symbols-outlined text-[16px]">close</span> Clear
      </button>
    )}
  </Card>
);
