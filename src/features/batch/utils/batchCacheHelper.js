/**
 * @file batchCacheHelper.js
 * @module BatchRepo
 * @description Centralized domain repository joining BatchAllocation junction records with Batch, Course, CourseType, and Student entities.
 */

import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { getCachedList } from '../../../lib/react-query/cacheHelper';
import { formatStructuredToTime, toLocalCalendarDate } from '../../../lib/dateUtils';

/**
 * Domain Repository for Academic Batches, Allocations, and Course mapping.
 */
export class BatchRepo {
  constructor() {
    this.batchMap = new Map();
    this.courseMap = new Map();
    this.courseTypeMap = new Map();
    this.allocationMap = new Map();

    /** @type {boolean} State flag indicating whether the singleton has been primed */
    this._isPrimed = false;

    /** @type {Array<Object>|null} Cached array reference pointers for identity-based short-circuiting */
    this._lastBatchesRef = null;
    this._lastCoursesRef = null;
    this._lastCourseTypesRef = null;
  }

  /**
   * Prime in-memory lookup maps from React Query cache datasets or passed arrays.
   * Employs a reference-identity guard to prevent redundant Map rebuilding if identical array references are passed.
   * 
   * @param {import('@tanstack/react-query').QueryClient|Array<Object>} queryClientOrBatches
   * @param {Array<Object>} [coursesList=[]]
   * @param {Array<Object>} [courseTypesList=[]]
   */
  prime(queryClientOrBatches, coursesList = [], courseTypesList = []) {
    if (queryClientOrBatches && typeof queryClientOrBatches.getQueryData === 'function') {
      const batches = getCachedList(queryClientOrBatches, 'batch', EMPTY_FILTER) || [];
      const courses = getCachedList(queryClientOrBatches, 'course', EMPTY_FILTER) || [];
      const courseTypes = getCachedList(queryClientOrBatches, 'coursetype', EMPTY_FILTER) || [];
      const allocations = getCachedList(queryClientOrBatches, 'batchallocation', EMPTY_FILTER) || [];

      this.batchMap = new Map(batches.map(b => [b.batch_id || b.id, b]));
      this.courseMap = new Map(courses.map(c => [c.course_id || c.id, c]));
      this.courseTypeMap = new Map(courseTypes.map(ct => [ct.segment_id || ct.id, ct]));
      this.allocationMap = new Map(allocations.map(a => [a.allocation_id || a.id, a]));
      this._isPrimed = true;
      return;
    }

    if (Array.isArray(queryClientOrBatches)) {
      if (
        this._lastBatchesRef === queryClientOrBatches &&
        this._lastCoursesRef === coursesList &&
        this._lastCourseTypesRef === courseTypesList
      ) {
        return; // Short-circuit: already primed with identical memory references
      }

      this._lastBatchesRef = queryClientOrBatches;
      this._lastCoursesRef = coursesList;
      this._lastCourseTypesRef = courseTypesList;

      this.batchMap = new Map(queryClientOrBatches.map(b => [b.batch_id || b.id, b]));
      if (Array.isArray(coursesList)) {
        this.courseMap = new Map(coursesList.map(c => [c.course_id || c.id, c]));
      }
      if (Array.isArray(courseTypesList)) {
        this.courseTypeMap = new Map(courseTypesList.map(ct => [ct.segment_id || ct.id, ct]));
      }
      this._isPrimed = true;
    }
  }

  /**
   * Joins a BatchAllocation junction record with Batch and Course datasets to return a hydrated view model.
   * 
   * @param {Object} alloc - BatchAllocation junction entry.
   * @returns {Object} Hydrated view model with human-readable titles and subtitles.
   */
  resolveAllocation(alloc) {
    if (!alloc) return null;

    const bId = alloc.batch_id || alloc.batch?.batch_id;
    const cId = alloc.course_id || alloc.course?.course_id;

    const matchedBatch = (bId ? this.batchMap.get(bId) : null) || alloc.batch || {};
    const matchedCourse = (cId ? this.courseMap.get(cId) : null) || alloc.course || {};

    const segmentId = matchedCourse.segment_id || matchedCourse.coursetype?.segment_id;
    const matchedCourseType = segmentId ? this.courseTypeMap.get(segmentId) : null;

    const batchName = alloc.batch_name 
      || alloc.batch?.batch_name 
      || matchedBatch.batch_name 
      || matchedBatch.name 
      || null;

    const courseName = alloc.course_name 
      || alloc.course?.name 
      || alloc.course?.course_name 
      || matchedCourse.name 
      || matchedCourse.course_name 
      || null;

    const courseTypeName = alloc.course_type_name
      || matchedCourse.coursetype?.segment_name
      || matchedCourse.segment_name
      || matchedCourseType?.segment_name
      || matchedCourseType?.name
      || matchedBatch.batch_type
      || matchedCourse.entity_type
      || null;

    return {
      allocationId: alloc.allocation_id || '—',
      studentId: alloc.student_id || '—',
      enrollmentId: alloc.enrollment_id || '—',
      batchId: bId || '—',
      batchName: batchName || (bId ? `Batch (${bId})` : 'Unassigned Batch'),
      courseId: cId || '—',
      courseName: courseName || (cId ? `Course (${cId})` : 'Unassigned Course'),
      courseTypeName: courseTypeName ? courseTypeName.toUpperCase() : null,
      status: (alloc.status || 'active').toLowerCase(),
      remarks: alloc.remarks || null,
      assignedAt: alloc.assigned_at || null
    };
  }

