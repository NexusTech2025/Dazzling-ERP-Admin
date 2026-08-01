/**
 * @file studentCacheHelper.js
 * @module StudentRepo
 * @description Centralized domain repository for Student entities, relational attendance aggregation, and individual/overall score calculations.
 */

import { aq } from '../../../lib/queryEngine.js';
import { getCachedList } from '../../../lib/react-query/cacheHelper.js';
import { EMPTY_FILTER } from '../../../lib/react-query/queryKeys.js';

/**
 * Domain Repository for Student entity analytics and Attendance aggregation.
 */
export class StudentRepo {
  constructor() {
    this.studentMap = new Map();
    this.attendanceMap = new Map(); // student_id -> Array<StudentAttendance>
    this.batchAttendanceMap = new Map(); // `${student_id}_${batch_id}` -> Array<StudentAttendance>
  }

  /**
   * Prime in-memory lookup maps from React Query cache datasets or passed arrays.
   * 
   * @param {import('@tanstack/react-query').QueryClient|Array<Object>} queryClientOrStudents
   * @param {Array<Object>} [attendanceList]
   */
  prime(queryClientOrStudents, attendanceList) {
    if (queryClientOrStudents && typeof queryClientOrStudents.getQueryData === 'function') {
      const students = getCachedList(queryClientOrStudents, 'student', EMPTY_FILTER) || [];
      const attendance = getCachedList(queryClientOrStudents, 'studentattendance', EMPTY_FILTER) || [];

      this.studentMap = new Map(students.map(s => [s.student_id || s.id, s]));
      this.groupAttendance(attendance);
    } else if (Array.isArray(queryClientOrStudents)) {
      this.studentMap = new Map(queryClientOrStudents.map(s => [s.student_id || s.id, s]));
      if (Array.isArray(attendanceList)) {
        this.groupAttendance(attendanceList);
      }
    }
  }

  /**
   * Groups attendance records by student_id and batch_id for O(1) lookup speeds.
   * 
   * @param {Array<Object>} attendanceList - Raw StudentAttendance records.
   */
  groupAttendance(attendanceList = []) {
    this.attendanceMap.clear();
    this.batchAttendanceMap.clear();

    if (!Array.isArray(attendanceList) || attendanceList.length === 0) return;

    const grouped = aq(attendanceList)
      .filter(rec => rec && rec.student_id && rec.status)
      .objects();

    grouped.forEach(rec => {
      const sId = rec.student_id;
      const bId = rec.batch_id;

      if (!this.attendanceMap.has(sId)) {
        this.attendanceMap.set(sId, []);
      }
      this.attendanceMap.get(sId).push(rec);

      if (bId) {
        const key = `${sId}_${bId}`;
        if (!this.batchAttendanceMap.has(key)) {
          this.batchAttendanceMap.set(key, []);
        }
        this.batchAttendanceMap.get(key).push(rec);
      }
    });
  }

