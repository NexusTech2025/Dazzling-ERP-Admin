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
      time: "Today, 09:30 AM", 
      title: "Physics Assignment Posted", 
      description: "Quantum Mechanics Intro uploaded for Grade 11-A." 
    },
    { 
      color: "bg-slate-400", 
      time: "Yesterday, 2:15 PM", 
      title: "Attendance Marked", 
      description: "Marked attendance for Grade 12-B batch." 
    },
    { 
      color: "bg-emerald-500", 
      time: "Oct 24, 2023", 
      title: "Leave Request Approved", 
      description: "Sick leave request for Oct 25 approved by Admin." 
    },
    { 
      color: "bg-amber-500", 
      time: "Oct 15, 2023", 
      title: "Performance Review", 
      description: "Quarterly review completed with HOD." 
    }
  ];

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <Card.Header className="bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary">history</span>
          Professional Activity Log
        </h3>
      </Card.Header>
      
      <Card.Body className="p-8 flex flex-col justify-between h-full">
        <Timeline items={activityItems} />
        
        <Button 
          variant="outlined" 
          size="sm" 
          className="w-full mt-8 border-dashed border-border-light dark:border-border-dark"
          startIcon="visibility"
        >
          View Full Activity Log
        </Button>
      </Card.Body>
    </Card>
  );
};

export default TeacherProfessionalLog;