  /**
   * Extracts and joins all allocations for a given student.
   * Executes purely in-memory lookups (O(1)) against the primed singleton maps.
   * Never triggers Map reconstruction or array iterations.
   * 
   * @param {Object} student - Hydrated student record.
   * @param {Array<Object>} [batches=[]] - Optional fallback batch array.
   * @param {Array<Object>} [courses=[]] - Optional fallback course array.
   * @param {Array<Object>} [courseTypes=[]] - Optional fallback courseTypes array.
   * @returns {Array<Object>} Hydrated allocation view models.
   */
  getStudentAllocations(student, batches = [], courses = [], courseTypes = []) {
    if (!student || typeof student !== 'object') return [];

    const rawAllocs = student.allocations || student.BatchAllocation || [];
    if (!Array.isArray(rawAllocs) || rawAllocs.length === 0) return [];

    // Defensive fallback: If singleton has never been primed, prime once using provided fallback arrays
    if (!this._isPrimed && (batches.length > 0 || courses.length > 0 || courseTypes.length > 0)) {
      this.prime(batches, courses, courseTypes);
    }

    return rawAllocs.map(alloc => this.resolveAllocation(alloc));
  }

  /**
   * Evaluates student batch allocations and determines assignment state.
   * 
   * @param {Object} student - Student entity record.
   * @param {Array<Object>} [batches=[]] - Optional fallback batch array.
   * @param {Array<Object>} [courses=[]] - Optional fallback course array.
   * @param {Array<Object>} [courseTypes=[]] - Optional fallback courseTypes array.
   * @returns {{ isUnassigned: boolean, allocations: Array<Object> }}
   */
  evaluateAllocations(student, batches = [], courses = [], courseTypes = []) {
    if (!student || typeof student !== 'object') {
      return { isUnassigned: true, allocations: [] };
    }
    try {
      const allocations = this.getStudentAllocations(student, batches, courses, courseTypes);
      return {
        isUnassigned: allocations.length === 0,
        allocations
      };
    } catch (err) {
      console.warn('[BatchRepo:evaluateAllocations] Error:', err);
      return { isUnassigned: true, allocations: [] };
    }
  }

