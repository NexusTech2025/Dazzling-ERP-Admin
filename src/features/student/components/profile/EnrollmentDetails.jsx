import React from 'react';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';

const EnrollmentDetails = ({ enrollments }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-text-main dark:text-white text-xl font-bold">Enrollment History</h3>
      <Badge variant="primary">{enrollments?.length || 0} Active Enrollments</Badge>
    </div>
    
    <div className="space-y-4">
      {enrollments?.length > 0 ? enrollments.map((enr, idx) => (
        <div 
          key={enr.enrollment_id} 
          className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <span className="material-symbols-outlined">auto_stories</span>
            </div>
            <div>
              <p className="font-bold text-text-main dark:text-white">{enr.course_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-secondary font-medium">{enr.batch_name}</span>
                <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span className="text-xs text-text-secondary font-medium">Joined: {new Date(enr.enrollment_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Duration</p>
              <p className="text-xs font-bold text-text-main dark:text-white">{enr.duration}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={enr.status === 'active' ? 'success' : 'default'}>
                {enr.status?.toUpperCase()}
              </Badge>
              <span className="text-[9px] font-mono text-text-secondary opacity-50 uppercase tracking-tighter">
                {enr.enrollment_id}
              </span>
            </div>
          </div>
        </div>
      )) : (
        <div className="py-8 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-xl">
          <span className="material-symbols-outlined text-text-secondary/20 text-4xl mb-2">history_edu</span>
          <p className="text-sm text-text-secondary italic">No active enrollments found for this student.</p>
        </div>
      )}
    </div>
  </Card>
);

export default EnrollmentDetails;
