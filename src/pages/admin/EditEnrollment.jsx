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
    subtitle: '',
    variant: 'success',
    items: [],
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
        const resData = response.data?.data || {};
        const enr = resData.enrollment || payload || {};
        const fee = resData.fee_account || {};
        const fin = resData.financial_settlement || {};
        const allocs = Array.isArray(resData.allocations) ? resData.allocations : [];

        const isWithdrawnOrDiscarded = ['withdrawn', 'discarded'].includes(enr.status);

        const items = [];

        items.push({
          label: 'Enrollment ID',
          value: enr.enrollment_id || enrollmentId,
          isMono: true
        });

        items.push({
          label: 'Contract Status',
          value: (enr.status || 'Active').toUpperCase(),
          isHighlight: isWithdrawnOrDiscarded
        });

        if (isWithdrawnOrDiscarded) {
          if (fin.policy) {
            items.push({
              label: 'Settlement Policy',
              value: fin.policy.replace(/_/g, ' ').toUpperCase()
            });
          }

          if (fee.final_fee !== undefined) {
            items.push({
              label: 'Revised Final Fee',
              value: `₹${Number(fee.final_fee).toLocaleString()}`
            });
          }

          if (fee.balance_due !== undefined) {
            items.push({
              label: 'Outstanding Balance',
              value: `₹${Number(fee.balance_due).toLocaleString()}`
            });
          }

          if (allocs.length > 0) {
            items.push({
              label: 'Seating Allocations',
              value: `${allocs.length} Slot(s) Marked Dropped`
            });
          }

          if (fee.remarks) {
            items.push({
              label: 'Settlement Note',
              value: fee.remarks,
              fullWidth: true
            });
          }
        } else {
          if (enr.roll_number) {
            items.push({
              label: 'Roll Number',
              value: `#${enr.roll_number}`
            });
          }
          if (enr.academic_status) {
            items.push({
              label: 'Academic Status',
              value: (enr.academic_status || 'Active').toUpperCase()
            });
          }
          if (allocs.length > 0) {
            items.push({
              label: 'Active Allocations',
              value: `${allocs.length} Course Seat(s) Synchronized`
            });
          }
        }

        setResponseModalState({
          isOpen: true,
          title: isWithdrawnOrDiscarded ? 'Enrollment Withdrawn & Settled' : 'Enrollment Saved',
          subtitle: `Enrollment contract [${enrollmentId}] has been updated successfully.`,
          variant: 'success',
          items,
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
        const isRefund = resData.discard_mode === 'refund';

        const items = [
          {
            label: 'Enrollment ID',
            value: payload.enrollment_id || enrollmentId,
            isMono: true
          },
          {
            label: 'Discard Mode',
            value: isRefund ? 'Full Refund' : 'No Refund (Waived)',
            isHighlight: true
          },
          {
            label: 'Refund Amount',
            value: isRefund ? `₹${Number(resData.refund_amount || 0).toLocaleString()}` : '₹0'
          },
          {
            label: 'Fee Account Status',
            value: isRefund ? 'REFUNDED' : 'CLOSED'
          }
        ];

        if (resData.remarks) {
          items.push({
            label: 'Audit Remarks',
            value: resData.remarks,
            fullWidth: true
          });
        }

        setResponseModalState({
          isOpen: true,
          title: 'Enrollment Discarded',
          subtitle: `Enrollment [${payload.enrollment_id}] has been discarded successfully.`,
          variant: 'success',
          items,
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
        const resData = response.data?.data || {};
        const newEnr = resData.new_contract || {};
        const newContractId = newEnr.enrollment_id || 'New Contract';

        const items = [
          {
            label: 'Previous Contract',
            value: payload.enrollment_id || enrollmentId,
            isMono: true
          },
          {
            label: 'New Contract ID',
            value: newContractId,
            isMono: true,
            isHighlight: true
          },
          {
            label: 'Credit Transferred',
            value: `₹${Number(resData.credit_applied || 0).toLocaleString()}`
          },
          {
            label: 'New Balance Due',
            value: `₹${Number(resData.new_balance_due || 0).toLocaleString()}`
          }
        ];

        setResponseModalState({
          isOpen: true,
          title: 'Enrollment Migrated',
          subtitle: `Student successfully migrated from [${payload.enrollment_id}] to new contract [${newContractId}].`,
          variant: 'success',
          items,
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
        subtitle={responseModalState.subtitle}
        variant={responseModalState.variant || 'success'}
        items={responseModalState.items || []}
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
