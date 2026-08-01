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
import { enrollmentRepo } from '../../features/student/utils/enrollmentCacheHelper.js';

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

/**
 * Normalizes a raw CourseType record.
 */
export function normalizeCourseType(courseType) {
  if (!courseType) return null;
  return {
    ...courseType,
    id: courseType.segment_id ?? courseType.id ?? null,
    segment_id: courseType.segment_id ?? courseType.id ?? null
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

/**
 * Normalizes a raw Enrollment record.
 * Standardizes primary key identification and parses stringified metadata.
 * 
 * @function normalizeEnrollment
 * @param {object} enrollment - Raw enrollment payload from database.
 * @returns {object|null} Normalized enrollment record.
 */
export function normalizeEnrollment(enrollment) {
  if (!enrollment) return null;
  return {
    ...enrollment,
    id: enrollment.enrollment_id ?? enrollment.id ?? null,
    enrollment_id: enrollment.enrollment_id ?? enrollment.id ?? null,
    metadata: safeParseMetadata(enrollment.metadata)
  };
}

/**
 * Hydrates Enrollment relations by resolving the Student object from query cache.
 * Maps student record onto the enrollment.student slot and propagates to sub-accounts.
 * 
 * @function hydrateEnrollment
 * @param {object} enrollment - Normalized enrollment record.
 * @param {QueryClient} queryClient - TanStack Query client.
 * @returns {object|null} Relational stitched enrollment record.
 */
export function hydrateEnrollment(enrollment, queryClient) {
  if (!enrollment) return null;

  const students = queryClient.getQueryData(queryKeys.student.list(EMPTY_FILTER)) || [];
  let student = students.find(s => s.student_id === enrollment.student_id || s.id === enrollment.student_id);

  if (!student) {
    const cachedDetail = queryClient.getQueryData(queryKeys.student.detail(enrollment.student_id));
    if (cachedDetail) {
      student = cachedDetail;
    } else {
      const listQueries = queryClient.getQueriesData({ queryKey: ['student', 'list'] });
      for (const [_, listData] of listQueries) {
        if (Array.isArray(listData)) {
          const found = listData.find(s => s && (s.student_id === enrollment.student_id || s.id === enrollment.student_id));
          if (found) {
            student = found;
            break;
          }
        }
      }
    }
  }

  const studentData = student || null;

  // const studentfeeaccounts = (enrollment.studentfeeaccounts || []).map(account => ({
  //   ...account,
  //   enrollment: {
  //     ...enrollment,
  //     student: studentData
  //   }
  // }));
  enrollment = normalizeEnrollment(enrollment);
  return {
    ...enrollment,
    student: studentData,
    // studentfeeaccounts
  };
}


/**
 * Normalizes a raw Student record to guarantee canonical schema properties.
 * Maps legacy/alias keys (id -> student_id, name -> student_name) and establishes primary defaults.
 * 
 * @param {Object} student - Raw student payload from API or cache.
 * @returns {Object|null} Normalized student record.
 */
export function normalizeStudent(student) {
  if (!student) return null;

  const student_id = student.student_id ?? student.id ?? null;
  const student_name = student.student_name ?? student.name ?? 'Anonymous Student';
  const email = student.email ?? student.contact?.email ?? null;
  const phone = student.phone ?? student.mobile_number ?? student.contact?.mobile_number ?? null;

  return {
    student_id,
    student_name,
    email,
    phone,
    gender: student.gender || null,
    dob: student.dob || null,
    father_name: student.father_name || null,
    mother_name: student.mother_name || null,
    avatarUrl: student.avatarUrl || null,
    status: (student.status || 'active').toLowerCase(),
    // Preserve child tables returned in server include payload:
    ...(student.Address && { Address: student.Address }),
    ...(student.ContactInfo && { ContactInfo: student.ContactInfo }),
    ...(student.Education && { Education: student.Education }),
    ...(student.BatchAllocation && { BatchAllocation: student.BatchAllocation }),
    ...(student.address && { address: student.address }),
    ...(student.contact && { contact: student.contact }),
    ...(student.education && { education: student.education }),
    ...(student.allocations && { allocations: student.allocations }),
    ...(student.enrollments && { enrollments: student.enrollments }),
    ...(student.studentattendance && { studentattendance: student.studentattendance })
  };
}

/**
 * Hydrates Student relations by resolving linked contact, address, education, and enrollment sub-entities.
 * 
 * @param {Object} student - Normalized student record.
 * @param {QueryClient} queryClient - TanStack Query client.
 * @returns {Object|null} Hydrated student record.
 */
export function hydrateStudent(student, queryClient) {
  if (!student) return null;
  return normalizeStudent(student);
}

/**
 * Hydrates a complete student profile (biological info, residency address, emergency contact, 
 * qualifications, active enrollments, and active batch/course allocations) directly from RAM cache with zero network calls.
 * 
 * @param {QueryClient} queryClient - TanStack Query client.
 * @param {string} studentId - Unique student identifier.
 * @returns {Object|null} Hydrated student profile containing basic student object and profileData payload.
 */
export function hydrateStudentProfile(queryClient, studentId) {
  if (!studentId || !queryClient) return null;

  console.groupCollapsed(`🔬 [hydrateStudentProfile] Resolving: ${studentId}`);

  // 1. Resolve raw student record from directory list cache
  const listData = queryClient.getQueryData(queryKeys.student.list(EMPTY_FILTER)) || [];
  console.log('📦 Cache listData count:', listData.length);
  console.log('📦 Cache queryKey used:', JSON.stringify(queryKeys.student.list(EMPTY_FILTER)));

  const rawStudent = listData.find(s => s && (s.student_id === studentId || s.id === studentId));
  if (!rawStudent) {
    console.warn('❌ Student NOT found in list cache for ID:', studentId);
    console.groupEnd();
    return null;
  }

  console.log('✅ Raw student found. Keys:', Object.keys(rawStudent));
  console.log('🔑 Has address?', !!rawStudent.address || Array.isArray(rawStudent.Address), '| Has contact?', !!rawStudent.contact || Array.isArray(rawStudent.ContactInfo));
  console.log('🔑 Has education?', Array.isArray(rawStudent.education) || Array.isArray(rawStudent.Education), '| Has allocations?', Array.isArray(rawStudent.allocations) || Array.isArray(rawStudent.BatchAllocation));
  console.log('🔑 Has enrollments?', Array.isArray(rawStudent.enrollments));

  const student = normalizeStudent(rawStudent);

  // 2. Extract child tables (prioritizing embedded lowercase payload properties from backend include)
  const address = rawStudent.address || (Array.isArray(rawStudent.Address) ? (rawStudent.Address[0] || null) : null);
  const contact = rawStudent.contact || (Array.isArray(rawStudent.ContactInfo) ? (rawStudent.ContactInfo[0] || null) : null);
  const education = Array.isArray(rawStudent.education)
    ? rawStudent.education
    : (Array.isArray(rawStudent.Education) ? rawStudent.Education : []);

  console.log('📍 Resolved address:', address ? 'present' : 'null');
  console.log('📞 Resolved contact:', contact ? 'present' : 'null');
  console.log('🎓 Resolved education count:', education.length);

  // 3. Resolve ALL allocations, batches, courses, and enrollments for this student
  const allocationsList = queryClient.getQueryData(queryKeys.batch_allocation?.all || ['batch_allocation']) || [];
  const rawAllocations = Array.isArray(rawStudent.allocations)
    ? rawStudent.allocations
    : (Array.isArray(rawStudent.BatchAllocation)
      ? rawStudent.BatchAllocation
      : (Array.isArray(allocationsList) ? allocationsList.filter(a => a && a.student_id === studentId) : []));

  console.log('🗂️ Allocation source:', Array.isArray(rawStudent.allocations) ? 'embedded (include.allocations)' : (Array.isArray(rawStudent.BatchAllocation) ? 'embedded (include.BatchAllocation)' : 'global cache fallback'));
  console.log('🗂️ Raw allocations count:', rawAllocations.length, rawAllocations);

  const batches = queryClient.getQueryData(queryKeys.batch.list(EMPTY_FILTER)) || [];
  const courses = queryClient.getQueryData(queryKeys.course.list(EMPTY_FILTER)) || [];

  console.log('📚 Global batches cache count:', batches.length, '| key:', JSON.stringify(queryKeys.batch.list(EMPTY_FILTER)));
  console.log('📚 Global courses cache count:', courses.length, '| key:', JSON.stringify(queryKeys.course.list(EMPTY_FILTER)));

  // Map each allocation to its resolved batch and course entities
  const studentAllocations = rawAllocations.map(alloc => {
    const linkedBatch = Array.isArray(batches) ? batches.find(b => b && b.batch_id === alloc.batch_id) : null;
    const linkedCourse = Array.isArray(courses) ? courses.find(c => c && c.course_id === alloc.course_id) : null;
    return {
      ...alloc,
      batch_name: linkedBatch?.batch_name || alloc.batch_id || 'Unassigned Batch',
      course_name: linkedCourse?.name || linkedCourse?.course_name || alloc.course_id || 'Unassigned Course',
      batch: linkedBatch,
      course: linkedCourse
    };
  });

  const studentBatches = studentAllocations.map(a => a.batch).filter(Boolean);
  const studentCourses = studentAllocations.map(a => a.course).filter(Boolean);

  // Resolve enrollments (prioritizing embedded include.enrollments)
  const enrollmentsList = queryClient.getQueryData(queryKeys.enrollment?.all || ['enrollment']) || [];
  const rawEnrollments = Array.isArray(rawStudent.enrollments)
    ? rawStudent.enrollments
    : (Array.isArray(enrollmentsList)
      ? enrollmentsList.filter(e => e && e.student_id === studentId)
      : []);

  const studentEnrollments = rawEnrollments.map(enr => {
    const enrId = enr.enrollment_id || enr.id;
    const repoEnr = enrollmentRepo.getByEnrollmentId(enrId);
    const linkedCourse = Array.isArray(courses) ? courses.find(c => c && (c.course_id === enr.item_id || c.id === enr.item_id)) : null;
    const linkedFeeAccounts = (enr.studentfeeaccounts && enr.studentfeeaccounts.length > 0)
      ? enr.studentfeeaccounts
      : (enr.StudentFeeAccount && enr.StudentFeeAccount.length > 0)
        ? enr.StudentFeeAccount
        : (repoEnr?.studentfeeaccounts || repoEnr?.StudentFeeAccount || []);
    const linkedAllocations = studentAllocations.filter(a => a && a.enrollment_id === enrId);

    return {
      ...enr,
      enrollment_id: enrId,
      course_name: linkedCourse?.name || linkedCourse?.course_name || (linkedAllocations[0]?.course_name) || enr.course_name || null,
      course: linkedCourse,
      studentfeeaccounts: linkedFeeAccounts,
      allocations: linkedAllocations
    };
  });

  console.log('📋 Final allocations:', studentAllocations.length, '| batches:', studentBatches.length, '| courses:', studentCourses.length);
  console.log('📋 Final enrollments count:', studentEnrollments.length);
  console.groupEnd();

  return {
    student,
    profileData: {
      address,
      contact,
      education,
      enrollments: studentEnrollments,
      allocations: studentAllocations,
      batches: studentBatches,
      courses: studentCourses
    }
  };
}

// --- GLOBAL STRATEGY ROUTERS ---

const NORMALIZERS = {
  course: normalizeCourse,
  batch: normalizeBatch,
  package: normalizePackage,
  coursetype: normalizeCourseType,
  enrollment: normalizeEnrollment,
  student: normalizeStudent
};

const HYDRATORS = {
  course: hydrateCourse,
  batch: hydrateBatch,
  package: hydratePackage,
  enrollment: hydrateEnrollment,
  student: hydrateStudent
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
