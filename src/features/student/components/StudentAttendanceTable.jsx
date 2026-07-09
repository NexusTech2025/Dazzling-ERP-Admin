import React from 'react';
import { 
  TableContainer, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  TableLoading, 
  TableError, 
  TableEmpty 
} from '../../../components/ui/table';
import StudentTableRow from './StudentTableRow';

/**
 * StudentAttendanceTable: Renders the daily student attendance registry grid using atomic table primitives.
 * 
 * @param {Object} props - React props.
 * @param {string} props.title - Table header title.
 * @param {string} props.subtitle - Table header description.
 * @param {Array<Object>} props.students - Active list of student registers.
 * @param {boolean} props.isEditingDisabled - Read-only switch flag.
 * @param {Function} props.onStatusChange - Updates student attendance status.
 * @param {Function} props.onTimeChange - Updates entry or exit times.
 * @param {Function} props.onRemarksChange - Remarks blur update handler.
 * @param {Array<Object>} props.batches - List of batch details.
 * @param {boolean} props.isLoading - Fetch loading indicator.
 * @param {Object} props.error - Relational query exception details.
 * @param {Function} props.onRetry - Re-query handler.
 * @param {React.ReactNode} props.filters - Filters element grid.
 * @param {React.ReactNode} props.secondaryAction - Header supplementary buttons.
 */
export const StudentAttendanceTable = ({
  title,
  subtitle,
  students = [],
  isEditingDisabled,
  onStatusChange,
  onTimeChange,
  onRemarksChange,
  batches = [],
  isLoading,
  error,
  onRetry,
  filters,
  secondaryAction
}) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {secondaryAction}
        </div>
      </div>

      {/* Filters Section */}
      {filters && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 shadow-sm">
          {filters}
        </div>
      )}

      {/* Table Container Wrapper aligned with standard design tokens */}
      <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {isLoading ? (
          <TableLoading />
        ) : error ? (
          <TableError error={error} onRetry={onRetry} />
        ) : (
          <TableContainer>
            <TableHeader>
              <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                <TableHead align="center" className="w-16">Roll</TableHead>
                <TableHead>Student Details</TableHead>
                <TableHead align="center" className="w-44">Attendance Status</TableHead>
                <TableHead className="w-44">Check-In</TableHead>
                <TableHead className="w-44">Check-Out</TableHead>
                <TableHead>Remarks / Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                  <TableCell colSpan={6} align="center">
                    <TableEmpty message="No student records found for this batch on the selected date." icon="person_off" />
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <StudentTableRow
                    key={student.student_id}
                    student={student}
                    isEditingDisabled={isEditingDisabled}
                    onStatusChange={onStatusChange}
                    onTimeChange={onTimeChange}
                    onRemarksChange={onRemarksChange}
                    batches={batches}
                  />
                ))
              )}
            </TableBody>
          </TableContainer>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceTable;
