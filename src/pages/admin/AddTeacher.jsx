import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useCreateTeacherMutation, 
  useTeacherDetailQuery, 
  useUpdateTeacherMutation,
  useTeacherSubjectsQuery,
  useTeacherSalaryConfigQuery,
  useTeacherDocumentsQuery,
  useAssignTeacherSubjectsMutation,
  useSetTeacherSalaryConfigMutation
} from '../../features/teacher/hooks/useTeacherQueries';
import { useBranchesQuery } from '../../features/core/hooks/useBranchQueries';
import { useCoursesQuery } from '../../features/course/hooks/useCourseQueries';
import TeacherForm from '../../features/teacher/components/TeacherForm';

/**
 * AddTeacher Page Controller: Manages state, queries, mutations, and orchestration for Faculty forms.
 * Delegates form display and validation to the decoupled TeacherForm component.
 */
const AddTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Core Queries
  const { data: existingTeacher, isLoading: isFetchingTeacher } = useTeacherDetailQuery(id);
  const { data: teacherSubjects, isLoading: isTeacherSubjectsLoading } = useTeacherSubjectsQuery(id);
  const { data: salaryConfig, isLoading: isSalaryConfigsLoading } = useTeacherSalaryConfigQuery(id);
  const { data: teacherDocs, isLoading: isTeacherDocsLoading } = useTeacherDocumentsQuery(id);

  // Options Queries
  const { data: coursesData, isLoading: isCoursesLoading } = useCoursesQuery();
  const { data: branchesData, isLoading: isBranchesLoading } = useBranchesQuery();

  // Mutations
  const addMutation = useCreateTeacherMutation();
  const updateMutation = useUpdateTeacherMutation();
  const assignSubjectsMutation = useAssignTeacherSubjectsMutation();
  const setSalaryConfigMutation = useSetTeacherSalaryConfigMutation();

  const handleFormSubmit = async (formData) => {
    setError(null);
    setFieldErrors({});

    if (isEditMode) {
      // Prepare unified update payload
      const updateData = {
        full_name: formData.full_name,
        mobile_number: formData.mobile_number,
        email: formData.email || null,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth || null,
        profile_photo_url: formData.profile_photo_url || null,
        experience_years: parseInt(formData.experience_years, 10) || 0,
        qualification: formData.qualification || null,
        specialization: formData.specialization || null,
        previous_institute: formData.previous_institute || null,
        teacher_type: formData.teacher_type,
        joining_date: formData.joining_date,
        branch_id: formData.branch,
        address: formData.address || null,
        status: formData.status,
        notes: formData.internal_notes || null,
        subjects: formData.subjects || [],
        salary_config: {
          salary_type: formData.salary_type.toLowerCase() === 'monthly' ? 'monthly' : 'per_class',
          base_amount: parseFloat(formData.base_salary) || 0,
          effective_from: formData.joining_date || new Date().toISOString().split('T')[0]
        },
        prefered_time_slot: Array.isArray(formData.time_slots) ? formData.time_slots[0] : formData.time_slots
      };

      updateMutation.mutate({ id, data: updateData }, {
        onSuccess: (res) => {
          if (res.success) {
            navigate(`/admin/teachers/${id}`);
          } else {
            setError(res.message || 'Failed to update profile.');
          }
        },
        onError: (err) => {
          console.error('[AddTeacher] Update Profile Error:', err);
          setError(err.message || 'Server error while updating profile.');
        }
      });
    } else {
      // New registration payload aligned with staff_onboard_teacher API
      const requestPayload = {
        full_name: formData.full_name,
        mobile_number: formData.mobile_number,
        email: formData.email || null,
        experience_years: parseInt(formData.experience_years, 10) || 0,
        qualification: formData.qualification || null,
        teacher_type: formData.teacher_type,
        joining_date: formData.joining_date,
        branch_id: formData.branch,
        address: formData.address || null,
        status: formData.status,
        subjects: formData.subjects,
        userData: formData.createLogin ? {
          username: formData.username || formData.full_name.toLowerCase().replace(/\s+/g, '_'),
          password: formData.password
        } : undefined,
        salary_config: {
          salary_type: formData.salary_type.toLowerCase() === 'monthly' ? 'monthly' : 'per_class',
          base_amount: parseFloat(formData.base_salary) || 0,
          effective_from: formData.joining_date
        },
        documents: formData.profile_photo_url ? [
          {
            document_type: "id_proof", 
            file_url: formData.profile_photo_url
          }
        ] : []
      };

      addMutation.mutate(requestPayload, {
        onSuccess: (res) => {
          if (res.success) {
            navigate('/admin/teachers');
          } else {
            const err = res.error;
            if (err?.type === 'ValidationError' && err.details?.fields) {
              const errorsMap = {};
              err.details.fields.forEach((item) => {
                errorsMap[item.field] = item.message;
              });
              setFieldErrors(errorsMap);
              setError(err.message || 'Please fix the errors highlighted below.');
            } else {
              setError(res.message || err?.message || 'Failed to register faculty.');
            }
          }
        },
        onError: (err) => {
          console.error('[AddTeacher] Onboard Error:', err);
          setError(err.message || 'Server error while onboarding teacher.');
        }
      });
    }
  };

  if (isEditMode && isFetchingTeacher) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Map subjects to only IDs if fetched
  const mappedSubjects = useMemo(() => {
    return teacherSubjects?.map(ts => ts.subject_id) || [];
  }, [teacherSubjects]);

  return (
    <TeacherForm
      teacher={existingTeacher}
      subjects={mappedSubjects}
      salaryConfig={salaryConfig}
      documents={teacherDocs}
      courses={coursesData || []}
      branches={branchesData || []}
      isBranchesLoading={isBranchesLoading}
      isDataLoading={isTeacherSubjectsLoading || isSalaryConfigsLoading || isTeacherDocsLoading}
      isSubmitting={addMutation.isPending || updateMutation.isPending}
      error={error}
      fieldErrors={fieldErrors}
      onSubmit={handleFormSubmit}
      onCancel={() => navigate(isEditMode ? `/admin/teachers/${id}` : '/admin/teachers')}
    />
  );
};

export default AddTeacher;