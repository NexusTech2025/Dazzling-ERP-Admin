import { useState, useMemo } from 'react';
import { parseISO, format } from 'date-fns';
import { useBatchMonthlyAttendanceQuery } from './useAttendanceQueries';
import { useBatchStudentsQuery, useBatchDetailQuery } from './useBatchQueries';

const EMPTY_ARRAY = Object.freeze([]);

export const useAttendanceRegistryData = (batchId) => {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  // 1. Consume the Master Cohort Ledger Hook (Cache-Aside monthly query)
  const { data: normalizedRegistry = { months: {}, dates: {} }, isLoading: isLoadingRegistry } = useBatchMonthlyAttendanceQuery(batchId);

  // 2. Consume Batch Student Enrollment Roster query
  const { data: batchStudents = EMPTY_ARRAY, isLoading: isLoadingStudents } = useBatchStudentsQuery(batchId);

  // 3. Retrieve Batch detail for schedule start_time and end_time configurations
  const { data: batchDetail, isLoading: isLoadingBatch } = useBatchDetailQuery(batchId);

  const isLoading = isLoadingRegistry || isLoadingStudents || isLoadingBatch;

  // Extract batch defined schedule times
  const batchStartTime = batchDetail?.schedule?.start_time || '08:00';
  const batchEndTime = batchDetail?.schedule?.end_time || '13:00';

  // Issue 3 Merge Strategy: Always map over batchStudents and merge with recorded entries
  const dailyBaselineRegistry = useMemo(() => {
    const recordedEntries = normalizedRegistry.dates?.[selectedDate] || EMPTY_ARRAY;

    return batchStudents.map((student) => {
      const recorded = recordedEntries.find(r => r.student_id === (student.student_id || student.id));
      if (recorded) {
        return {
          ...recorded,
          student_name: recorded.student_name || student.student_name || student.full_name,
          roll_number: recorded.roll_number || student.roll_number
        };
      }

      // Default unmarked NR record utilizing batch schedule times
      return {
        attendance_id: null,
        student_id: student.student_id || student.id,
        student_name: student.student_name || student.full_name,
        roll_number: student.roll_number,
        status: 'NR',
        entry_time: batchStartTime,
        exit_time: batchEndTime,
        remarks: ''
      };
    });
  }, [normalizedRegistry, selectedDate, batchStudents, batchStartTime, batchEndTime]);

  return {
    selectedDate,
    setSelectedDate,
    dailyBaselineRegistry,
    isLoading,
    batchStartTime,
    batchEndTime
  };
};