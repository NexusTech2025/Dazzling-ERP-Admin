import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { apiClient } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';
import { getCachedRecord, resolveRecord, resolveList, getCachedList } from '../../../lib/react-query/cacheHelper';
import { parseISO, compareDesc, isAfter, isBefore } from 'date-fns';
import { toLocalDate, formatToKey } from '../../../lib/dateUtils';
import { teacherRepo } from '../utils/teacherCacheHelper';

/**
 * Root query hook for pre-hydrated teacher datasets.
 * Employs cacheHelper's resolveList pipeline with progressive RAM hydration and fallback fetching.
 * Supports flexible signatures: useTeachersQuery(options) or useTeachersQuery(filter, options).
 * 
 * @param {Object} [filter=EMPTY_FILTER] - Filter criteria for in-memory resolution or options object.
 * @param {Object} [options={}] - Query parameter overrides.
 * @returns {QueryResult} TanStack Query result object with all pre-hydrated teachers.
 */
export const useTeachersQuery = (filter = EMPTY_FILTER, options = {}) => {
  const actualFilter = (filter && typeof filter === 'object' && !filter.queryKey && !filter.select)
    ? filter
    : EMPTY_FILTER;
  const actualOptions = (filter && typeof filter === 'object' && (filter.queryKey || filter.select || filter.enabled !== undefined || filter.forceRefetch !== undefined))
    ? filter
    : options;

  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { enabled = true, forceRefetch = false, delayMs = 0 } = actualOptions;

  return useQuery({
    queryKey: queryKeys.teacher.list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      if (delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs));
      }

      // Validate whether the cached list actually contains pre-hydrated relational sub-ledgers
      const cachedTeachers = queryClient.getQueryData(queryKeys.teacher.list(EMPTY_FILTER));
      const hasHydratedRelations = Array.isArray(cachedTeachers) &&
        cachedTeachers.length > 0 &&
        (cachedTeachers[0].teachersalaryconfig !== undefined ||
         cachedTeachers[0].teachersalaryconfigs !== undefined ||
         cachedTeachers[0].teacherSalaryConfig !== undefined);

      const shouldForce = forceRefetch || !hasHydratedRelations;

      return resolveList(
        queryClient,
        'teacher',
        actualFilter,
        async () => {
          const response = await apiClient.executeAction(
            API_REGISTRY.DATA.QUERY,
            {
              target: 'Teacher',
              where: {},
              include: {
                teachersalaryconfig: {},
                teacherpaymenttransaction: {},
                teacherattendance: {}
              },
              pagination: { limit: 1000, offset: 0 }
            },
            token,
            { signal, timeout: 'HYDRATED_QUERY' }
          );

          if (!response.success) {
            throw new Error(response.message || 'Failed to fetch teachers');
          }

          const list = Array.isArray(response.data)
            ? response.data
            : (Array.isArray(response.data?.data) ? response.data.data : []);

          return list;
        },
        { ...actualOptions, forceRefetch: shouldForce }
      );
    },
    enabled: !!token && enabled,
    initialData: () => {
      const cached = getCachedList(queryClient, 'teacher', actualFilter);
      const hasRelations = Array.isArray(cached) &&
        cached.length > 0 &&
        (cached[0].teachersalaryconfig !== undefined ||
         cached[0].teachersalaryconfigs !== undefined ||
         cached[0].teacherSalaryConfig !== undefined);
      return hasRelations ? cached : undefined;
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.teacher.list(EMPTY_FILTER))?.dataUpdatedAt,
    staleTime: 1000 * 60 * 30, // 30 minutes cache freshness window
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...actualOptions
  });
};

/**
 * Pure Selector: Derives a single teacher profile from the pre-hydrated root query cache.
 * @param {string} id - Target teacher identifier.
 * @param {Object} [options={}] - React Query overrides.
 */
export const useTeacherDetailQuery = (id, options = {}) => {
  return useTeachersQuery({
    select: (teachers) => {
      if (!Array.isArray(teachers)) return null;
      return teachers.find(t => String(t.teacher_id || t.id) === String(id)) || null;
    },
    enabled: !!id,
    ...options
  });
};

