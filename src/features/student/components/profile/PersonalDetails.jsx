import React from 'react';
import Card from '../../../../components/ui/Card';

const PersonalDetails = ({ student, address, contact, onEdit }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-text-main dark:text-white text-xl font-bold">Personal Information</h3>
      <button onClick={onEdit} className="text-primary text-sm font-bold hover:underline">Update</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
      <DetailField label="Date of Birth" value={student.dob} />
      <DetailField label="Gender" value={student.gender} />
      <DetailField label="Email Address" value={contact?.email} />
      <DetailField label="Phone Number" value={contact?.mobile_number} />
      <div className="md:col-span-2">
        <DetailField 
          label="Current Address" 
          value={address ? `${address.line1}, ${address.line2 ? address.line2 + ', ' : ''}${address.city}, ${address.state} ${address.pin_code}` : 'N/A'} 
        />
      </div>
    </div>
  </Card>
);

const DetailField = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">{label}</p>
    <p className="text-text-main dark:text-white font-bold">{value || 'N/A'}</p>
  </div>
);

export default PersonalDetails;
