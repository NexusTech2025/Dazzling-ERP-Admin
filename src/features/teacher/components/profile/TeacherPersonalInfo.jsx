import React from 'react';
import Card from '../../../../components/ui/Card';
import KeyValuePair from '../../../../components/ui/v2/KeyValuePair';

/**
 * TeacherPersonalInfo: Specific domain component for teacher demographics.
 * Updated to include schema-driven missing fields.
 */
const TeacherPersonalInfo = ({ teacher }) => {
  return (
    <Card className="h-full">
      <Card.Header className="flex items-center gap-2">
        <span className="material-symbols-outlined text-text-secondary text-xl">person</span>
        <h3 className="text-lg font-bold text-text-main dark:text-white">
          Personal Information
        </h3>
      </Card.Header>
      
      <Card.Body>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <KeyValuePair 
            label="Full Name" 
            value={teacher.teacher_name} 
            icon="person"
          />
          <KeyValuePair 
            label="Gender" 
            value={teacher.gender} 
            icon="wc"
            className="capitalize"
          />
          <KeyValuePair 
            label="Date of Birth" 
            value={teacher.date_of_birth} 
            icon="cake"
            fallback="Not provided"
          />
          <KeyValuePair 
            label="Teacher Type" 
            value={teacher.teacher_type?.replace('_', ' ')} 
            icon="badge"
            className="capitalize"
          />
          <KeyValuePair 
            label="Joining Date" 
            value={teacher.joining_date || (teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : 'N/A')} 
            icon="calendar_today"
          />
          <KeyValuePair 
            label="Department" 
            value={teacher.department} 
            icon="account_balance"
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default TeacherPersonalInfo;
