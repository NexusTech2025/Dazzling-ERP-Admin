import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTeacherDetailQuery } from '../../features/teacher/hooks/useTeacherQueries';

// Sub-components
import TeacherProfileHeader from '../../features/teacher/components/profile/TeacherProfileHeader';
import TeacherPersonalInfo from '../../features/teacher/components/profile/TeacherPersonalInfo';
import TeacherContactDetails from '../../features/teacher/components/profile/TeacherContactDetails';
import TeacherProfessionalLog from '../../features/teacher/components/profile/TeacherProfessionalLog';
import TeacherSalarySnapshot from '../../features/teacher/components/profile/TeacherSalarySnapshot';

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  const { data: teacher, isLoading } = useTeacherDetailQuery(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-text-main dark:text-white">Teacher not found</h2>
        <button onClick={() => navigate('/admin/teachers')} className="mt-4 text-primary hover:underline">Back to Directory</button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <TeacherPersonalInfo teacher={teacher} />
              <TeacherContactDetails teacher={teacher} />
              <TeacherSalarySnapshot />
            </div>
            <div className="lg:col-span-1">
              <TeacherProfessionalLog />
            </div>
          </div>
        );
      default:
        return (
          <div className="py-20 text-center animate-in fade-in zoom-in-95 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
            <span className="material-symbols-outlined text-text-secondary/20 text-6xl mb-4">construction</span>
            <h3 className="text-lg font-bold text-text-main dark:text-white">{activeTab} Section</h3>
            <p className="text-sm text-text-secondary">This module is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-10">
      <nav className="flex items-center gap-2 text-sm font-medium text-text-secondary px-4">
        <Link to="/admin/dashboard" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link to="/admin/teachers" className="hover:text-primary transition-colors">Teachers</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-text-main dark:text-white">Teacher Profile</span>
      </nav>

      <TeacherProfileHeader 
        teacher={teacher} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TeacherProfile;