  /**
   * Resolves deduplicated student roster for a batch by joining allocations with student master data.
   * Enforces UniqueStudentPolicy to ensure exactly 1 entry per student.
   * 
   * @param {string} batchId - Target batch identifier ("BAT-xxx").
   * @param {Object} datasets - In-memory table datasets.
   * @param {Array<Object>} [datasets.allocations=[]] - Raw BatchAllocation records.
   * @param {Array<Object>} [datasets.students=[]] - Raw Student master records.
   * @param {Object} [options={}] - Filtering options.
   * @param {boolean} [options.deduplicate=true] - Apply UniqueStudentPolicy.
   * @param {string} [options.statusFilter="active"] - Target allocation status filter ("active", "all").
   * @returns {Array<Object>} Array of unique, hydrated student objects with top-level student_name.
   */
  resolveBatchStudents(batchId, datasets = {}, options = {}) {
    const { allocations = [], students = [] } = datasets;
    const { deduplicate = true, statusFilter = 'active' } = options;

    if (!batchId) return [];

    // 1. Filter allocations matching target batch_id
    const batchAllocs = allocations.filter(a => {
      const aBatchId = a.batch_id || a.batch?.batch_id;
      if (String(aBatchId) !== String(batchId)) return false;
      if (statusFilter !== 'all' && a.status && a.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      return true;
    });

    // 2. Hydrate each allocation with student master info
    const studentMap = new Map(students.map(s => [s.student_id || s.id, s]));
    const hydratedList = [];
    const seenStudentIds = new Set();

    for (let i = 0; i < batchAllocs.length; i++) {
      const alloc = batchAllocs[i];
      const sId = alloc.student_id;
      if (!sId) continue;

      // Apply UniqueStudentPolicy
      if (deduplicate && seenStudentIds.has(sId)) continue;
      seenStudentIds.add(sId);

      const studentMaster = studentMap.get(sId) || alloc.student || {};
      const fullName = studentMaster.full_name || studentMaster.student_name || alloc.student_name || 'Unknown Student';

      hydratedList.push({
        ...alloc,
        student_id: sId,
        student_name: fullName,
        full_name: fullName,
        email: studentMaster.email || alloc.email || '',
        phone: studentMaster.mobile_number || studentMaster.phone || alloc.phone || '',
        roll_number: studentMaster.roll_number || alloc.roll_number || '',
        allocation_id: alloc.allocation_id || alloc.id,
        allocation_status: alloc.status || 'active',
        student: studentMaster
      });
    }

    return hydratedList;
  }

  /**
   * Resolves attendance records strictly for the target batch, with optional date filtering.
   * 
   * @param {string} batchId - Target batch identifier.
   * @param {Array<Object>} attendanceRecords - Flat list of attendance records from backend or cache.
   * @param {Object} [options={}] - Filter options.
   * @param {string} [options.date] - Optional target date string (YYYY-MM-DD). If omitted, returns all batch attendance.
   * @returns {Array<Object>} Filtered attendance entries array strictly matching batchId (and optional date).
   */
  resolveAttendance(batchId, attendanceRecords = [], options = {}) {
    if (!batchId || !Array.isArray(attendanceRecords)) return [];
    const targetDate = options.date || null;

    return attendanceRecords.filter(record => {
      const matchesBatch = String(record.batch_id) === String(batchId);
      if (!matchesBatch) return false;
      if (targetDate) {
        return String(record.attendance_date) === String(targetDate);
      }
      return true;
    });
  }

  /**
   * Resolves daily attendance baseline sheet for a batch by merging unique student roster with date entries.
   * 
   * @param {Array<Object>} batchStudents - Deduplicated batch student roster array.
   * @param {Array<Object>} recordedEntries - Recorded attendance entries for the target date.
   * @param {string} selectedDate - Active register date string (YYYY-MM-DD).
   * @param {Object} [schedule={}] - Batch schedule containing default start_time and end_time.
   * @returns {Array<Object>} Daily baseline attendance records array with status ('P'/'A'/'L'/'NR').
   */
  resolveAttendanceBaseline(batchStudents = [], recordedEntries = [], selectedDate, schedule = {}) {
    if (!Array.isArray(batchStudents)) return [];
    const recordsMap = new Map((recordedEntries || []).map(r => [r.student_id, r]));

    let startTime = schedule?.start_time || schedule?.startTime || null;
    let endTime = schedule?.end_time || schedule?.endTime || null;

    if (!startTime && typeof schedule === 'string') {
      try {
        const parsed = JSON.parse(schedule);
        startTime = parsed?.start_time;
        endTime = parsed?.end_time;
      } catch (err) {
        console.error('[BatchRepo:resolveAttendanceBaseline] Failed to parse JSON schedule string:', schedule, err);
      }
    }

    if (!startTime || !endTime) {
      console.warn(
        '[BatchRepo:resolveAttendanceBaseline] Batch schedule start_time or end_time missing in passed schedule:',
        schedule,
        `Falling back to default times (${startTime || '08:00'} - ${endTime || '13:00'}).`
      );
    }

    const defaultIn = startTime || '08:00';
    const defaultOut = endTime || '13:00';

    return batchStudents.map(student => {
      const sId = student.student_id || student.id;
      const recorded = recordsMap.get(sId);

      if (recorded) {
        let entryTime = recorded.entry_time;
        let exitTime = recorded.exit_time;

        if (entryTime && typeof entryTime === 'object') {
          entryTime = formatStructuredToTime(entryTime);
        }
        if (exitTime && typeof exitTime === 'object') {
          exitTime = formatStructuredToTime(exitTime);
        }

        return {
          ...recorded,
          student_id: sId,
          student_name: recorded.student_name || student.student_name || student.full_name,
          roll_number: recorded.roll_number || student.roll_number,
          entry_time: entryTime || defaultIn,
          exit_time: exitTime || defaultOut,
          status: recorded.status || 'NR',
          remarks: recorded.remarks || ''
        };
      }

      return {
        attendance_id: null,
        batch_id: student.batch_id,
        student_id: sId,
        student_name: student.student_name || student.full_name,
        roll_number: student.roll_number,
        status: 'NR',
        entry_time: defaultIn,
        exit_time: defaultOut,
        remarks: '',
        attendance_date: selectedDate
      };
    });
  }

  /**
   * Hydrates a batch record with course, teacher, and branch relational data.
   * 
   * @param {string} batchId - Target batch identifier.
   * @param {Object} datasets - Relational dataset maps or arrays.
   * @param {Array<Object>} [datasets.batches=[]] - List of batches.
   * @param {Array<Object>} [datasets.courses=[]] - List of courses.
   * @param {Array<Object>} [datasets.teachers=[]] - List of teachers.
   * @param {Array<Object>} [datasets.branches=[]] - List of branches.
   * @returns {Object|null} Hydrated batch object or null.
   */
  resolveBatchDetails(batchId, datasets = {}) {
    const { batches = [], courses = [], teachers = [], branches = [] } = datasets;
    if (!batchId) return null;

    const rawBatch = batches.find(b => String(b.batch_id || b.id) === String(batchId)) || null;
    if (!rawBatch) return null;

    const course = courses.find(c => String(c.course_id || c.id) === String(rawBatch.course_id)) || null;
    const teacher = teachers.find(t => String(t.teacher_id || t.id) === String(rawBatch.teacher_id)) || null;
    const branch = branches.find(b => String(b.branch_id || b.id) === String(rawBatch.branch_id)) || null;

    return {
      ...rawBatch,
      course_name: course?.name || rawBatch.course_name,
      instructor_name: teacher?.teacher_name || teacher?.full_name || rawBatch.instructor_name,
      branch_name: branch?.branch_name || rawBatch.branch_name
    };
  }
}

// Export singleton instance
export const batchRepo = new BatchRepo();

/**
 * Normalizes a raw array of batch attendance records and populates React Query two-level caches:
 * Level 1: Month-level cache keys -> ["attendance", "batch-month", batchId, "YYYY-MM"]
 * Level 2: Date-level cache keys  -> ["attendance", "batch", batchId, "YYYY-MM-DD"]
 * 
 * @param {import('@tanstack/react-query').QueryClient} queryClient - Active QueryClient instance.
 * @param {string} batchId - Unique batch identifier (e.g., BAT-xxxxx).
 * @param {Array<Object>} rawAttendanceList - Full list of attendance records for the batch.
 * @returns {{ dateMap: Map<string, Array<Object>>, monthMap: Map<string, Array<Object>> }} Grouped maps.
 */
export function batchAttendanceNormalization(queryClient, batchId, rawAttendanceList = []) {
  if (!queryClient || !batchId || !Array.isArray(rawAttendanceList)) {
    return { dateMap: new Map(), monthMap: new Map() };
  }

  const dateMap = new Map();
  const monthMap = new Map();

  for (const record of rawAttendanceList) {
    if (!record || !record.attendance_date) continue;

    const parsedCal = toLocalCalendarDate(record.attendance_date);
    if (!parsedCal) continue;

    const rawDateStr = parsedCal.dateKey;
    const monthKey = parsedCal.monthKey;

    let entryTime = record.entry_time;
    let exitTime = record.exit_time;

    if (entryTime && typeof entryTime === 'object') {
      entryTime = formatStructuredToTime(entryTime);
    }
    if (exitTime && typeof exitTime === 'object') {
      exitTime = formatStructuredToTime(exitTime);
    }

    const normalizedRecord = {
      ...record,
      attendance_date: rawDateStr,
      entry_time: entryTime,
      exit_time: exitTime
    };

    if (!dateMap.has(rawDateStr)) {
      dateMap.set(rawDateStr, []);
    }
    dateMap.get(rawDateStr).push(normalizedRecord);

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, []);
    }
    monthMap.get(monthKey).push(normalizedRecord);
  }

  // Populate Level 2: Date-Level Caches
  for (const [dateKey, dateRecords] of dateMap.entries()) {
    const cacheKey = queryKeys.attendance.batch(batchId, dateKey);
    queryClient.setQueryData(cacheKey, dateRecords);
  }

  // Populate Level 1: Month-Level Caches
  for (const [monthKey, monthRecords] of monthMap.entries()) {
    const monthCacheKey = queryKeys.attendance.batchMonth(batchId, monthKey);
    queryClient.setQueryData(monthCacheKey, monthRecords);
  }

  return { dateMap, monthMap };
}

