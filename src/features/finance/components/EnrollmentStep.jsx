import React, { useState, useMemo } from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import { SearchInput, SelectFilter } from '../../../components/ui/filters';
import { SelectedStudentCard } from './StudentCards';
import { ProgramSelectionCard } from './ProgramCards';
import RecentlyAdmitted from './RecentlyAdmitted';
import StudentDetailModal from '../../student/components/StudentDetailModal';
import StudentEditModal from '../../student/components/StudentEditModal';
import { useUpdateStudentMutation } from '../../student/hooks/useStudentQueries';

const EnrollmentStep = ({ 
  enrollment, 
  students, 
  courses, 
  coursesLoading, 
  onUpdateEnrollment 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showStudentTable, setShowTable] = useState(!enrollment.studentId);
  
  // Modal State
  const [selectedStudentForView, setSelectedStudentForView] = useState(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);
  
  const updateStudentMutation = useUpdateStudentMutation();

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const name = s.student_name || '';
      const id = s.student_id || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const recentStudents = useMemo(() => students.slice(0, 4), [students]);

  const selectStudent = (s) => {
    onUpdateEnrollment({ 
      studentId: s.student_id, 
      studentName: s.student_name,
      email: s.email,
      phone: s.phone,
      avatar: s.avatar
    });
    setShowTable(false);
  };

  const handleSaveStudent = (updatedData) => {
    updateStudentMutation.mutate({ 
      id: updatedData.student_id, 
      data: updatedData 
    }, {
      onSuccess: () => {
        setSelectedStudentForEdit(null);
        // If the updated student is the currently selected one in the wizard, update it too
        if (enrollment.studentId === updatedData.student_id) {
          onUpdateEnrollment({
            studentName: updatedData.student_name,
            email: updatedData.email,
            phone: updatedData.phone
          });
        }
      }
    });
  };

  const studentColumns = [
    {
      header: 'Student',
      accessor: 'student_name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {row.student_name ? row.student_name.substring(0, 2).toUpperCase() : '??'}
          </div>
          <div>
            <div className="font-bold text-text-main dark:text-white">{row.student_name}</div>
            <div className="text-[10px] text-text-secondary uppercase font-bold tracking-tight">ID: {row.student_id}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge variant={row.status === 'active' ? 'success' : 'default'}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => setSelectedStudentForView(row)}
            className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            title="View Details"
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </button>
          <button 
            onClick={() => setSelectedStudentForEdit(row)}
            className="p-1.5 text-text-secondary hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Edit Profile"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button 
            onClick={() => selectStudent(row)}
            className="ml-2 px-4 py-1.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-lg shadow-sm hover:bg-primary-dark transition-all active:scale-95"
          >
            Select
          </button>
        </div>
      )
    }
  ];

  const studentFilters = (
    <>
      <div className="md:col-span-8">
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search student by name or ID..."
        />
      </div>
      <div className="md:col-span-4">
        <SelectFilter 
          value={statusFilter}
          onChange={setStatusFilter}
          options={['active', 'inactive']}
          defaultLabel="All Statuses"
        />
      </div>
    </>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-3 space-y-8">
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-text-main dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_search</span>
              1. Select Student
            </h3>
            {enrollment.studentId && (
              <button 
                onClick={() => setShowTable(!showStudentTable)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {showStudentTable ? 'visibility_off' : 'swap_horiz'}
                </span>
                {showStudentTable ? 'Hide Table' : 'Change Student'}
              </button>
            )}
          </div>

          <div className={`${showStudentTable ? 'block' : 'hidden'}`}>
            <DataTable 
              data={filteredStudents}
              columns={studentColumns}
              filters={studentFilters}
              isLoading={false}
              emptyMessage="No students match your search."
            />
          </div>

          {!showStudentTable && enrollment.studentId && (
            <SelectedStudentCard 
              student={{
                ...enrollment,
                student_name: enrollment.studentName
              }} 
              onClear={() => {
                onUpdateEnrollment({ studentId: null, studentName: '' });
                setShowTable(true);
              }} 
            />
          )}
        </div>

        {enrollment.studentId && (
          <div className="space-y-4 pt-6 border-t border-border-light dark:border-border-dark animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-text-main dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500">school</span>
                2. Select Enrollment Program
              </h3>
              <Badge variant="primary">Academic Year 2026</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {coursesLoading ? (
                [1,2].map(i => <div key={i} className="h-20 bg-background-light dark:bg-background-dark animate-pulse rounded-xl border border-border-light dark:border-border-dark"></div>)
              ) : (
                courses.map(course => (
                  <ProgramSelectionCard 
                    key={course.course_id}
                    program={{
                      id: course.course_id,
                      name: course.name,
                      base_fee: course.base_fee || 0,
                      batch: '2026 January Batch',
                      type: 'Full-time',
                      icon: 'data_object'
                    }}
                    isSelected={enrollment.programId === course.course_id}
                    onSelect={(p) => onUpdateEnrollment({ 
                      programId: p.id, 
                      programName: p.name,
                      programBaseFee: p.base_fee 
                    })}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-1 border-l border-border-light dark:border-border-dark pl-8 hidden lg:block">
        <RecentlyAdmitted 
          students={recentStudents} 
          onSelect={selectStudent}
        />
      </div>

      {/* Modals */}
      <StudentDetailModal 
        isOpen={!!selectedStudentForView}
        onClose={() => setSelectedStudentForView(null)}
        student={selectedStudentForView}
      />
      <StudentEditModal 
        isOpen={!!selectedStudentForEdit}
        onClose={() => setSelectedStudentForEdit(null)}
        student={selectedStudentForEdit}
        onSave={handleSaveStudent}
      />
    </div>
  );
};

export default EnrollmentStep;
