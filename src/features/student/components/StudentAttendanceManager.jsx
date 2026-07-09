import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBatchAttendanceQuery, useMarkAttendanceMutation } from '../../batch/hooks/useAttendanceQueries';
import { useAttendanceOrchestration } from '../../batch/hooks/useAttendanceOrchestration';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import { useAuth } from '../../../context/AuthContextCore';
import { isPastLocalDate } from '../../../lib/dateUtils';
import useIsMobile from '../../../hooks/useIsMobile';

// Layout & UI Components
import MainLayout from '../../../components/layout/MainLayout';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import { SearchInput } from '../../../components/ui/filters';
import { GenericSelectDropdown } from '../../../components/ui/v2/GenericSelectDropdown';
import LowDensityCard from '../../../components/ui/v2/cards/LowDensityCard';
import RefreshButton from '../../../components/ui/btn/RefreshButton';
import KpiGrid from '../../../components/ui/v2/KpiGrid';
import KpiCard from '../../../components/ui/v2/KpiCard';
import KpiRibbon from '../../../components/ui/v2/KpiRibbon';

// Decoupled subcomponents
import StudentAttendanceTable from './StudentAttendanceTable';
import StudentAttendanceMobileList from './StudentAttendanceMobileList';

// Helper utilities for structured time objects
const parseTimeToStructured = (timeStr) => {
  if (!timeStr) return null;
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour = hour - 12;
  if (hour === 0) hour = 12;
  return { hour, minute, period };
};

