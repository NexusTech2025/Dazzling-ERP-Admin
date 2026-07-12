import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTeachersQuery, useTeacherAttendanceListQuery, useMarkTeacherAttendanceBulkMutation } from './useTeacherQueries';
import { useBatchesQuery } from '../../batch/hooks/useBatchQueries';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import { isPastLocalDate, parseTimeToStructured } from '../../../lib/dateUtils';
import { useAuth } from '../../../context/AuthContextCore';
import { 
  initializeStagedRecords, 
  calculateAttendanceMetrics
} from '../utils/teacher_workspace';

const EMPTY_ARRAY = Object.freeze([]);

export const useTeacherAttendance = (selectedDate, selectedBatchId, statusFilter, searchQuery) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Network Query Hooks
  const { data: batches = EMPTY_ARRAY, isLoading: isLoadingBatches, error: batchesError } = useBatchesQuery();
  const { data: teachers = EMPTY_ARRAY, isLoading: isLoadingTeachers, error: teachersError } = useTeachersQuery();
  const { data: dailyLogs = EMPTY_ARRAY, isLoading: isLoadingLogs, isFetching: isFetchingLogs, error: logsError } = useTeacherAttendanceListQuery(selectedDate);
  const bulkMarkMutation = useMarkTeacherAttendanceBulkMutation();

  // Staging Sheet Local State Bounding
  const [stagedRecords, setStagedRecords] = useState({});
  const [initialSnapshot, setInitialSnapshot] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'success' | 'error'

  // Read-only Lock Verification Context
  const isEditingDisabled = useMemo(() => {
    return isPastLocalDate(selectedDate) && user?.role !== 'superadmin';
  }, [selectedDate, user]);

  const isFetchingRegistry = isFetchingLogs;

  // Synchronize dynamic upstream backend payloads cleanly
  useEffect(() => {
    if (teachers.length && dailyLogs && batches.length) {
      const initialMap = initializeStagedRecords(teachers, dailyLogs, batches, selectedDate);
      setStagedRecords(initialMap);
      
      // Strict deep-copy snapshot allocation to allow clean historical rollbacks
      setInitialSnapshot(JSON.parse(JSON.stringify(initialMap)));
      setIsDirty(false);
    } else {
      setStagedRecords({});
      setIsDirty(false);
    }
  }, [teachers, dailyLogs, batches, selectedDate]);

  // Stable Functional Updaters to eliminate child tree micro-lag
  const handleStatusChange = useCallback((rowId, status) => {
    if (isEditingDisabled) return;
    setStagedRecords(prev => ({
      ...prev,
      [rowId]: { ...prev[rowId], status, isUnmarkedCurrentDate: false }
    }));
    setIsDirty(true);
  }, [isEditingDisabled]);

  const handleTimeChange = useCallback((rowId, field, value) => {
    if (isEditingDisabled) return;
    setStagedRecords(prev => ({
      ...prev,
      [rowId]: { ...prev[rowId], [field]: value }
    }));
    setIsDirty(true);
  }, [isEditingDisabled]);

  const handleRemarksChange = useCallback((rowId, value) => {
    if (isEditingDisabled) return;
    setStagedRecords(prev => ({
      ...prev,
      [rowId]: { ...prev[rowId], remarks: value }
    }));
    setIsDirty(true);
  }, [isEditingDisabled]);

  const handleMarkAllPresent = useCallback(() => {
    if (isEditingDisabled) return;
    setStagedRecords(prev => {
      const updated = {};
      Object.keys(prev).forEach(id => {
        updated[id] = { ...prev[id], status: 'P', isUnmarkedCurrentDate: false };
      });
      return updated;
    });
    setIsDirty(true);
  }, [isEditingDisabled]);

  const handleReset = useCallback(() => {
    // Reverts structural modifications safely back to structural snapshot bounds
    setStagedRecords(JSON.parse(JSON.stringify(initialSnapshot)));
    setIsDirty(false);
  }, [initialSnapshot]);

  // Dynamic selector computations
  const teachersList = useMemo(() => Object.values(stagedRecords), [stagedRecords]);

  const activeBatchRecords = useMemo(() => {
    if (selectedBatchId === 'all') return teachersList;
    return teachersList.filter(t => t.batch_id === selectedBatchId);
  }, [teachersList, selectedBatchId]);

  // Live aggregated metric evaluation
  const metrics = useMemo(() => calculateAttendanceMetrics(activeBatchRecords), [activeBatchRecords]);

  // Multi-tier search and status row filtering
  const filteredTeachers = useMemo(() => {
    return activeBatchRecords.filter(t => {
      const matchesStatus = statusFilter === 'ALL' || (t.status === statusFilter && !t.isUnmarkedPastDate && !t.isUnmarkedCurrentDate);
      const matchesSearch = t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.teacher_id?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [activeBatchRecords, statusFilter, searchQuery]);

  // Form submission and network validation execution pipelines
  const handleSave = useCallback(() => {
    if (isEditingDisabled) return;

    // Guard constraint checkup to assert no unmarked records bypass validation layers
    const hasUnmarkedEntries = activeBatchRecords.some(rec => rec.status === '');
    if (hasUnmarkedEntries) {
      alert("Validation Error: Please select a status (P, A, or L) for all teachers before saving today's register.");
      return;
    }

    setSaveStatus('saving');
    const recordsPayload = activeBatchRecords.map(rec => ({
      teacher_id: rec.teacher_id,
      batch_id: rec.batch_id,
      status: rec.status,
      entry_time: parseTimeToStructured(rec.entry_time),
      exit_time: parseTimeToStructured(rec.exit_time),
      remarks: rec.remarks || null
    }));

    const payload = {
      attendance_date: selectedDate,
      attendance_mode: 'Manual',
      records: recordsPayload
    };

    bulkMarkMutation.mutate(payload, {
      onSuccess: () => {
        setSaveStatus('success');
        setIsDirty(false);
        // Centralized cache keys factor tracking execution guarantees
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all });
        setTimeout(() => setSaveStatus(null), 3000);
      },
      onError: (err) => {
        setSaveStatus('error');
        alert(`Failed to save teacher attendance: ${err.message}`);
        setTimeout(() => setSaveStatus(null), 5000);
      }
    });
  }, [activeBatchRecords, isEditingDisabled, selectedDate, bulkMarkMutation, queryClient]);

  return {
    batches,
    filteredTeachers,
    metrics,
    isDirty,
    saveStatus,
    isEditingDisabled,
    isLoading: isLoadingTeachers || isLoadingLogs || isLoadingBatches,
    isFetchingRegistry,
    error: logsError || teachersError || batchesError || null,
    actions: {
      handleStatusChange,
      handleTimeChange,
      handleRemarksChange,
      handleMarkAllPresent,
      handleReset,
      handleSave
    }
  };
};
