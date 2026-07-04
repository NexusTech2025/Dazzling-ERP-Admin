import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { useTeacherDetailQuery, useTeacherSalaryConfigQuery, useTeacherAttendanceQuery } from '../../features/teacher/hooks/useTeacherQueries';
import { useBatchesQuery } from '../../features/batch/hooks/useBatchQueries';
import { queryKeys } from '../../lib/react-query/queryKeys';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import KpiCard from '../../components/ui/v2/KpiCard';

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
import TeacherSalaryPayroll from '../../features/teacher/components/profile/TeacherSalaryPayroll';

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.teacher.detail(id) });
    queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(id), 'salaryConfig'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.teacher.attendanceProfile(id, 'all') });
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

  // Calculate dynamic metrics
  const totalStudents = batches.reduce((sum, b) => sum + (b.enrolled_students || 0), 0);

  const presentDays = attendance.filter(a => a.status === 'P' || a.status?.toUpperCase() === 'PRESENT').length;
  const attendanceRate = attendance.length > 0
    ? Math.round((presentDays / attendance.length) * 100)
    : 98; // fallback to 98% as in mockup

  const salaryDisplay = salaryConfig?.base_amount
    ? `₹${salaryConfig.base_amount.toLocaleString()}`
    : '$4,250'; // fallback to mockup salary if not set

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Dynamic KPI Metric Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <KpiCard label="EXPERIENCE" value={`${teacher.experience_years || 0} Years`} icon="history" isCount />
              <KpiCard label="ASSIGNED" value={`${batches.length} Classes`} icon="book" isCount variant="info" />
              <KpiCard label="STUDENTS" value={totalStudents} icon="group" isCount variant="success" />
              <KpiCard label="ATTENDANCE" value={`${attendanceRate}%`} icon="verified_user" isCount variant="warning" />
              <KpiCard label="SALARY" value={salaryDisplay} icon="payments" isCount={!salaryConfig?.base_amount} />
              <KpiCard label="PERFORMANCE" value="A+" icon="star" isCount variant="info" />
            </div>

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

                {/* Quick Actions Panel */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-text-main dark:text-white">Quick Actions</h3>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => navigate(`/admin/batches`)} className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-sm text-text-main dark:text-white transition-colors">
                      <span className="material-symbols-outlined text-primary text-xl">add_box</span>
                      Assign Class
                    </button>
                    <button className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-sm text-text-main dark:text-white transition-colors">
                      <span className="material-symbols-outlined text-amber-500 text-xl">event_busy</span>
                      Approve Leave
                    </button>
                    <button className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-sm text-text-main dark:text-white transition-colors">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">download</span>
                      Download Profile
                    </button>
                    <button className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-sm text-text-main dark:text-white transition-colors">
                      <span className="material-symbols-outlined text-purple-500 text-xl">print</span>
                      Print Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Attendance':
        return <TeachersAttendance teacherId={teacher.teacher_id} />;
      case 'Assigned Classes':
        return <TeacherAssignedClasses teacherId={teacher.teacher_id} />;
      case 'Salary & Payroll':
        return <TeacherSalaryPayroll teacherId={teacher.teacher_id} />;
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
    <div className="space-y-6 pb-10 pt-6 lg:pt-10 w-full lg:w-[98%] lg:mx-auto xl:w-[95%] max-w-[1440px]">
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
