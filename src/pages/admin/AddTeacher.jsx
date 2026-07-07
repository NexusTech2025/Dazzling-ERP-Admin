import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { 
  useCreateTeacherMutation, 
  useTeacherDetailQuery, 
  useUpdateTeacherMutation,
  useTeacherSubjectsQuery,
  useTeacherSalaryConfigQuery,
  useTeacherDocumentsQuery
} from '../../features/teacher/hooks/useTeacherQueries';
import { useBranchesQuery } from '../../features/core/hooks/useBranchQueries';
import { useCoursesQuery } from '../../features/course/hooks/useCourseQueries';
import TeacherForm from '../../features/teacher/components/TeacherForm';
import APIErrorModal from '../../components/ui/APIErrorModal';
import ConfirmModal from '../../components/ui/ConfirmModal';

// Stable global reference allocation to prevent downstream drop-down jank
const EMPTY_FALLBACK_ARRAY = [];

/**
 * AddTeacher Page Controller: Manages state, queries, mutations, and orchestration for Faculty forms.
 * Refactored for render isolation, reference stability, and conditional modal portal mounts.
 */
const AddTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [fieldErrors, setFieldErrors] = useState({});
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: 'idle', // 'success' | 'error'
    error: null,
    resultMessage: ''
  });

  // Core Data Queries (Hooks handle conditional enabled check internally based on ID)
  const { data: existingTeacher, isLoading: isFetchingTeacher } = useTeacherDetailQuery(id);
  const { data: teacherSubjects, isLoading: isTeacherSubjectsLoading } = useTeacherSubjectsQuery(id);
  const { data: salaryConfig, isLoading: isSalaryConfigsLoading } = useTeacherSalaryConfigQuery(id);
  const { data: teacherDocs, isLoading: isTeacherDocsLoading } = useTeacherDocumentsQuery(id);

  // Selector Option Collections
  const { data: coursesData, isLoading: isCoursesLoading } = useCoursesQuery();
  const { data: branchesData, isLoading: isBranchesLoading } = useBranchesQuery();

  // Functional API Mutations
  const addMutation = useCreateTeacherMutation();
  const updateMutation = useUpdateTeacherMutation();

  // Stable navigation anchor path calculation
  const fallbackRedirectPath = useMemo(() => {
    return isEditMode ? `/admin/teachers/${id}` : '/admin/teachers';
  }, [isEditMode, id]);

  // Memoized submission processor targeting child lifecycle isolation
  const handleFormSubmit = useCallback(async (formData) => {
    setFieldErrors({});

    // Extract primary salary config from local array and transform keys
    const primarySalary = formData.salaryConfigs?.[0];

    const commonPayload = {
      full_name: formData.full_name,
      mobile_number: formData.mobile_number,
      email: formData.email || null,
      gender: formData.gender || null,
      date_of_birth: formData.date_of_birth || null,
      experience_years: parseInt(formData.experience_years, 10) || 0,
      qualification: formData.qualification || null,
      specialization: formData.specialization || null,
      previous_institute: formData.previous_institute || null,
      teacher_type: formData.teacher_type,
      joining_date: formData.joining_date,
      branch_id: formData.branch,
      address: formData.address || null,
      prefered_time_slot: formData.prefered_time_slot || null,
      profile_photo_url: formData.profile_photo_url || null,
      status: formData.status,
      notes: formData.internal_notes || null, // Map internal_notes → root notes key
      subjects: formData.subjects || [],       // Array of course ID strings
    };

    if (isEditMode) {
      const updateData = {
        ...commonPayload,
      };

      updateMutation.mutate({ id, data: updateData }, {
        onSuccess: (res) => {
          if (res.success) {
            setModalState({
              isOpen: true,
              status: 'success',
              resultMessage: `Faculty profile for "${formData.full_name}" was successfully updated.`
            });
          } else {
            setModalState({
              isOpen: true,
              status: 'error',
              error: res.error || { message: res.message || 'Failed to update profile.' }
            });
          }
        },
        onError: (err) => {
          console.error('[AddTeacher] Update Profile Error:', err);
          setModalState({ isOpen: true, status: 'error', error: err });
        }
      });
    } else {
      const requestPayload = {
        ...commonPayload,
        userData: formData.createLogin ? {
          username: formData.username || formData.full_name.toLowerCase().replace(/\s+/g, '_'),
          password: formData.password
        } : undefined,
        // camelCase → snake_case key transformation for the singular onboarding salary_config
        salary_config: primarySalary ? {
          salary_config_type: primarySalary.salaryConfigType,
          rate_type: primarySalary.rateType,
          base_value: Number(primarySalary.baseValue),
          scope_type: primarySalary.scopeType,
          scope_id: primarySalary.scopeId || null,
          effective_from: primarySalary.effectiveFrom,
          effective_to: primarySalary.effectiveTo || null,
          total_contract_value: primarySalary.totalContractValue ? Number(primarySalary.totalContractValue) : null,
          remark: primarySalary.remark || null,
          notes: primarySalary.notes || null,
          contract_status: primarySalary.contractStatus || 'drafted',
          settlement_state: primarySalary.settlementState || 'unsettled'
        } : undefined,
        // Sanitize documents to { file_url, document_type } structure
        documents: formData.documents?.map(doc => ({
          file_url: doc.file_url || doc.url,
          document_type: doc.document_type || 'other'
        })) || []
      };

      console.log('[AddTeacher] Submitting onboard request:', requestPayload);
      addMutation.mutate(requestPayload, {
        onSuccess: (res) => {
          console.log('[AddTeacher] Onboard API Response:', res);
          if (res.success) {
            setModalState({
              isOpen: true,
              status: 'success',
              resultMessage: `Faculty "${formData.full_name}" was successfully registered.`
            });
          } else {
            const err = res.error;
            if (err?.type === 'ValidationError' && err.details?.fields) {
              const errorsMap = {};
              err.details.fields.forEach((item) => {
                errorsMap[item.field] = item.message;
              });
              setFieldErrors(errorsMap);
            }
            setModalState({
              isOpen: true,
              status: 'error',
              error: err || { message: res.message || 'Failed to register faculty.' }
            });
          }
        },
        onError: (err) => {
          console.error('[AddTeacher] Onboard Error:', err);
          setModalState({ isOpen: true, status: 'error', error: err });
        }
      });
    }
  }, [isEditMode, id, addMutation, updateMutation]);

  // Stable handler wrapping dialogue confirmation loops
  const handleDismissModals = useCallback(() => {
    const isSuccess = modalState.status === 'success';
    setModalState({ isOpen: false, status: 'idle', error: null, resultMessage: '' });
    if (isSuccess) {
      navigate(fallbackRedirectPath);
    }
  }, [modalState.status, navigate, fallbackRedirectPath]);

  // Stable handle cancellation execution path 
  const handleCancelForm = useCallback(() => {
    navigate(fallbackRedirectPath);
  }, [navigate, fallbackRedirectPath]);

  // Map subjects array data mapping references cleanly
  const mappedSubjects = useMemo(() => {
    return teacherSubjects?.map(ts => ts.subject_id) || EMPTY_FALLBACK_ARRAY;
  }, [teacherSubjects]);

  if (isEditMode && isFetchingTeacher) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <TeacherForm
        teacher={existingTeacher}
        subjects={mappedSubjects}
        salaryConfig={salaryConfig}
        documents={teacherDocs}
        courses={coursesData || EMPTY_FALLBACK_ARRAY}
        branches={branchesData || EMPTY_FALLBACK_ARRAY}
        isBranchesLoading={isBranchesLoading}
        isDataLoading={isTeacherSubjectsLoading || isSalaryConfigsLoading || isTeacherDocsLoading || isCoursesLoading}
        isSubmitting={addMutation.isPending || updateMutation.isPending}
        error={modalState.status === 'error' ? (modalState.error?.message || 'Action failed.') : null}
        fieldErrors={fieldErrors}
        onSubmit={handleFormSubmit}
        onCancel={handleCancelForm}
      />

      {/* Strict Short-Circuit Conditional Modals Portals Mount Implementation */}
      {modalState.isOpen && modalState.status === 'success' && (
        <ConfirmModal 
          isOpen={true}
          onClose={handleDismissModals}
          onConfirm={handleDismissModals}
          status="success"
          title={isEditMode ? "Profile Updated Successfully" : "Faculty Registered Successfully"}
          resultMessage={modalState.resultMessage}
        />
      )}

      {modalState.isOpen && modalState.status === 'error' && (
        <APIErrorModal 
          isOpen={true}
          onClose={handleDismissModals}
          title={isEditMode ? "Profile Update Error" : "Faculty Registration Error"}
          error={modalState.error}
        />
      )}
    </>
  );
};

export default AddTeacher;