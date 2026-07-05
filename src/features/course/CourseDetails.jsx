import React, { useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Core Layout & UI Components
import MainLayout from '../../components/layout/MainLayout';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SelectInput from '../../components/ui/v2/SelectInput';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';

// Shared responsive layouts & footers
import useIsMobile from '../../hooks/useIsMobile';
import ActionFooter from '../../components/ui/v2/ActionFooter';
import StatusButton from '../../components/ui/v2/StatusButton';

// Data Fetching & Utilities
import { queryKeys } from '../../lib/react-query/queryKeys';
import { useTeachersQuery } from '../teacher/hooks/useTeacherQueries';
import { usePackagesQuery } from './hooks/usePackageQueries';
import { useBatchesQuery, useUpdateBatchMutation, useDeleteBatchMutation } from '../batch/hooks/useBatchQueries';
import { 
  useCourseDetailQuery, 
  useCourseTeachersQuery, 
  useCourseAllocationsQuery, 
  useAssignCourseTeacherMutation, 
  useUnassignCourseTeacherMutation,
  useDeleteCourseMutation,
  useUpdateCourseMutation
} from './hooks/useCourseQueries';

// Decoupled View Components (The Hashmap Sub-views)
import { OverviewTab } from './tabs/OverviewTab';
import { StudentsTab } from './tabs/StudentsTab';
import { BatchesTab } from './tabs/BatchesTab';
import { PackagesTab } from './tabs/PackagesTab';
import { StructureTab } from './tabs/StructureTab';

// Immutable metadata configurations declared outside render scope
const CRUMBS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
  { label: 'Courses', path: '/admin/courses' },
  { label: 'Details' }
];

const TABS_CONFIG = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'students', label: 'Enrolled Students', icon: 'group' },
  { id: 'batches', label: 'Assigned Batches', icon: 'calendar_today' },
  { id: 'packages', label: 'Connected Packages', icon: 'inventory_2' },
  { id: 'structure', label: 'Fee Structure', icon: 'receipt_long' },
];

const STATUS_COLORS = {
  active: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50',
  suspended: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50',
  completed: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
  dropped: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50',
  inactive: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50',
  draft: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50',
  cancelled: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50'
};

/**
 * Course Details & Analytics Page
 * Provides deep insights into course performance, financials, and enrollment.
 */
