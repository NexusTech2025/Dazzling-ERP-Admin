/**
 * Data Mapper for Batch Records
 * MVP Phase 1: Stabilize data contracts for UI components
 */

export const transformBatchRecord = (raw) => {
  if (!raw) return null;

  return {
    ...raw,
    // Ensure ID is consistently available
    id: raw.batch_id ?? raw.id ?? null,
    
    // Core details with fallback values
    batch_name: raw.batch_name || 'N/A',
    course_id: raw.course_id ?? null,
    course_name: raw.course_name || 'Unknown Course',
    instructor_name: raw.instructor_name || 'Unassigned',
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

export const transformBatchList = (rawList) => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(transformBatchRecord);
};
