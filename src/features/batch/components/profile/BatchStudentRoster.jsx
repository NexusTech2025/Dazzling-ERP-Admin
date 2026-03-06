import React, { useState, useMemo } from 'react';
import Card from '../../../../components/ui/Card';
import DataTable from '../../../../components/ui/DataTable';
import { SearchInput } from '../../../../components/ui/filters';

const BatchStudentRoster = ({ students, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const name = s.student_name || '';
      const id = s.enrollment_id || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             id.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [students, searchQuery]);

  const columns = [
    {
      header: 'Student Name',
      accessor: 'student_name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs uppercase">
            {row.student_name ? row.student_name.substring(0, 2) : '??'}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-text-main dark:text-white">{row.student_name}</span>
            <span className="text-xs text-text-secondary">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Enrollment ID',
      accessor: 'enrollment_id',
      className: 'font-mono text-xs font-medium text-text-secondary'
    },
    {
      header: 'Contact Info',
      accessor: 'phone',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm text-text-main dark:text-slate-300">{row.phone}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <button className="p-1.5 text-text-secondary hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>
      )
    }
  ];

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
        data={filteredStudents}
        columns={columns}
        isLoading={isLoading}
      />
    </Card>
  );
};

export default BatchStudentRoster;
