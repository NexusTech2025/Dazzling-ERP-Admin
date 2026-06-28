import React from 'react';
import Card from '../../../../components/ui/Card';
import { Timeline } from '../../../../components/ui/v2/Timeline';
import Button from '../../../../components/ui/v2/Button';

/**
 * TeacherProfessionalLog: Specific domain component for teacher's activity timeline.
 * Consumes Core Timeline and Button primitives.
 */
const TeacherProfessionalLog = () => {
  // Activity data (In production, this would be a dynamic prop)
  const activityItems = [
    { 
      color: "bg-primary", 
      time: "TODAY", 
      title: "Physics Assignment Posted", 
      description: "Batch: Grade 10-A • 10:30 AM" 
    },
    { 
      color: "bg-emerald-500", 
      time: "YESTERDAY", 
      title: "Attendance Marked", 
      description: "All sessions completed" 
    },
    { 
      color: "bg-amber-500", 
      time: "OCT 24", 
      title: "Leave Request Approved", 
      description: "Casual Leave: 1 Day" 
    },
    { 
      color: "bg-purple-500", 
      time: "OCT 15", 
      title: "Performance Review", 
      description: "Quarterly Assessment Completed" 
    }
  ];

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <Card.Header border={true} className="flex justify-between items-center bg-slate-50/20 dark:bg-slate-800/20">
        <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary">history</span>
          Recent Activity
        </h3>
      </Card.Header>
      
      <Card.Body className="p-6 flex flex-col justify-between h-full">
        <Timeline items={activityItems} />
      </Card.Body>
    </Card>
  );
};

export default TeacherProfessionalLog;
