import React from 'react';
import Card from '../../../../components/ui/Card';

const BatchDetailsCard = ({ batch }) => {
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
          value={batch.instructor_name || batch.teacher_name} 
          subValue="Faculty" 
        />
        <DetailItem 
          icon="schedule" 
          label="Timings" 
          value={batch.has_schedule ? `${batch.schedule.start_time} - ${batch.schedule.end_time}` : 'No schedule'} 
          subValue={batch.has_schedule ? batch.schedule.days_of_week.join(', ') : ''} 
        />
        <DetailItem 
          icon="location_on" 
          label="Branch" 
          value={batch.branch_id === 'BR-001' ? 'Main Campus' : 'City Center'} 
          subValue="Classroom 101" 
        />
        <DetailItem 
          icon="menu_book" 
          label="Current Module" 
          value={batch.course_name} 
          subValue={batch.end_date ? `Est. completion: ${new Date(batch.end_date).toLocaleDateString()}` : 'No end date'} 
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
