/**
 * src/lib/react-query/hydrate.js
 * Centralized Hydration Engine
 * 
 * Separation of Concerns (SOLID):
 * 1. NORMALIZERS (Ingestion/Write-time): Format data types, parse JSON payloads, and standardize IDs.
 *    Use these at cache ingestion or write time to prepare clean records.
 * 2. HYDRATORS (Selection/Read-time): Map relations by scanning query cache keys.
 *    Use these only at read-time (e.g. inside React Query's `select` hooks option)
 *    to guarantee updates in courses/teachers/branches dynamically propagate.
 */

import { queryKeys, EMPTY_FILTER } from './queryKeys.js';
import { validateRecordSchema } from './validationEngine.js';

// --- UTILITY PARSERS ---

/**
 * Safely parses serialized course JSON metadata fields.
 */
export const safeParseMetadata = (metadata) => {
  if (!metadata) return {};
  if (typeof metadata === 'object') return metadata;
  
  if (typeof metadata === 'string') {
    const trimmed = metadata.trim();
    if (trimmed === '' || trimmed === '{}' || trimmed === 'null' || trimmed === 'undefined') {
      return {};
    }
    try {
      const parsed = JSON.parse(trimmed);
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) {
      console.error('Failed to parse course metadata JSON:', metadata, e);
      return {};
    }
  }
  return {};
};

/**
 * Normalizes Date inputs to ISO string representation or null.
 */
