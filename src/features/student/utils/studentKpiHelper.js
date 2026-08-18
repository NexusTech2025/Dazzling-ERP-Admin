/**
 * @file studentKpiHelper.js
 * Enterprise Modular KPI Aggregation Engine for Student Directory & Analytics.
 * Composes domain repository calls to enrollmentRepo, studentRepo, and batchRepo.
 */

import { enrollmentRepo } from './enrollmentCacheHelper.js';
import { studentRepo } from './studentCacheHelper.js';
import { batchRepo } from '../../batch/utils/batchCacheHelper.js';

/**
 * Evaluates and attaches all pre-computed KPI summary flags to a single student record.
 * Executes once per student upon dataset loading or refresh.
 * 
 * @param {Object} student - Normalized student entity record.
 * @returns {Object} Student record enriched with `_kpi` object containing pre-evaluated boolean flags.
 */
export function enrichStudentWithKpi(student) {
  if (!student || typeof student !== 'object') return student;

  const statusRes = studentRepo.evaluateStatus(student);
  const allocRes = batchRepo.evaluateAllocations(student);
  const enrRes = enrollmentRepo.evaluateAdmissionDate(student, 30);
  const feeRes = enrollmentRepo.extractFeeSummary(student);
  const attnRes = studentRepo.evaluateAttendance(student, 75);

  return {
    ...student,
    _kpi: {
      isActive: statusRes.isActive,
      isInactive: statusRes.isInactive,
      isUnassigned: allocRes.isUnassigned,
      isNewAdmission: enrRes.isNewAdmission,
      isFeeDue: feeRes.isFeeDue,
      isOverdue: feeRes.isOverdue,
      isPaidFull: feeRes.isPaidFull,
      isLowAttendance: attnRes.isLowAttendance,
      feeSummary: feeRes,
      attendanceScore: attnRes,
      allocations: allocRes.allocations
    }
  };
}

/**
 * Master composer: Primes BatchRepo once, enriches students with `_kpi` metadata,
 * and calculates aggregate KPI metrics in a single O(N) pass.
 * 
 * @param {Array<Object>} [students=[]] - Array of student entity records.
 * @param {Array<Object>} [batches=[]] - Cached batches array from useBatchesQuery.
 * @param {Array<Object>} [courses=[]] - Cached courses array from useCoursesQuery.
 * @param {Array<Object>} [courseTypes=[]] - Cached course types array from useCourseTypesQuery.
 * @returns {{ total: number, active: number, inactive: number, feeDueCount: number, overdueCount: number, paidFullCount: number, newAdmissionsCount: number, lowAttendanceCount: number, unassignedCount: number, enrichedStudents: Array<Object> }}
 */
export function calculateStudentKpiMetrics(students = [], batches = [], courses = [], courseTypes = []) {
  if (!Array.isArray(students) || students.length === 0) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      feeDueCount: 0,
      overdueCount: 0,
      paidFullCount: 0,
      newAdmissionsCount: 0,
      lowAttendanceCount: 0,
      unassignedCount: 0,
      enrichedStudents: []
    };
  }

  // Prime singleton ONCE before O(N) loop
  if (batches.length > 0 || courses.length > 0 || courseTypes.length > 0) {
    batchRepo.prime(batches, courses, courseTypes);
  }

  let active = 0;
  let inactive = 0;
  let feeDueCount = 0;
  let overdueCount = 0;
  let paidFullCount = 0;
  let newAdmissionsCount = 0;
  let lowAttendanceCount = 0;
  let unassignedCount = 0;

  const enrichedStudents = new Array(students.length);

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    if (!s || typeof s !== 'object') {
      enrichedStudents[i] = s;
      continue;
    }

    try {
      const enriched = enrichStudentWithKpi(s);
      enrichedStudents[i] = enriched;

      const k = enriched._kpi;
      if (k.isActive) active++;
      else if (k.isInactive) inactive++;
      if (k.isUnassigned) unassignedCount++;
      if (k.isNewAdmission) newAdmissionsCount++;
      if (k.isFeeDue) {
        feeDueCount++;
        if (k.isOverdue) overdueCount++;
      } else if (k.isPaidFull) {
        paidFullCount++;
      }
      if (k.isLowAttendance) lowAttendanceCount++;

    } catch (recordError) {
      console.warn(`[studentKpiHelper:calculateStudentKpiMetrics] Non-fatal error evaluating student at index ${i}:`, recordError);
      enrichedStudents[i] = s;
    }
  }

  return {
    total: students.length,
    active,
    inactive,
    feeDueCount,
    overdueCount,
    paidFullCount,
    newAdmissionsCount,
    lowAttendanceCount,
    unassignedCount,
    enrichedStudents
  };
}
