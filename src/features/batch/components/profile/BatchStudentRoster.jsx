import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import DataTable from '../../../../components/ui/DataTable';
import { SearchInput } from '../../../../components/ui/filters';
import { createStudentColumns } from '../../../../pages/admin/schemas/studentSchema';
import { useBatchStudentsQuery } from '../../hooks/useBatchQueries';
import useIsMobile from '../../../../hooks/useIsMobile';
import ExpandableLowDensityCard from '../../../../components/ui/v2/cards/ExpandableLowDensityCard';
import { Badge } from '../../../../components/ui/v2/indicators';

const BatchStudentRoster = ({ batchId }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState({});
  const isMobile = useIsMobile();

  const { data: students = [], isLoading } = useBatchStudentsQuery(batchId, searchQuery);

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlers = useMemo(() => ({
    onView: (student) => navigate(`/admin/students/${student.student_id}`),
    onEdit: (student) => navigate(`/admin/students/edit/${student.student_id}`),
    onDelete: (id, name) => {
      // Stub navigation or modal trigger if deletion is required inside batch
      console.log('Remove student from batch:', id, name);
    }
  }), [navigate]);

  const columns = useMemo(() => createStudentColumns(handlers), [handlers]);

  // Mobile View Render Block
  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {/* Mobile Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-main dark:text-white leading-tight">Enrolled Students</h3>
              <p className="text-[10px] text-text-secondary">Roster Directory ({students.length} Total)</p>
            </div>
            <button className="flex items-center justify-center gap-1.5 rounded-lg h-9 px-3 bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-dark transition-all">
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Add Student</span>
            </button>
          </div>
          <div className="w-full">
            <SearchInput 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search in batch..."
            />
          </div>
        </div>

        {/* Mobile Cards List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-xs text-text-secondary">Loading roster...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-xs text-text-secondary">
            No students enrolled in this batch.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {students.map((student) => {
              const isExpanded = !!expandedIds[student.student_id];
              const initials = (student.student_name || student.name || 'ST')
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();

              const statusColor = student.status === 'active' 
                ? 'success' 
                : student.status === 'applicant' 
                  ? 'primary' 
                  : 'default';

              const leftHeader = (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 select-none">
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="font-bold text-text-main dark:text-white text-xs truncate">
                      {student.student_name || student.name || 'Anonymous Student'}
                    </span>
                    <span className="text-[10px] text-text-secondary font-medium">
                      {student.phone || 'No phone number'}
                    </span>
                    <div className="mt-0.5">
                      <Badge
                        variant="status"
                        color={statusColor}
                        content={student.status || 'active'}
                        size="sm"
                        className="scale-90 origin-left py-0"
                      />
                    </div>
                  </div>
                </div>
              );

              const rightHeader = (
                <div className="flex flex-col items-end gap-1 shrink-0 leading-tight">
                  <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">
                    {student.attendance_percentage || 94}% Attendance
                  </span>
                  {student.outstanding_balance > 0 ? (
                    <span className="text-[10px] text-rose-500 font-bold">
                      ₹{student.outstanding_balance.toLocaleString()} Due
                    </span>
                  ) : (
                    <span className="text-[9px] text-emerald-500 font-bold">
                      No Dues
                    </span>
                  )}
                </div>
              );

              const expandedContent = (
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-text-secondary text-[10px]">
                    <div>
                      <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Email Address</span>
                      <span className="font-semibold text-text-main dark:text-white truncate block">{student.email || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Student Identifier</span>
                      <span className="font-semibold text-text-main dark:text-white font-mono">{student.student_id}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-light/50 dark:border-border-dark/50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlers.onView(student);
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-main dark:text-white text-[10px] font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">person</span>
                      Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlers.onEdit(student);
                      }}
                      className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlers.onDelete(student.student_id, student.student_name);
                      }}
                      className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                      Remove
                    </button>
                  </div>
                </>
              );

              return (
                <ExpandableLowDensityCard
                  key={student.student_id}
                  isExpanded={isExpanded}
                  onToggleExpand={(e) => toggleExpand(e, student.student_id)}
                  onCardClick={() => handlers.onView(student)}
                  leftHeader={leftHeader}
                  rightHeader={rightHeader}
                  expandedContent={expandedContent}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Desktop View Render Block
  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-main dark:text-white leading-tight">Enrolled Students</h3>
          <p className="text-sm text-text-secondary">Manage student roster ({students.length} Total)</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search in batch..."
            />
          </div>
          <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-dark transition-all whitespace-nowrap">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span className="hidden sm:inline">Add Student</span>
          </button>
        </div>
      </div>
      <DataTable 
        data={students}
        columns={columns}
        isLoading={isLoading}
      />
    </Card>
  );
};

export default BatchStudentRoster;
