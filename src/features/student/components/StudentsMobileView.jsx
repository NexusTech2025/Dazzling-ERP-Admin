import React, { useState, useCallback } from 'react';
import { StudentMobileCard } from './StudentMobileCard';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import { getStudentAllocationsViewModel } from '../utils/enrollmentCacheHelper';
import { useBatchesQuery } from '../../batch/hooks/useBatchQueries';
import { useCoursesQuery, useCourseTypesQuery } from '../../course/hooks/useCourseQueries';

/**
 * Renders a list of student cards optimized for mobile display with inline expandable bars.
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.students - Filtered and sorted students list.
 * @param {Array<string>} props.selectedIds - List of checked row IDs.
 * @param {Function} props.onSelectRow - Checkbox toggle callback.
 * @param {Object} props.handlers - User event trigger handler callbacks.
 * @returns {React.JSX.Element} Low-density mobile-optimized student card list.
 */
export function StudentsMobileView({
  students,
  selectedIds,
  onSelectRow,
  handlers
}) {
  const [expandedIds, setExpandedIds] = useState({});
  const [activeModalStudent, setActiveModalStudent] = useState(null);

  const { data: batches = [] } = useBatchesQuery();
  const { data: courses = [] } = useCoursesQuery();
  const { data: courseTypes = [] } = useCourseTypesQuery();

  const toggleExpand = useCallback((e, id) => {
    e.stopPropagation();
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const handleOpenAllocationsModal = useCallback((student) => {
    setActiveModalStudent(student);
  }, []);

  const isSelectionMode = selectedIds.length > 0;
  const activeAllocations = activeModalStudent 
    ? getStudentAllocationsViewModel(activeModalStudent, batches, courses, courseTypes) 
    : [];

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <StudentMobileCard
          key={student.student_id}
          student={student}
          batches={batches}
          courses={courses}
          courseTypes={courseTypes}
          isChecked={selectedIds.includes(student.student_id)}
          isExpanded={!!expandedIds[student.student_id]}
          isSelectionMode={isSelectionMode}
          onSelectRow={onSelectRow}
          onToggleExpand={toggleExpand}
          onOpenAllocationsModal={handleOpenAllocationsModal}
          handlers={handlers}
        />
      ))}

      {/* Top-Level Container Modal for Allocation Breakdown (Prevents Z-Index / Card Cropping Issues) */}
      {activeModalStudent && (
        <Modal
          isOpen={!!activeModalStudent}
          onClose={() => setActiveModalStudent(null)}
          size="lg"
        >
          <Modal.Header
            title={activeModalStudent.student_name || 'Student Allocations'}
            subtitle={`Allocated Courses & Batches • ID: ${activeModalStudent.student_id}`}
            icon="school"
            onClose={() => setActiveModalStudent(null)}
          />

          <Modal.Body className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing total <span className="font-bold text-slate-800 dark:text-white">{activeAllocations.length}</span> active course & batch allocations:
            </p>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {activeAllocations.map((alloc, idx) => (
                <div
                  key={alloc.allocationId || idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-2.5"
                >
                  {/* Allocation Status Header */}
                  <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 pb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      Allocation ID: {alloc.allocationId || '—'}
                    </span>
                    <Badge variant={alloc.status === 'active' ? 'success' : 'default'} className="scale-90 origin-right">
                      {(alloc.status || 'ACTIVE').toUpperCase()}
                    </Badge>
                  </div>

                  {/* Course & Batch Name Details (Names as Titles, IDs as Subtitles) */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Course Column */}
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-base">menu_book</span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-800 dark:text-white leading-snug">
                            {alloc.courseName || 'Unassigned Course'}
                          </span>
                          {alloc.courseTypeName && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-primary/10 text-primary border border-primary/20 shrink-0">
                              {alloc.courseTypeName}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          {alloc.courseId ? `ID: ${alloc.courseId}` : 'No Course ID'}
                        </span>
                      </div>
                    </div>

                    {/* Batch Column */}
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-base">groups</span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-white leading-snug">
                          {alloc.batchName || 'Unassigned Batch'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          {alloc.batchId ? `ID: ${alloc.batchId}` : 'No Batch ID'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>

          <Modal.Footer>
            <button
              type="button"
              onClick={() => setActiveModalStudent(null)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