/**
 * Pure Selector: Derives a teacher's attendance check-in records.
 * @param {string} teacherId - Target teacher identifier.
 * @param {Object} [options={}] - React Query overrides.
 */
export const useTeacherAttendanceQuery = (teacherId, options = {}) => {
  return useTeachersQuery({
    select: (teachers) => {
      if (!Array.isArray(teachers)) return [];
      const teacher = teachers.find(t => String(t.teacher_id || t.id) === String(teacherId));
      const rawData = teacher?.teacherattendance || teacher?.teacherattendances || teacher?.teacherAttendance || [];
      return rawData.map(item => {
        if (item.attendance_date) {
          const localDate = toLocalDate(item.attendance_date);
          const dateKey = formatToKey(localDate);
          return {
            ...item,
            attendance_date: dateKey
          };
        }
        return item;
      });
    },
    enabled: !!teacherId,
    ...options
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
      const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      return rawData.map(item => {
        if (item.attendance_date) {
          const localDate = toLocalDate(item.attendance_date);
          const dateKey = formatToKey(localDate);
          return {
            ...item,
            attendance_date: dateKey
          };
        }
        return item;
      });
    },
    enabled: !!token && !!date,
    staleTime: 1000 * 60 * 60, // 60 minutes
    refetchOnMount: false,
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
        token,
        { timeout: 'DATA_MUTATION' }
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
        { timeout: 'DATA_MUTATION', ...options }
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
        { timeout: 'DATA_MUTATION', ...options }
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
    staleTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Static, stable selector function to filter and resolve the active salary configuration.
 * Declared outside the hook to prevent memory re-allocations on re-render cycles.
 * @param {Array} salaryConfigs - The list of salary configurations.
 * @returns {Object|null} The active salary configuration or null.
 */
export const selectActiveSalaryConfig = (salaryConfigs) => {
  if (!Array.isArray(salaryConfigs) || salaryConfigs.length === 0) return null;
  const now = new Date();

  // Active means contract_status is 'active', effective_from has passed, and effective_to has not passed.
  const active = salaryConfigs.find(row => {
    if (row.contract_status !== 'active') return false;
    const fromDate = row.effective_from ? parseISO(row.effective_from) : null;
    const toDate = row.effective_to ? parseISO(row.effective_to) : null;

    if (fromDate && isAfter(fromDate, now)) return false;
    if (toDate && isBefore(toDate, now)) return false;
    return true;
  });
  if (active) return active;

  // Fallback to the latest record regardless of lifecycle phase if none matches the dates
  return [...salaryConfigs].sort((a, b) => {
    const dateA = a.effective_from ? parseISO(a.effective_from) : new Date(0);
    const dateB = b.effective_from ? parseISO(b.effective_from) : new Date(0);
    return compareDesc(dateA, dateB);
  })[0] || null;
};

/**
 * Pure Selector: Derives all teacher salary configuration records (historical and active) with parsed scope JSON.
 * @param {string} teacherId - The unique teacher identifier.
 * @param {Object} [options={}] - React Query overrides.
 */
export const useTeacherSalaryConfigsQuery = (teacherId, options = {}) => {
  return useTeachersQuery({
    select: (teachers) => {
      if (!Array.isArray(teachers)) return [];
      const teacher = teachers.find(t => String(t.teacher_id || t.id) === String(teacherId));
      const rawConfigs = teacher?.teachersalaryconfig || teacher?.teachersalaryconfigs || teacher?.teacherSalaryConfig || [];
      return rawConfigs.map(cfg => {
        if (cfg.scope_type === 'batch_group' && typeof cfg.scope_id === 'string' && cfg.scope_id) {
          try {
            return { ...cfg, scope_id: JSON.parse(cfg.scope_id) };
          } catch (e) {
            console.error('[useTeacherSalaryConfigsQuery] Failed to parse scope_id JSON:', e);
          }
        }
        return cfg;
      });
    },
    enabled: !!teacherId,
    ...options
  });
};

/**
 * Pure Selector: Queries active teacher salary configuration.
 * Selects the active item client-side from the pre-hydrated configuration list.
 * @param {string} teacherId - The unique teacher identifier.
 * @param {Object} [options={}] - React Query overrides.
 */
export const useTeacherSalaryConfigQuery = (teacherId, options = {}) => {
  return useTeachersQuery({
    select: (teachers) => {
      if (!Array.isArray(teachers)) return null;
      const teacher = teachers.find(t => String(t.teacher_id || t.id) === String(teacherId));
      const rawConfigs = teacher?.teachersalaryconfig || teacher?.teachersalaryconfigs || teacher?.teacherSalaryConfig || [];
      return selectActiveSalaryConfig(rawConfigs);
    },
    enabled: !!teacherId,
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
    staleTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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
        { timeout: 'DATA_MUTATION', ...options }
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
    onSuccess: (response, variables) => {
      const teacherId = variables.teacherId || variables.entity_id;
      if (response.success && teacherId) {
        const newConfig = response.data || {
          ...variables,
          salary_config_id: response.id || `TSC-${Date.now()}`
        };
        teacherRepo.updateSalaryConfigCache(queryClient, teacherId, newConfig);
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.list(EMPTY_FILTER) });
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
    onSuccess: (response, { teacherId, data }) => {
      if (response.success) {
        const newConfig = response.data || { ...data, salary_config_id: response.id || `TSC-${Date.now()}` };
        teacherRepo.updateSalaryConfigCache(queryClient, teacherId, newConfig);
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.list(EMPTY_FILTER) });
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
    onSuccess: (response, { teacherId, salaryConfigId }) => {
      if (response.success) {
        teacherRepo.deleteSalaryConfigCache(queryClient, teacherId, salaryConfigId);
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.list(EMPTY_FILTER) });
      }
    }
  });
};

