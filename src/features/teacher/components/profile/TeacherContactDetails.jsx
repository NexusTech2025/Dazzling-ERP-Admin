import React from 'react';
import Card from '../../../../components/ui/Card';

const TeacherContactDetails = ({ teacher }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-text-secondary">contact_phone</span>
        Contact Details
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
      <div>
        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Email Address</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-text-main dark:text-white">{teacher.email}</p>
          <button className="text-primary hover:underline text-[10px] font-black uppercase tracking-tighter">Copy</button>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Phone Number</p>
        <p className="text-sm font-bold text-text-main dark:text-white">{teacher.mobile || 'N/A'}</p>
      </div>
      <div className="md:col-span-2">
        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Residential Address</p>
        <p className="text-sm font-bold text-text-main dark:text-white">42 Abbey Road, Liverpool, L8 0SS, United Kingdom (Mock)</p>
      </div>
    </div>
  </Card>
);

export default TeacherContactDetails;
