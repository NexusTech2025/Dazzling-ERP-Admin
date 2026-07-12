import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentById } from '../../features/student/hooks/useStudentById';
import { useStudentFeeOverviewQuery } from '../../features/finance/hooks/useFinanceQueries';
import { useUpdateStudentMutation } from '../../features/student/hooks/useStudentQueries';
import useIsMobile from '../../hooks/useIsMobile';

// Shared Layout UI Primitives
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Button from '../../components/ui/v2/Button';
import Avatar from '../../components/ui/v2/Avatar';
import Badge from '../../components/ui/Badge';
import StudentEditModal from '../../features/student/components/StudentEditModal';

// Mobile Design Primitives
import ProfileHero from '../../components/domain/ProfileHero';
import ScrollableRibbon from '../../components/ui/v2/ScrollableRibbon';
import { KeyValuePairIcon } from '../../components/ui/v2/KeyValuePair';
import DescriptionSection from '../../components/ui/v2/DescriptionSection';
import SlottedEntityCard from '../../components/ui/v2/cards/SlottedEntityCard';
import KeyValuePair from '../../components/ui/v2/KeyValuePair';
import KpiCard from '../../components/ui/v2/KpiCard';
import { Timeline } from '../../components/ui/v2/Timeline';

// Sub-components
import ProfileHeader from '../../features/student/components/profile/ProfileHeader';
import PersonalDetails from '../../features/student/components/profile/PersonalDetails';
import GuardianInfo from '../../features/student/components/profile/GuardianInfo';
import AcademicBackground from '../../features/student/components/profile/AcademicBackground';
import EnrollmentDetails from '../../features/student/components/profile/EnrollmentDetails';
import FeeSchedule from '../../features/student/components/profile/FeeSchedule';
import ProfileSidebar from '../../features/student/components/profile/ProfileSidebar';
import AttendanceHeatmap from '../../features/student/components/profile/AttendanceHeatmap';

