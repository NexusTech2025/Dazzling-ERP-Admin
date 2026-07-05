import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { useTeacherDetailQuery, useTeacherSalaryConfigQuery, useTeacherAttendanceQuery } from '../../features/teacher/hooks/useTeacherQueries';
import { useBatchesQuery } from '../../features/batch/hooks/useBatchQueries';
import { queryKeys } from '../../lib/react-query/queryKeys';
import { aq } from '../../lib/queryEngine'; // Unified Data Wrangling Engine
import useIsMobile from '../../hooks/useIsMobile';

// Design System Core UI Primitives
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Button from '../../components/ui/v2/Button';
import KpiCard from '../../components/ui/v2/KpiCard';
import KpiGrid from '../../components/ui/v2/KpiGrid';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import Avatar from '../../components/ui/v2/Avatar';
import Badge from '../../components/ui/Badge';

// Mobile Design Primitives
import ProfileHero from '../../components/ui/v2/ProfileHero';
import ScrollableRibbon from '../../components/ui/v2/ScrollableRibbon';
import DescriptionSection from '../../components/ui/v2/DescriptionSection';
import KeyValuePair from '../../components/ui/v2/KeyValuePair';

// Feature Sub-components
import TeacherProfileHeader from '../../features/teacher/components/profile/TeacherProfileHeader';
import TeacherPersonalInfo from '../../features/teacher/components/profile/TeacherPersonalInfo';
import TeacherContactDetails from '../../features/teacher/components/profile/TeacherContactDetails';
import TeacherProfessionalLog from '../../features/teacher/components/profile/TeacherProfessionalLog';
import TeacherSalarySnapshot from '../../features/teacher/components/profile/TeacherSalarySnapshot';
import TeacherProfessionalCard from '../../features/teacher/components/profile/TeacherProfessionalCard';
import TeacherDocumentsCard from '../../features/teacher/components/profile/TeacherDocumentsCard';
import TeachersAttendance from '../../features/teacher/components/profile/TeachersAttendance';
import TeacherAssignedClasses from '../../features/teacher/components/profile/TeacherAssignedClasses';
import TeacherSalaryPayroll from '../../features/teacher/components/profile/TeacherSalaryPayroll';

