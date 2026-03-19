import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, onDelete }) => {
  // Generate random gradients or use based on segment
  const gradients = {
    'SEG-ACA': 'from-blue-500 to-cyan-400',
    'SEG-FND': 'from-purple-500 to-pink-400',
    'SEG-CMP': 'from-orange-400 to-amber-300',
    'default': 'from-emerald-500 to-teal-400'
  };

  const gradient = gradients[course.segment_id] || gradients.default;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm hover:shadow-md transition-all duration-300">
      {/* Gradient Header */}
      <div className={`h-32 w-full bg-gradient-to-r ${gradient} p-6 flex items-start justify-between relative`}>
        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
          <span className="material-symbols-outlined text-white">
            {course.segment_id === 'SEG-CMP' ? 'computer' : course.segment_id === 'SEG-FND' ? 'star' : 'school'}
          </span>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur-sm uppercase tracking-wider">
            {course.short_code || course.course_id}
          </span>
          {course.language_medium && (
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[9px] font-black text-white backdrop-blur-sm uppercase tracking-widest border border-white/10">
              {course.language_medium}
            </span>
          )}
        </div>
        
        {/* Absolute delete button for admin */}
        <button 
          onClick={() => onDelete(course.course_id, course.name)}
          className="absolute top-2 left-2 p-1.5 bg-black/10 hover:bg-red-500 text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4">
          <h4 className="text-lg font-bold text-text-main dark:text-white line-clamp-1">
            {course.name}
          </h4>
          <p className="text-xs font-bold text-text-secondary uppercase tracking-tighter mt-1">
            {course.segment_name || 'Academic'} • {course.duration_value} {course.duration_unit}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Base Fee</p>
            <p className="text-sm font-black text-text-main dark:text-white">${course.base_fee?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Installments</p>
            <p className="text-sm font-black text-text-main dark:text-white">{course.default_installment_count} Steps</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-3">
          <Link 
            to={`/admin/courses/${course.course_id}`}
            className="flex items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 px-3 py-2 text-sm font-bold text-text-secondary dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            Details
          </Link>
          <button className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
