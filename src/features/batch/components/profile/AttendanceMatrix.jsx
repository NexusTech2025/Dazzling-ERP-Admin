import React, { useState } from 'react';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import DataTable from '../../../../components/ui/DataTable';
import { useBatchAttendanceQuery, useMarkAttendanceMutation } from '../../hooks/useAttendanceQueries';
import AttendanceSummaryCards from './AttendanceSummaryCards';
import AttendanceHistoryMatrix from './AttendanceHistoryMatrix';

const AttendanceMatrix = ({ batchId }) => {
  const [activeSubTab, setActiveSubTab] = useState('Registry'); // 'Registry' or 'Matrix'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: registry = [], isLoading } = useBatchAttendanceQuery(batchId, selectedDate);
  const markMutation = useMarkAttendanceMutation();

  const handleMark = (enrollmentId, studentId, status) => {
    markMutation.mutate({
      enrollment_id: enrollmentId,
      studentId,
      batchId,
      date: selectedDate,
      status,
      remarks: ''
    });
  };

  const columns = [
    {
      header: 'Roll #',
      accessor: 'roll_number',
      className: 'w-16 text-center font-mono font-bold text-text-secondary'
    },
    {
      header: 'Student Name',
      accessor: 'student_name',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-main dark:text-white">{row.student_name}</span>
          <span className="text-[10px] text-text-secondary uppercase tracking-tighter">{row.student_id}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={
          row.status === 'Present' ? 'success' : 
          row.status === 'Absent' ? 'danger' : 
          row.status === 'Late' ? 'warning' : 'default'
        }>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Mark Attendance',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => handleMark(row.enrollment_id, row.student_id, 'Present')}
            className={`size-8 rounded-lg flex items-center justify-center font-black text-xs transition-all ${
              row.status === 'Present' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-110' 
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 hover:bg-emerald-100'
            }`}
          >
            P
          </button>
          <button 
            onClick={() => handleMark(row.enrollment_id, row.student_id, 'Absent')}
            className={`size-8 rounded-lg flex items-center justify-center font-black text-xs transition-all ${
              row.status === 'Absent' 
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20 scale-110' 
                : 'bg-red-50 text-red-600 dark:bg-red-900/20 hover:bg-red-100'
            }`}
          >
            A
          </button>
          <button 
            onClick={() => handleMark(row.enrollment_id, row.student_id, 'Late')}
            className={`size-8 rounded-lg flex items-center justify-center font-black text-xs transition-all ${
              row.status === 'Late' 
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-110' 
                : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 hover:bg-amber-100'
            }`}
          >
            L
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation for Attendance */}
      <div className="flex gap-4 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button 
          onClick={() => setActiveSubTab('Registry')}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'Registry' 
              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
              : 'text-text-secondary hover:text-text-main'
          }`}
        >
          Daily Registry
        </button>
        <button 
          onClick={() => setActiveSubTab('Matrix')}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'Matrix' 
              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
              : 'text-text-secondary hover:text-text-main'
          }`}
        >
          History Matrix
        </button>
      </div>

      {activeSubTab === 'Registry' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AttendanceSummaryCards registry={registry} />
          
          <Card className="overflow-hidden border-2 border-primary/5">
            <div className="p-5 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-text-main dark:text-white">Daily Registry</h3>
                <p className="text-sm text-text-secondary font-medium">Session status for {new Date(selectedDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border-2 border-border-light dark:border-border-dark bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-bold text-text-main dark:text-white outline-none focus:border-primary transition-colors"
                />
                <button className="px-4 py-2 bg-slate-900 dark:bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
                  Mark All Present
                </button>
              </div>
            </div>
            
            <div className="relative">
              {markMutation.isPending && (
                <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="size-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
              <DataTable 
                data={registry}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No students found in this batch."
              />
            </div>
          </Card>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <AttendanceHistoryMatrix batchId={batchId} />
        </div>
      )}
    </div>
  );
};

export default AttendanceMatrix;