export const normalizeDate = (val) => {
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
 * Parses schedule string to JSON object if stringified.
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


// --- NORMALIZERS (WRITE-TIME INGESTION) ---

/**
 * Normalizes a raw Course record.
 */
export function normalizeCourse(course) {
  if (!course) return null;
  return {
    ...course,
    id: course.course_id ?? course.id ?? null,
    course_id: course.course_id ?? course.id ?? null,
    metadata: safeParseMetadata(course.metadata)
  };
}

/**
 * Normalizes a raw Batch record.
 */
export function normalizeBatch(batch) {
  if (!batch) return null;

  const parsedSchedule = parseBatchSchedule(batch.schedule);

  return {
    ...batch,
    id: batch.batch_id ?? batch.id ?? null,
    course_id: batch.course_id ?? batch.item_id ?? null,
    teacher_id: batch.teacher_id ?? null,
    branch_id: batch.branch_id ?? null,

    batch_name: batch.batch_name || 'N/A',
    course_name: batch.course_name || 'Unknown Course',
    instructor_name: batch.instructor_name || batch.teacher_name || 'Unassigned',
    branch_name: batch.branch_name || 'Unknown Branch',
    capacity: batch.capacity ?? 0,
    enrolled_students: batch.enrolled_students ?? 0,
    status: batch.status || 'Unknown',

    start_date: normalizeDate(batch.start_date),
    end_date: normalizeDate(batch.end_date),
    created_at: normalizeDate(batch.created_at),
    updated_at: normalizeDate(batch.updated_at),

    schedule: {
      days_of_week: Array.isArray(parsedSchedule?.days_of_week) ? parsedSchedule.days_of_week : [],
      start_time: parsedSchedule?.start_time || null,
      end_time: parsedSchedule?.end_time || null,
      room: parsedSchedule?.room || 'TBD',
    },

    is_active: (batch.status || '').toLowerCase() === 'active',
    has_schedule: !!(parsedSchedule?.start_time && parsedSchedule?.end_time && Array.isArray(parsedSchedule?.days_of_week) && parsedSchedule.days_of_week.length > 0)
  };
}

/**
 * Normalizes a raw Package record.
 */
export function normalizePackage(pkg) {
  if (!pkg) return null;
  return {
    ...pkg,
    id: pkg.package_id ?? pkg.id ?? null,
    package_id: pkg.package_id ?? pkg.id ?? null,
    package_fee: typeof pkg.package_fee === 'string' ? parseFloat(pkg.package_fee) : (pkg.package_fee ?? 0),
    discount_percent: typeof pkg.discount_percent === 'string' ? parseFloat(pkg.discount_percent) : (pkg.discount_percent ?? 0),
    month: typeof pkg.month === 'string' ? parseInt(pkg.month, 10) : (pkg.month ?? 0)
  };
}


// --- HYDRATORS (READ-TIME SELECTION) ---

/**
 * Hydrates Course relations (no-op placeholder if course relations are loaded standalone).
 */
export function hydrateCourse(course, queryClient) {
  return course;
}

/**
 * Hydrates Batch relations by stitching Course, Teacher, and Branch from cache.
 */
export function hydrateBatch(batch, queryClient) {
  if (!batch) return null;

  const courses = queryClient.getQueryData(queryKeys.course.list(EMPTY_FILTER)) || [];
  const teachers = queryClient.getQueryData(queryKeys.teacher.list(EMPTY_FILTER)) || [];
  const branches = queryClient.getQueryData(queryKeys.branch.list(EMPTY_FILTER)) || [];

  const course = courses.find(c => c.course_id === batch.course_id || c.id === batch.course_id);
  const teacher = teachers.find(t => t.teacher_id === batch.teacher_id || t.id === batch.teacher_id);
  const branch = branches.find(b => b.branch_id === batch.branch_id || b.id === batch.branch_id);

  return {
    ...batch,
    course: course || null,
    teacher: teacher || null,
    branch: branch || null,
    course_name: course ? course.name : batch.course_name,
    instructor_name: teacher ? (teacher.teacher_name || teacher.full_name) : batch.instructor_name,
    branch_name: branch ? (branch.branch_name || branch.name) : batch.branch_name
  };
}

/**
 * Hydrates Package relations by resolving included Course objects and Perks from cache.
 */
export function hydratePackage(pkg, queryClient) {
  if (!pkg) return null;

  const courses = queryClient.getQueryData(queryKeys.course.list(EMPTY_FILTER)) || [];
  
  // Resolve raw items from pkg.packageitems, pkg.package_items, or the query cache
  let items = pkg.packageitems || pkg.package_items;
  if (!items || items.length === 0) {
    const cachedItems = queryClient.getQueryData(queryKeys.course.packageItem.list()) || [];
    items = cachedItems.filter(item => item.package_id === pkg.package_id);
  }

  // Resolve raw perks from pkg.packageperks, pkg.package_perks, or the query cache
  let perks = pkg.packageperks || pkg.package_perks || pkg.perks;
  if (!perks || perks.length === 0) {
    const cachedPerks = queryClient.getQueryData(queryKeys.course.packagePerk.list()) || [];
    perks = cachedPerks.filter(perk => perk.package_id === pkg.package_id);
  }

  // Hydrate package items with their referenced courses
  const hydratedItems = items.map(item => {
    const course = courses.find(c => c.course_id === item.entity_id || c.id === item.entity_id);
    return {
      ...item,
      course: course || null
    };
  });

  const includedCourseIds = items
    .filter(item => item.entity_type === 'course' || item.entity_type === 'subject')
    .map(item => item.entity_id);

  const resolvedCourses = courses.filter(c => includedCourseIds.includes(c.course_id) || includedCourseIds.includes(c.id));

  return {
    ...pkg,
    packageitems: hydratedItems,
    courses: resolvedCourses,
    packageperks: perks,
    perks: perks
  };
}


// --- GLOBAL STRATEGY ROUTERS ---

const NORMALIZERS = {
  course: normalizeCourse,
  batch: normalizeBatch,
  package: normalizePackage
};

const HYDRATORS = {
  course: hydrateCourse,
  batch: hydrateBatch,
  package: hydratePackage
};

/**
 * Global router for record normalization (writes).
 */
export function normalizeRecord(entityName, data) {
  const normalizer = NORMALIZERS[entityName?.toLowerCase()];
  if (!normalizer) return data;
  return Array.isArray(data) ? data.map(normalizer) : normalizer(data);
}

const validatedRecords = new WeakSet();

/**
 * Global router for record relational hydration (reads).
 */
export function hydrateRecord(entityName, data, queryClient) {
  const hydrator = HYDRATORS[entityName?.toLowerCase()];
  if (!hydrator) return data;
  
  const hydrated = Array.isArray(data) 
    ? data.map(record => hydrator(record, queryClient)) 
    : hydrator(data, queryClient);

  // Validate the fully hydrated record(s) to guarantee schema compliance at read-time select
  if (hydrated) {
    const recordsToValidate = Array.isArray(hydrated) ? hydrated : [hydrated];
    for (const record of recordsToValidate) {
      if (record && typeof record === 'object' && !validatedRecords.has(record)) {
        validateRecordSchema(entityName, record, { failMode: 'lazy', context: 'read' });
        validatedRecords.add(record);
      }
    }
  }

  return hydrated;
}