  /**
   * Extracts and groups attendance records from a single student's nested attendance array.
   * Designed for list-view usage where each student carries its own attendance data.
   * Includes defensive input validation and exception handling to prevent runtime crashes.
   * 
   * @param {Object} student - Hydrated student record with nested studentattendance[].
   * @returns {number} Count of successfully processed attendance records.
   */
  getAttendanceFromStudent(student) {
    try {
      if (!student || typeof student !== 'object') {
        console.warn('[StudentRepo:getAttendanceFromStudent] Invalid or non-object student argument provided:', student);
        return 0;
      }

      const studentId = student.student_id || student.id;
      if (!studentId) {
        console.warn('[StudentRepo:getAttendanceFromStudent] Student record is missing student_id property:', student);
        return 0;
      }

      // Index student object in studentMap
      this.studentMap.set(studentId, student);

      const records = Array.isArray(student.studentattendance)
        ? student.studentattendance
        : (Array.isArray(student.StudentAttendance) ? student.StudentAttendance : []);

      if (records.length === 0) {
        console.debug(`[StudentRepo:getAttendanceFromStudent] No nested attendance records found for student ${studentId}`);
        return 0;
      }

      let processedCount = 0;
      records.forEach((rec, index) => {
        if (!rec || typeof rec !== 'object') {
          console.warn(`[StudentRepo:getAttendanceFromStudent] Skipping invalid record at index ${index} for student ${studentId}:`, rec);
          return;
        }

        const sId = rec.student_id || studentId;
        const bId = rec.batch_id;
        const status = rec.status;

        if (!sId || !status) {
          console.warn(`[StudentRepo:getAttendanceFromStudent] Record missing required student_id or status at index ${index}:`, rec);
          return;
        }

        if (!this.attendanceMap.has(sId)) {
          this.attendanceMap.set(sId, []);
        }
        this.attendanceMap.get(sId).push(rec);

        if (bId) {
          const key = `${sId}_${bId}`;
          if (!this.batchAttendanceMap.has(key)) {
            this.batchAttendanceMap.set(key, []);
          }
          this.batchAttendanceMap.get(key).push(rec);
        }

        processedCount++;
      });

      console.log(`[StudentRepo:getAttendanceFromStudent] Successfully indexed ${processedCount} attendance records for student ${studentId}`);
      return processedCount;
    } catch (error) {
      console.error('[StudentRepo:getAttendanceFromStudent] Error processing student attendance records:', {
        student,
        error: error.message,
        stack: error.stack
      });
      return 0;
    }
  }

  /**
   * Custom serializer for console logging and debugging JSON representations of StudentRepo state.
   * Maps in JavaScript serialize as {} by default; this exposes internal sizes and data structures cleanly.
   * 
   * @returns {Object} Human-readable summary of repository state.
   */
  toJSON() {
    return {
      studentCount: this.studentMap.size,
      attendanceStudentsCount: this.attendanceMap.size,
      batchAttendanceKeysCount: this.batchAttendanceMap.size,
      students: Array.from(this.studentMap.keys()),
      attendanceByStudent: Object.fromEntries(
        Array.from(this.attendanceMap.entries()).map(([k, v]) => [k, v.length])
      ),
      batchAttendanceByKey: Object.fromEntries(
        Array.from(this.batchAttendanceMap.entries()).map(([k, v]) => [k, v.length])
      )
    };
  }

  /**
   * Calculates individual attendance score for a specific student and batch allocation.
   * 
   * @param {string} studentId - Unique identifier of student.
   * @param {string} batchId - Unique identifier of batch.
   * @returns {{ totalSessions: number, presentCount: number, absentCount: number, lateCount: number, percentage: number|null }}
   */
  calculateBatchAttendanceScore(studentId, batchId) {
    try {
      if (!studentId || typeof studentId !== 'string') {
        console.warn('[StudentRepo:calculateBatchAttendanceScore] Invalid studentId provided:', studentId);
        return { totalSessions: 0, presentCount: 0, absentCount: 0, lateCount: 0, percentage: null };
      }

      if (!batchId || typeof batchId !== 'string') {
        console.warn('[StudentRepo:calculateBatchAttendanceScore] Invalid batchId provided:', batchId);
        return { totalSessions: 0, presentCount: 0, absentCount: 0, lateCount: 0, percentage: null };
      }

      const key = `${studentId}_${batchId}`;
      const records = this.batchAttendanceMap.get(key) || [];

      if (!Array.isArray(records) || records.length === 0) {
        return { totalSessions: 0, presentCount: 0, absentCount: 0, lateCount: 0, percentage: null };
      }

      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      records.forEach(r => {
        if (!r || !r.status) return;
        const s = String(r.status).toUpperCase();
        if (s === 'P' || s === 'PRESENT') presentCount++;
        else if (s === 'L' || s === 'LATE') { presentCount++; lateCount++; }
        else if (s === 'A' || s === 'ABSENT') absentCount++;
      });

      const totalSessions = records.length;
      const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : null;

      return { totalSessions, presentCount, absentCount, lateCount, percentage };
    } catch (error) {
      console.error('[StudentRepo:calculateBatchAttendanceScore] Calculation error:', {
        studentId,
        batchId,
        error: error.message
      });
      return { totalSessions: 0, presentCount: 0, absentCount: 0, lateCount: 0, percentage: null };
    }
  }