const formatStructuredToTime = (structTime) => {
  if (!structTime || typeof structTime !== 'object') return '';
  let { hour, minute, period } = structTime;
  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const EMPTY_ARRAY = Object.freeze([]);

export const StudentAttendanceManager = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isMobile = useIsMobile(768);
  const [isSticky, setIsSticky] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'P', 'A', 'L'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Filter States for Class Level and Macro-Segment Toggles
  const [classFilter, setClassFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');

  // 1. Consume client-side orchestrator hook for data joins and filters
  const orchestratorParams = useMemo(() => ({
    selectedBatchId,
    classFilter,
    boardFilter,
    segmentFilter
  }), [selectedBatchId, classFilter, boardFilter, segmentFilter]);

  const { students: orchestratedStudents, menus, isLoading: isLoadingOrchestration } = useAttendanceOrchestration(orchestratorParams);
  const batches = menus.batches || EMPTY_ARRAY;

  // 2. Fetch daily student attendance records for selected batch & date (Fetch all batches)
  const { data: registry = EMPTY_ARRAY, isLoading: isLoadingRegistry, isFetching: isFetchingRegistry, error } = useBatchAttendanceQuery(
    'all',
    selectedDate
  );

  const markMutation = useMarkAttendanceMutation();

  // Local modified records (Differential tracking)
  const [modifiedRecords, setModifiedRecords] = useState({});
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

  const isEditingDisabled = useMemo(() => {
    return isPastLocalDate(selectedDate) && user?.role !== 'superadmin';
  }, [selectedDate, user]);

  // Set default batch selection if not set
  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId('all');
    }
  }, [batches, selectedBatchId]);

  // Reset differential tracking state when switching date or batch
  useEffect(() => {
    setModifiedRecords({});
  }, [selectedBatchId, selectedDate]);

  // Compute baseline records from query inputs
  const baselineRecords = useMemo(() => {
    const initial = {};
    if (!registry || orchestratedStudents.length === 0) return initial;

    const todayStr = new Date().toLocaleDateString('sv-SE');
    const isToday = selectedDate === todayStr;
    const isPastDate = isPastLocalDate(selectedDate);

    orchestratedStudents.forEach(student => {
      // Find existing attendance record for student in registry
      const rec = registry.find(r => r.student_id === student.student_id && r.batch_id === student.batch_id) || {};

      let statusVal = 'P';
      const isUnrecorded = !rec.status && isPastDate;
      const isUnrecordedToday = !rec.status && isToday;

      if (rec.status) {
        if (rec.status === 'Absent' || rec.status === 'A') statusVal = 'A';
        else if (rec.status === 'Late' || rec.status === 'L') statusVal = 'L';
        else statusVal = 'P';
      } else {
        if (isToday) {
          statusVal = ''; // unselected by default for current date
        }
      }

      const entryTimeStr = formatStructuredToTime(rec.entry_time) || '08:00';
      const exitTimeStr = formatStructuredToTime(rec.exit_time) || '13:00';

      initial[student.student_id] = {
        student_id: student.student_id,
        student_name: student.student_name,
        roll_number: student.roll_number,
        batch_id: student.batch_id,
        status: statusVal,
        entry_time: entryTimeStr,
        exit_time: exitTimeStr,
        remarks: rec.remarks || '',
        isUnmarkedPastDate: isUnrecorded,
        isUnmarkedCurrentDate: isUnrecordedToday
      };
    });

    return initial;
  }, [registry, orchestratedStudents, selectedDate]);

  // Merge baseline with modifications
  const stagedRecords = useMemo(() => {
    const merged = {};
    Object.keys(baselineRecords).forEach(id => {
      merged[id] = {
        ...baselineRecords[id],
        ...(modifiedRecords[id] || {})
      };
    });
    return merged;
  }, [baselineRecords, modifiedRecords]);

  const isDirty = useMemo(() => Object.keys(modifiedRecords).length > 0, [modifiedRecords]);

  // Handlers targeting differential state changes
  const handleStatusChange = (studentId, status) => {
    if (isEditingDisabled) return;
    setModifiedRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        isUnmarkedCurrentDate: false,
        isUnmarkedPastDate: false
      }
    }));
  };

  const handleTimeChange = (studentId, field, value) => {
    if (isEditingDisabled) return;
    setModifiedRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleRemarksChange = (studentId, value) => {
    if (isEditingDisabled) return;
    setModifiedRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: value
      }
    }));
  };

  const handleMarkAllPresent = () => {
    if (isEditingDisabled) return;
    setModifiedRecords(prev => {
      const updated = { ...prev };
      Object.keys(baselineRecords).forEach(id => {
        updated[id] = {
          ...updated[id],
          status: 'P',
          isUnmarkedCurrentDate: false,
          isUnmarkedPastDate: false
        };
      });
      return updated;
    });
  };

  const handleSave = () => {
    if (!selectedBatchId) return;
    if (isEditingDisabled) {
      alert("Access Denied: Past records can only be updated by a superadmin.");
      return;
    }

    const recordsArray = Object.values(stagedRecords);
    const hasUnmarkedEntries = recordsArray.some(rec =>
      (selectedBatchId === 'all' || rec.batch_id === selectedBatchId) && rec.status === ''
    );

    if (hasUnmarkedEntries) {
      alert("Validation Error: Please select a status (P, A, or L) for all students before saving today's register.");
      return;
    }

    setSaveStatus('saving');

    if (selectedBatchId === 'all') {
      const grouped = {};
      Object.values(stagedRecords).forEach(rec => {
        const bId = rec.batch_id || (batches.length > 0 ? batches[0].batch_id : '');
        if (!bId) return;
        if (!grouped[bId]) {
          grouped[bId] = [];
        }
        grouped[bId].push({
          student_id: rec.student_id,
          status: rec.status,
          entry_time: parseTimeToStructured(rec.entry_time),
          exit_time: parseTimeToStructured(rec.exit_time),
          remarks: rec.remarks || null
        });
      });

      const promises = Object.entries(grouped).map(([bId, records]) => {
        const payload = {
          batch_id: bId,
          attendance_date: selectedDate,
          attendance_mode: 'Manual',
          marked_by: 'Admin',
          records
        };
        return markMutation.mutateAsync(payload);
      });

      Promise.all(promises)
        .then(() => {
          setSaveStatus('success');
          setModifiedRecords({});
          queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
          setTimeout(() => setSaveStatus(null), 3000);
        })
        .catch((err) => {
          setSaveStatus('error');
          alert(`Failed to save student attendance: ${err.message}`);
          setTimeout(() => setSaveStatus(null), 5000);
        });
    } else {
      const recordsPayload = Object.values(stagedRecords)
        .filter(rec => rec.batch_id === selectedBatchId)
        .map(rec => ({
          student_id: rec.student_id,
          status: rec.status,
          entry_time: parseTimeToStructured(rec.entry_time),
          exit_time: parseTimeToStructured(rec.exit_time),
          remarks: rec.remarks || null
        }));

      const payload = {
        batch_id: selectedBatchId,
        attendance_date: selectedDate,
        attendance_mode: 'Manual',
        marked_by: 'Admin',
        records: recordsPayload
      };

      markMutation.mutate(payload, {
        onSuccess: () => {
          setSaveStatus('success');
          setModifiedRecords({});
          setTimeout(() => setSaveStatus(null), 3000);
        },
        onError: (err) => {
          setSaveStatus('error');
          alert(`Failed to save student attendance: ${err.message}`);
          setTimeout(() => setSaveStatus(null), 5000);
        }
      });
    }
  };

  const handleBodyScroll = (e) => {
    setIsSticky(e.currentTarget.scrollTop > 80);
  };

  // Find active batch object for schedule lookup
  const selectedBatchObj = useMemo(() => {
    return batches.find(b => b.batch_id === selectedBatchId);
  }, [batches, selectedBatchId]);

  // Stats calculation
  const studentsList = useMemo(() => Object.values(stagedRecords), [stagedRecords]);

  const activeBatchRecords = useMemo(() => {
    if (selectedBatchId === 'all') {
      return studentsList;
    }
    return studentsList.filter(s => s.batch_id === selectedBatchId);
  }, [studentsList, selectedBatchId]);

  const totalCount = activeBatchRecords.length;
  const presentCount = activeBatchRecords.filter(s => s.status === 'P' && !s.isUnmarkedPastDate && !s.isUnmarkedCurrentDate).length;
  const absentCount = activeBatchRecords.filter(s => s.status === 'A' && !s.isUnmarkedPastDate && !s.isUnmarkedCurrentDate).length;
  const lateCount = activeBatchRecords.filter(s => s.status === 'L' && !s.isUnmarkedPastDate && !s.isUnmarkedCurrentDate).length;
  const unrecordedCount = activeBatchRecords.filter(s => s.isUnmarkedPastDate || s.isUnmarkedCurrentDate).length;

  const filteredStudents = useMemo(() => {
    return activeBatchRecords.filter(s => {
      const matchesStatus = statusFilter === 'ALL' || (s.status === statusFilter && !s.isUnmarkedPastDate && !s.isUnmarkedCurrentDate);
      const matchesSearch = s.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [activeBatchRecords, statusFilter, searchQuery]);

  const crumbs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Students', path: '/admin/students' },
    { label: 'Attendance' }
  ];

  // Filters slot content
  const filters = (
    <>
      <div className="md:col-span-3 relative">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search student..."
        />
      </div>
      <div className="md:col-span-9 flex flex-wrap gap-2 items-center">

        {/* Attendance Status Filters */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/20 p-1 border border-border-light dark:border-white/5 rounded-xl">
          {['ALL', 'P', 'A', 'L'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${statusFilter === st
                ? 'bg-white dark:bg-slate-700 text-text-main dark:text-white shadow-sm ring-1 ring-black/5'
                : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
                }`}
            >
              {st === 'ALL' ? 'All' : st === 'P' ? 'Present' : st === 'A' ? 'Absent' : 'Late'}
            </button>
          ))}
        </div>

        {/* Course Type Segement filter */}
        <div className="w-[160px]">
          <GenericSelectDropdown
            items={menus.segments.map(seg => ({ id: seg, name: seg }))}
            selectedId={segmentFilter}
            onChange={setSegmentFilter}
            idProp="id"
            labelProp="name"
            searchFields={["name"]}
            selectedViewMode="one-line"
            placeholder="All Segments"
            renderItem={(item, isSelected) => (
              <div className="py-2.5 px-4 text-xs font-bold text-text-main dark:text-white flex items-center justify-between">
                <span>{item.name}</span>
                {isSelected && <span className="material-symbols-outlined text-sm text-primary">check</span>}
              </div>
            )}
          />
        </div>

        {/* Class Filter */}
        <div className="w-[140px]">
          <GenericSelectDropdown
            items={(menus.classes || []).map(cl => ({ id: cl, name: `Class ${cl}` }))}
            selectedId={classFilter}
            onChange={setClassFilter}
            idProp="id"
            labelProp="name"
            searchFields={["name"]}
            selectedViewMode="one-line"
            placeholder="All Classes"
            renderItem={(item, isSelected) => (
              <div className="py-2.5 px-4 text-xs font-bold text-text-main dark:text-white flex items-center justify-between">
                <span>{item.name}</span>
                {isSelected && <span className="material-symbols-outlined text-sm text-primary">check</span>}
              </div>
            )}
          />
        </div>

        {/* Board Filter */}
        <div className="w-[140px]">
          <GenericSelectDropdown
            items={(menus.boards || []).map(b => ({ id: b, name: b }))}
            selectedId={boardFilter}
            onChange={setBoardFilter}
            idProp="id"
            labelProp="name"
            searchFields={["name"]}
            selectedViewMode="one-line"
            placeholder="All Boards"
            renderItem={(item, isSelected) => (
              <div className="py-2.5 px-4 text-xs font-bold text-text-main dark:text-white flex items-center justify-between">
                <span>{item.name}</span>
                {isSelected && <span className="material-symbols-outlined text-sm text-primary">check</span>}
              </div>
            )}
          />
        </div>

        {/* Batches Filters */}
        <div className="w-[180px]">
          <GenericSelectDropdown
            items={batches}
            selectedId={selectedBatchId}
            onChange={setSelectedBatchId}
            idProp="batch_id"
            labelProp="batch_name"
            searchFields={["batch_name"]}
            selectedViewMode="one-line"
            placeholder="Select Batch"
            dropdownWidth="w-[380px] md:w-[420px]"
            renderItem={(item, isSelected) => {
              const initials = item.batch_name ? item.batch_name.substring(0, 2).toUpperCase() : "BT";
              return (
                <LowDensityCard
                  variant="selection-card"
                  title={item.batch_name}
                  subtitle1={`Class ${item.class_level || 11}`}
                  subtitle2={`${item.course?.metadata?.medium || 'English'} • ${item.branch_name || 'Main Campus'}`}
                  avatarText={initials}
                  enrolled={item.enrolled_students || 0}
                  capacity={item.capacity || 30}
                  isSelected={isSelected}
                />
              );
            }}
          />
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-xl px-4 py-2 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all cursor-pointer h-[38px]"
        />
      </div>
    </>
  );

  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      header={
        <div
          className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${isSticky
            ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
        >
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">fact_check</span>
              <span className="text-sm font-bold text-text-main dark:text-white">
                Student Attendance Register
              </span>
            </div>
          </div>
        </div>
      }
      body={
        <div className="pt-6 lg:pt-10 pb-24 space-y-6">
          <Breadcrumbs items={crumbs} />

          {/* Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-text-main dark:text-white">
                Student Attendance Register
              </h1>
              <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">
                Manage daily check-ins, check-outs, status registers, and shift tracking for students by batch.
              </p>
            </div>
            {isEditingDisabled && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold self-start sm:self-auto">
                <span className="material-symbols-outlined text-sm">lock</span>
                Past Attendance Logs Locked (Superadmin Only)
              </div>
            )}
          </div>

          {/* Stats Section */}
          {selectedBatchId && (
            <>
              {/* Desktop Stats Cards */}
              <KpiGrid cols={5} smCols={5} mdCols={5} lgCols={5} gap={3} className="hidden md:grid">
                <KpiCard
                  label="Total Students"
                  value={totalCount}
                  icon="groups"
                  variant="neutral"
                  isCount={true}
                  size="lg"
                />
                <KpiCard
                  label="Present"
                  value={presentCount}
                  icon="check_circle"
                  variant="success"
                  isCount={true}
                  size="lg"
                />
                <KpiCard
                  label="Late"
                  value={lateCount}
                  icon="schedule"
                  variant="warning"
                  isCount={true}
                  size="lg"
                />
                <KpiCard
                  label="Absent"
                  value={absentCount}
                  icon="cancel"
                  variant="danger"
                  isCount={true}
                  size="lg"
                />
                <KpiCard
                  label="Not Recorded"
                  value={unrecordedCount}
                  icon="help"
                  variant="neutral"
                  isCount={true}
                  size="lg"
                />
              </KpiGrid>

              {/* Mobile Stats Ribbon */}
              <KpiRibbon
                items={[
                  { label: 'Total', value: totalCount, icon: 'groups', variant: 'info' },
                  { label: 'Present', value: presentCount, icon: 'check_circle', variant: 'success' },
                  { label: 'Late', value: lateCount, icon: 'schedule', variant: 'warning' },
                  { label: 'Absent', value: absentCount, icon: 'cancel', variant: 'danger' },
                  ...(unrecordedCount > 0 ? [{ label: 'NR', value: unrecordedCount, icon: 'help', variant: 'neutral' }] : [])
                ]}
                className="md:hidden"
              />
            </>
          )}

          {/* Main Register Sheet */}
          {!selectedBatchId ? (
            <div className="py-20 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-text-secondary/20 text-5xl">fact_check</span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-text-main dark:text-white">Please select a batch to view and mark attendance:</span>
                <div className="w-[200px]">
                  <GenericSelectDropdown
                    items={batches}
                    selectedId={selectedBatchId}
                    onChange={setSelectedBatchId}
                    idProp="batch_id"
                    labelProp="batch_name"
                    searchFields={["batch_name"]}
                    selectedViewMode="one-line"
                    placeholder="Select Batch"
                    renderItem={(item, isSelected) => (
                      <div className="py-2.5 px-4 text-xs font-bold text-text-main dark:text-white flex items-center justify-between">
                        <span>{item.batch_name}</span>
                        {isSelected && <span className="material-symbols-outlined text-sm text-primary">check</span>}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Programmatic Viewport branching */}
              {!isMobile ? (
                <StudentAttendanceTable
                  title="Daily Registry"
                  subtitle={isEditingDisabled ? "Viewing historical records (Read-Only Mode)" : "Staging changes before committing bulk student register updates"}
                  students={filteredStudents}
                  isEditingDisabled={isEditingDisabled}
                  onStatusChange={handleStatusChange}
                  onTimeChange={handleTimeChange}
                  onRemarksChange={handleRemarksChange}
                  batches={batches}
                  isLoading={isLoadingRegistry}
                  error={error}
                  onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all })}
                  filters={filters}
                  secondaryAction={
                    <>
                      <RefreshButton
                        isFetching={isFetchingRegistry}
                        onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all })}
                      />
                      <button
                        type="button"
                        onClick={handleMarkAllPresent}
                        disabled={isLoadingRegistry || studentsList.length === 0 || isEditingDisabled}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-border-light dark:border-white/8 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-text-main dark:text-white"
                      >
                        Mark All Present
                      </button>
                    </>
                  }
                />
              ) : (
                <StudentAttendanceMobileList
                  students={filteredStudents}
                  isEditingDisabled={isEditingDisabled}
                  onStatusChange={handleStatusChange}
                  onTimeChange={handleTimeChange}
                  onRemarksChange={handleRemarksChange}
                  batches={batches}
                  isLoading={isLoadingRegistry}
                  expandedCardId={expandedCardId}
                  setExpandedCardId={setExpandedCardId}
                  selectedBatchId={selectedBatchId}
                  setSelectedBatchId={setSelectedBatchId}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              )}
            </>
          )}
        </div>
      }
      footer={
        isDirty ? (
          <div className="w-full animate-in slide-in-from-bottom-8 duration-300">
            <div className="bg-surface-light/95 dark:bg-[#122131]/95 border border-border-light dark:border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-lg flex items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-lg animate-pulse">warning</span>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-text-main dark:text-white">Unsaved Staged Entries</p>
                  <p className="text-[10px] text-text-secondary dark:text-slate-400">You have modified registers. Commit changes to update the database.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModifiedRecords({});
                  }}
                  className="px-4 py-2 border border-border-light dark:border-white/8 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-xs font-bold transition-all cursor-pointer text-text-main dark:text-slate-300"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all text-white flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider min-w-[170px]"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      Save Attendance
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null
      }
    />
  );
};

export default StudentAttendanceManager;
