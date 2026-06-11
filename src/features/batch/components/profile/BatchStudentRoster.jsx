import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import DataTable from '../../../../components/ui/DataTable';
import { SearchInput } from '../../../../components/ui/filters';
import { createStudentColumns } from '../../../../pages/admin/schemas/studentSchema';
import { useBatchStudentsQuery } from '../../hooks/useBatchQueries';

const BatchStudentRoster = ({ batchId }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: students = [], isLoading } = useBatchStudentsQuery(batchId, searchQuery);

  const handlers = useMemo(() => ({
    onView: (student) => navigate(`/admin/students/${student.student_id}`)
  }), [navigate]);

  const columns = useMemo(() => createStudentColumns(handlers), [handlers]);

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
