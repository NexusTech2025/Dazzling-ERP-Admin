import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys } from '../../../lib/react-query/queryKeys';
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
  fetchAccountingData
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
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook for fetching all installments
 */
export const useInstallmentsQuery = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.finance.installment.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchInstallments(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch installments');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook for fetching overdue accounts (Overdue installments)
 */
export const useOverdueAccountsQuery = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.finance.overdue(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchOverdueAccounts(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch overdue accounts');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook for fetching individual student fee overview
 */
export const useStudentFeeOverviewQuery = (studentId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.finance.installment.student(studentId),
    queryFn: async ({ signal }) => {
      const response = await fetchStudentFeeOverview(token, studentId, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch student fee overview');
      }
      return response.data?.data || []; // Note: changed from response.data to response.data.data based on mock structure
    },
    enabled: !!token && !!studentId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook for recording a payment
 */
export const useRecordPaymentMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, options }) => recordPayment(token, data, options),
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
export const useMoneyTransactionsQuery = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.finance.transaction.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchMoneyTransactions(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch money transactions');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
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
export const useExpenseCategoriesQuery = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.finance.category.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchExpenseCategories(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch expense categories');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
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
export const useStaffMembersQuery = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.staff.list(filter),
    queryFn: async ({ signal }) => {
      const response = await fetchStaffMembers(token, filter, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch staff members');
      }
      return response.data?.data || [];
    },
    enabled: !!token,
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
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
