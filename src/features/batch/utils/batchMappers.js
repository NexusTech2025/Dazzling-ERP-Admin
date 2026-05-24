/**
 * Data Mapper for Batch Records
 * MVP Phase 1: Stabilize data contracts for UI components
 */

import { queryKeys } from '../../../lib/react-query/queryKeys';

const normalizeDate = (val) => {
  if (!val) return null;
  if (typeof val === 'object') {
    if (val instanceof Date) {
      return val.toISOString();
    }
    if (Object.keys(val).length === 0) return null;
  }
  if (typeof val === 'string') {
    if (val.trim() === '{}') return null;
    return val;
  }
  return val;
};

/**
 * Parses schedule string to JSON object if stringified (Single Responsibility: JSON Parsing)
 */
export const parseBatchSchedule = (scheduleVal) => {
  if (!scheduleVal) return null;
  if (typeof scheduleVal === 'string') {
    try {
      return JSON.parse(scheduleVal);
    } catch (e) {
      console.error('Failed to parse schedule JSON string:', scheduleVal, e);
      return null;
    }
  }
  return scheduleVal;
};

/**
 * Normalizes the schedule field of a batch record (Single Responsibility: Batch Level Normalization)
 */
export const normalizeBatch = (batch) => {
  if (!batch) return batch;

  console.log("normalizing the batch dates: ", batch)
  return {
    ...batch,
    start_date: normalizeDate(batch.start_date),
    end_date: normalizeDate(batch.end_date),
    created_at: normalizeDate(batch.created_at),
    updated_at: normalizeDate(batch.updated_at),
    schedule: parseBatchSchedule(batch.schedule)
  };
};

/**
 * Normalizes the schedule fields of a list of batch records
 */
export const normalizeBatchList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeBatch);
};

/**
 * Basic record transformation
 */
export const transformBatchRecord = (raw) => {
  if (!raw) return null;

  const parsedSchedule = parseBatchSchedule(raw.schedule);

  return {
    ...raw,
    // Ensure ID is consistently available
    id: raw.batch_id ?? raw.id ?? null,

    // Standardize identifiers
    course_id: raw.course_id ?? raw.item_id ?? null,
    teacher_id: raw.teacher_id ?? null,
    branch_id: raw.branch_id ?? null,

    // Core details with fallback values
    batch_name: raw.batch_name || 'N/A',
    course_name: raw.course_name || 'Unknown Course',
    instructor_name: raw.instructor_name || raw.teacher_name || 'Unassigned',
    branch_id: raw.branch_id || null,
    branch_name: raw.branch_name || 'Unknown Branch',
    capacity: raw.capacity ?? 0,
    enrolled_students: raw.enrolled_students ?? 0,
    status: raw.status || 'Unknown',

    // Dates remain raw (UI should format them)
    start_date: normalizeDate(raw.start_date),
    end_date: normalizeDate(raw.end_date),
    created_at: normalizeDate(raw.created_at),
    updated_at: normalizeDate(raw.updated_at),

    // Defensive null handling for schedule object
    schedule: {
      days_of_week: Array.isArray(parsedSchedule?.days_of_week) ? parsedSchedule.days_of_week : [],
      start_time: parsedSchedule?.start_time || null,
      end_time: parsedSchedule?.end_time || null,
      room: parsedSchedule?.room || 'TBD',
    },

    // Lightweight derived flags for UI consumption
    is_active: (raw.status || '').toLowerCase() === 'active',
    has_schedule: !!(parsedSchedule?.start_time && parsedSchedule?.end_time && Array.isArray(parsedSchedule?.days_of_week) && parsedSchedule.days_of_week.length > 0)
  };
};

/**
 * Cross-feature cache resolver
 * Enriches a batch record with data from other domain caches (Course, Teacher)
 */
export const resolveBatchRelations = (batch, queryClient) => {
  if (!batch || !queryClient) return batch;

  // 1. Resolve Course Name
  if (batch.course_name === 'Unknown Course' && batch.course_id) {
    const courses = queryClient.getQueryData(queryKeys.course.lists()) || [];
    const course = courses.find(c => c.course_id === batch.course_id || c.id === batch.course_id);
    if (course) {
      batch.course_name = course.name;
    }
  }

  // 2. Resolve Instructor Name
  if (batch.instructor_name === 'Unassigned' && batch.teacher_id) {
    const teachers = queryClient.getQueryData(queryKeys.teacher.lists()) || [];
    const teacher = teachers.find(t => t.teacher_id === batch.teacher_id || t.id === batch.teacher_id);
    if (teacher) {
      batch.instructor_name = teacher.teacher_name || teacher.full_name;
    }
  }

  // 3. Resolve Branch Name
  if (batch.branch_name === 'Unknown Branch' && batch.branch_id) {
    const branches = queryClient.getQueryData(queryKeys.branch.list()) || [];
    const branch = branches.find(b => b.branch_id === batch.branch_id || b.id === batch.branch_id);
    if (branch) {
      batch.branch_name = branch.branch_name || branch.name;
    }
  }

  return batch;
};

export const transformBatchList = (rawList) => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(transformBatchRecord);
};
