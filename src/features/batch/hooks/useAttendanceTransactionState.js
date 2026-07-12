import { useState, useMemo, useCallback } from 'react';
import { useOptimizedMarkAttendanceMutation } from './useAttendanceQueries';
import { parseTimeToStructured, formatStructuredToTime } from '../utils/attendanceUtils';

export const useAttendanceTransactionState = ({
  batchId,
  selectedDate,
  dailyBaselineRegistry,
  batchStartTime,
  batchEndTime
}) => {
  const [stagedChanges, setStagedChanges] = useState({});
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

  const optimizedMutation = useOptimizedMarkAttendanceMutation();

  // Derived State Matrix Builder: Merges baseline values with unsaved staged changes
  const studentsList = useMemo(() => {
    return dailyBaselineRegistry.map((record) => {
      const stage = stagedChanges[record.student_id] || {};

      const defaultIn = record.entry_time
        ? (typeof record.entry_time === 'object' ? formatStructuredToTime(record.entry_time) : record.entry_time)
        : batchStartTime;
      const defaultOut = record.exit_time
        ? (typeof record.exit_time === 'object' ? formatStructuredToTime(record.exit_time) : record.exit_time)
        : batchEndTime;

      return {
        ...record,
        id: record.student_id,
        status: stage.status !== undefined ? stage.status : record.status,
        entry_time: stage.entry_time !== undefined ? stage.entry_time : defaultIn,
        exit_time: stage.exit_time !== undefined ? stage.exit_time : defaultOut,
        remarks: stage.remarks !== undefined ? stage.remarks : (record.remarks || ''),
        isRowDirty: stagedChanges[record.student_id] !== undefined
      };
    });
  }, [dailyBaselineRegistry, stagedChanges, batchStartTime, batchEndTime]);

  // Stable delta staging controller with automatic redundant stage pruning
  const updateStageField = useCallback((studentId, field, value) => {
    setStagedChanges(prev => {
      const currentStage = prev[studentId] || {};
      const updatedStage = { ...currentStage, [field]: value };

      // Locate corresponding initial baseline record to verify if change is redundant
      const baseline = dailyBaselineRegistry.find(s => s.student_id === studentId) || {};

      let baselineVal = baseline[field];
      if (baselineVal === undefined || baselineVal === null) {
        baselineVal = field === 'status' ? 'NR' : '';
      }

      // Time and text formatting normalization comparisons
      let isSame = updatedStage[field] === baselineVal;
      if (field === 'entry_time' || field === 'exit_time') {
        const baselineTimeStr = typeof baseline[field] === 'object'
          ? formatStructuredToTime(baseline[field])
          : (baseline[field] || (field === 'entry_time' ? batchStartTime : batchEndTime));
        isSame = value === baselineTimeStr;
      } else if (field === 'remarks') {
        const baselineRemarksStr = baseline.remarks || '';
        isSame = value.trim() === baselineRemarksStr.trim();
      }

      // If matches original baseline value, delete key to prune staging buffer size
      if (isSame) {
        delete updatedStage[field];
      }

      const copy = { ...prev };
      if (Object.keys(updatedStage).length === 0) {
        delete copy[studentId];
      } else {
        copy[studentId] = updatedStage;
      }
      return copy;
    });
  }, [dailyBaselineRegistry, batchStartTime, batchEndTime]);

  const handleMarkAllPresent = useCallback(() => {
    studentsList.forEach(rec => {
      if (rec.status !== 'P') {
        updateStageField(rec.student_id, 'status', 'P');
      }
    });
  }, [studentsList, updateStageField]);

  const handleReset = useCallback(() => {
    setStagedChanges({});
  }, []);

  // Maps UI state representation to structured backend mutation payload schema
  const buildPayloadStructureItem = useCallback((studentId, currentRecordState) => {
    const isAbsent = currentRecordState.status === 'A' || currentRecordState.status === 'NR';
    return {
      student_id: studentId,
      status: currentRecordState.status === 'NR' ? null : currentRecordState.status,
      entry_time: isAbsent ? null : parseTimeToStructured(currentRecordState.entry_time),
      exit_time: isAbsent ? null : parseTimeToStructured(currentRecordState.exit_time),
      remarks: currentRecordState.remarks || null
    };
  }, []);

  /**
   * TIER 1 SAVE CONTROL: Single Row Direct Patch Commit
   */
  const commitIndividualRow = useCallback(async (row) => {
    if (!row) return;

    const payload = {
      batch_id: batchId,
      attendance_date: selectedDate,
      commit_mode: 'individual',
      records: [buildPayloadStructureItem(row.student_id, row)]
    };

    try {
      setSaveStatus('saving');
      await optimizedMutation.mutateAsync(payload);
      setStagedChanges(prev => {
        const copy = { ...prev };
        delete copy[row.student_id];
        return copy;
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    }
  }, [batchId, selectedDate, buildPayloadStructureItem, optimizedMutation]);

  /**
   * TIER 2 SAVE CONTROL: Commit Staged Delta Elements Only
   */
  const commitDeltaChanges = useCallback(async () => {
    const alteredIds = Object.keys(stagedChanges);
    if (alteredIds.length === 0) return;

    const deltaRecords = alteredIds.map(id => {
      const consolidatedRow = studentsList.find(s => s.student_id === id);
      return buildPayloadStructureItem(id, consolidatedRow);
    });

    const payload = {
      batch_id: batchId,
      attendance_date: selectedDate,
      commit_mode: 'delta',
      records: deltaRecords
    };

    try {
      setSaveStatus('saving');
      await optimizedMutation.mutateAsync(payload);
      setStagedChanges({});
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    }
  }, [batchId, selectedDate, stagedChanges, studentsList, buildPayloadStructureItem, optimizedMutation]);

  /**
   * TIER 3 SAVE CONTROL: Absolute Full Roster Snapshot Re-Save
   */
  const commitFullRosterSnapshot = useCallback(async () => {
    const fullRecords = studentsList.map(s => buildPayloadStructureItem(s.student_id, s));

    const payload = {
      batch_id: batchId,
      attendance_date: selectedDate,
      commit_mode: 'all',
      records: fullRecords
    };

    try {
      setSaveStatus('saving');
      await optimizedMutation.mutateAsync(payload);
      setStagedChanges({});
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    }
  }, [batchId, selectedDate, studentsList, buildPayloadStructureItem, optimizedMutation]);

  // Derive stats for KPI indicators
  const totalCount = studentsList.length;
  const presentCount = studentsList.filter(s => s.status === 'P').length;
  const absentCount = studentsList.filter(s => s.status === 'A').length;
  const leaveCount = studentsList.filter(s => s.status === 'L').length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + leaveCount) / totalCount) * 100) : 0;

  const isDirty = Object.keys(stagedChanges).length > 0;

  return {
    stagedChanges,
    saveStatus,
    studentsList,
    isDirty,
    kpiStats: {
      totalCount,
      presentCount,
      absentCount,
      leaveCount,
      attendanceRate
    },
    updateStageField,
    handleMarkAllPresent,
    handleReset,
    setStagedChanges,
    commitIndividualRow,
    commitDeltaChanges,
    commitFullRosterSnapshot
  };
};