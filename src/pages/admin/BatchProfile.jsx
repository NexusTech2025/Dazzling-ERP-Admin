import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBatchDetailQuery, useBatchStudentsQuery, useUpdateBatchMutation } from '../../features/batch/hooks/useBatchQueries';
import { useCourseDetailQuery } from '../../features/course/hooks/useCourseQueries';
import { useTeacherDetailQuery } from '../../features/teacher/hooks/useTeacherQueries';
import { useBranchesQuery } from '../../features/core/hooks/useBranchQueries';
import StatusButton from '../../components/ui/v2/StatusButton';
import useIsMobile from '../../hooks/useIsMobile';

// Sub-components
import BatchProfileHeader from '../../features/batch/components/profile/BatchProfileHeader';
import BatchKPICards from '../../features/batch/components/profile/BatchKPICards';
import BatchDetailsCard from '../../features/batch/components/profile/BatchDetailsCard';
import BatchUpcomingSchedule from '../../features/batch/components/profile/BatchUpcomingSchedule';
import BatchActivityLog from '../../features/batch/components/profile/BatchActivityLog';
import BatchStudentRoster from '../../features/batch/components/profile/BatchStudentRoster';
import AttendanceMatrix from '../../features/batch/components/profile/AttendanceMatrix';

// Mobile layout additions
import ScrollableTabSegment from '../../features/batch/components/profile/ScrollableTabSegment';
import BatchOverviewTab from '../../features/batch/components/profile/BatchOverviewTab';
import ProfileHero from '../../components/ui/v2/ProfileHero';
import HorizontalStatMetrics from '../../components/ui/v2/cards/HorizontalStatMetrics';
import CardContainer from '../../components/ui/v2/cards/CardContainer';

const MOBILE_TABS = [
  { key: 'Overview', label: 'Overview', icon: 'dashboard' },
  { key: 'Students', label: 'Roster', icon: 'group' },
  { key: 'Attendance', label: 'Attendance', icon: 'co_present' },
];

const BatchProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const isMobile = useIsMobile();

  const { data: rawBatch, isLoading: isBatchLoading, error: batchError } = useBatchDetailQuery(id);
  const { data: students = [], isLoading: isStudentsLoading } = useBatchStudentsQuery(id);
  const updateBatchMutation = useUpdateBatchMutation();

  const handleStatusToggle = useCallback(async (nextStatus) => {
    const statusValue = nextStatus === 'inactive' ? 'cancelled' : 'active';
    return await updateBatchMutation.mutateAsync({
      id,
      data: { status: statusValue }
    });
  }, [id, updateBatchMutation]);

  // Independent related data hooks (Cache-First)
  const { data: course } = useCourseDetailQuery(rawBatch?.course_id);
  const { data: teacher } = useTeacherDetailQuery(rawBatch?.teacher_id);
  const { data: branches = [] } = useBranchesQuery();

  const selectedBranch = useMemo(() => {
    if (!rawBatch?.branch_id || !branches.length) return null;
    return branches.find(b => b.branch_id === rawBatch.branch_id || b.id === rawBatch.branch_id);
  }, [rawBatch?.branch_id, branches]);

  // Merge descriptive data for UI consumption
  const batch = useMemo(() => {
    if (!rawBatch) return null;

    return {
      ...rawBatch,
      course_name: course?.name,
      instructor_name: teacher?.teacher_name || teacher?.full_name,
      branch_name: selectedBranch?.branch_name || rawBatch.branch_name
    };
  }, [rawBatch, course, teacher, selectedBranch]);

  // Mobile specific static/derived view data configurations (Memoized to prevent list re-renders)
  const mobileScheduleItems = useMemo(() => {
    if (!batch) return [];
    return [
      { id: '1', dayType: 'today', time: batch.schedule?.start_time || '08:00 AM', topic: 'Intro to Quantum Mechanics', chapter: 'Chapter 1' },
      { id: '2', dayType: 'tomorrow', time: batch.schedule?.start_time || '08:00 AM', topic: 'Wave-Particle Duality', chapter: 'Chapter 2' },
      { id: '3', dayType: 'future', dateLabel: 'FRI, 25 JUL', time: batch.schedule?.start_time || '08:00 AM', topic: 'Schrodinger Wave Equation', chapter: 'Chapter 3' },
    ];
  }, [batch]);

  const mobileActivityItems = useMemo(() => [
    { id: '1', icon: 'how_to_reg', iconVariant: 'success', title: 'Attendance Marked', timestamp: 'Today, 09:30 AM', detail: `${students.length} Present` },
    { id: '2', icon: 'quiz', iconVariant: 'warning', title: 'Test Results Published', timestamp: 'Yesterday, 02:15 PM', detail: 'Class Avg: 81%' },
    { id: '3', icon: 'upload_file', iconVariant: 'primary', title: 'Material Uploaded', timestamp: 'Oct 12, 10:00 AM', detail: 'Ch-3 PDF' },
  ], [students.length]);

  const mobileAttendanceStats = useMemo(() => ({
    overallPercent: 92,
    lastWeekPercent: 94,
    presentToday: `${students.length} Enrolled`,
    totalClasses: 24,
  }), [students.length]);

  const mobileAcademicStats = useMemo(() => ({
    syllabusPercent: 74,
    testsConducted: 8,
    averageScore: 81,
    highestScore: 98,
  }), []);


  // Stats items for the horizontal metrics ribbon
  const mobileStatsItems = useMemo(() => {
    if (!batch) return [];
    return [
      { icon: 'groups', value: `${students.length} / ${batch.capacity || 30}`, label: 'Seats Filled', minWidth: '100px', maxWidth: '160px' },
      { icon: 'check_circle', value: '92%', label: 'Attendance', minWidth: '100px', maxWidth: '160px' },
      { icon: 'menu_book', value: '24', label: 'Classes Held', minWidth: '100px', maxWidth: '160px' },
      { icon: 'payments', value: '₹5.2L', label: 'Revenue', minWidth: '100px', maxWidth: '160px' },
    ];
  }, [batch, students.length]);

  const mobileMetaLines = useMemo(() => {
    if (!batch) return [];

    const daysLabel = batch.schedule?.days_of_week?.join(', ') || 'No days configured';
    const timingsLabel = batch.schedule?.start_time && batch.schedule?.end_time
      ? `${batch.schedule.start_time} - ${batch.schedule.end_time}`
      : 'TBD';

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        const dateOnly = dateStr.split('T')[0];
        const [year, month, day] = dateOnly.split('-');
        return new Date(year, month - 1, day).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short'
        });
      } catch (e) {
        return dateStr;
      }
    };

    const startEndDates = batch.start_date && batch.end_date
      ? `${formatDate(batch.start_date)} - ${formatDate(batch.end_date)}`
      : 'No dates configured';

    return [
      {
        icon: 'calendar_month',
        text: (
          <span className="flex flex-wrap items-center gap-1 select-none">
            <span>{startEndDates}</span>
            <span className="text-slate-300 dark:text-slate-700 mx-0.5">•</span>
            <span className="material-symbols-outlined text-[13px] text-slate-400">schedule</span>
            <span>{timingsLabel}</span>
            <span className="text-slate-300 dark:text-slate-700 mx-0.5">•</span>
            <span className="material-symbols-outlined text-[13px] text-slate-400">event_note</span>
            <span>{daysLabel}</span>
          </span>
        )
      },
      {
        icon: 'person',
        text: (
          <span className="flex flex-wrap items-center gap-1 select-none">
            <span>{batch.instructor_name || 'Unassigned Instructor'}</span>
            <span className="text-slate-300 dark:text-slate-700 mx-0.5">•</span>
            <span className="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
            <span>{batch.branch_name || 'Main Branch'}</span>
          </span>
        )
      }
    ];
  }, [batch]);

  const handleMobileTabNavigation = useCallback((tabKey) => {
    setActiveTab(tabKey);
  }, []);

  const handleViewAttendanceLink = useCallback(() => {
    setActiveTab('Attendance');
  }, []);

  const handleViewPerformanceLink = useCallback(() => {
    console.log('Navigate to Academic Metrics');
  }, []);

  if (isBatchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (batchError || !batch) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-text-main dark:text-white">Batch not found</h2>
        <button onClick={() => navigate('/admin/batches')} className="mt-4 text-primary hover:underline">Back to Directory</button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <BatchDetailsCard batch={batch} />
              <BatchUpcomingSchedule batch={batch} />
            </div>
            <div className="lg:col-span-1">
              <BatchActivityLog />
            </div>
          </div>
        );

      case 'Students':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <BatchStudentRoster batchId={id} />
          </div>
        );

      case 'Attendance':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <AttendanceMatrix batchId={id} />
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

  // JS-Conditional Viewport Router Split
  if (isMobile) {
    const avatarNode = (
      <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-primary border border-primary/20 shrink-0">
        <span className="material-symbols-outlined text-[32px]">menu_book</span>
      </div>
    );

    const statusBadge = (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/20 leading-none">
        Active
      </span>
    );

    const heroActions = (
      <div className="flex items-center gap-2.5 w-full mt-2 md:mt-0">
        <Link
          to={`/admin/batches/edit/${id}`}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg h-9 bg-white dark:bg-slate-800 text-text-main dark:text-white border border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs font-bold shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          <span>Edit Batch</span>
        </Link>
        <button
          onClick={() => navigate(`/admin/batches/schedule/${id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg h-9 bg-white dark:bg-slate-800 text-text-main dark:text-white border border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs font-bold shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          <span>Schedule</span>
        </button>
        <button
          className="flex items-center justify-center gap-1.5 rounded-lg h-9 px-4 bg-primary text-white hover:bg-primary-dark transition-all text-xs font-bold shadow-sm active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">more_vert</span>
          <span>More</span>
        </button>
      </div>
    );

    return (
      <div className="flex flex-col gap-4 pb-10 w-full min-h-screen">
        {/* Navigation Breadcrumbs for Mobile */}
        <nav className="flex items-center gap-2 text-sm font-medium text-text-secondary px-4 pt-4 shrink-0">
          <Link to="/admin/dashboard" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link to="/admin/batches" className="hover:text-primary transition-colors">Batches</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-text-main dark:text-white">Batch Details</span>
        </nav>

        {/* Persistent Profile Hero */}
        <div className="px-4 shrink-0">
          <ProfileHero
            avatar={avatarNode}
            title={batch.batch_name}
            badge={statusBadge}
            idText={`ID: ${batch.batch_id || id}`}
            metaLines={mobileMetaLines}
            actions={heroActions}
          />
        </div>

        {/* Persistent Horizontal KPI Stats Ribbon */}
        <div className="px-4 shrink-0">
          <CardContainer hoverable={false} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <HorizontalStatMetrics
              items={mobileStatsItems}
              allowWrap={false}
              className="[&_.flex-col]:flex-col-reverse [&_span.material-symbols-outlined]:bg-primary/10 dark:[&_span.material-symbols-outlined]:bg-primary/15 [&_span.material-symbols-outlined]:text-primary [&_span.material-symbols-outlined]:p-2 [&_span.material-symbols-outlined]:rounded-full [&_div.min-w-\[65px\]]:flex-1"
            />
          </CardContainer>
        </div>

        {/* Mobile Sticky Tab Segment Navigation */}
        <ScrollableTabSegment
          activeTab={activeTab}
          onTabChange={handleMobileTabNavigation}
          tabs={MOBILE_TABS}
        />

        {/* Tab switched content panels */}
        <div className="px-4">
          {activeTab === 'Overview' ? (
            <BatchOverviewTab
              batch={batch}
              scheduleItems={mobileScheduleItems}
              activityItems={mobileActivityItems}
              attendanceStats={mobileAttendanceStats}
              academicStats={mobileAcademicStats}
              onViewAttendance={handleViewAttendanceLink}
              onViewPerformance={handleViewPerformanceLink}
            />
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 pb-10">
      <nav className="flex items-center gap-2 text-sm font-medium text-text-secondary px-4">
        <Link to="/admin/dashboard" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link to="/admin/batches" className="hover:text-primary transition-colors">Batches</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-text-main dark:text-white">Batch Details</span>
      </nav>

      <BatchProfileHeader
        batch={batch}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onStatusToggle={handleStatusToggle}
        isStatusLoading={updateBatchMutation.isPending}
      />

      <BatchKPICards batch={batch} studentsCount={students.length} />

      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default BatchProfile;
