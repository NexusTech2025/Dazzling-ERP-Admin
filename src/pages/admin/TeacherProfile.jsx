import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { useTeacherDetailQuery } from '../../features/teacher/hooks/useTeacherQueries';
import { queryKeys } from '../../lib/react-query/queryKeys';
import RefreshButton from '../../components/ui/btn/RefreshButton';

// Sub-components
import TeacherProfileHeader from '../../features/teacher/components/profile/TeacherProfileHeader';
import TeacherPersonalInfo from '../../features/teacher/components/profile/TeacherPersonalInfo';
import TeacherContactDetails from '../../features/teacher/components/profile/TeacherContactDetails';
import TeacherProfessionalLog from '../../features/teacher/components/profile/TeacherProfessionalLog';
import TeacherSalarySnapshot from '../../features/teacher/components/profile/TeacherSalarySnapshot';
import TeacherProfessionalCard from '../../features/teacher/components/profile/TeacherProfessionalCard';
import TeacherDocumentsCard from '../../features/teacher/components/profile/TeacherDocumentsCard';
import TeachersAttendance from '../../features/teacher/components/profile/TeachersAttendance';
import TeacherAssignedClasses from '../../features/teacher/components/profile/TeacherAssignedClasses';

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: queryKeys.teacher.detail(id) }) > 0;

  const { data: teacher, isLoading } = useTeacherDetailQuery(id);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.teacher.detail(id) });
  };

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
              <TeacherProfessionalCard teacher={teacher} />
              <TeacherContactDetails teacher={teacher} />
              <TeacherDocumentsCard documents={teacher.documents} />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6">
              <TeacherSalarySnapshot />
              <TeacherProfessionalLog />
            </div>
          </div>
        );
      case 'Attendance':
        return <TeachersAttendance teacherId={teacher.teacher_id} />;
      case 'Assigned Classes':
        return <TeacherAssignedClasses teacherId={teacher.teacher_id} />;
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
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between px-4">
        <nav className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Link to="/admin/dashboard" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link to="/admin/teachers" className="hover:text-primary transition-colors">Teachers</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-text-main dark:text-white">Teacher Profile</span>
        </nav>
        <RefreshButton isFetching={isFetching} onRefresh={handleRefresh} />
      </div>

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
