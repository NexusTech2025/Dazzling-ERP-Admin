import React from 'react';
import Card from '../../../../components/ui/Card';

const GuardianInfo = ({ student, contact }) => (
  <Card className="p-6">
    <h3 className="text-text-main dark:text-white text-xl font-bold mb-6">Guardian Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
      <DetailField label="Father's Name" value={student.father_name} />
      <DetailField label="Mother's Name" value={student.mother_name} />
      <DetailField label="Contact Number" value={contact?.mobile_number || student.phone} />
      <DetailField label="Emergency Contact" value={contact?.emergency_name ? `${contact.emergency_name} (${contact.emergency_phone})` : "N/A"} />
    </div>
  </Card>
);

const DetailField = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">{label}</p>
    <p className="text-text-main dark:text-white font-bold">{value || 'N/A'}</p>
  </div>
);

export default GuardianInfo;
