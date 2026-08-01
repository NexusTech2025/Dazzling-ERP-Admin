/**
 * @file studentKpiHelper.js
 * Enterprise Modular KPI Aggregation Engine for Student Directory & Analytics.
 * Composes domain repository calls to enrollmentRepo, studentRepo, and batchRepo.
 */

import { enrollmentRepo } from './enrollmentCacheHelper';
import { studentRepo } from './studentCacheHelper';
import { batchRepo } from '../../batch/utils/batchCacheHelper';

/**
 * Master composer: Calculates aggregate KPI metrics across an array of student records in a single O(N) pass.
 * Delegates per-student evaluations to decoupled domain repository singletons (enrollmentRepo, studentRepo, batchRepo).
 * 
 * @param {Array<Object>} [students=[]] - Array of student entity records.
 * @param {Array<Object>} [batches=[]] - Cached batches array from useBatchesQuery.
 * @param {Array<Object>} [courses=[]] - Cached courses array from useCoursesQuery.
 * @param {Array<Object>} [courseTypes=[]] - Cached course types array from useCourseTypesQuery.
 * @returns {{ total: number, active: number, inactive: number, feeDueCount: number, overdueCount: number, paidFullCount: number, newAdmissionsCount: number, lowAttendanceCount: number, unassignedCount: number }}
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
      unassignedCount: 0
    };
  }

  let active = 0;
  let inactive = 0;
  let feeDueCount = 0;
  let overdueCount = 0;
  let paidFullCount = 0;
  let newAdmissionsCount = 0;
  let lowAttendanceCount = 0;
  let unassignedCount = 0;

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    if (!s || typeof s !== 'object') continue;

    try {
      // 1. Status Domain Check (StudentRepo)
      const statusRes = studentRepo.evaluateStatus(s);
      if (statusRes.isActive) active++;
      else if (statusRes.isInactive) inactive++;

      // 2. Allocation Domain Check (BatchRepo)
      const allocRes = batchRepo.evaluateAllocations(s, batches, courses, courseTypes);
      if (allocRes.isUnassigned) unassignedCount++;

      // 3. Admission Date Domain Check (EnrollmentRepo)
      const enrRes = enrollmentRepo.evaluateAdmissionDate(s, 30);
      if (enrRes.isNewAdmission) newAdmissionsCount++;

      // 4. Fee Accounting Domain Check (EnrollmentRepo)
      const feeRes = enrollmentRepo.extractFeeSummary(s);
      if (feeRes.isFeeDue) {
        feeDueCount++;
        if (feeRes.isOverdue) overdueCount++;
      } else if (feeRes.isPaidFull) {
        paidFullCount++;
      }

      // 5. Attendance Domain Check (StudentRepo)
      const attnRes = studentRepo.evaluateAttendance(s, 75);
      if (attnRes.isLowAttendance) lowAttendanceCount++;

    } catch (recordError) {
      console.warn(`[studentKpiHelper:calculateStudentKpiMetrics] Non-fatal error evaluating student at index ${i}:`, recordError);
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
    unassignedCount
  };
}