const VALID_TABS = ['Overview', 'Attendance', 'Fees', 'Performance', 'Documents'];

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      ),
      Attendance: (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <AttendanceHeatmap studentId={id} />
        </div>
      ),
      Fees: (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <FeeSchedule installments={installments} />
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

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div className="space-y-6 pb-10 px-4 md:px-0">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/students')}
              className="flex items-center justify-center size-8 rounded-lg text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-lg font-black text-slate-800 dark:text-white">Student Profile</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex items-center justify-center size-8 rounded-lg text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center size-8 rounded-lg text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
        </div>

        {/* Profile Hero Section */}
        <ProfileHero>
          {/* Header Row (Top Tier) */}
          <ProfileHero.Header>
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <Avatar
                src={(() => {
                  const url = student.avatarUrl;
                  if (!url || url === 'null' || url === 'undefined' || url === '') {
                    return student.gender?.toLowerCase() === 'female' || student.gender?.toLowerCase() === 'f'
                      ? 'https://img.icons8.com/color/150/girl.png'
                      : 'https://img.icons8.com/color/150/boy.png';
                  }
                  return url;
                })()}
                initials={student.student_name?.substring(0, 2).toUpperCase()}
                status="online"
                size="xl"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <ProfileHero.Title className="text-xl md:text-2xl font-extrabold">{student.student_name}</ProfileHero.Title>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/20 leading-none">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {student.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                </div>
                <div className="mt-1">
                  <ProfileHero.Identity idText={`Student ID: ${student.student_id}`} />
                </div>
              </div>
            </div>
          </ProfileHero.Header>

          {/* Divider Line */}
          <hr className="-mx-5 border-slate-100 dark:border-slate-800/60" />

          {/* Logistics Grid (Middle Tier) */}
          <div className="flex flex-col gap-4 py-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <KeyValuePairIcon
                  icon="menu_book"
                  size="20px"
                  className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Class 11 Science (CBSE)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <KeyValuePairIcon
                  icon="calendar_today"
                  size="20px"
                  className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Joined: {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Divider Line */}
          <hr className="-mx-5 border-slate-100 dark:border-slate-800/60" />

          {/* Action Footer (Bottom Tier) */}
          <ProfileHero.Actions className="border-t-0 mt-0 pt-0 flex flex-row gap-3 w-full">
            <Button size="sm" variant="outlined" startIcon="edit" onClick={() => setIsEditModalOpen(true)} className="flex-1 rounded-xl h-11 border-primary text-primary hover:bg-primary/5">Edit</Button>
            <Button size="sm" variant="outlined" startIcon="chat" className="flex-1 rounded-xl h-11 border-primary text-primary hover:bg-primary/5">Message</Button>
          </ProfileHero.Actions>
        </ProfileHero>

        {/* Metric Ribbon */}
        <ScrollableRibbon>
          <KpiCard label="ACTIVE ENROLLMENT" value="1" icon="person" isCount size="sm" />
          <KpiCard label="ATTENDANCE" value="92%" icon="calendar_today" isCount variant="warning" size="sm" />
          <KpiCard label="CGPA/GRADE" value="9.24" icon="star" isCount variant="info" size="sm" />
          <KpiCard label="FEE STATUS" value="Paid" icon="payments" isCount variant="success" size="sm" />
        </ScrollableRibbon>

        {/* Tabs Swipe Ribbon */}
        <ScrollableRibbon className="border-b border-slate-100 dark:border-slate-800 pb-0">
          {VALID_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`flex items-center gap-1.5 pb-2.5 border-b-[3px] font-bold text-sm whitespace-nowrap transition-colors ${activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <span>{tab}</span>
            </button>
          ))}
        </ScrollableRibbon>

        {/* Tab Contents */}
        <div className="space-y-6">
          {activeTab === 'Overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Personal Information */}
              <DescriptionSection
                title="Personal Information"
                icon="person"
                onActionClick={() => setIsEditModalOpen(true)}
              >
                <KeyValuePair label="Date of Birth" value={student.dob} />
                <KeyValuePair label="Gender" value={student.gender} />
                <KeyValuePair label="Email" value={profileData?.contact?.email} />
                <KeyValuePair label="Phone" value={profileData?.contact?.mobile_number} />
                <KeyValuePair
                  label="Address"
                  value={
                    profileData?.address
                      ? `${profileData.address.line1}, ${profileData.address.line2 ? profileData.address.line2 + ', ' : ''}${profileData.address.city}, ${profileData.address.state} ${profileData.address.pin_code}`
                      : 'N/A'
                  }
                  className="col-span-2"
                />
              </DescriptionSection>

              {/* Guardian Information */}
              <DescriptionSection title="Guardian Information" icon="shield">
                <KeyValuePair label="Father's Name" value={student.father_name || 'Rajesh Mehta'} />
                <KeyValuePair label="Mother's Name" value={student.mother_name || 'Meera Mehta'} />
                <KeyValuePair label="Contact Number" value={profileData?.contact?.guardian_phone || profileData?.contact?.mobile_number} />
                <KeyValuePair
                  label="Emergency Contact"
                  value={`${student.father_name || 'Rajesh Mehta'} (${profileData?.contact?.guardian_phone || profileData?.contact?.mobile_number || 'N/A'})`}
                />
              </DescriptionSection>

              {/* Link Slotted Cards */}
              <SlottedEntityCard
                icon="menu_book"
                iconColor="text-primary"
                title="Class 11 Science Bundle (CBSE)"
                subtitle="PCM + English"
                metaText={`Joined: ${student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'}`}
                badge={<Badge variant="success">ACTIVE</Badge>}
                onClick={() => { }}
              />

              <SlottedEntityCard
                icon="school"
                iconColor="text-amber-500"
                title="Academic Background"
                subtitle="Class 10 • St. Xavier School"
                metaText="Passing Year: 2025 • Percentage: 92.4%"
                onClick={() => { }}
              />

              {/* Recent Activity */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Recent Activity</h3>
                  <button type="button" className="text-sm font-semibold text-primary hover:underline">View All</button>
                </div>
                <Timeline
                  items={[
                    {
                      time: 'Today, 10:45 AM',
                      title: 'Enrolled into Program',
                      description: 'Class 11 Science Bundle (CBSE) (PCM + English)',
                      color: 'bg-emerald-500',
                    },
                    {
                      time: 'Yesterday, 4:30 PM',
                      title: 'Profile Updated',
                      description: 'Personal information updated',
                      color: 'bg-primary',
                    },
                    {
                      time: '2 Days Ago',
                      title: 'Fee Received',
                      description: 'Admission fee payment received',
                      color: 'bg-amber-500',
                    },
                  ]}
                />
              </div>

              {/* Tags */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Tags</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="info">Regular</Badge>
                  <Badge variant="success">Verified</Badge>
                  <Badge variant="primary">Scholarship</Badge>
                  <Button size="sm" variant="outlined" startIcon="add">Add Tag</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Overview' && (
            <div className="min-h-[300px]">
              {VALID_TABS.map((tabKey) => {
                if (tabKey === 'Overview') return null;
                const tabNode = tabRegistry[tabKey];

                if (!tabNode) {
                  return (
                    <div
                      key={tabKey}
                      className={activeTab === tabKey ? 'block animate-in fade-in zoom-in-95' : 'hidden'}
                    >
                      <div className="py-20 text-center bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
                        <span className="material-symbols-outlined text-text-secondary/20 text-6xl mb-4">construction</span>
                        <h3 className="text-lg font-bold text-text-main dark:text-white">{tabKey} Section</h3>
                        <p className="text-text-secondary">This module is currently under development.</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={tabKey} className={activeTab === tabKey ? 'block' : 'hidden'}>
                    {tabNode}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Portal/Short-circuit conditional mounting for optimization */}
        {isEditModalOpen && (
          <StudentEditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            student={student}
            onSave={handleSaveStudent}
          />
        )}
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <div className="space-y-6 pb-10">
      <Breadcrumbs items={breadcrumbItems} />

      <ProfileHeader
        student={student}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onEdit={() => setIsEditModalOpen(true)}
      />

      <div className="min-h-[400px]">
        {VALID_TABS.map((tabKey) => {
          const tabNode = tabRegistry[tabKey];

          if (!tabNode) {
            // Render Fallback Template for In-Development Tabs
            return (
              <div
                key={tabKey}
                className={activeTab === tabKey ? 'block animate-in fade-in zoom-in-95' : 'hidden'}
              >
                <div className="py-20 text-center bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
                  <span className="material-symbols-outlined text-text-secondary/20 text-6xl mb-4">construction</span>
                  <h3 className="text-lg font-bold text-text-main dark:text-white">{tabKey} Section</h3>
                  <p className="text-text-secondary">This module is currently under development.</p>
                </div>
              </div>
            );
          }

          return (
            <div key={tabKey} className={activeTab === tabKey ? 'block' : 'hidden'}>
              {tabNode}
            </div>
          );
        })}
      </div>

      {/* Portal/Short-circuit conditional mounting for optimization */}
      {isEditModalOpen && (
        <StudentEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          student={student}
          onSave={handleSaveStudent}
        />
      )}
    </div>
  );
};

export default StudentProfile;
