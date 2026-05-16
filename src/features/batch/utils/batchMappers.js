/**
 * Data Mapper for Batch Records
 * MVP Phase 1: Stabilize data contracts for UI components
 */

import { queryKeys } from '../../../lib/react-query/queryKeys';

/**
 * Basic record transformation
 */
export const transformBatchRecord = (raw) => {
  if (!raw) return null;

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
    start_date: raw.start_date || null,
    end_date: raw.end_date || null,
    created_at: raw.created_at || null,
    updated_at: raw.updated_at || null,

    // Defensive null handling for schedule object
    schedule: {
      days_of_week: Array.isArray(raw.schedule?.days_of_week) ? raw.schedule.days_of_week : [],
      start_time: raw.schedule?.start_time || null,
      end_time: raw.schedule?.end_time || null,
      room: raw.schedule?.room || 'TBD',
    },

    // Lightweight derived flags for UI consumption
    is_active: (raw.status || '').toLowerCase() === 'active',
    has_schedule: !!(raw.schedule?.start_time && raw.schedule?.end_time && Array.isArray(raw.schedule?.days_of_week) && raw.schedule.days_of_week.length > 0)
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
