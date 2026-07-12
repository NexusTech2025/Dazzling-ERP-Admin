import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StatusButton from '../../../../components/ui/v2/StatusButton';
import { DateDisplay } from '../../../../components/ui/presets/DateDisplay';
import { TimeRange } from '../../../../components/ui/presets/TimeRange';
import Badge from '../../../../components/ui/Badge';

import { TabGroup, TabButton } from '../../../../components/ui/v2/Tabs';

const BatchProfileHeader = ({ batch, activeTab, onTabChange, onStatusToggle, isStatusLoading }) => {
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
            <StatusButton
              currentStatus={batch.is_active ? 'active' : 'inactive'}
              entityName="Batch"
              onStatusToggle={onStatusToggle}
              isLoading={isStatusLoading}
            />
          </div>
          <p className="text-text-secondary text-sm font-medium">
            {batch.course_name} • {batch.schedule.days_of_week.join(', ')}
            <br />
            <Badge variant='info'>{batch.batch_id}</Badge> | &nbsp;
            <TimeRange start={batch.schedule.start_time} end={batch.schedule.end_time} useBadge badgeVariant="success" />
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

      <div className="mt-2 px-4">
        <TabGroup>
          {tabs.map(tab => (
            <TabButton
              key={tab}
              active={activeTab === tab}
              onClick={() => onTabChange(tab)}
              icon={tab === 'Overview' ? 'dashboard' : tab === 'Students' ? 'group' : tab === 'Schedule' ? 'calendar_month' : tab === 'Attendance' ? 'co_present' : 'quiz'}
            >
              {tab}
            </TabButton>
          ))}
        </TabGroup>
      </div>
    </div>
  );
};

export default BatchProfileHeader;
