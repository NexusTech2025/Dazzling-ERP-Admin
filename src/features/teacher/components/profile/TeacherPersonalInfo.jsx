import React from 'react';
import Card from '../../../../components/ui/Card';

const TeacherPersonalInfo = ({ teacher }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-text-secondary">person</span>
        Personal Information
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
      <DetailField label="Full Name" value={teacher.teacher_name} />
      <DetailField label="Teacher ID" value={teacher.teacher_id} />
      <DetailField label="Specialization" value={teacher.specialization} />
      <DetailField label="Joining Date" value={teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : 'N/A'} />
      <DetailField label="Status" value={teacher.status} />
      <DetailField label="Email Address" value={teacher.email} />
    </div>
  </Card>
);

const DetailField = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">{label}</p>
    <p className="text-sm font-bold text-text-main dark:text-white">{value || 'N/A'}</p>
  </div>
);

export default TeacherPersonalInfo;
