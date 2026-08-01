import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentById } from '../../features/student/hooks/useStudentById';
import { useStudentFeeOverviewQuery } from '../../features/finance/hooks/useFinanceQueries';
import { useEnrollmentsQuery } from '../../features/student/hooks/useEnrollmentQueries';
import { useUpdateStudentMutation } from '../../features/student/hooks/useStudentQueries';
import useIsMobile from '../../hooks/useIsMobile';

// Shared Layout UI Primitives
import Button from '../../components/ui/v2/Button';
import StudentEditModal from '../../features/student/components/StudentEditModal';

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
  const { student, profileData, isLoading, error } = useStudentById(id);
  const { data: installments = [] } = useStudentFeeOverviewQuery(id);
  // console.log("studentdata: ", student, profileData)
  const handleSaveStudent = (updatedData) => {
    updateMutation.mutate(
      { id: updatedData.student_id, data: updatedData },
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
              onEdit={() => setIsEditModalOpen(true)}
            />
            <GuardianInfo student={student} contact={profileData?.contact} />
            <EnrollmentDetails enrollments={profileData?.enrollments} allocations={profileData?.allocations} />
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
      ),
      Attendance: (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <AttendanceHeatmap studentId={id} />
        </div>
      ),
      Fees: (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <StudentFeeTab studentId={id} />
        </div>
      )
    };
  }, [student, profileData, installments, id]);

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
        <Button
          variant="contained"
          onClick={() => navigate('/admin/students')}
          className="mt-6 shadow-lg shadow-primary/20"
        >
          Back to Directory
        </Button>
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
          onOpenEdit={() => setIsEditModalOpen(true)}
          onNavigateBack={() => navigate('/admin/students')}
          tabRegistry={tabRegistry}
        />
      ) : (
        <DesktopStudentProfile
          student={student}
          profileData={profileData}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenEdit={() => setIsEditModalOpen(true)}
          breadcrumbItems={breadcrumbItems}
          tabRegistry={tabRegistry}
        />
      )}

      {/* Shared Edit Modal */}
      {isEditModalOpen && (
        <StudentEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          student={student}
          onSave={handleSaveStudent}
        />
      )}
    </>
  );
};

export default StudentProfile;
