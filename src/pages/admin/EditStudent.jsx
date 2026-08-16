import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudentsQuery, useUpdateStudentProfileMutation } from '../../features/student/hooks/useStudentQueries';
import StudentUpdateProfileForm from '../../features/student/components/profile/StudentUpdateProfileForm';

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: students = [], isLoading } = useStudentsQuery();
  const updateProfileMutation = useUpdateStudentProfileMutation();

  const student = students.find(s => s.student_id === id);

  const handleSave = (payload) => {
    updateProfileMutation.mutate(
      { payload },
      {
        onSuccess: () => {
          navigate(`/admin/students/${id}`);
        }
      }
    );
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-text-secondary flex flex-col items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary mb-2">sync</span>
        <p className="text-xs font-bold">Loading student profile data...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-text-secondary flex flex-col items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-4xl text-danger mb-2">error</span>
        <p className="text-sm font-bold text-text-main dark:text-white">Student not found ({id})</p>
        <button
          type="button"
          onClick={() => navigate('/admin/students')}
          className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          Return to Students Directory
        </button>
      </div>
    );
  }

  return (
    <StudentUpdateProfileForm
      student={student}
      onClose={handleClose}
      onSave={handleSave}
      isSubmitting={updateProfileMutation.isPending}
    />
  );
}
