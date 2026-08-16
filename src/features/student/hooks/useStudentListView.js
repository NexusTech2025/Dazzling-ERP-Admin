import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import {
  useStudentsQuery,
  useUpdateStudentMutation,
  useUpdateStudentProfileMutation,
  useDeleteStudentMutation
} from './useStudentQueries';
import { useBatchesQuery } from '../../batch/hooks/useBatchQueries';
import { useCoursesQuery, useCourseTypesQuery } from '../../course/hooks/useCourseQueries';
import { useEnrollmentsQuery } from './useEnrollmentQueries';
import { useFilteredStudents } from '../../../hooks/useFilteredStudents';
import useSelection from '../../../hooks/useSelection';
import useDeleteManyMutation from '../../../hooks/useDeleteManyMutation';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { batchRepo } from '../../batch/utils/batchCacheHelper';
import { getStudentAllocationsViewModel } from '../utils/enrollmentCacheHelper';
import { studentRepo } from '../utils/studentCacheHelper';
import { calculateStudentKpiMetrics } from '../utils/studentKpiHelper';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { parseDeleteBlockers } from '../../../components/ui/DeleteDependencyModal';

/**
 * Helper to evaluate if the student list needs relational hydration (allocations / enrollments).
 * 
 * @param {Array<Object>} studentsList - Raw student objects array.
 * @returns {boolean} True if first record is missing allocations or enrollments.
 */
function isStudentListIncomplete(studentsList) {
  if (!Array.isArray(studentsList) || studentsList.length === 0) return false;
  const sample = studentsList[0];
  const hasAllocations = (Array.isArray(sample.allocations) && sample.allocations.length > 0) || (Array.isArray(sample.BatchAllocation) && sample.BatchAllocation.length > 0);
  const hasEnrollments = Array.isArray(sample.enrollments) && sample.enrollments.length > 0;
  return !hasAllocations && !hasEnrollments;
}

/**
 * Headless View-Controller Hook for Student Directory Page & Mobile View.
 * Encapsulates data fetching, relational pre-fetching, hydration guards, in-memory filtering,
 * selection state, deletion modals, and live KPI metric computations into structured namespaces.
 * 
 * @returns {Object} Structured controller object with namespaces: { data, status, filterState, selectionState, modals, actions }.
 */
