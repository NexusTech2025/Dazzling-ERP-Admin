import React from 'react';
import Card from '../../../../components/ui/Card';
import DetailField from '../../../../components/ui/v2/KeyValuePair';

/**
 * TeacherContactDetails: Specific component for teacher's contact information.
 * Refactored to consume Core KeyValuePair with icons with aliased name DetailField.
 */
const TeacherContactDetails = ({ teacher }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary">contact_phone</span>
          Contact Details
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        <DetailField 
          label="Email Address" 
          value={teacher.email} 
          icon="mail"
          className="group"
        />
        
        <DetailField 
          label="Phone Number" 
          value={teacher.mobile_number} 
          icon="call"
          fallback="No phone number"
        />
        
        <DetailField 
          label="Residential Address" 
          value={teacher.address} 
          icon="location_on"
          fallback="Not provided"
          className="md:col-span-2"
        />
      </div>
    </Card>
  );
};

export default TeacherContactDetails;
