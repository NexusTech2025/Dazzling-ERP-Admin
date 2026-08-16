import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { resolveList } from '../../../lib/react-query/cacheHelper';
import { enrollmentRepo } from '../../student/utils/enrollmentCacheHelper';
import { useDeleteManyMutation } from '../../../hooks/useDeleteManyMutation';
import {
  fetchInstallments,
  fetchRevenueSummary,
  fetchOverdueAccounts,
  fetchStudentFeeOverview,
  recordPayment,
  generateFeePlan,
  fetchMoneyTransactions,
  createMoneyTransaction,
  updateMoneyTransaction,
  deleteMoneyTransaction,
  fetchExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  fetchStaffMembers,
  fetchAccountingData,
  rescheduleInstallments,
  updateFeeAccount,
  adjustFee
} from '../api/finance.api';

/**
 * Hook for fetching revenue summary
 */
export const useRevenueSummaryQuery = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.finance.revenue.summary,
    queryFn: async ({ signal }) => {
      const response = await fetchRevenueSummary(token, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch revenue summary');
      }
      return response.data?.data?.[0] || null;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 60 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching all installments
 */
export const useInstallmentsQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.finance.installment.list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      return resolveList(
        queryClient,
        'installment',
        filter,
        async () => {
          const response = await fetchInstallments(token, filter, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch installments');
          }
          return response.data?.data || [];
        }
      );
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 60 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching overdue accounts (Overdue installments)
 */
export const useOverdueAccountsQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.finance.overdue(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      return resolveList(
        queryClient,
        'overdue',
        filter,
        async () => {
          const response = await fetchOverdueAccounts(token, filter, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch overdue accounts');
          }
          return response.data?.data || [];
        }
      );
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 60 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching individual student fee overview
 */
export const useStudentFeeOverviewQuery = (studentId) => {
  const { data: accountingData, isLoading, error } = useAccountingDataQuery();

  const studentInstallments = useMemo(() => {
    if (!accountingData || !studentId) return [];
    const installments = accountingData.installments || Array.isArray(accountingData) ? accountingData : [];
    return Array.isArray(installments) ? installments.filter(inst => inst && (inst.student_id === studentId || inst.studentId === studentId)) : [];
  }, [accountingData, studentId]);

  return {
    data: studentInstallments,
    isLoading,
    error
  };
};

/**
 * Hook for recording a payment
 */
export const useRecordPaymentMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables) => recordPayment(token, variables),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      }
    }
  });
};

/**
 * Hook for generating a fee plan
 */
export const useGenerateFeePlanMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, options }) => generateFeePlan(token, data, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      }
    }
  });
};

/**
 * Hook for fetching money transactions
 */
export const useMoneyTransactionsQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.finance.transaction.list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      return resolveList(
        queryClient,
        'transaction',
        filter,
        async () => {
          const response = await fetchMoneyTransactions(token, filter, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch money transactions');
          }
          return response.data?.data || [];
        }
      );
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 60 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for creating a money transaction
 */
export const useCreateMoneyTransactionMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createMoneyTransaction(token, data),
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate both transactions list and finance summary
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      }
    }
  });
};

/**
 * Hook for updating a money transaction
 */
export const useUpdateMoneyTransactionMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateMoneyTransaction(token, id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      }
    }
  });
};

/**
 * Hook for deleting a money transaction
 */
export const useDeleteMoneyTransactionMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteMoneyTransaction(token, id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      }
    }
  });
};

/**
 * Hook for bulk deleting money transactions
 */
export const useDeleteManyMoneyTransactionsMutation = () => {
  return useDeleteManyMutation('MoneyTransaction', [queryKeys.finance.all]);
};

/**
 * Hook for fetching expense categories
 */
export const useExpenseCategoriesQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.finance.category.list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      return resolveList(
        queryClient,
        'category',
        filter,
        async () => {
          const response = await fetchExpenseCategories(token, filter, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch expense categories');
          }
          return response.data?.data || [];
        }
      );
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 60 minutes
  });
};

/**
 * Hook for creating an expense category
 */
export const useCreateExpenseCategoryMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createExpenseCategory(token, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.category.all });
      }
    }
  });
};

/**
 * Hook for updating an expense category
 */
export const useUpdateExpenseCategoryMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateExpenseCategory(token, id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.category.all });
      }
    }
  });
};

/**
 * Hook for deleting an expense category
 */
export const useDeleteExpenseCategoryMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteExpenseCategory(token, id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.category.all });
      }
    }
  });
};

/**
 * Hook for fetching support staff members
 */
export const useStaffMembersQuery = (filter = EMPTY_FILTER) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.staff.list(EMPTY_FILTER),
    queryFn: async ({ signal }) => {
      return resolveList(
        queryClient,
        'staff',
        filter,
        async () => {
          const response = await fetchStaffMembers(token, filter, { signal });
          if (!response.success) {
            throw new Error(response.error?.message || response.message || 'Failed to fetch staff members');
          }
          return response.data?.data || [];
        }
      );
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 60 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for batch fetching all accounting records (fee accounts, installments, payments, adjustments).
 */
export const useAccountingDataQuery = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.finance.accountingData,
    queryFn: async ({ signal }) => {
      const response = await fetchAccountingData(token, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch accounting data');
      }
      return response.data || { studentFeeAccounts: [], installments: [], payments: [], feeAdjustments: [] };
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 60 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for executing installment rescheduling mutations with cache invalidation & O(1) RAM sync.
 */
export const useRescheduleInstallmentsMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => rescheduleInstallments(token, payload),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { student_fee_id, balance_due, next_due_date, account_status } = response.data;

        // 1. O(1) Instant RAM Cache Sync on queryKeys.enrollment.list(EMPTY_FILTER)
        if (student_fee_id) {
          enrollmentRepo.updateFeeAccountCache(queryClient, student_fee_id, {
            balance_due,
            next_due_date,
            account_status
          });
        }

        // 2. Silent background invalidation for enrollment & finance query keys
        enrollmentRepo.invalidate(queryClient);
      }
    }
  });
};

/**
 * Hook for executing Student Fee Account update mutations with O(1) RAM cache sync.
 */
export const useUpdateFeeAccountMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateFeeAccount(token, payload),
    onSuccess: (response, payload) => {
      const resData = response.data?.data || response.data;
      if (response.success && resData) {
        const studentFeeId = payload?.student_fee_id || resData.student_fee_id;

        if (studentFeeId) {
          enrollmentRepo.updateFeeAccountCache(queryClient, studentFeeId, resData);
        }

        enrollmentRepo.invalidate(queryClient);
      }
    }
  });
};

/**
 * Hook for executing Fee Adjustment mutations with O(1) RAM cache sync.
 */
export const useApplyFeeAdjustmentMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => adjustFee(token, payload),
    onSuccess: (response, payload) => {
      const resData = response.data?.data || response.data;
      if (response.success && resData) {
        const studentFeeId = payload?.student_fee_id || resData.student_fee_id;

        if (studentFeeId) {
          enrollmentRepo.updateFeeAccountCache(queryClient, studentFeeId, resData);
        }

        enrollmentRepo.invalidate(queryClient);
      }
    }
  });
};