export function useStudentListView() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Relational pre-fetch & batchRepo priming
  const { data: batches = [] } = useBatchesQuery();
  const { data: courses = [] } = useCoursesQuery();
  const { data: courseTypes = [] } = useCourseTypesQuery();
  const { data: enrollments = [] } = useEnrollmentsQuery();

  useEffect(() => {
    batchRepo.prime(batches, courses, courseTypes);
  }, [batches, courses, courseTypes]);

  // Refetch & hydration state
  const [needsRefetch, setNeedsRefetch] = useState(false);
  const hasRefetchedRef = useRef(false);
  const wasFetchingRef = useRef(false);

  const { data: students = [], isLoading, isFetching, error } = useStudentsQuery(undefined, {
    forceRefetch: needsRefetch
  });

  // Detect incomplete hydration and trigger single imperative refetch
  useEffect(() => {
    if (hasRefetchedRef.current || needsRefetch || isFetching) return;
    if (isStudentListIncomplete(students)) {
      hasRefetchedRef.current = true;
      queryClient.invalidateQueries({ queryKey: queryKeys.student.list(EMPTY_FILTER) });
      setNeedsRefetch(true);
    }
  }, [students, needsRefetch, isFetching, queryClient]);

  // Reset refetch flag after fetch completes
  useEffect(() => {
    if (isFetching) {
      wasFetchingRef.current = true;
    } else if (needsRefetch && wasFetchingRef.current) {
      setNeedsRefetch(false);
      wasFetchingRef.current = false;
    }
  }, [needsRefetch, isFetching]);

  // Filtering hook with relational lookups for batch/course matching
  const filterState = useFilteredStudents(students, batches, courses, courseTypes);
  const { filteredStudents } = filterState;

  // Selection hook
  const selectionState = useSelection();

  // Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: '',
    student: null,
    type: 'student',
    status: 'idle',
    error: null,
    responsePayload: null,
    resultMessage: null
  });

  const [selectedStudentForView, setSelectedStudentForView] = useState(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);
  const [dependencyViolations, setDependencyViolations] = useState([]);
  const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
  const [blockedParentId, setBlockedParentId] = useState('');
  const [blockedParentName, setBlockedParentName] = useState('');

  // Mutations
  const updateMutation = useUpdateStudentMutation();
  const updateProfileMutation = useUpdateStudentProfileMutation();
  const deleteMutation = useDeleteStudentMutation();
  const deleteManyMutation = useDeleteManyMutation(
    'Student',
    [queryKeys.student.all],
    API_REGISTRY.STUDENT.DELETE_MANY
  );

  // Compute live 7 KPI metrics from student dataset
  const kpiMetrics = useMemo(() => {
    return calculateStudentKpiMetrics(students, batches, courses, courseTypes);
  }, [students, batches, courses, courseTypes]);

  // Navigation and Action Handlers
  const handlers = useMemo(() => ({
    onView: (student) => navigate(`/admin/students/${student.student_id}`),
    onEdit: (student) => navigate(`/admin/students/${student.student_id}/edit`),
    onDelete: (id, name, studentObj = null) => {
      const targetStudent = studentObj || students.find(s => s.student_id === id) || { student_id: id, student_name: name };
      setDeleteModal({
        isOpen: true,
        id,
        name: name || targetStudent.student_name,
        student: targetStudent,
        type: 'student',
        status: 'idle',
        resultMessage: null
      });
    },
    isDeleting: deleteMutation.isPending
  }), [navigate, deleteMutation.isPending, students]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
  }, [queryClient]);

  const handleBatchDelete = useCallback((ids) => {
    deleteManyMutation.mutate({ ids }, {
      onSuccess: (res) => {
        if (res.success) {
          const manifest = res.data?.manifest || {};
          const deleted = manifest.deleted || [];
          const failed = manifest.failed || {};
          const failedCount = Object.keys(failed).length;

          let msg = `Successfully deleted ${deleted.length} students.`;
          if (failedCount > 0) {
            msg += ` Failed to delete ${failedCount} students due to referential constraints.`;
          }

          if (selectedStudentForView && deleted.includes(selectedStudentForView.student_id)) {
            setSelectedStudentForView(null);
          }
          if (selectedStudentForEdit && deleted.includes(selectedStudentForEdit.student_id)) {
            setSelectedStudentForEdit(null);
          }

          setDeleteModal(prev => ({
            ...prev,
            status: failedCount > 0 && deleted.length === 0 ? 'error' : 'success',
            resultMessage: msg
          }));

          if (deleted.length > 0) {
            selectionState.clearSelection();
          }
        } else {
          setDeleteModal(prev => ({
            ...prev,
            status: 'error',
            resultMessage: res.message || 'Failed to delete students.'
          }));
        }
      },
      onError: (err) => {
        console.error('Delete Many Students Error:', err);
        const rawErr = err.rawBackendError;
        if (rawErr?.details?.failed) {
          const parsedBlockers = parseDeleteBlockers(rawErr, 'Student');
          if (parsedBlockers.length > 0) {
            setDependencyViolations(parsedBlockers);
            setBlockedParentId('Multiple Students');
            setBlockedParentName(`${Object.keys(rawErr.details.failed).length} selected profiles`);
            setIsDependencyModalOpen(true);
            setDeleteModal(prev => ({ ...prev, isOpen: false }));
            return;
          }
        }
        setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'Failed to delete students due to a server error.'
        }));
      }
    });
  }, [deleteManyMutation, selectedStudentForView, selectedStudentForEdit, selectionState]);

  const handleSingleDelete = useCallback((payloadOrId) => {
    const studentId = typeof payloadOrId === 'string' ? payloadOrId : (payloadOrId?.student_id || payloadOrId?.id);
    deleteMutation.mutate(payloadOrId, {
      onSuccess: (response) => {
        if (selectedStudentForView?.student_id === studentId) {
          setSelectedStudentForView(null);
        }
        if (selectedStudentForEdit?.student_id === studentId) {
          setSelectedStudentForEdit(null);
        }
        setDeleteModal(prev => ({
          ...prev,
          status: 'success',
          responsePayload: response,
          resultMessage: response.data?.message || response.message || 'Student record has been successfully processed.'
        }));
      },
      onError: (err) => {
        console.error('Delete Student Error:', err);
        const rawErr = err?.rawBackendError || err?.response?.data?.error || err;
        if (rawErr?.details?.violations) {
          const parsedBlockers = parseDeleteBlockers(rawErr, 'Student');
          if (parsedBlockers.length > 0) {
            setDependencyViolations(parsedBlockers);
            setBlockedParentId(studentId);
            setBlockedParentName(deleteModal.name || 'Selected Profile');
            setIsDependencyModalOpen(true);
            setDeleteModal(prev => ({ ...prev, isOpen: false }));
            return;
          }
        }

        const errorObj = {
          errorCode: rawErr?.errorCode || err?.errorCode || (err.status ? `HTTP_${err.status}` : 'DELETE_ERROR'),
          message: rawErr?.message || err?.message || 'Failed to delete student record.',
          type: rawErr?.type || err?.name || 'Error',
          details: rawErr?.details || []
        };

        setDeleteModal(prev => ({
          ...prev,
          status: 'error',
          error: errorObj,
          responsePayload: null,
          resultMessage: errorObj.message
        }));
      }
    });
  }, [deleteMutation, selectedStudentForView, selectedStudentForEdit, deleteModal.name]);

  const handleConfirmDelete = useCallback((payload) => {
    setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    if (deleteModal.type === 'bulk_student') {
      handleBatchDelete(deleteModal.id);
    } else {
      handleSingleDelete(payload || deleteModal.id);
    }
  }, [deleteModal.id, deleteModal.type, handleBatchDelete, handleSingleDelete]);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, id: null, name: '', student: null, type: 'student', status: 'idle', error: null, responsePayload: null, resultMessage: null });
  }, []);

  const handleResetDeleteStatus = useCallback(() => {
    setDeleteModal(prev => ({ ...prev, status: 'idle', error: null, responsePayload: null, resultMessage: null }));
  }, []);

  const handleSaveStudent = useCallback((payload) => {
    updateProfileMutation.mutate({
      payload
    }, {
      onSuccess: () => setSelectedStudentForEdit(null)
    });
  }, [updateProfileMutation]);

  return {
    data: {
      students,
      filteredStudents,
      batches,
      courses,
      courseTypes,
      enrollments,
      kpiMetrics
    },
    status: {
      isLoading,
      isFetching,
      error
    },
    filterState,
    selectionState,
    modals: {
      deleteModal,
      setDeleteModal,
      selectedStudentForView,
      setSelectedStudentForView,
      selectedStudentForEdit,
      setSelectedStudentForEdit,
      dependencyModal: {
        isOpen: isDependencyModalOpen,
        setIsOpen: setIsDependencyModalOpen,
        violations: dependencyViolations,
        setViolations: setDependencyViolations,
        blockedParentId,
        blockedParentName
      },
      handleConfirmDelete,
      handleCloseDeleteModal,
      handleResetDeleteStatus,
      handleSaveStudent
    },
    actions: {
      handlers,
      handleRefresh,
      updateMutation,
      updateProfileMutation,
      deleteMutation,
      deleteManyMutation
    }
  };
}

export default useStudentListView;