const VALID_PROFILE_TABS = ['Overview', 'Attendance', 'Assigned Classes', 'Salary & Payroll'];

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('Overview');

  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: queryKeys.teacher.detail(id) }) > 0;

  const { data: teacher, isLoading } = useTeacherDetailQuery(id);
  const { data: salaryConfig } = useTeacherSalaryConfigQuery(id);
  
  const { data: batches = [] } = useBatchesQuery(
    { teacher_id: id },
    { enabled: !!id && id !== '' }
  );
  const { data: attendance = [] } = useTeacherAttendanceQuery(id);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.teacher.detail(id) });
    queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(id), 'salaryConfig'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.teacher.attendanceProfile(id, 'all') });
  }, [queryClient, id]);

  // Standard Navigation Core Mapping
  const breadcrumbItems = useMemo(() => [
    { label: 'Home', path: '/admin/dashboard', icon: 'home' },
    { label: 'Teachers', path: '/admin/teachers' },
    { label: 'Teacher Profile' }
  ], []);

  // Performance Tuning: Optimize Data Wrangling Analytics Pipelines via Fluent Engine
  const analyticsSummary = useMemo(() => {
    if (!attendance.length && !batches.length) {
      return { totalStudents: 0, attendanceRate: 98, salaryDisplay: '$4,250' };
    }

    // Sum students using high-order reducer standard
    const studentsSum = batches.reduce((sum, b) => sum + (b.enrolled_students || 0), 0);

    // Compute metrics cleanly using custom query table wrappers
    const presentCount = aq(attendance)
      .filter(a => a.status === 'P' || a.status?.toUpperCase() === 'PRESENT')
      .objects().length;

    const rate = attendance.length > 0
      ? Math.round((presentCount / attendance.length) * 100)
      : 98;

    const baseSalary = salaryConfig?.base_amount
      ? `₹${salaryConfig.base_amount.toLocaleString()}`
      : '$4,250';

    return { totalStudents: studentsSum, attendanceRate: rate, salaryDisplay: baseSalary };
  }, [attendance, batches, salaryConfig]);

  // Parallel DOM Layout Registry to prevent flash-of-empty context losses
  const tabRegistry = useMemo(() => {
    if (!teacher) return {};

    return {
      Overview: (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Aligned KPI Component Grid Grid layout */}
          <KpiGrid cols={2} smCols={3} lgCols={6} gap={4}>
            <KpiCard label="EXPERIENCE" value={`${teacher.experience_years || 0} Years`} icon="history" isCount size="lg" />
            <KpiCard label="ASSIGNED" value={`${batches.length} Classes`} icon="book" isCount variant="info" size="lg" />
            <KpiCard label="STUDENTS" value={analyticsSummary.totalStudents} icon="group" isCount variant="success" size="lg" />
            <KpiCard label="ATTENDANCE" value={`${analyticsSummary.attendanceRate}%`} icon="verified_user" isCount variant="warning" size="lg" />
            <KpiCard label="SALARY" value={analyticsSummary.salaryDisplay} icon="payments" isCount={!salaryConfig?.base_amount} size="lg" />
            <KpiCard label="PERFORMANCE" value="A+" icon="star" isCount variant="info" size="lg" />
          </KpiGrid>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <TeacherPersonalInfo teacher={teacher} />
              <TeacherProfessionalCard teacher={teacher} />
              <TeacherContactDetails teacher={teacher} />
              <TeacherDocumentsCard documents={teacher.documents} />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6">
              <TeacherSalarySnapshot salaryConfig={salaryConfig} />
              <TeacherProfessionalLog />

              {/* Enhanced Quick Actions Panel using native button specs */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-text-main dark:text-white">Quick Actions</h3>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => navigate(`/admin/batches`)} className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-sm text-text-main dark:text-white transition-colors">
                    <span className="material-symbols-outlined text-primary text-xl">add_box</span>
                    Assign Class
                  </button>
                  <button type="button" className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-sm text-text-main dark:text-white transition-colors">
                    <span className="material-symbols-outlined text-amber-500 text-xl">event_busy</span>
                    Approve Leave
                  </button>
                  <button type="button" className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-sm text-text-main dark:text-white transition-colors">
                    <span className="material-symbols-outlined text-emerald-500 text-xl">download</span>
                    Download Profile
                  </button>
                  <button type="button" className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-sm text-text-main dark:text-white transition-colors">
                    <span className="material-symbols-outlined text-purple-500 text-xl">print</span>
                    Print Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      Attendance: <TeachersAttendance teacherId={teacher.teacher_id} />,
      'Assigned Classes': <TeacherAssignedClasses teacherId={teacher.teacher_id} />,
      'Salary & Payroll': <TeacherSalaryPayroll teacherId={teacher.teacher_id} />
    };
  }, [teacher, batches, analyticsSummary, salaryConfig, navigate]);

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
        <Button variant="outlined" className="mt-4" onClick={() => navigate('/admin/teachers')}>
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
              onClick={() => navigate('/admin/teachers')}
              className="flex items-center justify-center size-8 rounded-lg text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-lg font-black text-slate-800 dark:text-white">Teacher Profile</h1>
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
        <ProfileHero
          avatar={
            <Avatar
              src={teacher.profile_photo_url || ''}
              initials={teacher.full_name}
              size="xl"
            />
          }
          title={teacher.full_name}
          badge={<Badge variant={teacher.status === 'active' ? 'success' : 'default'}>{teacher.status?.toUpperCase() || 'ACTIVE'}</Badge>}
          idText={`ID: ${teacher.teacher_id}`}
          metaLines={[
            { text: teacher.specialization || 'Department Faculty', icon: 'menu_book' },
            { text: `Joined ${teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : 'N/A'} • Branch: ${teacher.branch_name || teacher.branch_id || 'Main Branch'}` }
          ]}
          actions={
            <div className="flex flex-row md:flex-col gap-2 w-full">
              <Button size="sm" variant="outlined" startIcon="edit" onClick={() => navigate(`/admin/teachers/edit/${teacher.teacher_id}`)} className="flex-1">Edit</Button>
              <Button size="sm" variant="outlined" startIcon="chat" className="flex-1">Message</Button>
            </div>
          }
        />

        {/* Metric Ribbon */}
        <ScrollableRibbon>
          <KpiCard label="EXPERIENCE" value={`${teacher.experience_years || 0} Years`} icon="history" isCount size="sm" />
          <KpiCard label="ASSIGNED" value={`${batches.length} Classes`} icon="book" isCount variant="info" size="sm" />
          <KpiCard label="STUDENTS" value={analyticsSummary.totalStudents} icon="group" isCount variant="success" size="sm" />
          <KpiCard label="ATTENDANCE" value={`${analyticsSummary.attendanceRate}%`} icon="verified_user" isCount variant="warning" size="sm" />
          <KpiCard label="SALARY" value={analyticsSummary.salaryDisplay} icon="payments" isCount={!salaryConfig?.base_amount} size="sm" />
          <KpiCard label="PERFORMANCE" value="A+" icon="star" isCount variant="info" size="sm" />
        </ScrollableRibbon>

        {/* Tabs Swipe Ribbon */}
        <ScrollableRibbon className="border-b border-slate-100 dark:border-slate-800 pb-0">
          {VALID_PROFILE_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 pb-2.5 border-b-[3px] font-bold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab
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
              <DescriptionSection title="Personal Information" icon="person">
                <KeyValuePair label="Gender" value={teacher.gender} />
                <KeyValuePair label="Date of Birth" value={teacher.date_of_birth ? new Date(teacher.date_of_birth).toLocaleDateString() : 'N/A'} />
                <KeyValuePair label="Joined Date" value={teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : 'N/A'} />
                <KeyValuePair label="Teacher Type" value={teacher.teacher_type?.replace('_', ' ')} />
              </DescriptionSection>

              {/* Contact Information */}
              <DescriptionSection title="Contact Information" icon="contact_phone">
                <KeyValuePair label="Email Address" value={teacher.email} />
                <KeyValuePair label="Phone Number" value={teacher.mobile_number} />
                <KeyValuePair label="Address" value={teacher.address} className="col-span-2" />
              </DescriptionSection>

              {/* Professional details */}
              <TeacherProfessionalCard teacher={teacher} />
              
              {/* Documents Card */}
              <TeacherDocumentsCard documents={teacher.documents} />

              {/* Salary snapshot & logs */}
              <TeacherSalarySnapshot salaryConfig={salaryConfig} />
              <TeacherProfessionalLog />

              {/* Quick Actions Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-text-main dark:text-white">Quick Actions</h3>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => navigate(`/admin/batches`)} className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-sm text-text-main dark:text-white transition-colors">
                    <span className="material-symbols-outlined text-primary text-xl">add_box</span>
                    Assign Class
                  </button>
                  <button type="button" className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-sm text-text-main dark:text-white transition-colors">
                    <span className="material-symbols-outlined text-amber-500 text-xl">event_busy</span>
                    Approve Leave
                  </button>
                  <button type="button" className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-sm text-text-main dark:text-white transition-colors">
                    <span className="material-symbols-outlined text-emerald-500 text-xl">download</span>
                    Download Profile
                  </button>
                  <button type="button" className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-sm text-text-main dark:text-white transition-colors">
                    <span className="material-symbols-outlined text-purple-500 text-xl">print</span>
                    Print Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Overview' && (
            <div className="min-h-[300px]">
              {VALID_PROFILE_TABS.map((tabKey) => {
                if (tabKey === 'Overview') return null;
                const tabNode = tabRegistry[tabKey];

                if (!tabNode) {
                  return (
                    <div
                      key={tabKey}
                      className={activeTab === tabKey ? 'block animate-in fade-in zoom-in-95' : 'hidden'}
                    >
                      <div className="py-20 text-center bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                        <span className="material-symbols-outlined text-text-secondary/20 text-6xl mb-4">construction</span>
                        <h3 className="text-lg font-bold text-text-main dark:text-white">{tabKey} Section</h3>
                        <p className="text-sm text-text-secondary">This module is currently under development.</p>
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
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <div className="space-y-6 pb-10 pt-6 lg:pt-10 w-full lg:w-[98%] lg:mx-auto xl:w-[95%] max-w-[1440px]">
      <div className="flex items-center justify-between px-4">
        <Breadcrumbs items={breadcrumbItems} />
        <RefreshButton isFetching={isFetching} onRefresh={handleRefresh} />
      </div>

      <TeacherProfileHeader
        teacher={teacher}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="min-h-[400px]">
        {VALID_PROFILE_TABS.map((tabKey) => {
          const tabNode = tabRegistry[tabKey];

          if (!tabNode) {
            return (
              <div key={tabKey} className={activeTab === tabKey ? 'block animate-in fade-in zoom-in-95' : 'hidden'}>
                <div className="py-20 text-center bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                  <span className="material-symbols-outlined text-text-secondary/20 text-6xl mb-4">construction</span>
                  <h3 className="text-lg font-bold text-text-main dark:text-white">{tabKey} Section</h3>
                  <p className="text-sm text-text-secondary">This module is currently under development.</p>
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
    </div>
  );
};

export default TeacherProfile;