const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [isSticky, setIsSticky] = useState(false);

  const handleBodyScroll = useCallback((e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => (prev !== shouldBeSticky ? shouldBeSticky : prev));
  }, []);

  const { data: course, isLoading, error } = useCourseDetailQuery(id);
  const { data: assignedTeachersRaw = [], isLoading: isAssignedLoading } = useCourseTeachersQuery(id);
  const { data: allTeachers = [], isLoading: isAllTeachersLoading } = useTeachersQuery();
  const { data: allocations = [], isLoading: isAllocationsLoading } = useCourseAllocationsQuery(id);
  const { data: batches = [], isLoading: isBatchesLoading } = useBatchesQuery({ course_id: id });
  const { data: packages = [], isLoading: isPackagesLoading } = usePackagesQuery();

  const assignTeacherMutation = useAssignCourseTeacherMutation();
  const unassignTeacherMutation = useUnassignCourseTeacherMutation();
  const updateBatchMutation = useUpdateBatchMutation();
  const deleteBatchMutation = useDeleteBatchMutation();
  const deleteCourseMutation = useDeleteCourseMutation();
  const updateCourseMutation = useUpdateCourseMutation();

  const handleStatusToggle = useCallback(async (nextStatus) => {
    return await updateCourseMutation.mutateAsync({
      id,
      data: { status: nextStatus }
    });
  }, [id, updateCourseMutation]);

  // Memoized relational data mapping (Phase 1)
  const { assignedTeachers, unassignedTeachers } = useMemo(() => {
    const assigned = assignedTeachersRaw.map(assignment => {
      const teacher = allTeachers.find(t => t.teacher_id === assignment.teacher_id);
      return {
        ...assignment,
        teacher_name: teacher ? (teacher.teacher_name || teacher.full_name) : 'Unknown Teacher',
        email: teacher?.email || 'No email',
        avatarUrl: teacher?.avatarUrl
      };
    });

    const assignedIds = new Set(assignedTeachersRaw.map(a => a.teacher_id));
    const unassigned = allTeachers.filter(t => !assignedIds.has(t.teacher_id));

    return { assignedTeachers: assigned, unassignedTeachers: unassigned };
  }, [assignedTeachersRaw, allTeachers]);

  const connectedPackages = useMemo(() => {
    return packages.filter(pkg => pkg.courses?.some(c => c.course_id === id));
  }, [packages, id]);

  // Memoized mutation callback triggers (Phase 1)
  const handleAssignTeacher = useCallback(async () => {
    if (!selectedTeacherId) return;
    try {
      await assignTeacherMutation.mutateAsync({ teacherId: selectedTeacherId, courseId: id });
      setSelectedTeacherId('');
    } catch (err) {
      console.error('[CourseDetails] Failed to assign teacher:', err);
    }
  }, [selectedTeacherId, id, assignTeacherMutation]);

  const handleUnassignTeacher = useCallback(async (teacherSubjectId) => {
    if (window.confirm('Are you sure you want to unassign this teacher from this course?')) {
      try {
        await unassignTeacherMutation.mutateAsync({ teacherSubjectId, courseId: id });
      } catch (err) {
        console.error('[CourseDetails] Failed to unassign teacher:', err);
      }
    }
  }, [id, unassignTeacherMutation]);

  const handleUnassignBatch = useCallback(async (batchId) => {
    if (window.confirm('Are you sure you want to unassign this batch from this course?')) {
      try {
        await updateBatchMutation.mutateAsync(
          {
            id: batchId,
            data: {
              item_id: null,
              type: null
            }
          },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: queryKeys.batch.lists() });
            }
          }
        );
      } catch (err) {
        console.error('[CourseDetails] Failed to unassign batch:', err);
      }
    }
  }, [updateBatchMutation, queryClient]);

  const handleDeleteBatch = useCallback(async (batchId) => {
    if (window.confirm('Are you sure you want to permanently delete this batch? All scheduling and records for this batch will be lost.')) {
      try {
        await deleteBatchMutation.mutateAsync(
          { id: batchId },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: queryKeys.batch.lists() });
            }
          }
        );
      } catch (err) {
        console.error('[CourseDetails] Failed to delete batch:', err);
      }
    }
  }, [deleteBatchMutation, queryClient]);

  const handleDeleteCourse = useCallback(async () => {
    if (window.confirm('Are you sure you want to permanently delete this course? All associated records will be lost.')) {
      try {
        await deleteCourseMutation.mutateAsync({ id });
        navigate('/admin/courses');
      } catch (err) {
        console.error('[CourseDetails] Failed to delete course:', err);
      }
    }
  }, [id, deleteCourseMutation, navigate]);

  const handleInvalidateDetails = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.course.detail(id) });
  }, [queryClient, id]);

  const handleNavigateToCourses = useCallback(() => navigate('/admin/courses'), [navigate]);

  // Tab Component Hashmap Registry (Phase 2)
  const tabRegistry = useMemo(() => {
    if (!course) return {};

    return {
      overview: (
        <OverviewTab
          baseFee={Number(course.base_fee) || 0}
          allocationsLength={allocations.length}
          installmentCount={course.default_installment_count || 1}
          isAllocationsLoading={isAllocationsLoading}
          course={course}
          isMobile={isMobile}
        />
      ),
      students: (
        <StudentsTab
          allocations={allocations}
          isAllocationsLoading={isAllocationsLoading}
          isMobile={isMobile}
        />
      ),
      batches: (
        <BatchesTab
          batches={batches}
          isBatchesLoading={isBatchesLoading}
          statusColors={STATUS_COLORS}
          onUnassignBatch={handleUnassignBatch}
          onDeleteBatch={handleDeleteBatch}
          isUpdatePending={updateBatchMutation.isPending}
          isDeletePending={deleteBatchMutation.isPending}
          isMobile={isMobile}
        />
      ),
      packages: (
        <PackagesTab
          connectedPackages={connectedPackages}
          isPackagesLoading={isPackagesLoading}
          isMobile={isMobile}
        />
      ),
      structure: (
        <StructureTab
          course={course}
          isMobile={isMobile}
        />
      )
    };
  }, [
    course,
    allocations,
    isAllocationsLoading,
    batches,
    isBatchesLoading,
    connectedPackages,
    isPackagesLoading,
    handleUnassignBatch,
    handleDeleteBatch,
    updateBatchMutation.isPending,
    deleteBatchMutation.isPending,
    isMobile
  ]);

  // Memoized actions array for abstract mobile ActionFooter (WCAG compliant)
  const mobileActions = useMemo(() => [
    { 
      label: 'Edit', 
      icon: 'edit', 
      onClick: () => navigate(`/admin/courses/edit/${id}`), 
      variant: 'outlined' 
    },
    { 
      label: 'Add', 
      icon: 'add', 
      onClick: () => navigate(`/admin/students/register?course_id=${id}`), 
      variant: 'contained' 
    },
    { 
      label: 'Delete', 
      icon: 'delete', 
      onClick: handleDeleteCourse, 
      variant: 'danger',
      loading: deleteCourseMutation.isPending 
    }
  ], [id, navigate, handleDeleteCourse, deleteCourseMutation.isPending]);

  if (isLoading) return <LoadingState message="Analyzing course data..." />;
  if (error) return <ErrorState message={error.message} onRetry={handleInvalidateDetails} />;
  if (!course) return <ErrorState title="Course Not Found" message="The requested course could not be located." onRetry={handleNavigateToCourses} />;

  // Mobile layout branch (JS-based conditional rendering)
  if (isMobile) {
    const baseFee = Number(course.base_fee || 0);
    const installmentCount = course.default_installment_count || 1;
    const estimatedInstallment = baseFee / installmentCount;

    return (
      <MainLayout
        onBodyScroll={handleBodyScroll}
        header={
          <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${isSticky ? 'opacity-100 translate-y-0 shadow-md' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between rounded-b-xl">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => navigate('/admin/courses')} className="p-1 -ml-1 text-text-main dark:text-white">
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <span className="text-sm font-bold text-text-main dark:text-white truncate">{course.name}</span>
              </div>
            </div>
          </div>
        }
        body={
          <div className="px-4 pt-4 pb-16 space-y-4 w-full text-text-main dark:text-white">
            {/* Header Title Block */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => navigate('/admin/courses')} className="p-1 -ml-2 text-text-main dark:text-white active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                  </button>
                  <div>
                    <h1 className="text-lg font-black tracking-tight leading-tight">{course.name}</h1>
                    <p className="text-[10px] font-mono text-text-secondary mt-0.5">{course.course_id}</p>
                  </div>
                </div>
                <StatusButton
                  currentStatus={course.is_active ? 'active' : 'inactive'}
                  entityName="Course"
                  onStatusToggle={handleStatusToggle}
                  isLoading={updateCourseMutation.isPending}
                />
              </div>
            </div>

            {/* Course Price Gradient Card with Inline vector graphics illustration */}
            <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/15 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-sm flex items-center justify-between overflow-hidden relative min-h-[120px]">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Course Price</p>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                  ₹{baseFee.toLocaleString()}
                </h2>
                <div className="flex flex-col text-[10px] text-text-secondary mt-1 font-semibold">
                  <span>₹{estimatedInstallment.toFixed(2).toLocaleString()} / month</span>
                  <span>{installmentCount} Installments</span>
                </div>
              </div>
              
              {/* Books & Graduation Cap Vector SVG Illustration */}
              <div className="w-28 h-20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 80" className="w-full h-full text-primary select-none" fill="currentColor">
                  {/* Stacked Book 1 (Blue) */}
                  <path d="M10,60 L90,60 L80,68 L20,68 Z" fill="#3b82f6" opacity="0.9" />
                  <rect x="20" y="68" width="60" height="4" fill="#1d4ed8" />
                  {/* Stacked Book 2 (Red) */}
                  <path d="M15,48 L85,48 L75,56 L25,56 Z" fill="#ef4444" opacity="0.9" />
                  <rect x="25" y="56" width="50" height="4" fill="#b91c1c" />
                  {/* Graduation Cap Box */}
                  <path d="M50,20 L80,30 L50,40 L20,30 Z" fill="#1e293b" />
                  <polygon points="50,30 50,48 53,48 53,30" fill="#1e293b" />
                  {/* Tassel */}
                  <path d="M50,30 L25,35 L24,45 L26,45 Z" fill="#eab308" />
                </svg>
              </div>
            </div>

            {/* $2x2 Stat Chips Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                  <span className="material-symbols-outlined text-lg">group</span>
                </div>
                <div>
                  <p className="text-sm font-black">{isAllocationsLoading ? '...' : allocations.length}</p>
                  <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wide">Students</p>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                </div>
                <div>
                  <p className="text-sm font-black">{isBatchesLoading ? '...' : batches.length}</p>
                  <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wide">Batches</p>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                  <span className="material-symbols-outlined text-lg">school</span>
                </div>
                <div>
                  <p className="text-sm font-black">{isAssignedLoading ? '...' : assignedTeachers.length}</p>
                  <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wide">Faculty</p>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
                  <span className="material-symbols-outlined text-lg">event_repeat</span>
                </div>
                <div>
                  <p className="text-sm font-black">{course.default_installment_count || 1}</p>
                  <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wide">Cycles</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Header */}
            <div className="sticky top-0 z-40 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark -mx-4 px-4 overflow-x-auto no-scrollbar">
              <nav className="flex space-x-6 py-1">
                {TABS_CONFIG.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-0.5 border-b-2 font-black text-xs flex items-center gap-1.5 transition-all whitespace-nowrap focus:outline-none ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}
                  >
                    <span className="material-symbols-outlined text-base">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Views Persistent Viewport */}
            <div className="pt-2">
              {Object.entries(tabRegistry).map(([tabId, componentInstance]) => (
                <div 
                  key={tabId} 
                  className={activeTab === tabId ? "block animate-in fade-in duration-200" : "hidden"}
                >
                  {componentInstance}
                </div>
              ))}
            </div>
          </div>
        }
        footer={<ActionFooter actions={mobileActions} />}
      />
    );
  }

  // Standard Desktop Layout View
  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      header={
        <div
          className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
            isSticky
              ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">school</span>
              <span className="text-sm font-bold text-text-main dark:text-white">
                {course.name}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-text-secondary dark:text-slate-400 font-semibold uppercase">
                {course.course_id}
              </span>
            </div>
          </div>
        </div>
      }
      body={
        <div className="px-4 lg:px-0 pt-6 lg:pt-10 pb-6 space-y-6">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Breadcrumbs items={CRUMBS} className="mb-1" />
              <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">{course.name}</h1>
              <p className="text-text-secondary text-sm">
                ID: {course.course_id} • Status: {course.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusButton
                currentStatus={course.is_active ? 'active' : 'inactive'}
                entityName="Course"
                onStatusToggle={handleStatusToggle}
                isLoading={updateCourseMutation.isPending}
              />
              <button 
                type="button"
                onClick={() => navigate(`/admin/courses/edit/${course.course_id}`)} 
                className="px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-text-main dark:text-white text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Course
              </button>
              <button 
                type="button"
                onClick={() => navigate(`/admin/students/register?course_id=${course.course_id}`)}
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Student
              </button>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            
            {/* Left Column (Main Tab Areas - Decoupled with Visual Toggle Render - Phase 2) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Tabs */}
              <div className="border-b border-border-light dark:border-border-dark">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                  {TABS_CONFIG.map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all
                        ${activeTab === tab.id 
                          ? 'border-primary text-primary' 
                          : 'border-transparent text-text-secondary hover:text-text-main dark:hover:text-white hover:border-gray-300'}
                      `}
                    >
                      <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Render all tabs in parallel to maintain DOM states using CSS visibility toggles */}
              <div className="tabs-content-wrapper">
                {Object.entries(tabRegistry).map(([tabId, componentInstance]) => (
                  <div
                    key={tabId}
                    className={activeTab === tabId ? 'block' : 'hidden'}
                  >
                    {componentInstance}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (Sidebar Widgets) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Assigned Faculty Card */}
              <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                  <h3 className="font-bold text-text-main dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">school</span>
                    Assigned Faculty
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold">
                    {assignedTeachers.length}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {isAssignedLoading || isAllTeachersLoading ? (
                    <div className="flex justify-center py-4">
                      <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></span>
                    </div>
                  ) : assignedTeachers.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-text-secondary">No faculty members assigned to this course yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                      {assignedTeachers.map(assignment => {
                        const initials = assignment.teacher_name
                          .split(' ')
                          .map(n => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        return (
                          <div 
                            key={assignment.teacher_subject_id} 
                            className="flex items-center justify-between p-2.5 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark hover:border-primary/20 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              {assignment.avatarUrl ? (
                                <img src={assignment.avatarUrl} alt={assignment.teacher_name} className="w-9 h-9 rounded-full object-cover border border-border-light dark:border-border-dark" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center border border-primary/20">
                                  {initials}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-text-main dark:text-white truncate">{assignment.teacher_name}</p>
                                <p className="text-[10px] text-text-secondary truncate">{assignment.email}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUnassignTeacher(assignment.teacher_subject_id)}
                              disabled={unassignTeacherMutation.isPending}
                              className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 disabled:opacity-50"
                              title="Unassign Faculty"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Assign Dropdown Area */}
                  <div className="pt-4 border-t border-dashed border-border-light dark:border-border-dark space-y-3">
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Assign New Faculty</h4>
                    {isAllTeachersLoading ? (
                      <div className="h-9 bg-background-light dark:bg-background-dark animate-pulse rounded-lg"></div>
                    ) : unassignedTeachers.length === 0 ? (
                      <p className="text-[11px] text-text-secondary italic">All registered teachers are assigned to this course.</p>
                    ) : (
                      <div className="space-y-3">
                        <SelectInput
                          options={unassignedTeachers.map(t => ({
                            value: t.teacher_id,
                            label: t.teacher_name || t.full_name
                          }))}
                          value={selectedTeacherId}
                          onChange={setSelectedTeacherId}
                          placeholder="Select faculty member..."
                          searchable={true}
                          variant="filled"
                        />
                        <button
                          type="button"
                          onClick={handleAssignTeacher}
                          disabled={!selectedTeacherId || assignTeacherMutation.isPending}
                          className="w-full py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                          {assignTeacherMutation.isPending ? (
                            <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          )}
                          Assign Faculty
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Summary Card */}
              <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                  <h3 className="font-bold text-text-main dark:text-white">Quick Summary</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${course.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {course.is_active ? 'HEALTHY' : 'INACTIVE'}
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">category</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-text-secondary uppercase">Category</p>
                      <p className="text-xs font-bold text-text-main dark:text-white">{course.segment_name || 'N/A'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary italic">"{course.description || 'No description provided for this course.'}"</p>
                  <div className="pt-4 border-t border-dashed border-border-light dark:border-border-dark">
                    <div className="flex justify-between items-center text-xs text-text-secondary mb-1 uppercase font-bold tracking-wider">
                      <span>Revenue Target</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-background-light dark:bg-background-dark rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default CourseDetails;
