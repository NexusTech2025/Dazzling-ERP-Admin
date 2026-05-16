import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys } from '../../../lib/react-query/queryKeys';
// IMPORT FROM MOCK API FOR DEVELOPMENT
import { 
  fetchInstallments, 
  fetchRevenueSummary, 
  fetchOverdueAccounts, 
  fetchStudentFeeOverview,
  recordPayment,
  generateFeePlan
} from '../api/finance.mockApi';

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
