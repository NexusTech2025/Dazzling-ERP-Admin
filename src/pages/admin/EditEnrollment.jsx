import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useEnrollmentsQuery,
  useUpdateEnrollmentMutation,
  useDiscardEnrollmentMutation,
  useMigrateEnrollmentMutation
} from '../../features/student/hooks/useEnrollmentQueries';
import { useStudentsQuery } from '../../features/student/hooks/useStudentQueries';
import { useBatchesQuery, useBatchAllocationsQuery } from '../../features/batch/hooks/useBatchQueries';
import { useCoursesQuery } from '../../features/course/hooks/useCourseQueries';
import { usePackagesQuery } from '../../features/course/hooks/usePackageQueries';
import { EMPTY_FILTER } from '../../lib/react-query/queryKeys';

import StudentUpdateEnrollmentForm from '../../features/student/components/profile/StudentUpdateEnrollmentForm';
import DiscardEnrollmentDrawer from '../../features/student/components/profile/drawers/DiscardEnrollmentDrawer';
import MigrateEnrollmentDrawer from '../../features/student/components/profile/drawers/MigrateEnrollmentDrawer';
import ResponseModal from '../../components/ui/ResponseModal';
import APIErrorModal from '../../components/ui/APIErrorModal';

/**
 * Container / Page Controller component for Student Enrollment Update feature.
 * Registered under route path `/admin/students/:studentId/enrollments/:enrollmentId/edit`.
 */
