import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { parseISO, compareDesc } from 'date-fns';
import { aq, op } from '../../../lib/queryEngine';
import { getCachedList } from '../../../lib/react-query/cacheHelper';
import {
  useTeacherSalaryConfigsQuery,
  useDeleteTeacherSalaryConfigMutation,
  useTeacherPaymentTransactionsQuery,
  useRecordTeacherPaymentMutation
} from './useTeacherQueries';
import {
  calculateTotalAmountToPay,
  calculateActiveBaseRate,
  calculateAverageMonthlyPay
} from '../utils/teacher.utils';

export const useTeacherPayroll = (teacherId) => {
  const queryClient = useQueryClient();
  const startTime = performance.now();

  // Asynchronous Queries
  const { data: salaryConfigs = [], isPending: isConfigsPending } = useTeacherSalaryConfigsQuery(teacherId, {
    initialData: () => getCachedList(queryClient, 'teacherSalaryConfig', { teacherId })
  });

  const { data: transactions = [], isPending: isTransactionsPending } = useTeacherPaymentTransactionsQuery(teacherId, {
    initialData: () => getCachedList(queryClient, 'teacherPaymentTransaction', { teacherId })
  });

  console.log("teachers salary data: ", salaryConfigs)
  console.log("teachers transactions data: ", transactions)

  // Mutations
  const deleteConfigMutation = useDeleteTeacherSalaryConfigMutation();
  const recordPaymentMutation = useRecordTeacherPaymentMutation();

  // Dialog / Modal Visibility States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingConfigId, setDeletingConfigId] = useState(null);

  // Sorting
  const sortedConfigs = useMemo(() => {
    return [...salaryConfigs].sort((a, b) => {
      const dateA = a.effective_from ? parseISO(a.effective_from) : new Date(0);
      const dateB = b.effective_from ? parseISO(b.effective_from) : new Date(0);
      return compareDesc(dateA, dateB);
    });
  }, [salaryConfigs]);

  const activeConfig = useMemo(() => {
    if (!salaryConfigs.length) return null;
    return salaryConfigs.find(row => row.contract_status === 'active') || sortedConfigs[0];
  }, [salaryConfigs, sortedConfigs]);

  // Ledger Calculations using Arquero queryEngine
  const ledgerAuditMetrics = useMemo(() => {
    const totalAmountToPay = calculateTotalAmountToPay(salaryConfigs);
    const avgMonthlyPay = calculateAverageMonthlyPay(salaryConfigs);
    const activeBaseRate = calculateActiveBaseRate(salaryConfigs);

    const paidAmount = transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const pendingAmount = Math.max(0, totalAmountToPay - paidAmount);
    const settlementRatio = totalAmountToPay > 0 ? (paidAmount / totalAmountToPay) * 100 : 0;

    // Fluent Arquero parsing evaluations execution pass
    const analyticalRollup = aq(transactions);

    const advancesSum = transactions.length > 0
      ? (analyticalRollup
        .filter(tx => tx.payment_type?.toLowerCase() === 'advance')
        .rollup({ sum: op.sum('amount') })
        .objects()[0]?.sum || 0)
      : 0;

    const channelSummary = transactions.length > 0
      ? analyticalRollup
        .groupby('payment_method')
        .rollup({ sum: op.sum('amount') })
        .objects()
        .reduce((acc, row) => {
          const method = (row.payment_method || '').toLowerCase();
          acc[method] = row.sum;
          return acc;
        }, {})
      : {};

    const uniqueMonths = [...new Set(transactions.map(tx => tx.salary_month).filter(Boolean))];
    const avgMonthlyPaid = paidAmount / (uniqueMonths.length || 1);

    // Timing assertion console log (Rule N5)
    console.log(`[useTeacherPayroll] Calculations complete in ${(performance.now() - startTime).toFixed(2)}ms`);

    return {
      totalAmountToPay,
      avgMonthlyPay,
      paidAmount,
      pendingAmount,
      settlementRatio,
      advancesSum,
      upiSum: (channelSummary['upi'] || 0) + (channelSummary['paytm'] || 0) + (channelSummary['phonepe'] || 0),
      cashSum: channelSummary['cash'] || 0,
      bankSum: (channelSummary['bank'] || 0) + (channelSummary['bank_transfer'] || 0),
      avgMonthlyPaid,
      activeBaseRate,
      successfulCount: transactions.length,
      pendingCount: 0
    };
  }, [salaryConfigs, transactions]);

  // Dispatch callbacks
  const handleOpenCreate = useCallback(() => {
    setEditingConfig(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((config) => {
    setEditingConfig(config);
    setIsFormOpen(true);
  }, []);

  const handleOpenDelete = useCallback((configId) => {
    setDeletingConfigId(configId);
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    deleteConfigMutation.mutate(
      { teacherId, salaryConfigId: deletingConfigId },
      {
        onSuccess: (res) => {
          if (res?.success) {
            setIsDeleteOpen(false);
            setDeletingConfigId(null);
          }
        }
      }
    );
  }, [teacherId, deletingConfigId, deleteConfigMutation]);

  return {
    state: {
      salaryConfigs,
      transactions,
      sortedConfigs,
      activeConfig,
      ledgerAuditMetrics,
      isPending: (isConfigsPending && salaryConfigs.length === 0) || (isTransactionsPending && transactions.length === 0),
      isFormOpen,
      editingConfig,
      isDeleteOpen,
      isMutationProcessing: deleteConfigMutation.isPending
    },
    actions: {
      setIsFormOpen,
      setIsDeleteOpen,
      handleOpenCreate,
      handleOpenEdit,
      handleOpenDelete,
      handleDeleteConfirm
    }
  };
};
