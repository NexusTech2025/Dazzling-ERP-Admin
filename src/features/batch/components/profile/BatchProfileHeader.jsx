import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Badge from '../../../../components/ui/Badge';

const BatchProfileHeader = ({ batch, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const tabs = ['Overview', 'Students', 'Schedule', 'Attendance', 'Tests'];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold leading-tight text-text-main dark:text-white">
              Batch: {batch.batch_name}
            </h1>
            <Badge variant={batch.is_active ? 'primary' : 'default'} className="uppercase tracking-wider">
              {batch.status}
            </Badge>
          </div>
          <p className="text-text-secondary text-sm font-medium">
            {batch.course_name} • {batch.schedule.days_of_week.join(', ')} ({batch.schedule.start_time} - {batch.schedule.end_time})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-surface-light dark:bg-slate-800 text-text-secondary dark:text-slate-200 border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-bold shadow-sm">
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            <span>Options</span>
          </button>
          <Link 
            to={`/admin/batches/edit/${batch.id}`}
            className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white hover:bg-primary-dark transition-all text-sm font-bold shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
            <span>Edit Batch</span>
          </Link>
        </div>
      </div>

      <div className="border-b border-border-light dark:border-border-dark mt-2">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex items-center gap-2 border-b-[3px] pb-3 pt-2 transition-all ${
                activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-main dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {tab === 'Overview' ? 'dashboard' : tab === 'Students' ? 'group' : tab === 'Schedule' ? 'calendar_month' : tab === 'Attendance' ? 'co_present' : 'quiz'}
              </span>
              <span className="text-sm font-bold tracking-wide">{tab}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BatchProfileHeader;
