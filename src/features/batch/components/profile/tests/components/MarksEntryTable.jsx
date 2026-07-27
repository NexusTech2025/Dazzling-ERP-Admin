import React, { useState } from 'react';
import MarksEntryRow from './MarksEntryRow';
import TextInput from '../../../../../../components/ui/v2/TextInput';

export default function MarksEntryTable({
  students = [],
  marksState = {},
  totalMarks = 100,
  onMarkChange
}) {
  const [filterQuery, setFilterQuery] = useState('');

  const getStudentId = (student) => student?.student_id || student?.id || student?.allocation_id || '';
  const getStudentName = (student) => student?.student?.student_name || student?.student_name || '';

  const filteredStudents = students.filter(s =>
    getStudentName(s).toLowerCase().includes(filterQuery.toLowerCase()) ||
    getStudentId(s).toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden space-y-4 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <TextInput
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search student by name or ID..."
            startIcon="search"
          />
        </div>
        <div className="text-xs text-text-secondary">
          Showing <span className="font-semibold text-text-main dark:text-white">{filteredStudents.length}</span> of {students.length} students
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark bg-surface-light/80 dark:bg-surface-dark/80 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Obtained Marks</th>
              <th className="px-4 py-3 text-center">Absent</th>
              <th className="px-4 py-3">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-text-secondary">
                  No students found matching your search.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => {
                const sId = getStudentId(student);
                return (
                  <MarksEntryRow
                    key={sId}
                    index={idx}
                    student={student}
                    markData={marksState[sId] || { student_id: sId, obtained_marks: '', is_absent: false, remarks: '' }}
                    totalMarks={totalMarks}
                    onChange={onMarkChange}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
