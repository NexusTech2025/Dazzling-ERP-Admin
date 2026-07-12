import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBatchDetailQuery, useBatchStudentsQuery, useUpdateBatchMutation } from './useBatchQueries';
import { useCourseDetailQuery } from '../../course/hooks/useCourseQueries';
import { useTeacherDetailQuery } from '../../teacher/hooks/useTeacherQueries';
import { useBranchesQuery } from '../../core/hooks/useBranchQueries';
import useIsMobile from '../../../hooks/useIsMobile';

export const useBatchProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const isMobile = useIsMobile();

  // Primary Query Core
  const { data: rawBatch, isLoading: isBatchLoading, error: batchError } = useBatchDetailQuery(id);
  const { data: students = [], isLoading: isStudentsLoading } = useBatchStudentsQuery(id);
  const updateBatchMutation = useUpdateBatchMutation();

  // Relational Entity Sync (Cache-First Model)
  const { data: course } = useCourseDetailQuery(rawBatch?.course_id);
  const { data: teacher } = useTeacherDetailQuery(rawBatch?.teacher_id);
  const { data: branches = [] } = useBranchesQuery();

  // Resolve Branch Reference Mapping
  const selectedBranch = useMemo(() => {
    if (!rawBatch?.branch_id || !branches.length) return null;
    return branches.find(b => b.branch_id === rawBatch.branch_id || b.id === rawBatch.branch_id);
  }, [rawBatch?.branch_id, branches]);

  // Unified Relational Batch Payload Data Transformation
  const batch = useMemo(() => {
    if (!rawBatch) return null;
    return {
      ...rawBatch,
      course_name: course?.name,
      instructor_name: teacher?.teacher_name || teacher?.full_name,
      branch_name: selectedBranch?.branch_name || rawBatch.branch_name
    };
  }, [rawBatch, course, teacher, selectedBranch]);

  // Transaction Status Switch Callback
  const handleStatusToggle = useCallback(async (nextStatus) => {
    const statusValue = nextStatus === 'inactive' ? 'cancelled' : 'active';
    return await updateBatchMutation.mutateAsync({
      id,
      data: { status: statusValue }
    });
  }, [id, updateBatchMutation]);

  // Tab Triggers & Routing Links
  const handleMobileTabNavigation = useCallback((tabKey) => {
    setActiveTab(tabKey);
  }, []);

  const handleViewAttendanceLink = useCallback(() => {
    setActiveTab('Attendance');
  }, []);

  const handleViewPerformanceLink = useCallback(() => {
    console.log('Navigate to Academic Metrics');
  }, []);

  // Mobile Layout Static Framework Configurations (Memoized to isolate downstream paints)
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

  const mobileStatsItems = useMemo(() => {
    if (!batch) return [];
    return [
      { icon: 'groups', value: `${students.length} / ${batch.capacity || 30}`, label: 'Seats Filled', minWidth: '100px', maxWidth: '160px' },
      { icon: 'check_circle', value: '92%', label: 'Attendance', minWidth: '100px', maxWidth: '160px' },
      { icon: 'menu_book', value: '24', label: 'Classes Held', minWidth: '100px', maxWidth: '160px' },
      { icon: 'payments', value: '₹5.2L', label: 'Revenue', minWidth: '100px', maxWidth: '160px' },
    ];
  }, [batch, students.length]);

  return {
    id,
    batch,
    students,
    activeTab,
    setActiveTab,
    isMobile,
    isBatchLoading,
    batchError,
    handleStatusToggle,
    isStatusLoading: updateBatchMutation.isPending,
    handleMobileTabNavigation,
    handleViewAttendanceLink,
    handleViewPerformanceLink,
    mobileScheduleItems,
    mobileActivityItems,
    mobileAttendanceStats,
    mobileAcademicStats,
    mobileStatsItems,
    navigate
  };
};