  /**
   * Calculates overall summarized attendance score across all active batch allocations for a student.
   * Derives attendance percentage exclusively from StudentAttendance records.
   * Auto-primes maps from nested student.studentattendance[] if not previously primed.
   * 
   * @param {Object|string} studentOrId - Hydrated Student object or student_id string.
   * @returns {{ totalSessions: number, presentCount: number, absentCount: number, lateCount: number, percentage: number|null, batchScores: Array<Object> }}
   */
  calculateSummarizedAttendanceScore(studentOrId) {
    try {
      if (!studentOrId) {
        console.warn('[StudentRepo:calculateSummarizedAttendanceScore] Empty studentOrId argument provided.');
        return { totalSessions: 0, presentCount: 0, absentCount: 0, lateCount: 0, percentage: null, batchScores: [] };
      }

      const student = typeof studentOrId === 'string' ? this.studentMap.get(studentOrId) : studentOrId;
      if (!student || typeof student !== 'object') {
        console.warn('[StudentRepo:calculateSummarizedAttendanceScore] Unresolvable student record:', studentOrId);
        return { totalSessions: 0, presentCount: 0, absentCount: 0, lateCount: 0, percentage: null, batchScores: [] };
      }

      const studentId = student.student_id || student.id;
      if (!studentId) {
        console.warn('[StudentRepo:calculateSummarizedAttendanceScore] Student missing valid ID:', student);
        return { totalSessions: 0, presentCount: 0, absentCount: 0, lateCount: 0, percentage: null, batchScores: [] };
      }

      // Auto-prime from nested attendance if maps are empty for this student
      if (!this.attendanceMap.has(studentId)) {
        this.getAttendanceFromStudent(student);
      }

      const rawAllocations = student.allocations || student.BatchAllocation || [];
      const allocations = Array.isArray(rawAllocations) ? rawAllocations : [];

      const batchScores = allocations.map(alloc => {
        if (!alloc || typeof alloc !== 'object') return null;
        const bId = alloc.batch_id || alloc.batch?.batch_id;
        const bName = alloc.batch_name || alloc.batch?.batch_name || alloc.batch_id || 'Batch';
        const score = this.calculateBatchAttendanceScore(studentId, bId);

        return {
          batchId: bId || '—',
          batchName: bName,
          allocationId: alloc.allocation_id || alloc.id || '—',
          ...score
        };
      }).filter(Boolean);

      const allStudentRecords = this.attendanceMap.get(studentId) || [];
      if (!Array.isArray(allStudentRecords) || allStudentRecords.length === 0) {
        return {
          totalSessions: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          percentage: null,
          batchScores
        };
      }

      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLate = 0;

      allStudentRecords.forEach(r => {
        if (!r || !r.status) return;
        const s = String(r.status).toUpperCase();
        if (s === 'P' || s === 'PRESENT') totalPresent++;
        else if (s === 'L' || s === 'LATE') { totalPresent++; totalLate++; }
        else if (s === 'A' || s === 'ABSENT') totalAbsent++;
      });

      const totalSessions = allStudentRecords.length;
      const overallPercentage = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : null;

      console.debug(`[StudentRepo:calculateSummarizedAttendanceScore] Calculated score for ${studentId}: ${overallPercentage}% (${totalPresent}/${totalSessions})`);

      return {
        totalSessions,
        presentCount: totalPresent,
        absentCount: totalAbsent,
        lateCount: totalLate,
        percentage: overallPercentage,
        batchScores
      };
    } catch (error) {
      console.error('[StudentRepo:calculateSummarizedAttendanceScore] Error calculating summarized attendance:', {
        studentOrId,
        error: error.message,
        stack: error.stack
      });
      return { totalSessions: 0, presentCount: 0, absentCount: 0, lateCount: 0, percentage: null, batchScores: [] };
    }
  }
}

// Export singleton instance
export const studentRepo = new StudentRepo();
