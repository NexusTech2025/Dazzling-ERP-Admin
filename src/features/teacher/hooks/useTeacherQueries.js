import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { getCachedRecord, resolveRecord, resolveList, getCachedList } from '../../../lib/react-query/cacheHelper';

/**
 * Hook for fetching all teachers
 */
export const useTeachersQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.teacher.list(filter),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'Teacher', where: filter },
        token,
        { signal }
      );
      return response.data?.data || [];
    },
    enabled: !!token,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching a single teacher detail
 */
export const useTeacherDetailQuery = (id) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.teacher.detail(id),
    queryFn: async ({ signal }) => {
      return resolveRecord(
        queryClient,
        'teacher',
        id,
        async () => {
          const response = await apiClient.executeAction(
            API_REGISTRY.DATA.QUERY,
            {
              target: 'Teacher',
              where: { teacher_id: id },
              pagination: { limit: 1 }
            },
            token,
            { signal }
          );
          return response.data?.data?.[0] || null;
        }
      );
    },
    enabled: !!token && !!id,
    initialData: () => getCachedRecord(queryClient, 'teacher', id),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.teacher.detail(id))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for fetching teacher attendance
 */
export const useTeacherAttendanceQuery = (teacherId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.teacher.attendanceProfile(teacherId, 'all'),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.ATTENDANCE.TEACHER_QUERY,
        { where: { teacher_id: teacherId } },
        token,
        { signal }
      );
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },
    enabled: !!token && !!teacherId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching daily teacher attendance registry
 */
export const useTeacherAttendanceListQuery = (date) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.teacher.attendanceDaily(date, 'all'),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.ATTENDANCE.TEACHER_QUERY,
        { where: { attendance_date: date } },
        token,
        { signal }
      );
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },
    enabled: !!token && !!date,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for updating teacher attendance (single)
 */
export const useUpdateTeacherAttendanceMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, date, data, options }) =>
      apiClient.executeAction(
        API_REGISTRY.ATTENDANCE.TEACHER_MARK,
        { teacher_id: teacherId, attendance_date: date, ...data },
        token,
        options
      ),
    onSuccess: (response, { teacherId, date }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.attendanceProfile(teacherId, 'all') });
        if (date) {
          queryClient.invalidateQueries({ queryKey: queryKeys.teacher.attendanceDaily(date) });
        }
      }
    }
  });
};

/**
 * Hook for batch updating teacher attendance (bulk)
 */
export const useMarkTeacherAttendanceBulkMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      apiClient.executeAction(
        API_REGISTRY.ATTENDANCE.TEACHER_MARK_BULK,
        payload,
        token
      ),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.attendanceDaily(variables.attendance_date) });
        if (variables.records) {
          variables.records.forEach(rec => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teacher.attendanceProfile(rec.teacher_id, 'all') });
          });
        }
      }
    }
  });
};

/**
 * Hook for creating a new teacher
 */
export const useCreateTeacherMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      apiClient.executeAction(
        API_REGISTRY.STAFF.ONBOARD_TEACHER,
        payload,
        token
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all });
      }
    }
  });
};

/**
 * Hook for updating a teacher
 */
export const useUpdateTeacherMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, options }) =>
      apiClient.executeAction(
        API_REGISTRY.STAFF.UPDATE_TEACHER,
        { teacher_id: id, data },
        token,
        options
      ),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.detail(id) });
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(id), 'subjects'] });
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(id), 'salaryConfig'] });
      }
    }
  });
};

/**
 * Hook for deleting a teacher
 */
export const useDeleteTeacherMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }) =>
      apiClient.executeAction(
        API_REGISTRY.DATA.DELETE,
        { table: "Teacher", id },
        token,
        options
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all });
      }
    }
  });
};

/**
 * Hook for querying assigned teacher subjects
 */
export const useTeacherSubjectsQuery = (teacherId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.teacher.detail(teacherId), 'subjects'],
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'TeacherSubject', where: { teacher_id: teacherId } },
        token,
        { signal }
      );
      return response.data?.data || [];
    },
    enabled: !!token && !!teacherId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Static, stable selector function to filter and resolve the active salary configuration.
 * Declared outside the hook to prevent memory re-allocations on re-render cycles.
 * @param {Array} salaryConfigs - The list of salary configurations.
 * @returns {Object|null} The active salary configuration or null.
 */
const selectActiveSalaryConfig = (salaryConfigs) => {
  if (!salaryConfigs || salaryConfigs.length === 0) return null;
  const now = new Date();

  // Active means contract_status is 'active', effective_from has passed, and effective_to has not passed.
  const active = salaryConfigs.find(row => {
    if (row.contract_status !== 'active') return false;
    const fromDate = new Date(row.effective_from);
    const toDate = row.effective_to ? new Date(row.effective_to) : null;
    return fromDate <= now && (!toDate || toDate >= now);
  });
  if (active) return active;

  // Fallback to the latest record regardless of lifecycle phase if none matches the dates
  return [...salaryConfigs].sort((a, b) => new Date(b.effective_from) - new Date(a.effective_from))[0];
};

/**
 * Hook for querying all teacher salary configuration records (historical and active).
 * Synchronized with the centralized cache architecture for progressive hydration.
 * @param {string} teacherId - The unique teacher identifier.
 * @param {Object} [options={}] - React Query overrides.
 */