/**
 * Pure Selector: Derives payment transactions for a given teacher.
 * @param {string} teacherId - The target faculty member's system identifier.
 * @param {Object} [options={}] - Standard TanStack Query parameter overrides.
 */
export const useTeacherPaymentTransactionsQuery = (teacherId, options = {}) => {
  return useTeachersQuery({
    select: (teachers) => {
      if (!Array.isArray(teachers)) return [];
      const teacher = teachers.find(t => String(t.teacher_id || t.id) === String(teacherId));
      return teacher?.teacherpaymenttransaction || teacher?.teacherpaymenttransactions || teacher?.teacherPaymentTransaction || [];
    },
    enabled: !!teacherId,
    ...options
  });
};

/**
 * Mutation hook for recording a new payment transaction entry to the ledger.
 * Optimistically updates the teacher transaction ledger in RAM before query invalidation.
 * @returns {MutationResult} React Query mutation trigger function.
 */
export const useRecordTeacherPaymentMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => {
      const teacherId = payload.teacherId || payload.teacher_id;
      const paymentType = payload.paymentType || payload.payment_type;
      const amount = payload.amount;
      const paymentMethod = payload.paymentMethod || payload.payment_method;
      const transactionDate = payload.transactionDate || payload.transaction_date;
      const referenceNumber = payload.referenceNumber || payload.reference_number;
      const salaryMonth = payload.salaryMonth || payload.salary_month;
      const notes = payload.notes;
      const options = payload.options;

      return apiClient.executeAction(
        API_REGISTRY.STAFF.RECORD_PAYMENT,
        {
          teacher_id: teacherId,
          payment_type: paymentType,
          amount: Number(amount),
          payment_method: paymentMethod,
          transaction_date: transactionDate,
          reference_number: referenceNumber || null,
          salary_month: salaryMonth,
          notes: notes || null
        },
        token,
        options
      );
    },
    onSuccess: (response, payload) => {
      const teacherId = payload?.teacherId || payload?.teacher_id;
      if (response.success && teacherId) {
        const newTx = response.data || { ...payload, transaction_id: response.id || `TPT-${Date.now()}` };
        teacherRepo.recordPaymentCache(queryClient, teacherId, newTx);
        queryClient.invalidateQueries({ queryKey: queryKeys.teacher.list(EMPTY_FILTER) });
      }
    }
  });
};
