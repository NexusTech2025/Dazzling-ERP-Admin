import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useCourseDetailQuery, 
  useCourseTeachersQuery, 
  useCourseAllocationsQuery, 
  useAssignCourseTeacherMutation, 
  useUnassignCourseTeacherMutation 
} from './hooks/useCourseQueries';
import { usePackagesQuery } from './hooks/usePackageQueries';
import { useTeachersQuery } from '../teacher/hooks/useTeacherQueries';
import { useBatchesQuery, useUpdateBatchMutation, useDeleteBatchMutation } from '../batch/hooks/useBatchQueries';
import SelectInput from '../../components/ui/v2/SelectInput';
import { LoadingState, ErrorState } from '../../components/ui/QueryStatus';
import { queryKeys } from '../../lib/react-query/queryKeys';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import MainLayout from '../../components/layout/MainLayout';

/**
 * Course Details & Analytics Page
 * Provides deep insights into course performance, financials, and enrollment.
 */
const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [isSticky, setIsSticky] = useState(false);

  const handleBodyScroll = (e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => {
      if (prev !== shouldBeSticky) return shouldBeSticky;
      return prev;
    });
  };

  const crumbs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Courses', path: '/admin/courses' },
    { label: 'Details' }
  ];

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

  if (isLoading) return <LoadingState message="Analyzing course data..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.course.detail(id) })} />;
  if (!course) return <ErrorState title="Course Not Found" message="The requested course could not be located." onRetry={() => navigate('/admin/courses')} />;

  // Map raw assignments to full teacher details
  const assignedTeachers = assignedTeachersRaw.map(assignment => {
    const teacher = allTeachers.find(t => t.teacher_id === assignment.teacher_id);
    return {
      ...assignment,
      teacher_name: teacher ? (teacher.teacher_name || teacher.full_name) : 'Unknown Teacher',
      email: teacher?.email || 'No email',
      avatarUrl: teacher?.avatarUrl
    };
  });

  const assignedTeacherIds = assignedTeachersRaw.map(a => a.teacher_id);
  const unassignedTeachers = allTeachers.filter(t => !assignedTeacherIds.includes(t.teacher_id));

  const handleAssignTeacher = async () => {
    if (!selectedTeacherId) return;
    try {
      await assignTeacherMutation.mutateAsync({ teacherId: selectedTeacherId, courseId: id });
      setSelectedTeacherId('');
    } catch (err) {
      console.error('[CourseDetails] Failed to assign teacher:', err);
    }
  };

  const handleUnassignTeacher = async (teacherSubjectId) => {
    if (window.confirm('Are you sure you want to unassign this teacher from this course?')) {
      try {
        await unassignTeacherMutation.mutateAsync({ teacherSubjectId, courseId: id });
      } catch (err) {
        console.error('[CourseDetails] Failed to unassign teacher:', err);
      }
    }
  };

  const handleUnassignBatch = async (batchId) => {
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
  };

  const handleDeleteBatch = async (batchId) => {
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
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'students', label: 'Enrolled Students', icon: 'group' },
    { id: 'batches', label: 'Assigned Batches', icon: 'calendar_today' },
    { id: 'packages', label: 'Connected Packages', icon: 'inventory_2' },
    { id: 'structure', label: 'Fee Structure', icon: 'receipt_long' },
  ];

  const connectedPackages = packages.filter(pkg => pkg.courses?.some(c => c.course_id === id));

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
              <Breadcrumbs items={crumbs} className="mb-1" />
              <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">{course.name}</h1>
              <p className="text-text-secondary text-sm">
                ID: {course.course_id} • Status: {course.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(`/admin/courses/edit/${course.course_id}`)} className="px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-text-main dark:text-white text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Course
              </button>
              <button 
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
            
            {/* Left Column (Main Tab Areas) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Tabs */}
              <div className="border-b border-border-light dark:border-border-dark">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
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

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                          <span className="material-symbols-outlined">payments</span>
                        </div>
                        <span className="text-sm font-semibold text-text-secondary">Base Fee</span>
                      </div>
                      <p className="text-2xl font-black text-text-main dark:text-white">₹{Number(course.base_fee).toLocaleString()}</p>
                    </div>
                    
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                          <span className="material-symbols-outlined">group</span>
                        </div>
                        <span className="text-sm font-semibold text-text-secondary">Enrollment</span>
                      </div>
                      <p className="text-2xl font-black text-text-main dark:text-white">
                        {isAllocationsLoading ? (
                          <span className="inline-block w-8 h-6 bg-background-light dark:bg-background-dark animate-pulse rounded"></span>
                        ) : (
                          `${allocations.length} Students`
                        )}
                      </p>
                    </div>

                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                          <span className="material-symbols-outlined">event_repeat</span>
                        </div>
                        <span className="text-sm font-semibold text-text-secondary">Installments</span>
                      </div>
                      <p className="text-2xl font-black text-text-main dark:text-white">{course.default_installment_count || 1} Cycles</p>
                    </div>
                  </div>

                  {/* Performance Analytics Placeholder */}
                  <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-5xl text-text-secondary/20 mb-4">analytics</span>
                    <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">Performance Analytics</h3>
                    <p className="text-text-secondary text-sm max-w-sm">Detailed revenue and enrollment charts will be visualized here using historical course data.</p>
                  </div>
                </div>
              )}

              {/* Enrolled Students Tab */}
              {activeTab === 'students' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {isAllocationsLoading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                      <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
                    </div>
                  ) : allocations.length === 0 ? (
                    <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-2xl border border-border-light dark:border-border-dark shadow-sm text-center flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-text-secondary/30 mb-3">group</span>
                      <p className="text-text-secondary font-medium text-sm">No students enrolled in this course yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allocations.map(alloc => {
                        const student = alloc.student || {};
                        const batch = alloc.batch || {};
                        const initials = (student.student_name || 'N A')
                          .split(' ')
                          .map(n => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        const statusColors = {
                          active: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50',
                          suspended: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50',
                          completed: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
                          dropped: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50'
                        };

                        const statusStyle = statusColors[alloc.status?.toLowerCase()] || 'bg-gray-50 dark:bg-gray-800 text-text-secondary border-border-light dark:border-border-dark';

                        return (
                          <div 
                            key={alloc.allocation_id} 
                            className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark hover:border-primary/20 transition-all duration-300 shadow-sm flex flex-col justify-between"
                          >
                            <div className="flex items-start gap-4">
                              {student.avatarUrl ? (
                                <img src={student.avatarUrl} alt={student.student_name} className="w-12 h-12 rounded-full object-cover border border-border-light dark:border-border-dark" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/5 text-primary text-sm font-black flex items-center justify-center border border-primary/10">
                                  {initials}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-text-main dark:text-white truncate">{student.student_name || 'N/A'}</h4>
                                <p className="text-xs text-text-secondary truncate mt-0.5">{student.email || 'No email'}</p>
                                <p className="text-xs text-text-secondary mt-0.5">{student.phone || 'No phone'}</p>
                              </div>
                              <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${statusStyle}`}>
                                {alloc.status || 'Active'}
                              </span>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Assigned Batch</p>
                                <p className="font-bold text-text-main dark:text-white truncate mt-0.5">{batch.batch_name || 'No Batch'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Enrolled On</p>
                                <p className="font-bold text-text-main dark:text-white mt-0.5">
                                  {alloc.assigned_at ? new Date(alloc.assigned_at).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Batches Tab */}
              {activeTab === 'batches' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {isBatchesLoading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                      <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
                    </div>
                  ) : batches.length === 0 ? (
                    <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-2xl border border-border-light dark:border-border-dark shadow-sm text-center flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-text-secondary/30 mb-3">calendar_today</span>
                      <p className="text-text-secondary font-medium text-sm">No batches assigned to this course yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {batches.map(batch => {
                        const statusColors = {
                          active: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50',
                          completed: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
                          cancelled: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50'
                        };
                        const statusStyle = statusColors[batch.status?.toLowerCase()] || 'bg-gray-50 dark:bg-gray-800 text-text-secondary border-border-light dark:border-border-dark';

                        return (
                          <div 
                            key={batch.batch_id} 
                            className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark hover:border-primary/20 transition-all duration-300 shadow-sm flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start gap-4 mb-2">
                                <h4 className="font-bold text-text-main dark:text-white text-base truncate">{batch.batch_name}</h4>
                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${statusStyle}`}>
                                  {batch.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
                                <span className="px-2 py-0.5 bg-background-light dark:bg-background-dark rounded border border-border-light dark:border-border-dark text-[10px] font-bold uppercase">
                                  {batch.batch_type}
                                </span>
                                <span>•</span>
                                <span className="truncate">Instructor: {batch.instructor_name || 'N/A'}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border-light dark:border-border-dark text-xs mb-4">
                              <div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Capacity</p>
                                <p className="font-bold text-text-main dark:text-white mt-0.5">{batch.capacity} Students</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Start Date</p>
                                <p className="font-bold text-text-main dark:text-white mt-0.5">
                                  {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">End Date</p>
                                <p className="font-bold text-text-main dark:text-white mt-0.5">
                                  {batch.end_date ? new Date(batch.end_date).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-dashed border-border-light dark:border-border-dark">
                              <button
                                onClick={() => handleUnassignBatch(batch.batch_id)}
                                disabled={updateBatchMutation.isPending}
                                className="px-3 py-1.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary/30 rounded-lg text-xs font-bold text-text-secondary hover:text-primary transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50"
                                title="Remove connection between batch and this course without deleting the batch"
                              >
                                <span className="material-symbols-outlined text-[15px]">link_off</span>
                                Unassign
                              </button>
                              <button
                                onClick={() => handleDeleteBatch(batch.batch_id)}
                                disabled={deleteBatchMutation.isPending}
                                className="px-3 py-1.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/30 rounded-lg text-xs font-bold text-red-700 dark:text-red-400 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50"
                                title="Permanently delete this batch"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Connected Packages Tab */}
              {activeTab === 'packages' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {isPackagesLoading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                      <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
                    </div>
                  ) : connectedPackages.length === 0 ? (
                    <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-2xl border border-border-light dark:border-border-dark shadow-sm text-center flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-text-secondary/30 mb-3">inventory_2</span>
                      <p className="text-text-secondary font-medium text-sm">No connected packages found for this course.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {connectedPackages.map(pkg => {
                        const statusColors = {
                          active: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50',
                          inactive: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50',
                          draft: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50'
                        };
                        const statusStyle = statusColors[pkg.status?.toLowerCase()] || 'bg-gray-50 dark:bg-gray-800 text-text-secondary border-border-light dark:border-border-dark';

                        return (
                          <div 
                            key={pkg.package_id} 
                            className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark hover:border-primary/20 transition-all duration-300 shadow-sm flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start gap-4 mb-2">
                                <h4 className="font-bold text-text-main dark:text-white text-base truncate">{pkg.name}</h4>
                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${statusStyle}`}>
                                  {pkg.status}
                                </span>
                              </div>
                              <p className="text-xs text-text-secondary line-clamp-2 mb-4">{pkg.description || 'No description provided.'}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border-light dark:border-border-dark text-xs">
                              <div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Target Class</p>
                                <p className="font-bold text-text-main dark:text-white mt-0.5 truncate">{pkg.target_class || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Duration</p>
                                <p className="font-bold text-text-main dark:text-white mt-0.5">{pkg.month} Months</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Package Fee</p>
                                <p className="font-bold text-primary mt-0.5">₹{Number(pkg.package_fee).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Fee Structure Tab */}
              {activeTab === 'structure' && (
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-border-light dark:border-border-dark pb-4">
                    <h3 className="font-bold text-text-main dark:text-white text-lg">Fee Breakdown & Configurations</h3>
                    <p className="text-xs text-text-secondary mt-1">Below are the billing parameters configured for this course.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Base Fee</p>
                      <p className="text-2xl font-black text-text-main dark:text-white mt-1">₹{Number(course.base_fee).toLocaleString()}</p>
                      <p className="text-[10px] text-text-secondary mt-2">One-time / standard enrollment fee for this course.</p>
                    </div>

                    <div className="p-4 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Installments Allowed</p>
                      <p className="text-2xl font-black text-text-main dark:text-white mt-1">{course.default_installment_count || 1} Cycles</p>
                      <p className="text-[10px] text-text-secondary mt-2">Default splits offered for student payments.</p>
                    </div>

                    <div className="p-4 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Installment Amount</p>
                      <p className="text-2xl font-black text-text-main dark:text-white mt-1">
                        ₹{Number(course.base_fee / (course.default_installment_count || 1)).toFixed(2).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-text-secondary mt-2">Estimated base installment per cycle.</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-light dark:border-border-dark">
                    <h4 className="text-xs font-bold text-text-main dark:text-white mb-3 uppercase tracking-wider">Additional Parameters</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                        <p className="text-[10px] text-text-secondary font-bold uppercase">Medium</p>
                        <p className="font-bold text-text-main dark:text-white mt-0.5">{course.language_medium || 'English'}</p>
                      </div>
                      <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                        <p className="text-[10px] text-text-secondary font-bold uppercase">Duration</p>
                        <p className="font-bold text-text-main dark:text-white mt-0.5">
                          {course.duration_value} {course.duration_unit || 'months'}
                        </p>
                      </div>
                      <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                        <p className="text-[10px] text-text-secondary font-bold uppercase">Entity Type</p>
                        <p className="font-bold text-text-main dark:text-white mt-0.5 capitalize">{course.entity_type || 'course'}</p>
                      </div>
                      <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                        <p className="text-[10px] text-text-secondary font-bold uppercase">Short Code</p>
                        <p className="font-bold text-text-main dark:text-white mt-0.5">{course.short_code || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
