import { useState, useMemo } from 'react';
import { useCourseTypesQuery } from '../features/course/hooks/useCourseQueries';

/**
 * Parses time string (e.g., "09:00 AM", "14:30", "9:00") into a decimal hour value.
 * @param {string} timeStr - Time string to parse.
 * @returns {number|null} Decimal hour value, or null if invalid.
 */
const parseTimeToHour = (timeStr) => {
  if (!timeStr) return null;
  const cleanStr = timeStr.trim().toUpperCase();
  const isPM = cleanStr.includes('PM');
  const isAM = cleanStr.includes('AM');
  const parts = cleanStr.replace(/[AP]M/, '').split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] ? parseInt(parts[1], 10) : 0;

  if (isNaN(hours)) return null;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours + (minutes / 60);
};

/**
 * Maps time value to dynamic timing categories.
 * @param {string} startTimeStr - Start time string.
 * @returns {string} The timing category identifier.
 */
const getTimingCategory = (startTimeStr) => {
  const hour = parseTimeToHour(startTimeStr);
  if (hour === null) return 'unknown';
  if (hour < 8) return 'early_morning';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 14) return 'noon';
  if (hour >= 14 && hour < 16) return 'afternoon';
  return 'evening';
};

/**
 * Parses target class number from the batch name.
 * @param {string} name - The batch name string.
 * @returns {string|null} The parsed class level string, or null.
 */
const parseClassLevel = (name) => {
  if (!name) return null;
  const match = name.match(/Class\s*(\d+)/i) || name.match(/(\d+)(?:th|rd|nd|st)?/i);
  return match ? match[1] : null;
};

/**
 * Hook to manage complex filtering logic for batches.
 * Supports searching, course, course type, class, status, and timing range filtering.
 * 
 * @param {Array} initialBatches - The raw array of batch objects from the API.
 */
export const useFilteredBatches = (initialBatches = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // handled as state below
  const [statusState, setStatusFilterState] = useState('all');
  const [courseTypeFilter, setCourseTypeFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [timingFilter, setTimingFilter] = useState('all');

  // Resolve CourseTypes list using cached query hook
  const { data: courseTypes = [] } = useCourseTypesQuery();

  const filteredBatches = useMemo(() => {
    return initialBatches.filter(batch => {
      // 1. Search across multiple fields
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        (batch.batch_name && batch.batch_name.toLowerCase().includes(query)) ||
        (batch.course_name && batch.course_name.toLowerCase().includes(query)) ||
        (batch.teacher_name && batch.teacher_name.toLowerCase().includes(query));

      // 2. Course Name Filter
      const matchesCourse = courseFilter === 'all' || courseFilter === '' || batch.course_name === courseFilter;

      // 3. Status Filter (Consolidated)
      const matchesStatus = statusState === 'all' || statusState === '' || batch.status?.toLowerCase() === statusState.toLowerCase();

      // 4. Course Type Filter
      const batchCourseType = courseTypes.find(ct => ct.segment_id === batch.course?.segment_id || ct.id === batch.course?.segment_id);
      const matchesCourseType = courseTypeFilter === 'all' || courseTypeFilter === '' ||
        batchCourseType?.segment_id === courseTypeFilter || batchCourseType?.id === courseTypeFilter;

      // 5. Class Filter (applied if Academic CourseType is active)
      const isAcademic = batchCourseType?.type_name?.toLowerCase() === 'academic' || batch.course?.coursetype?.type_name?.toLowerCase() === 'academic';
      const parsedClass = parseClassLevel(batch.batch_name);
      const matchesClass = !isAcademic || classFilter === 'all' || classFilter === '' || (parsedClass && String(parsedClass) === String(classFilter));

      // 6. Timing Filter (dynamic ranges)
      const batchTimingCategory = getTimingCategory(batch.schedule?.start_time);
      const matchesTiming = timingFilter === 'all' || timingFilter === '' || batchTimingCategory === timingFilter;

      return matchesSearch && matchesCourse && matchesStatus && matchesCourseType && matchesClass && matchesTiming;
    });
  }, [initialBatches, searchQuery, courseFilter, statusState, courseTypeFilter, classFilter, timingFilter, courseTypes]);

  // Derived state for dropdown options
  const availableCourses = useMemo(() => {
    const courses = new Set(initialBatches.map(b => b.course_name).filter(Boolean));
    return Array.from(courses).sort();
  }, [initialBatches]);

  // Consolidated global static enum status options as requested
  const availableStatuses = useMemo(() => {
    return ['active', 'inactive', 'completed', 'pending', 'canceled'];
  }, []);

  // Dynamically parse target classes from batches whose course type is academic
  const availableClasses = useMemo(() => {
    const classes = new Set();
    initialBatches.forEach(b => {
      const batchCourseType = courseTypes.find(ct => ct.segment_id === b.course?.segment_id || ct.id === b.course?.segment_id);
      const isAcademic = batchCourseType?.type_name?.toLowerCase() === 'academic' || b.course?.coursetype?.type_name?.toLowerCase() === 'academic';
      if (isAcademic) {
        const cls = parseClassLevel(b.batch_name);
        if (cls) classes.add(cls);
      }
    });
    return Array.from(classes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [initialBatches, courseTypes]);

  return {
    searchQuery,
    setSearchQuery,
    courseFilter,
    setCourseFilter,
    statusFilter: statusState,
    setStatusFilter: setStatusFilterState,
    courseTypeFilter,
    setCourseTypeFilter,
    classFilter,
    setClassFilter,
    timingFilter,
    setTimingFilter,
    filteredBatches,
    availableCourses,
    availableStatuses,
    availableClasses,
    courseTypes
  };
};

export default useFilteredBatches;
