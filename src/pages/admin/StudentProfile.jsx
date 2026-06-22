import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useStudentById } from '../../features/student/hooks/useStudentById';
import { useStudentFeeOverviewQuery } from '../../features/finance/hooks/useFinanceQueries';
import { useUpdateStudentMutation } from '../../features/student/hooks/useStudentQueries';
import StudentEditModal from '../../features/student/components/StudentEditModal';

// Sub-components
import ProfileHeader from '../../features/student/components/profile/ProfileHeader';
import PersonalDetails from '../../features/student/components/profile/PersonalDetails';
import GuardianInfo from '../../features/student/components/profile/GuardianInfo';
import AcademicBackground from '../../features/student/components/profile/AcademicBackground';
import EnrollmentDetails from '../../features/student/components/profile/EnrollmentDetails';
import FeeSchedule from '../../features/student/components/profile/FeeSchedule';
import ProfileSidebar from '../../features/student/components/profile/ProfileSidebar';
import AttendanceHeatmap from '../../features/student/components/profile/AttendanceHeatmap';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const formatted = tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase();
      if (['Overview', 'Attendance', 'Fees', 'Performance', 'Documents'].includes(formatted)) {
        return formatted;
      }
    }
    return 'Overview';
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Keep tab state synchronized with query parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const formatted = tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase();
      if (['Overview', 'Attendance', 'Fees', 'Performance', 'Documents'].includes(formatted)) {
        setActiveTab(formatted);
      }
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab: tab.toLowerCase() });
  };

  const updateMutation = useUpdateStudentMutation();

  // Fetch all student data (Basic + Profile) using the composite hook
  const { student, profileData, isLoading, error } = useStudentById(id);
  
  // Fetch fee data
  const { data: installments = [], isLoading: isFeesLoading } = useStudentFeeOverviewQuery(id);

  const handleSaveStudent = (updatedData) => {
    updateMutation.mutate({ 
      id: updatedData.student_id, 
      data: updatedData 
    }, {
      onSuccess: () => {
        setIsEditModalOpen(false);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-text-main dark:text-white">Student not found</h2>
        <p className="text-text-secondary mt-2">{error?.message || "The requested student could not be located."}</p>
        <button onClick={() => navigate('/admin/students')} className="mt-6 px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">
          Back to Directory
        </button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
              <PersonalDetails 
                student={student} 
                address={profileData?.address} 
                contact={profileData?.contact} 
                onEdit={() => setIsEditModalOpen(true)}
              />
              <GuardianInfo student={student} contact={profileData?.contact} />
              <EnrollmentDetails enrollments={profileData?.enrollments} />
              <AcademicBackground education={profileData?.education} />
            </div>
            <div className="lg:col-span-1">
              <ProfileSidebar 
                studentId={id} 
                education={profileData?.education} 
                enrollments={profileData?.enrollments} 
              />
            </div>
          </div>
        );

      case 'Attendance':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <AttendanceHeatmap studentId={id} />
          </div>
        );

      case 'Fees':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <FeeSchedule installments={installments} />
          </div>
        );

      default:
        return (
          <div className="py-20 text-center animate-in fade-in zoom-in-95 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
            <span className="material-symbols-outlined text-text-secondary/20 text-6xl mb-4">construction</span>
            <h3 className="text-lg font-bold text-text-main dark:text-white">{activeTab} Section</h3>
            <p className="text-text-secondary">This module is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-medium text-text-secondary px-4">
        <Link to="/admin/dashboard" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link to="/admin/students" className="hover:text-primary transition-colors">Students</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-text-main dark:text-white">Student Profile</span>
      </nav>

      <ProfileHeader 
        student={student} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        onEdit={() => setIsEditModalOpen(true)}
      />

      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      <StudentEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={student}
        onSave={handleSaveStudent}
      />
    </div>
  );
};

export default StudentProfile;
