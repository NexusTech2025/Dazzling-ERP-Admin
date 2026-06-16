import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTeachersQuery, useTeacherAttendanceListQuery, useMarkTeacherAttendanceBulkMutation } from '../hooks/useTeacherQueries';
import { useBatchesQuery } from '../../batch/hooks/useBatchQueries';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import { useAuth } from '../../../context/AuthContextCore';
import { isPastLocalDate } from '../../../lib/dateUtils';

// Layout & UI Components
import MainLayout from '../../../components/layout/MainLayout';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import DataTable from '../../../components/ui/DataTable';
import { SearchInput, SelectFilter } from '../../../components/ui/filters';
import RefreshButton from '../../../components/ui/btn/RefreshButton';

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

const TeacherAttendanceManager = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isSticky, setIsSticky] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'P', 'A', 'L'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCardId, setExpandedCardId] = useState(null);

  // 1. Load batches, teachers, and daily attendance logs
  const { data: batches = EMPTY_ARRAY, isLoading: isLoadingBatches, error: batchesError } = useBatchesQuery();
  const { data: teachers = EMPTY_ARRAY, isLoading: isLoadingTeachers, error: teachersError } = useTeachersQuery();
  const { data: dailyLogs = EMPTY_ARRAY, isLoading: isLoadingLogs, isFetching: isFetchingLogs, error: logsError } = useTeacherAttendanceListQuery(selectedDate);
  const bulkMarkMutation = useMarkTeacherAttendanceBulkMutation();

  const isFetchingRegistry = isFetchingLogs;
  const error = logsError || teachersError || batchesError || null;

  const [stagedRecords, setStagedRecords] = useState({});
  const [initialSnapshot, setInitialSnapshot] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

  const isEditingDisabled = useMemo(() => {
    return isPastLocalDate(selectedDate) && user?.role !== 'superadmin';
  }, [selectedDate, user]);

  // Options for batch dropdown
  const batchOptions = useMemo(() => {
    const list = batches.map(b => ({
      value: b.batch_id,
      label: b.batch_name || b.name || b.batch_id
    }));
    return [{ value: 'all', label: 'All Batches' }, ...list];
  }, [batches]);

  // Set default batch selection
  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId('all');
    }
  }, [batches, selectedBatchId]);

  // Get current batch context
  const selectedBatchObj = useMemo(() => {
    return batches.find(b => b.batch_id === selectedBatchId);
  }, [batches, selectedBatchId]);

  // Format batch schedule range
  const batchScheduleStr = useMemo(() => {
    if (!selectedBatchObj) return '08:00 AM - 10:00 AM';
    let scheduleObj = selectedBatchObj.schedule;
    if (typeof scheduleObj === 'string') {
      try {
        scheduleObj = JSON.parse(scheduleObj);
      } catch (e) {
        scheduleObj = null;
      }
    }
    if (scheduleObj && scheduleObj.start_time && scheduleObj.end_time) {
      return `${scheduleObj.start_time} - ${scheduleObj.end_time}`;
    }
    return '08:00 AM - 10:00 AM';
  }, [selectedBatchObj]);

  // Sync stagedRecords based on selected batch assignments (fetch all batches client side)
  useEffect(() => {
    if (teachers && dailyLogs && batches) {
      const initial = {};
      const todayStr = new Date().toLocaleDateString('sv-SE');
      const isToday = selectedDate === todayStr;
      const isPastDate = isPastLocalDate(selectedDate);
      
      teachers.forEach(teacher => {
        const teacherBatches = batches.filter(b => b.teacher_id === teacher.teacher_id);
        teacherBatches.forEach(batch => {
          const matchingLog = dailyLogs.find(log => 
            log.teacher_id === teacher.teacher_id && 
            (log.batch_id === batch.batch_id || !log.batch_id)
          );
          
          let statusVal = 'P';
          let entryTimeStr = '08:00';
          let exitTimeStr = '16:00';
          let remarksStr = '';
          const isUnrecorded = !matchingLog && isPastDate;
          const isUnrecordedToday = !matchingLog && isToday;
          
          if (matchingLog) {
            if (matchingLog.status === 'Absent' || matchingLog.status === 'A') statusVal = 'A';
            else if (matchingLog.status === 'Late' || matchingLog.status === 'L') statusVal = 'L';
            else statusVal = 'P';
            
            entryTimeStr = formatStructuredToTime(matchingLog.entry_time) || '08:00';
            exitTimeStr = formatStructuredToTime(matchingLog.exit_time) || '16:00';
            remarksStr = matchingLog.remarks || '';
          } else {
            if (isToday) {
              statusVal = ''; // unselected by default for current date
            }
          }
          
          const compositeKey = `${teacher.teacher_id}_${batch.batch_id}`;
          initial[compositeKey] = {
            id: compositeKey,
            teacher_id: teacher.teacher_id,
            batch_id: batch.batch_id,
            batch_name: batch.batch_name || batch.name || batch.batch_id,
            full_name: teacher.full_name,
            phone: teacher.mobile_number,
            status: statusVal,
            entry_time: entryTimeStr,
            exit_time: exitTimeStr,
            remarks: remarksStr,
            isUnmarkedPastDate: isUnrecorded,
            isUnmarkedCurrentDate: isUnrecordedToday
          };
        });
      });
      
      setStagedRecords(initial);
      setInitialSnapshot(JSON.parse(JSON.stringify(initial)));
      setIsDirty(false);
    } else {
      setStagedRecords({});
      setIsDirty(false);
    }
  }, [teachers, dailyLogs, batches, selectedDate]);

  const handleStatusChange = (rowId, status) => {
    if (isEditingDisabled) return;
    setStagedRecords(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        status,
        // When user selects a status, it's no longer unmarked/unrecorded for today
        isUnmarkedCurrentDate: false
      }
    }));
    setIsDirty(true);
  };

  const handleTimeChange = (rowId, field, value) => {
    if (isEditingDisabled) return;
    setStagedRecords(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value
      }
    }));
    setIsDirty(true);
  };

  const handleRemarksChange = (rowId, value) => {
    if (isEditingDisabled) return;
    setStagedRecords(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        remarks: value
      }
    }));
    setIsDirty(true);
  };

  const handleMarkAllPresent = () => {
    if (isEditingDisabled) return;
    setStagedRecords(prev => {
      const updated = {};
      Object.keys(prev).forEach(id => {
        updated[id] = {
          ...prev[id],
          status: 'P',
          isUnmarkedCurrentDate: false
        };
      });
      return updated;
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    if (isEditingDisabled) {
      alert("Access Denied: Past records can only be updated by a superadmin.");
      return;
    }

    const recordsArray = Object.values(stagedRecords);
    const hasUnmarkedEntries = recordsArray.some(rec => 
      (selectedBatchId === 'all' || rec.batch_id === selectedBatchId) && rec.status === ''
    );

    if (hasUnmarkedEntries) {
      alert("Validation Error: Please select a status (P, A, or L) for all teachers before saving today's register.");
      return;
    }

    setSaveStatus('saving');
    const recordsPayload = Object.values(stagedRecords)
      .filter(rec => selectedBatchId === 'all' || rec.batch_id === selectedBatchId)
      .map(rec => {
        return {
          teacher_id: rec.teacher_id,
          batch_id: rec.batch_id,
          status: rec.status,
          entry_time: parseTimeToStructured(rec.entry_time),
          exit_time: parseTimeToStructured(rec.exit_time),
          remarks: rec.remarks || null
        };
      });

    const payload = {
      attendance_date: selectedDate,
      attendance_mode: 'Manual',
      records: recordsPayload
    };

    bulkMarkMutation.mutate(payload, {
      onSuccess: () => {
        setSaveStatus('success');
        setIsDirty(false);
        setTimeout(() => setSaveStatus(null), 3000);
      },
      onError: (err) => {
        setSaveStatus('error');
        alert(`Failed to save teacher attendance: ${err.message}`);
        setTimeout(() => setSaveStatus(null), 5000);
      }
    });
  };

  const handleBodyScroll = (e) => {
    setIsSticky(e.currentTarget.scrollTop > 80);
  };

  // Stats & Filtering computations
  const teachersList = Object.values(stagedRecords);

  const activeBatchRecords = useMemo(() => {
    if (selectedBatchId === 'all') {
      return teachersList;
    }
    return teachersList.filter(t => t.batch_id === selectedBatchId);
  }, [teachersList, selectedBatchId]);

  const totalCount = activeBatchRecords.length;
  const presentCount = activeBatchRecords.filter(t => t.status === 'P' && !t.isUnmarkedPastDate && !t.isUnmarkedCurrentDate).length;
  const absentCount = activeBatchRecords.filter(t => t.status === 'A' && !t.isUnmarkedPastDate && !t.isUnmarkedCurrentDate).length;
  const lateCount = activeBatchRecords.filter(t => t.status === 'L' && !t.isUnmarkedPastDate && !t.isUnmarkedCurrentDate).length;
  const unrecordedCount = activeBatchRecords.filter(t => t.isUnmarkedPastDate || t.isUnmarkedCurrentDate).length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / (totalCount - unrecordedCount || 1)) * 100) : 0;

  const filteredTeachers = useMemo(() => {
    return activeBatchRecords.filter(t => {
      const matchesStatus = statusFilter === 'ALL' || (t.status === statusFilter && !t.isUnmarkedPastDate && !t.isUnmarkedCurrentDate);
      const matchesSearch = t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.teacher_id?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [activeBatchRecords, statusFilter, searchQuery]);

  // columns configuration for DataTable (Desktop view)
  const columns = useMemo(() => [
    {
      header: 'Teacher Details',
      accessor: 'full_name',
      render: (row) => {
        const showNRBadge = row.isUnmarkedPastDate || row.isUnmarkedCurrentDate;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
              {row.full_name?.charAt(0) || 'T'}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-main dark:text-white text-sm">{row.full_name}</span>
                {showNRBadge && (
                  <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider">
                    <span className={`w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 ${row.isUnmarkedCurrentDate ? 'animate-pulse bg-blue-400 dark:bg-blue-500' : ''}`}></span>
                    NR
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-text-secondary dark:text-slate-400 tracking-wider uppercase font-mono">{row.teacher_id}</span>
                {row.batch_name && (
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {row.batch_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Attendance Status',
      accessor: 'status',
      align: 'center',
      className: 'w-60',
      render: (row) => (
        <div className={`flex items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-black/30 border border-border-light dark:border-white/5 rounded-2xl w-fit mx-auto ${isEditingDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
          <button 
            disabled={isEditingDisabled}
            onClick={() => handleStatusChange(row.id, 'P')}
            className={`w-12 h-12 rounded-xl text-[32px] font-black uppercase transition-all duration-200 cursor-pointer flex items-center justify-center ${
              row.status === 'P' && !row.isUnmarkedPastDate && !row.isUnmarkedCurrentDate
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105' 
                : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
            }`}
          >
            P
          </button>
          <button 
            disabled={isEditingDisabled}
            onClick={() => handleStatusChange(row.id, 'A')}
            className={`w-12 h-12 rounded-xl text-[32px] font-black uppercase transition-all duration-200 cursor-pointer flex items-center justify-center ${
              row.status === 'A' && !row.isUnmarkedPastDate && !row.isUnmarkedCurrentDate
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105' 
                : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
            }`}
          >
            A
          </button>
          <button 
            disabled={isEditingDisabled}
            onClick={() => handleStatusChange(row.id, 'L')}
            className={`w-12 h-12 rounded-xl text-[32px] font-black uppercase transition-all duration-200 cursor-pointer flex items-center justify-center ${
              row.status === 'L' && !row.isUnmarkedPastDate && !row.isUnmarkedCurrentDate
                ? 'bg-emerald-500 text-white dark:bg-amber-500 shadow-md dark:shadow-amber-500/20 scale-105' 
                : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
            }`}
          >
            L
          </button>
        </div>
      )
    },
    {
      header: 'Punch In',
      accessor: 'entry_time',
      className: 'w-44',
      render: (row) => (
        <input 
          type="time" 
          disabled={isEditingDisabled}
          value={row.entry_time}
          onChange={(e) => handleTimeChange(row.id, 'entry_time', e.target.value)}
          className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-3 py-1.5 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
        />
      )
    },
    {
      header: 'Punch Out',
      accessor: 'exit_time',
      className: 'w-44',
      render: (row) => (
        <input 
          type="time" 
          disabled={isEditingDisabled}
          value={row.exit_time}
          onChange={(e) => handleTimeChange(row.id, 'exit_time', e.target.value)}
          className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-3 py-1.5 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
        />
      )
    },
    {
      header: 'Remarks / Notes',
      accessor: 'remarks',
      render: (row) => (
        <input 
          type="text" 
          disabled={isEditingDisabled}
          value={row.remarks}
          placeholder={isEditingDisabled ? "Entries Locked" : "Remarks"}
          onChange={(e) => handleRemarksChange(row.id, e.target.value)}
          className="w-full bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-lg px-3 py-1.5 text-xs text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-indigo-500 transition-all disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
        />
      )
    }
  ], [isEditingDisabled]);

  const crumbs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Teachers', path: '/admin/teachers' },
    { label: 'Attendance' }
  ];

  const filters = (
    <>
      <div className="md:col-span-4 relative">
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search teacher..."
        />
      </div>
      <div className="md:col-span-8 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/20 p-1 border border-border-light dark:border-white/5 rounded-xl">
          {['ALL', 'P', 'A', 'L'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                statusFilter === st 
                  ? 'bg-white dark:bg-slate-700 text-text-main dark:text-white shadow-sm ring-1 ring-black/5' 
                  : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All' : st === 'P' ? 'Present' : st === 'A' ? 'Absent' : 'Late'}
            </button>
          ))}
        </div>
        
        <SelectFilter 
          value={selectedBatchId}
          onChange={setSelectedBatchId}
          options={batchOptions}
          defaultLabel="Select Batch"
        />

        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white dark:bg-[#0a1420] border border-border-light dark:border-white/8 rounded-xl px-4 py-2 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all cursor-pointer"
        />
      </div>
    </>
  );

  const isLoading = isLoadingTeachers || isLoadingLogs || isLoadingBatches;

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
              <span className="material-symbols-outlined text-primary text-lg">supervisor_account</span>
              <span className="text-sm font-bold text-text-main dark:text-white">
                Teacher Attendance Register
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
                Teacher Attendance Register
              </h1>
              <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">
                Manage daily check-ins, check-outs, status registers, and shift tracking for teachers by batch.
              </p>
            </div>
            {isEditingDisabled && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-550/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold self-start sm:self-auto">
                <span className="material-symbols-outlined text-sm">lock</span>
                Past Attendance Logs Locked (Superadmin Only)
              </div>
            )}
          </div>

          {/* Stats Section (Desktop Small Cards vs Mobile Compact Ribbon) */}
          {selectedBatchId && (
            <>
              {/* Desktop Stats Cards (small size) */}
              <div className="hidden md:grid grid-cols-5 gap-3">
                <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-3.5 rounded-xl flex flex-col justify-between backdrop-blur-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Total Teachers</span>
                    <span className="material-symbols-outlined text-sm text-indigo-500">supervisor_account</span>
                  </div>
                  <p className="text-xl font-black mt-1.5 text-text-main dark:text-white leading-none">{totalCount}</p>
                </div>

                <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-3.5 rounded-xl flex flex-col justify-between backdrop-blur-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Present</span>
                    <span className="material-symbols-outlined text-sm text-emerald-500">check_circle</span>
                  </div>
                  <p className="text-xl font-black mt-1.5 text-emerald-500 leading-none">{presentCount}</p>
                </div>

                <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-3.5 rounded-xl flex flex-col justify-between backdrop-blur-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Late</span>
                    <span className="material-symbols-outlined text-sm text-amber-500">schedule</span>
                  </div>
                  <p className="text-xl font-black mt-1.5 text-amber-500 leading-none">{lateCount}</p>
                </div>

                <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-3.5 rounded-xl flex flex-col justify-between backdrop-blur-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Absent</span>
                    <span className="material-symbols-outlined text-sm text-rose-500">cancel</span>
                  </div>
                  <p className="text-xl font-black mt-1.5 text-rose-500 leading-none">{absentCount}</p>
                </div>

                <div className="bg-surface-light dark:bg-[#122131] border border-border-light dark:border-white/8 p-3.5 rounded-xl flex flex-col justify-between backdrop-blur-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">Not Recorded</span>
                    <span className="material-symbols-outlined text-sm text-slate-500">help</span>
                  </div>
                  <p className="text-xl font-black mt-1.5 text-slate-500 dark:text-slate-400 leading-none">{unrecordedCount}</p>
                </div>
              </div>

              {/* Mobile Stats Ribbon */}
              <div className="flex md:hidden flex-wrap items-center gap-2 bg-slate-100/50 dark:bg-black/30 p-1.5 border border-border-light dark:border-white/5 rounded-xl self-start">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <span className="text-[9px] font-black uppercase tracking-wider">Total</span>
                  <span className="text-xs font-black">{totalCount}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <span className="text-[9px] font-black uppercase tracking-wider">Present</span>
                  <span className="text-xs font-black">{presentCount}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <span className="text-[9px] font-black uppercase tracking-wider">Late</span>
                  <span className="text-xs font-black">{lateCount}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <span className="text-[9px] font-black uppercase tracking-wider">Absent</span>
                  <span className="text-xs font-black">{absentCount}</span>
                </div>
                {unrecordedCount > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400">
                    <span className="text-[9px] font-black uppercase tracking-wider">NR</span>
                    <span className="text-xs font-black">{unrecordedCount}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Main Register Sheet */}
          {!selectedBatchId ? (
            <div className="py-20 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-text-secondary/20 text-5xl">fact_check</span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-text-main dark:text-white">Please select a batch to view and mark attendance:</span>
                <SelectFilter 
                  value={selectedBatchId}
                  onChange={setSelectedBatchId}
                  options={batchOptions}
                  defaultLabel="Select Batch"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block">
                <DataTable 
                  title="Daily Registry"
                  subtitle={isEditingDisabled ? "Viewing historical records (Read-Only Mode)" : "Staging changes before committing bulk updates"}
                  columns={columns}
                  data={filteredTeachers}
                  isLoading={isLoading}
                  error={error}
                  onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all })}
                  emptyMessage="No teacher records found for this batch on the selected date."
                  filters={filters}
                  secondaryAction={
                    <>
                      <RefreshButton 
                        isFetching={isFetchingRegistry} 
                        onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all })} 
                      />
                      <button 
                        onClick={handleMarkAllPresent}
                        disabled={isLoading || teachersList.length === 0 || isEditingDisabled}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-border-light dark:border-white/8 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-text-main dark:text-white"
                      >
                        Mark All Present
                      </button>
                    </>
                  }
                />
              </div>

              {/* Mobile view */}
              <div className="md:hidden flex flex-col gap-6">
                {/* Batch & Date Selectors side-by-side */}
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <SelectFilter 
                      value={selectedBatchId}
                      onChange={setSelectedBatchId}
                      options={batchOptions}
                      defaultLabel="Select Batch"
                    />
                  </div>
                  <div className="relative flex items-center bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2">
                    <span className="material-symbols-outlined text-text-secondary text-sm mr-2">calendar_today</span>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-xs font-bold text-text-main dark:text-white outline-none cursor-pointer w-24"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="py-20 text-center">
                    <p className="text-xs text-text-secondary">Loading registry...</p>
                  </div>
                ) : filteredTeachers.length === 0 ? (
                  <div className="py-20 text-center text-text-secondary text-xs">
                    No faculty assigned to this batch.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredTeachers.map((row) => {
                      const batchObj = batches.find(b => b.batch_id === row.batch_id);
                      let displayScheduleStr = '08:00 AM - 10:00 AM';
                      if (batchObj) {
                        let scheduleObj = batchObj.schedule;
                        if (typeof scheduleObj === 'string') {
                          try { scheduleObj = JSON.parse(scheduleObj); } catch (e) { scheduleObj = null; }
                        }
                        if (scheduleObj && scheduleObj.start_time && scheduleObj.end_time) {
                          displayScheduleStr = `${scheduleObj.start_time} - ${scheduleObj.end_time}`;
                        }
                      }
                      const isExpanded = expandedCardId === row.id;
                      return (
                        <div 
                          key={row.id} 
                          className="flex flex-col p-4 rounded-xl border border-border-light dark:border-white/5 bg-slate-50/50 dark:bg-[#0a1420] shadow-sm relative overflow-visible"
                        >
                          <div className="flex items-center justify-between w-full">
                            {/* Left Avatar & Name Stack */}
                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
                                {row.full_name?.charAt(0) || 'T'}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-text-main dark:text-white text-xs truncate">{row.full_name}</span>
                                  {(row.isUnmarkedPastDate || row.isUnmarkedCurrentDate) && (
                                    <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider flex-shrink-0">
                                      <span className={`w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 ${row.isUnmarkedCurrentDate ? 'animate-pulse bg-blue-400 dark:bg-blue-500' : ''}`}></span>
                                      NR
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-text-secondary truncate mt-0.5 font-medium">Batch: {row.batch_name}</span>
                                <span className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold mt-1">
                                  <span className="material-symbols-outlined text-[11px]">schedule</span>
                                  <span>{displayScheduleStr}</span>
                                </span>
                              </div>
                            </div>
 
                            {/* Right Interactive Status Buttons */}
                            <div className={`flex items-center gap-1.5 bg-slate-100/50 dark:bg-black/30 border border-border-light dark:border-white/5 p-1 rounded-2xl flex-shrink-0 ${isEditingDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                              {['P', 'A', 'L'].map(st => {
                                const isActive = row.status === st;
                                let activeClass = 'text-text-secondary hover:text-text-main dark:hover:text-white';
                                if (isActive && !row.isUnmarkedPastDate && !row.isUnmarkedCurrentDate) {
                                  if (st === 'P') activeClass = 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20';
                                  else if (st === 'A') activeClass = 'bg-rose-500 text-white shadow-md shadow-rose-500/20';
                                  else if (st === 'L') activeClass = 'bg-amber-500 text-white shadow-md shadow-amber-500/20';
                                }
                                return (
                                  <button
                                    key={st}
                                    disabled={isEditingDisabled}
                                    onClick={() => handleStatusChange(row.id, st)}
                                    className={`w-10 h-10 rounded-xl text-[26px] font-black transition-all flex items-center justify-center cursor-pointer ${activeClass}`}
                                  >
                                    {st}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
 
                          {/* Collapsible Time & Remarks Drawer */}
                          <div className="border-t border-slate-100 dark:border-white/5 mt-3 pt-3 flex flex-col gap-1.5">
                            {/* Summary / Expand trigger button */}
                            <button 
                              onClick={() => setExpandedCardId(isExpanded ? null : row.id)}
                              className="flex items-center justify-between w-full text-left text-[10px] font-bold text-text-secondary dark:text-slate-400 cursor-pointer"
                            >
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span>{row.isUnmarkedPastDate ? 'Not Recorded (NR)' : `In: ${row.entry_time || '--:--'} • Out: ${row.exit_time || '--:--'}`}</span>
                                {row.remarks && (
                                  <span className="truncate max-w-[120px] text-indigo-500"> • {row.remarks}</span>
                                )}
                              </div>
                              <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                expand_more
                              </span>
                            </button>
 
                            {/* Collapsible drawer content */}
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[200px] opacity-100 mt-2' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary dark:text-slate-400">Punch In</span>
                                  <input 
                                    type="time" 
                                    disabled={isEditingDisabled}
                                    value={row.entry_time}
                                    onChange={(e) => handleTimeChange(row.id, 'entry_time', e.target.value)}
                                    className="w-full bg-white dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-lg px-2.5 py-1.5 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary dark:text-slate-400">Punch Out</span>
                                  <input 
                                    type="time" 
                                    disabled={isEditingDisabled}
                                    value={row.exit_time}
                                    onChange={(e) => handleTimeChange(row.id, 'exit_time', e.target.value)}
                                    className="w-full bg-white dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-lg px-2.5 py-1.5 text-xs font-bold text-text-main dark:text-white outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 mt-3">
                                <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary dark:text-slate-400">Remarks / Notes</span>
                                <input 
                                  type="text" 
                                  disabled={isEditingDisabled}
                                  value={row.remarks}
                                  placeholder={isEditingDisabled ? "Entries Locked" : "Remarks"}
                                  onChange={(e) => handleRemarksChange(row.id, e.target.value)}
                                  className="w-full bg-white dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-lg px-2.5 py-1.5 text-xs text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
                  onClick={() => {
                    setStagedRecords(JSON.parse(JSON.stringify(initialSnapshot)));
                    setIsDirty(false);
                  }}
                  className="px-4 py-2 border border-border-light dark:border-white/8 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-xs font-bold transition-all cursor-pointer text-text-main dark:text-slate-300"
                >
                  Reset
                </button>
                <button 
                  onClick={handleSave}
                  disabled={bulkMarkMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all text-white flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider min-w-[170px]"
                >
                  {bulkMarkMutation.isPending ? (
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

export default TeacherAttendanceManager;
