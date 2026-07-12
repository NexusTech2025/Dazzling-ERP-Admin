import React from 'react';
import Card from '../../../../components/ui/Card';
import { DateDisplay } from '../../../../components/ui/presets/DateDisplay';
import { DateRange } from '../../../../components/ui/presets/DateRange';
import TimeRange from '../../../../components/ui/presets/TimeRange';

const BatchDetailsCard = ({ batch }) => {
  console.log("batch data: ", batch)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold leading-tight text-text-main dark:text-white">Batch Details</h3>
        <button className="text-primary hover:bg-primary/5 p-2 rounded-full transition-colors">
          <span className="material-symbols-outlined">edit_square</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        <DetailItem
          icon="person"
          label="Primary Instructor"
          value={batch.instructor_name}
          subValue="Faculty"
        />
        <DetailItem
          icon="schedule"
          label="Timings"
          value={
            batch.schedule?.start_time && batch.schedule?.end_time
              ? <TimeRange start={batch.schedule.start_time} end={batch.schedule.end_time} useBadge={true} badgeVariant="info" />
              : 'TBD'
          }
          subValue={batch.schedule?.days_of_week?.join(', ') || 'No days configured'}
        />
        <DetailItem
          icon="calendar_month"
          label="Timeline"
          value={
            batch.start_date ? (
              <DateRange start={batch.start_date} end={batch.end_date} fallback="ongoing" />
            ) : (
              'No dates configured'
            )
          }
        />
        <DetailItem
          icon="group"
          label="Capacity"
          value={`${batch.enrolled_students ?? 0} / ${batch.capacity} Enrolled`}
          subValue={`${Math.max(0, batch.capacity - (batch.enrolled_students ?? 0))} seats remaining`}
        />
        <DetailItem
          icon="location_on"
          label="Branch"
          value={batch.branch_name}
          subValue="Classroom 101"
        />
        <DetailItem
          icon="menu_book"
          label="Current Course"
          value={batch.course_name}
          subValue={
            batch.end_date ? (
              <>
                Est. completion: <DateDisplay value={batch.end_date} className="font-normal" />
              </>
            ) : (
              'No end date'
            )
          }
        />
      </div>
    </Card>
  );
};

const DetailItem = ({ icon, label, value, subValue }) => (
  <div className="flex gap-4">
    <div className="mt-1 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg text-primary h-fit">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div>
      <p className="text-sm text-text-secondary font-medium">{label}</p>
      <p className="text-base font-semibold text-text-main dark:text-white mt-0.5">{value}</p>
      {subValue && <p className="text-xs text-text-secondary mt-0.5">{subValue}</p>}
    </div>
  </div>
);

export default BatchDetailsCard;
