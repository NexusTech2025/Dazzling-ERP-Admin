/**
 * @file batchCacheHelper.js
 * @module BatchRepo
 * @description Centralized domain repository joining BatchAllocation junction records with Batch, Course, CourseType, and Student entities.
 */

import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { getCachedList } from '../../../lib/react-query/cacheHelper';

/**
 * Domain Repository for Academic Batches, Allocations, and Course mapping.
 */
export class BatchRepo {
  constructor() {
    this.batchMap = new Map();
    this.courseMap = new Map();
    this.courseTypeMap = new Map();
    this.allocationMap = new Map();
  }

  /**
   * Prime in-memory lookup maps from React Query cache datasets or passed arrays.
   * 
   * @param {import('@tanstack/react-query').QueryClient|Array<Object>} queryClientOrBatches
   * @param {Array<Object>} [coursesList]
   * @param {Array<Object>} [courseTypesList]
   */
  prime(queryClientOrBatches, coursesList, courseTypesList) {
    if (queryClientOrBatches && typeof queryClientOrBatches.getQueryData === 'function') {
      const batches = getCachedList(queryClientOrBatches, 'batch', EMPTY_FILTER) || [];
      const courses = getCachedList(queryClientOrBatches, 'course', EMPTY_FILTER) || [];
      const courseTypes = getCachedList(queryClientOrBatches, 'coursetype', EMPTY_FILTER) || [];
      const allocations = getCachedList(queryClientOrBatches, 'batchallocation', EMPTY_FILTER) || [];

      this.batchMap = new Map(batches.map(b => [b.batch_id || b.id, b]));
      this.courseMap = new Map(courses.map(c => [c.course_id || c.id, c]));
      this.courseTypeMap = new Map(courseTypes.map(ct => [ct.segment_id || ct.id, ct]));
      this.allocationMap = new Map(allocations.map(a => [a.allocation_id || a.id, a]));
    } else if (Array.isArray(queryClientOrBatches)) {
      this.batchMap = new Map(queryClientOrBatches.map(b => [b.batch_id || b.id, b]));
      if (Array.isArray(coursesList)) {
        this.courseMap = new Map(coursesList.map(c => [c.course_id || c.id, c]));
      }
      if (Array.isArray(courseTypesList)) {
        this.courseTypeMap = new Map(courseTypesList.map(ct => [ct.segment_id || ct.id, ct]));
      }
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
   * 
   * @param {Object} student - Hydrated student record.
   * @param {Array<Object>} [batches=[]] - Optional fallback batch array.
   * @param {Array<Object>} [courses=[]] - Optional fallback course array.
   * @param {Array<Object>} [courseTypes=[]] - Optional fallback courseTypes array.
   * @returns {Array<Object>} Hydrated allocation view models.
   */
  getStudentAllocations(student, batches = [], courses = [], courseTypes = []) {
    if (!student) return [];

    const rawAllocs = student.allocations || student.BatchAllocation || [];
    if (!Array.isArray(rawAllocs) || rawAllocs.length === 0) return [];

    if (batches.length > 0 || courses.length > 0 || courseTypes.length > 0) {
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
}

// Export singleton instance
export const batchRepo = new BatchRepo();
