/**
 * @file useBatchFilters.js
 * @module BatchFilters
 * @description Client-side relational join engine and multi-stage filter transformation hook
 * for student attendance. Consumes pre-fetched datasets from the cache layer and performs
 * memory-efficient map joins across Student, Batch, BatchAllocation, and Course records.
 *
 * Intentionally stateless — all computation is driven by the input arguments.
 * Mount this hook inside any view that needs a filtered student matrix keyed by batch membership.
 */

import { useMemo } from 'react';

/**
 * Computes a filtered student attendance matrix by performing single-pass client-side grouping
 * and joins across Student, Batch, BatchAllocation, and Course datasets using fast HashMap lookups.
 *
 * @function useBatchFilters
 * @param {Object} datasets - Pre-fetched raw datasets from the React Query cache layer.
 * @param {Array<Object>} datasets.students - Flat array of Student records.
 * @param {Array<Object>} datasets.batches - Flat (or hydrated) array of Batch records.
 * @param {Array<Object>} datasets.batchAllocations - Flat array of BatchAllocation records.
 * @param {Array<Object>} datasets.courses - Flat array of Course records with parsed metadata.
 * @param {Object} [filters={}] - Active selection criteria for filtering the output matrix.
 * @param {string} [filters.selectedBatchId] - Active batch identifier (pass 'all' or omit to skip).
 * @param {string} [filters.classFilter] - Class level value from course.metadata.class.
 * @param {string} [filters.boardFilter] - Board value from course.metadata.board.
 * @param {string} [filters.segmentFilter] - Batch type toggle (e.g. 'Academy', 'Computer').
 * @returns {{
 *   studentsGrid: Array<Object>,
 *   menus: { batches: Array<Object>, classes: Array<string>, boards: Array<string>, segments: Array<string> }
 * }} Computed grid and filter menu datasets, memoized against input changes.
 */
export function useBatchFilters({ students = [], batches = [], batchAllocations = [], courses = [] }, filters = {}) {
  const { selectedBatchId, classFilter, boardFilter, segmentFilter } = filters;

  return useMemo(() => {
    // 1. Build fast O(1) lookup tables
    const studentMap = new Map(students.map(s => [s.student_id, s]));
    const batchMap = new Map(batches.map(b => [b.batch_id, b]));
    const courseMap = new Map(courses.map(c => [c.course_id, c]));


    // 2. Group and join active allocations by batch in a single pass
    const allocationsByBatch = new Map(); // batch_id -> Array of joined student records



    batchAllocations.forEach((alloc) => {
      if (alloc.status !== 'active') return;

      const student = studentMap.get(alloc.student_id);
      const batch = batchMap.get(alloc.batch_id);
      if (!student || !batch) return;

      const course = courseMap.get(batch.course_id);

      let list = allocationsByBatch.get(alloc.batch_id);
      if (!list) {
        list = [];
        allocationsByBatch.set(alloc.batch_id, list);
      }

      list.push({
        ...student,
        allocation_id: alloc.allocation_id,
        batch_id: alloc.batch_id,
        batch_name: batch.batch_name || 'Unassigned Batch',
        batch_type: batch.batch_type || 'Unknown Segment',
        class_level: course?.metadata?.class || null,
        board: course?.metadata?.board || null,
      });
    });

    // console.log("batchAllocations", allocationsByBatch);

    // 3. Filter to batches with active enrollment count > 1
    console.log("all batches: ", batches)
    const activeBatchesMenu = batches.filter(
      (b) => b.status === 'active' && (allocationsByBatch.get(b.batch_id)?.length || 0) >= 1
    );

    batches.forEach((b) => {
      console.log({ is_active: b.status, batch_name: b.batch_name, length: allocationsByBatch.get(b.batch_id)?.length || 0 })
    })

    // console.log("active batch menu: ", activeBatchesMenu)

    // 4. Extract distinct class levels and board values from course metadata
    const activeCourseIds = new Set(activeBatchesMenu.map(b => b.course_id));
    const activeCourses = courses.filter(c => activeCourseIds.has(c.course_id));

    const classFilterMenu = Array.from(
      new Set(activeCourses.map(c => c.metadata?.class).filter(Boolean))
    ).sort((a, b) => Number(b) - Number(a));

    // console.log("Active Classes: ", classFilterMenu)

    const boardFilterMenu = Array.from(
      new Set(activeCourses.map(c => c.metadata?.board).filter(Boolean))
    ).sort();

    // 5. Get initial student matrix (instant batch lookup or flatten all)
    let studentMatrix = [];
    if (selectedBatchId && selectedBatchId !== 'all') {
      studentMatrix = allocationsByBatch.get(selectedBatchId) || [];
    } else {
      for (const list of allocationsByBatch.values()) {
        studentMatrix.push(...list);
      }
    }

    // 6. Apply runtime selection filters (class level, board, segment)
    if (classFilter) studentMatrix = studentMatrix.filter((r) => r.class_level === classFilter);
    if (boardFilter) studentMatrix = studentMatrix.filter((r) => r.board === boardFilter);
    if (segmentFilter) studentMatrix = studentMatrix.filter((r) => r.batch_type === segmentFilter);

    return {
      studentsGrid: studentMatrix,
      menus: {
        batches: activeBatchesMenu,
        classes: classFilterMenu,
        boards: boardFilterMenu,
        segments: ['Academy', 'Computer', 'Foundation', 'Competitive'],
      },
    };
  }, [students, batches, batchAllocations, courses, selectedBatchId, classFilter, boardFilter, segmentFilter]);
}
