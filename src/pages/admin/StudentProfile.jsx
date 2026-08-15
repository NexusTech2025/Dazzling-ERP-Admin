import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentById } from '../../features/student/hooks/useStudentById';
import { useStudentFeeOverviewQuery } from '../../features/finance/hooks/useFinanceQueries';
import { useEnrollmentsQuery } from '../../features/student/hooks/useEnrollmentQueries';
import { useUpdateStudentMutation, useUpdateStudentProfileMutation } from '../../features/student/hooks/useStudentQueries';
import useIsMobile from '../../hooks/useIsMobile';

// Shared Layout UI Primitives
import Button from '../../components/ui/v2/Button';
import StudentUpdateProfileForm from '../../features/student/components/profile/StudentUpdateProfileForm';

// Viewport Component Controllers
import MobileStudentProfile from '../../features/student/components/profile/MobileStudentProfile';
import DesktopStudentProfile from '../../features/student/components/profile/DesktopStudentProfile';

// Sub-components for Desktop Tab Registry
import PersonalDetails from '../../features/student/components/profile/PersonalDetails';
import GuardianInfo from '../../features/student/components/profile/GuardianInfo';
import AcademicBackground from '../../features/student/components/profile/AcademicBackground';
import EnrollmentDetails from '../../features/student/components/profile/EnrollmentDetails';
import StudentFeeTab from '../../features/student/components/profile/StudentFeeTab';
import ProfileSidebar from '../../features/student/components/profile/ProfileSidebar';
import AttendanceHeatmap from '../../features/student/components/profile/AttendanceHeatmap';

const VALID_TABS = ['Overview', 'Attendance', 'Fees', 'Performance', 'Documents'];

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Pre-warm enrollments repository & fee accounts cache
  useEnrollmentsQuery();

  // Derive active tab directly from URL to preserve a single source of truth
  const activeTab = useMemo(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const formatted = tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase();
      if (VALID_TABS.includes(formatted)) return formatted;
    }
    return 'Overview';
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab: tab.toLowerCase() });
  };

  const updateMutation = useUpdateStudentMutation();
  const updateProfileMutation = useUpdateStudentProfileMutation();
  const { student, profileData, isLoading, error } = useStudentById(id);
  const { data: installments = [] } = useStudentFeeOverviewQuery(id);

  const handleSaveStudent = (payload) => {
    updateProfileMutation.mutate(
      { payload },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
        },
      }
    );
  };

  // Centralized Breadcrumbs Configuration Map
  const breadcrumbItems = useMemo(() => [
    { label: 'Home', path: '/admin/dashboard', icon: 'home' },
    { label: 'Students', path: '/admin/students' },
    { label: 'Student Profile' }
  ], []);

  // Parallel DOM Tab Registry to preserve scroll position and input context
  const tabRegistry = useMemo(() => {
    if (!student) return {};
    return {
      Overview: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <PersonalDetails
              student={student}
              address={profileData?.address}
              contact={profileData?.contact}
              onEdit={() => navigate(`/admin/students/${id}/edit`)}
            />
            <GuardianInfo student={student} contact={profileData?.contact} />
            <EnrollmentDetails enrollments={profileData?.enrollments} allocations={profileData?.allocations} studentId={id} />
            <AcademicBackground education={profileData?.education} />
          </div>
          <div className="lg:col-span-1">
            <ProfileSidebar
              studentId={id}
              education={profileData?.education}
              enrollments={profileData?.enrollments}
              installments={installments}
            />
          </div>
        </div>
      ),
      Attendance: (
        <div className="animate-in fade-in duration-300">
          <AttendanceHeatmap studentId={id} />
        </div>
      ),
      Fees: (
        <div className="animate-in fade-in duration-300">
          <StudentFeeTab studentId={id} />
        </div>
      ),
      Performance: (
        <div className="p-8 text-center bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl animate-in fade-in">
          <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">analytics</span>
          <h3 className="text-sm font-bold text-text-main dark:text-white">Performance Analytics Coming Soon</h3>
          <p className="text-xs text-text-secondary mt-1">Detailed exam marks and tracking report cards will appear here.</p>
        </div>
      ),
      Documents: (
        <div className="p-8 text-center bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl animate-in fade-in">
          <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">folder_open</span>
          <h3 className="text-sm font-bold text-text-main dark:text-white">Document Vault Coming Soon</h3>
          <p className="text-xs text-text-secondary mt-1">Uploaded certificates, ID proofs, and admission forms will be managed here.</p>
        </div>
      ),
    };
  }, [student, profileData, installments, id, navigate]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-text-secondary">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary mb-2">sync</span>
        <p className="text-xs font-bold">Loading Student Profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-8 text-center text-text-secondary">
        <p className="text-sm font-bold text-danger">Failed to load student profile.</p>
        <button
          type="button"
          onClick={() => navigate('/admin/students')}
          className="mt-3 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
        >
          Return to Students List
        </button>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <MobileStudentProfile
          student={student}
          profileData={profileData}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenEdit={() => navigate(`/admin/students/${id}/edit`)}
          onNavigateBack={() => navigate('/admin/students')}
          tabRegistry={tabRegistry}
        />
      ) : (
        <DesktopStudentProfile
          student={student}
          profileData={profileData}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenEdit={() => navigate(`/admin/students/${id}/edit`)}
          breadcrumbItems={breadcrumbItems}
          tabRegistry={tabRegistry}
        />
      )}
    </>
  );
};

export default StudentProfile;