export default function EditEnrollment() {
  const { studentId, enrollmentId } = useParams();
  const navigate = useNavigate();

  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [isMigrateOpen, setIsMigrateOpen] = useState(false);

  // ResponseModal & APIErrorModal states
  const [responseModalState, setResponseModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
    onCloseCallback: null
  });

  const [apiErrorState, setApiErrorState] = useState({
    isOpen: false,
    error: null
  });

  const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useEnrollmentsQuery();
  const { data: students = [], isLoading: isStudentsLoading } = useStudentsQuery();
  const { data: batches = [], isLoading: isBatchesLoading } = useBatchesQuery();
  const { data: courses = [] } = useCoursesQuery();
  const { data: packages = [] } = usePackagesQuery();

  // Fetch target batch allocations matching enrollment_id via queryKeys.batch_allocation.list
  const { data: batchAllocations = [], isLoading: isAllocationsLoading } = useBatchAllocationsQuery(
    enrollmentId ? { enrollment_id: enrollmentId } : EMPTY_FILTER,
    { enabled: !!enrollmentId }
  );

  const updateEnrollmentMutation = useUpdateEnrollmentMutation();
  const discardMutation = useDiscardEnrollmentMutation();
  const migrateMutation = useMigrateEnrollmentMutation();

  const isLoading = isEnrollmentsLoading || isStudentsLoading || isBatchesLoading || isAllocationsLoading;

  const student = useMemo(() => {
    return students.find(s => (s.student_id || s.id) === studentId);
  }, [students, studentId]);

  const enrollment = useMemo(() => {
    const rawEnr = enrollments.find(e => (e.enrollment_id || e.id) === enrollmentId);
    if (!rawEnr) return null;

    const rawEnrAllocs = (Array.isArray(rawEnr.allocations) && rawEnr.allocations.length > 0)
      ? rawEnr.allocations
      : ((Array.isArray(student?.allocations) && student.allocations.length > 0)
        ? student.allocations.filter(a => (a.enrollment_id || a.enrollment?.enrollment_id) === enrollmentId)
        : batchAllocations.filter(a => (a.enrollment_id || a.enrollment?.enrollment_id || a.enrollmentId) === enrollmentId));

    const finalAllocs = rawEnrAllocs.length > 0 ? rawEnrAllocs : batchAllocations;

    return {
      ...rawEnr,
      allocations: finalAllocs
    };
  }, [enrollments, enrollmentId, student, batchAllocations]);

  // Handler for standard Enrollment Update
  const handleSave = (payload) => {
    updateEnrollmentMutation.mutate(payload, {
      onSuccess: (response) => {
        setResponseModalState({
          isOpen: true,
          title: 'Enrollment Saved',
          message: `Enrollment contract [${enrollmentId}] has been updated successfully.`,
          type: 'success',
          onCloseCallback: () => navigate(`/admin/students/${studentId}`)
        });
      },
      onError: (error) => {
        setApiErrorState({
          isOpen: true,
          error: error?.message || error
        });
      }
    });
  };

  // Handler for Discard Enrollment Action
  const handleDiscard = (payload) => {
    console.log('[EditEnrollment] Executing Discard:', payload);
    discardMutation.mutate(payload, {
      onSuccess: (response) => {
        setIsDiscardOpen(false);
        const resData = response.data?.data || {};
        const refundMsg = resData.discard_mode === 'refund'
          ? `Full refund of ₹${resData.refund_amount || 0} issued.`
          : 'Account closed without refund.';

        setResponseModalState({
          isOpen: true,
          title: 'Enrollment Discarded',
          message: `Enrollment [${payload.enrollment_id}] has been discarded. ${refundMsg}`,
          type: 'success',
          onCloseCallback: () => navigate(`/admin/students/${studentId}`)
        });
      },
      onError: (error) => {
        setIsDiscardOpen(false);
        setApiErrorState({
          isOpen: true,
          error: error?.message || error
        });
      }
    });
  };

  // Handler for Migrate Enrollment Action
  const handleMigrate = (payload) => {
    console.log('[EditEnrollment] Executing Migration:', payload);
    migrateMutation.mutate(payload, {
      onSuccess: (response) => {
        setIsMigrateOpen(false);
        const newContractId = response.data?.data?.new_contract?.enrollment_id || 'New Contract';

        setResponseModalState({
          isOpen: true,
          title: 'Enrollment Migrated',
          message: `Student successfully migrated from [${payload.enrollment_id}] to new contract [${newContractId}].`,
          type: 'success',
          onCloseCallback: () => navigate(`/admin/students/${studentId}`)
        });
      },
      onError: (error) => {
        setIsMigrateOpen(false);
        setApiErrorState({
          isOpen: true,
          error: error?.message || error
        });
      }
    });
  };

  const handleCancel = () => {
    navigate(`/admin/students/${studentId}`);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-3xl text-cyan-400 mb-2">sync</span>
        <p className="text-xs font-bold">Loading enrollment and batch allocation records...</p>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">error</span>
        <p className="text-sm font-bold text-slate-200">Enrollment Contract Not Found ({enrollmentId})</p>
        <button
          type="button"
          onClick={() => navigate(`/admin/students/${studentId}`)}
          className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
        >
          Return to Student Profile
        </button>
      </div>
    );
  }

  return (
    <>
      <StudentUpdateEnrollmentForm
        enrollment={enrollment}
        student={student}
        batches={batches}
        isSubmitting={updateEnrollmentMutation.isPending}
        onSave={handleSave}
        onCancel={handleCancel}
        onDiscard={() => setIsDiscardOpen(true)}
        onMigrate={() => setIsMigrateOpen(true)}
      />

      {/* Discard Enrollment Drawer Overlay */}
      <DiscardEnrollmentDrawer
        isOpen={isDiscardOpen}
        onClose={() => setIsDiscardOpen(false)}
        enrollment={enrollment}
        isSubmitting={discardMutation.isPending}
        onExecute={handleDiscard}
      />

      {/* Migrate Enrollment Drawer Overlay */}
      <MigrateEnrollmentDrawer
        isOpen={isMigrateOpen}
        onClose={() => setIsMigrateOpen(false)}
        enrollment={enrollment}
        courses={courses}
        packages={packages}
        batches={batches}
        isSubmitting={migrateMutation.isPending}
        onExecute={handleMigrate}
      />

      {/* Result Response Modal */}
      <ResponseModal
        isOpen={responseModalState.isOpen}
        onClose={() => {
          setResponseModalState(prev => ({ ...prev, isOpen: false }));
          if (responseModalState.onCloseCallback) {
            responseModalState.onCloseCallback();
          }
        }}
        title={responseModalState.title}
        message={responseModalState.message}
        type={responseModalState.type}
      />

      {/* Global API Error Modal */}
      <APIErrorModal
        isOpen={apiErrorState.isOpen}
        onClose={() => setApiErrorState({ isOpen: false, error: null })}
        error={apiErrorState.error}
      />
    </>
  );
}