export const useTeacherSalaryConfigsQuery = (teacherId, options = {}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...queryKeys.teacher.detail(teacherId), 'salaryConfigs'],
    queryFn: async ({ signal }) => {
      const startTime = performance.now();
      const result = await resolveList(
        queryClient,
        'teacherSalaryConfig',
        { teacherId },
        async () => {
          const response = await apiClient.executeAction(
            API_REGISTRY.STAFF.GET_SALARY_CONFIGS,
            {
              entity_type: 'Teacher',
              entity_id: teacherId
            },
            token,
            { signal }
          );
          if (!response.success) {
            throw new Error(response.message || 'Failed to fetch salary configurations');
          }
          const list = response.data || [];
          return list.map(item => {
            if (item.scope_type === 'batch_group' && typeof item.scope_id === 'string' && item.scope_id) {
              try {

                const _scope_id = JSON.parse(item.scope_id)
                return { ...item, scope_id: _scope_id };
              } catch (e) {
                console.error('[useTeacherSalaryConfigsQuery] Failed to parse scope_id JSON:', e);
              }
            }
            return item;
          });
        },
        options
      );
      console.log(`[useTeacherSalaryConfigsQuery] Resolution completed in ${(performance.now() - startTime).toFixed(2)}ms`);
      return result;
    },
    enabled: !!token && !!teacherId,
    staleTime: 1000 * 60 * 10, // 10 minutes cache freshness constraint
    refetchOnMount: true,
    refetchOnReconnect: true,
    initialData: () => {
      return getCachedList(queryClient, 'teacherSalaryConfig', { teacherId });
    },
    ...options
  });
};

/**
 * Hook for querying active teacher salary configuration.
 * Selects the active item client-side from the cached historical configuration list.
 * @param {string} teacherId - The unique teacher identifier.
 * @param {Object} [options={}] - React Query overrides.
 */
export const useTeacherSalaryConfigQuery = (teacherId, options = {}) => {
  return useTeacherSalaryConfigsQuery(teacherId, {
    select: selectActiveSalaryConfig,
    ...options
  });
};

/**
 * Hook for querying teacher document attachments
 */
export const useTeacherDocumentsQuery = (teacherId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.teacher.detail(teacherId), 'documents'],
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'TeacherDocument', where: { teacher_id: teacherId } },
        token,
        { signal }
      );
      return response.data?.data || [];
    },
    enabled: !!token && !!teacherId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for assigning subjects/courses to a teacher
 */
export const useAssignTeacherSubjectsMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, subjectIds, options }) =>
      apiClient.executeAction(
        API_REGISTRY.STAFF.ASSIGN_SUBJECTS,
        { teacher_id: teacherId, subject_ids: subjectIds },
        token,
        options
      ),
    onSuccess: (response, { teacherId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(teacherId), 'subjects'] });
      }
    }
  });
};

/**
 * Hook for setting teacher salary configuration (inserting a new block)
 */
export const useSetTeacherSalaryConfigMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, salaryConfigType, rateType, baseValue, scopeType, scopeId, totalContractValue, remark, notes, effectiveFrom, effectiveTo, contractStatus, settlementState, options }) =>
      apiClient.executeAction(
        API_REGISTRY.STAFF.SET_SALARY_CONFIG,
        {
          entity_type: 'Teacher',
          entity_id: teacherId,
          salary_config_type: salaryConfigType,
          rate_type: rateType,
          base_value: Number(baseValue),
          scope_type: scopeType || 'global',
          scope_id: scopeId || null,
          total_contract_value: totalContractValue ? Number(totalContractValue) : null,
          effective_from: effectiveFrom,
          effective_to: effectiveTo || null,
          remark: remark || null,
          notes: notes || null,
          contract_status: contractStatus || 'drafted',
          settlement_state: settlementState || 'unsettled'
        },
        token,
        options
      ),
    onSuccess: (response, { teacherId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(teacherId), 'salaryConfigs'] });
      }
    }
  });
};

/**
 * Hook for updating an existing teacher salary configuration block
 */
export const useUpdateTeacherSalaryConfigMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, salaryConfigId, data, options }) =>
      apiClient.executeAction(
        API_REGISTRY.STAFF.UPDATE_SALARY_CONFIG,
        {
          entity_type: 'Teacher',
          entity_id: teacherId,
          salary_config_id: salaryConfigId,
          data: {
            salary_config_type: data.salary_config_type || data.salaryConfigType,
            rate_type: data.rate_type || data.rateType,
            base_value: data.base_value !== undefined ? Number(data.base_value) : (data.baseValue !== undefined ? Number(data.baseValue) : undefined),
            scope_type: data.scope_type || data.scopeType,
            scope_id: data.scope_id !== undefined ? data.scope_id : (data.scopeId !== undefined ? data.scopeId : undefined),
            total_contract_value: data.total_contract_value !== undefined ? Number(data.total_contract_value) : (data.totalContractValue !== undefined ? Number(data.totalContractValue) : undefined),
            effective_from: data.effective_from || data.effectiveFrom,
            effective_to: data.effective_to !== undefined ? data.effective_to : data.effectiveTo,
            remark: data.remark !== undefined ? data.remark : data.remark,
            notes: data.notes !== undefined ? data.notes : data.notes,
            contract_status: data.contract_status || data.contractStatus,
            settlement_state: data.settlement_state || data.settlementState
          }
        },
        token,
        options
      ),
    onSuccess: (response, { teacherId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(teacherId), 'salaryConfigs'] });
      }
    }
  });
};

/**
 * Hook for deleting a teacher salary configuration block
 */
export const useDeleteTeacherSalaryConfigMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, salaryConfigId, options }) =>
      apiClient.executeAction(
        API_REGISTRY.STAFF.DELETE_SALARY_CONFIG,
        {
          entity_type: 'Teacher',
          entity_id: teacherId,
          salary_config_id: salaryConfigId
        },
        token,
        options
      ),
    onSuccess: (response, { teacherId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teacher.detail(teacherId), 'salaryConfigs'] });
      }
    }
  });
};
