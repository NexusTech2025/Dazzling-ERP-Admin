import React, { useState, useMemo } from 'react';
import { parseISO, compareDesc, format, isAfter, isBefore, isEqual, differenceInMonths } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import Button from '../../../../components/ui/v2/Button';
import KpiCard from '../../../../components/ui/v2/KpiCard';
import KpiGrid from '../../../../components/ui/v2/KpiGrid';
import SalaryConfigModal from './SalaryConfigModal';
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty
} from '../../../../components/ui/table';
import {
  useTeacherSalaryConfigsQuery,
  useDeleteTeacherSalaryConfigMutation
} from '../../hooks/useTeacherQueries';
import { getCachedList } from '../../../../lib/react-query/cacheHelper';
import { aq, op } from '../../../../lib/queryEngine';

// Decoupled helper functions to compute KPIs

export const getActiveConfig = (configs) => {
  return configs.filter(c => c.contract_status === 'active');
}


export const calculateTotalAmountToPay = (configs) => {
  if (!configs || configs.length === 0) return 0;

  // first filter all active
  const activeConfigs = getActiveConfig(configs);
  return activeConfigs.reduce((sum, c) => {

    // if there is contract value the use it as is.
    const contractVal = Number(c.total_contract_value);
    if (!isNaN(contractVal) && contractVal > 0) {
      return sum + contractVal;
    }

    // if no contract value then use base value * number of months
    const base = Number(c.base_value || 0);
    const months = differenceInMonths(parseISO(c.effective_to), parseISO(c.effective_from));
    if (base > 0 && months > 0) {
      return sum + (base * months);
    }
    return sum + base;
  }, 0);
};

export const calculateActiveBaseRate = (configs) => {
  if (!configs || configs.length === 0) return 0;
  const activeConfigs = getActiveConfig(configs);
  return activeConfigs.reduce((sum, c) => {
    const base = Number(c.base_value || 0);
    if (base > 0) {
      return sum + base;
    }
    const contractVal = Number(c.total_contract_value || 0);
    if (contractVal > 0) {
      let months = 1;
      if (c.effective_from && c.effective_to) {
        months = differenceInMonths(parseISO(c.effective_to), parseISO(c.effective_from)) || 1;
      }
      return sum + (contractVal / months);
    }
    return sum;
  }, 0);
};

export const calculateAverageMonthlyPay = (configs) => {
  if (!configs || configs.length === 0) return 0;
  const activeConfigs = getActiveConfig(configs);

  return activeConfigs.reduce((acc, c) => {
    // Ignore revenue percentage base calculations
    if (c.rate_type === 'revenue_percentage') {
      return acc;
    }

    const base = Number(c.base_value || 0);
    if (base > 0) {
      return acc + base;
    }

    const contractVal = Number(c.total_contract_value || 0);
    if (contractVal > 0) {
      const rateType = c.rate_type || 'monthly';
      if (rateType === 'yearly') {
        return acc + (contractVal / 12);
      }
      
      let months = 1;
      if (c.effective_from && c.effective_to) {
        months = differenceInMonths(parseISO(c.effective_to), parseISO(c.effective_from)) || 1;
      }
      return acc + (contractVal / months);
    }
    return acc;
  }, 0);
};

// Subcomponent for rendering all salary configurations in a table
const SalaryConfigsCard = ({ salaryConfigs = [], activeConfig, onEdit, onDelete, onCreate }) => {
  // Sort configs descending by effective_from so latest is at the top
  const sortedConfigs = React.useMemo(() => {
    return [...salaryConfigs].sort((a, b) => {
      const dateA = a.effective_from ? parseISO(a.effective_from) : new Date(0);
      const dateB = b.effective_from ? parseISO(b.effective_from) : new Date(0);
      return compareDesc(dateA, dateB);
    });
  }, [salaryConfigs]);

  return (
    <Card className="h-full">
      <Card.Header border={true} className="flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary text-xl">payments</span>
          <h3 className="text-lg font-bold text-text-main dark:text-white">
            Salary Configurations
          </h3>
        </div>
        <Button
          variant="contained"
          size="sm"
          startIcon="add"
          onClick={onCreate}
        >
          Add Configuration
        </Button>
      </Card.Header>

      <Card.Body className="p-0">
        {sortedConfigs.length === 0 ? (
          <div className="py-12">
            <TableEmpty message="No salary configurations found." icon="payments" />
          </div>
        ) : (
          <TableContainer>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Config Type</TableHead>
                <TableHead>Rate Type</TableHead>
                <TableHead>Base Value</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Contract Value</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Settlement</TableHead>
                <TableHead align="center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedConfigs.map((config) => {
                const isActive = config.contract_status === 'active';

                const fromDate = config.effective_from
                  ? format(parseISO(config.effective_from), 'MMM d, yyyy')
                  : 'N/A';
                const toDate = config.effective_to
                  ? format(parseISO(config.effective_to), 'MMM d, yyyy')
                  : 'Present';

                // Displaying scope: format batch weight parsing if scope type is batch group
                let scopeDisplay = config.scope_type || 'global';
                if (config.scope_type === 'single_batch') {
                  scopeDisplay = `Single: ${config.scope_id}`;
                } else if (config.scope_type === 'batch_group' && config.scope_id) {
                  try {
                    const weights = JSON.parse(config.scope_id);
                    const batchCount = Object.keys(weights).length;
                    scopeDisplay = `Group (${batchCount} batches)`;
                  } catch (e) {
                    scopeDisplay = 'Group';
                  }
                }

                return (
                  <TableRow key={config.salary_config_id} className={isActive ? 'bg-primary/5 hover:bg-primary/10' : ''}>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant={
                          config.contract_status === 'active' ? 'success' :
                            config.contract_status === 'drafted' ? 'default' :
                              config.contract_status === 'expired' ? 'warning' : 'danger'
                        } className="font-black tracking-widest text-[9px] uppercase">
                          {config.contract_status || 'drafted'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {(config.salary_config_type || 'recurring_monthly').replace('_', ' ')}
                    </TableCell>
                    <TableCell className="capitalize">
                      {config.rate_type || 'monthly'}
                    </TableCell>
                    <TableCell className="font-mono font-bold">
                      ₹{(config.base_value || config.base_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="capitalize text-xs">
                      {scopeDisplay}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {config.total_contract_value ? `₹${config.total_contract_value.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {fromDate} - {toDate}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        config.settlement_state === 'settled' ? 'success' :
                          config.settlement_state === 'unsettled' ? 'warning' : 'danger'
                      } className="font-black tracking-widest text-[9px] uppercase">
                        {(config.settlement_state || 'unsettled').replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell align="center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(config)}
                          className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit Configuration"
                        >
                          <span className="material-symbols-outlined text-sm leading-none">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(config.salary_config_id)}
                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Configuration"
                        >
                          <span className="material-symbols-outlined text-sm leading-none">delete</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </TableContainer>
        )}
      </Card.Body>
    </Card>
  );
};

// Subcomponent for rendering teacher payment transactions list ledger
const TeacherPaymentTransactionsCard = ({ transactions = [] }) => {
  return (
    <Card>
      <Card.Header border={true} className="flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary text-xl">list_alt</span>
          <h3 className="text-lg font-bold text-text-main dark:text-white">
            Payment Transactions Ledger
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="h-8 w-8 flex items-center justify-center rounded-lg border border-border-light dark:border-slate-800 text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-base">filter_list</span>
          </button>
          <button type="button" className="h-8 w-8 flex items-center justify-center rounded-lg border border-border-light dark:border-slate-800 text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-base">more_vert</span>
          </button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {transactions.length === 0 ? (
          <div className="py-12">
            <TableEmpty message="No payment transactions found." icon="payments" />
          </div>
        ) : (
          <TableContainer>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Salary Month</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Ref Number</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead align="right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.transaction_id}>
                  <TableCell className="text-xs">
                    {tx.transaction_date ? format(parseISO(tx.transaction_date), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {tx.salary_month || 'N/A'}
                  </TableCell>
                  <TableCell className="capitalize text-xs font-semibold">
                    {tx.payment_type || 'SALARY'}
                  </TableCell>
                  <TableCell className="capitalize text-xs font-mono">
                    {(tx.payment_method || '').replace('_', ' ')}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {tx.reference_number || '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {tx.created_by || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" className="font-black tracking-widest text-[9px] uppercase">
                      Reconciled
                    </Badge>
                  </TableCell>
                  <TableCell align="right" className="font-mono font-bold">
                    ₹{(tx.amount || 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContainer>
        )}
      </Card.Body>

      <Card.Footer border={true} className="text-center py-3">
        <button type="button" className="text-xs font-bold text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
          View Full History <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
        </button>
      </Card.Footer>
    </Card>
  );
};

// Subcomponent for rendering the conceptual Faculty Ledger Account & Audit Card
const FacultyLedgerAuditCard = ({ salaryConfigs = [], activeConfig, transactions = [], onReconcile, onDisburse, onIssueAdvance, onViewLogs }) => {
  const calculations = React.useMemo(() => {
    const totalAmountToPay = calculateTotalAmountToPay(salaryConfigs);
    const avgMonthlyPay = calculateAverageMonthlyPay(salaryConfigs);
    const activeBaseRate = calculateActiveBaseRate(salaryConfigs);

    const paidAmount = transactions.reduce((sum, tx) => {
      return sum + Number(tx.amount);
    }, 0);

    const pendingAmount = Math.max(0, totalAmountToPay - paidAmount);
    const settlementRatio = totalAmountToPay > 0 ? (paidAmount / totalAmountToPay) * 100 : 0;

    const successfulCount = transactions.length;
    const pendingCount = 0;

    const advancesSum = aq(transactions)
      .filter(tx => tx.payment_type === 'ADVANCE')
      .rollup({ sum: op.sum('amount') })
      .objects()[0]?.sum || 0;

    const methodSummaryList = aq(transactions)
      .groupby('payment_method')
      .rollup({ sum: op.sum('amount') })
      .objects();

    const methodSummary = methodSummaryList.reduce((acc, row) => {
      acc[row.payment_method] = row.sum;
      return acc;
    }, {});

    const upiSum = methodSummary['UPI'] || 0;
    const cashSum = methodSummary['CASH'] || 0;
    const bankSum = methodSummary['BANK_TRANSFER'] || 0;

    const uniqueMonths = [...new Set(transactions.map(tx => tx.salary_month))];
    const monthsPaidCount = uniqueMonths.length || 1;

    // avg monthly amount we have paid or paying until now == avg of successful transactions / number of unique months
    const avgMonthlyPaid = paidAmount / monthsPaidCount;

    console.log({
      "Total Amount To Pay: ": totalAmountToPay,
      "Average Amount To Pay": avgMonthlyPay,
      "Avg Monthly Paid": avgMonthlyPaid
    })

    return {
      totalAmountToPay,
      avgMonthlyPay,
      paidAmount,
      pendingAmount,
      settlementRatio,
      successfulCount,
      pendingCount,
      advancesSum,
      upiSum,
      cashSum,
      bankSum,
      avgMonthlyPaid,
      activeBaseRate
    };
  }, [salaryConfigs, transactions]);

  const formatLakh = (num) => {
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)}L`;
    }
    return `₹${num.toLocaleString()}`;
  };

  const formatK = (num) => {
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${num.toLocaleString()}`;
  };

  return (
    <Card>
      <Card.Header border={true} className="flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary text-xl">account_balance_wallet</span>
          <h3 className="text-lg font-bold text-text-main dark:text-white">
            Ledger Audit Summary
          </h3>
        </div>
        <Badge variant="success" className="font-black tracking-widest text-[9px] uppercase px-2 py-0.5">
          RECONCILED
        </Badge>
      </Card.Header>

      <Card.Body className="space-y-6">

        {/* Section A: Budgetary Allocation */}
        <div className="space-y-3">
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest block">Budgetary Allocation</span>

          <div className="bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-xl border border-border-light dark:border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Total Contract Value</span>
              <p className="text-2xl font-bold font-mono text-text-main dark:text-white mt-1">
                INR {calculations.totalAmountToPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <span className="material-symbols-outlined text-text-secondary text-2xl">account_balance</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50/30 dark:bg-slate-950/20 p-3 rounded-lg border border-border-light dark:border-slate-800/30">
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Active Base Rate</span>
              <span className="font-bold text-text-main dark:text-white font-mono">
                INR {calculations.activeBaseRate.toLocaleString(undefined, { maximumFractionDigits: 2 })}/mo
              </span>
            </div>
            <div className="bg-slate-50/30 dark:bg-slate-950/20 p-3 rounded-lg border border-border-light dark:border-slate-800/30">
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Settlement Ratio</span>
              <span className="font-bold text-text-main dark:text-white font-mono">
                {calculations.settlementRatio.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Average Payouts Full-Width Split Card */}
          <div className="bg-orange-500/5 dark:bg-rose-500/5 p-4 rounded-xl border border-orange-500/20 dark:border-rose-500/20 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-orange-500 dark:text-rose-400 uppercase tracking-wider">Average Monthly Payouts</span>
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] text-text-secondary uppercase block">Should Pay</span>
                <span className="text-sm font-bold font-mono text-text-main dark:text-white">
                  ₹{calculations.avgMonthlyPay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="h-8 w-px bg-orange-500/20 dark:bg-rose-500/20" />
              <div className="text-right">
                <span className="text-[9px] text-text-secondary uppercase block">Currently Paying</span>
                <span className="text-sm font-bold font-mono text-text-main dark:text-white">
                  ₹{calculations.avgMonthlyPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Transaction Reconciliation */}
        <div className="space-y-4 pt-4 border-t border-border-light/10 dark:border-slate-800/40">
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest block">Transaction Reconciliation</span>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">Gross Paid</span>
              <p className="text-xl font-bold font-mono text-emerald-400">
                {formatLakh(calculations.paidAmount)}
              </p>
            </div>
            <div className="bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/20">
              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">Net Owed</span>
              <p className="text-xl font-bold font-mono text-indigo-400">
                {formatK(calculations.pendingAmount)}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-medium">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-[16px]">check_circle</span>
                <span>Successful Payments</span>
              </div>
              <span className="font-bold font-mono">{calculations.successfulCount}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[16px]">pending</span>
                <span>Pending Processing</span>
              </div>
              <span className="font-bold font-mono">{calculations.pendingCount}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[16px]">payments</span>
                <span>Salary Advances</span>
              </div>
              <span className="font-bold font-mono">INR {calculations.advancesSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="bg-slate-50/30 dark:bg-slate-950/20 py-2.5 rounded-lg border border-border-light dark:border-slate-800/40">
              <span className="text-[9px] font-bold text-text-secondary uppercase block mb-0.5">UPI</span>
              <span className="font-bold font-mono text-text-main dark:text-white">
                ₹{calculations.upiSum.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-50/30 dark:bg-slate-950/20 py-2.5 rounded-lg border border-border-light dark:border-slate-800/40">
              <span className="text-[9px] font-bold text-text-secondary uppercase block mb-0.5">Cash</span>
              <span className="font-bold font-mono text-text-main dark:text-white">
                ₹{calculations.cashSum.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-50/30 dark:bg-slate-950/20 py-2.5 rounded-lg border border-border-light dark:border-slate-800/40">
              <span className="text-[9px] font-bold text-text-secondary uppercase block mb-0.5">Bank</span>
              <span className="font-bold font-mono text-text-main dark:text-white">
                ₹{calculations.bankSum.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Triggers Grid inside card body */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-light/10 dark:border-slate-800/40">
          <Button
            variant="outlined"
            size="sm"
            startIcon="payments"
            onClick={onIssueAdvance}
            className="w-full text-[10px] uppercase font-bold"
          >
            Issue Advance
          </Button>
          <Button
            variant="outlined"
            size="sm"
            startIcon="assignment"
            onClick={onViewLogs}
            className="w-full text-[10px] uppercase font-bold"
          >
            View Logs
          </Button>
        </div>

      </Card.Body>

      <Card.Footer border={true} className="flex gap-2">
        <Button
          variant="outlined"
          size="md"
          onClick={onReconcile}
          className="flex-1 text-[10px] uppercase font-bold"
        >
          Reconcile Ledger
        </Button>
        <Button
          variant="contained"
          size="md"
          onClick={onDisburse}
          className="flex-1 text-[10px] uppercase font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Disburse Salary
        </Button>
      </Card.Footer>
    </Card>
  );
};

const TeacherSalaryPayroll = ({ teacherId }) => {
  const queryClient = useQueryClient();
  // Call only the single query hook with initialData cache initializer
  const { data: salaryConfigs = [], isPending } = useTeacherSalaryConfigsQuery(teacherId, {
    initialData: () => getCachedList(queryClient, 'teacherSalaryConfig', { teacherId })
  });

  // Mutations
  const deleteConfigMutation = useDeleteTeacherSalaryConfigMutation();

  // Local Form & Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingConfigId, setDeletingConfigId] = useState(null);

  // Client-side resolve active config
  const activeConfig = useMemo(() => {
    if (!salaryConfigs || salaryConfigs.length === 0) return null;
    const active = salaryConfigs.find(row => row.contract_status === 'active');
    if (active) return active;
    // Fallback to the latest record regardless of lifecycle phase if none matches
    return [...salaryConfigs].sort((a, b) => {
      const dateA = a.effective_from ? parseISO(a.effective_from) : new Date(0);
      const dateB = b.effective_from ? parseISO(b.effective_from) : new Date(0);
      return compareDesc(dateA, dateB);
    })[0];
  }, [salaryConfigs]);

  // Timeline & History sorting
  const sortedHistory = useMemo(() => {
    return [...salaryConfigs].sort((a, b) => {
      const dateA = a.effective_from ? parseISO(a.effective_from) : new Date(0);
      const dateB = b.effective_from ? parseISO(b.effective_from) : new Date(0);
      return compareDesc(dateA, dateB);
    });
  }, [salaryConfigs]);

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingConfig(null);
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (config) => {
    setEditingConfig(config);
    setIsFormOpen(true);
  };

  // Open Delete Dialog
  const handleOpenDelete = (configId) => {
    setDeletingConfigId(configId);
    setIsDeleteOpen(true);
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = () => {
    deleteConfigMutation.mutate({
      teacherId,
      salaryConfigId: deletingConfigId
    }, {
      onSuccess: (res) => {
        if (res.success) {
          setIsDeleteOpen(false);
          setDeletingConfigId(null);
        }
      }
    });
  };

  // Paystub list
  const mock_payment_transaction_list = [
    { "transaction_id": "PTX-001", "teacher_id": "TCH-EF263ECD", "payment_type": "SALARY", "amount": 5000, "payment_method": "BANK_TRANSFER", "transaction_date": "2026-03-01", "reference_number": "REF-1001", "salary_month": "2026-03", "notes": "", "created_by": "Manish Kumar", "__tx_id": "TX-9001", "__tx_status": "SUCCESS", "__created_at": "2026-03-01 10:00:00" },
    { "transaction_id": "PTX-002", "teacher_id": "TCH-EF263ECD", "payment_type": "ADVANCE", "amount": 1500, "payment_method": "CASH", "transaction_date": "2026-03-05", "reference_number": "REF-1002", "salary_month": "2026-03", "notes": "", "created_by": "Sarger Soni", "__tx_id": "TX-9002", "__tx_status": "PENDING", "__created_at": "2026-03-05 14:30:00" },
    { "transaction_id": "PTX-003", "teacher_id": "TCH-EF263ECD", "payment_type": "BONUS", "amount": 500, "payment_method": "UPI", "transaction_date": "2026-03-15", "reference_number": "REF-1003", "salary_month": "2026-03", "notes": "", "created_by": "Manish Kumar", "__tx_id": "TX-9003", "__tx_status": "SUCCESS", "__created_at": "2026-03-15 09:15:00" },
    { "transaction_id": "PTX-004", "teacher_id": "TCH-EF263ECD", "payment_type": "SALARY", "amount": 4500, "payment_method": "BANK_TRANSFER", "transaction_date": "2026-04-01", "reference_number": "REF-1004", "salary_month": "2026-04", "notes": "", "created_by": "Sarger Soni", "__tx_id": "TX-9004", "__tx_status": "SUCCESS", "__created_at": "2026-04-01 10:00:00" },
    { "transaction_id": "PTX-005", "teacher_id": "TCH-EF263ECD", "payment_type": "SALARY", "amount": 5500, "payment_method": "BANK_TRANSFER", "transaction_date": "2026-04-01", "reference_number": "REF-1005", "salary_month": "2026-04", "notes": "", "created_by": "Manish Kumar", "__tx_id": "TX-9005", "__tx_status": "SUCCESS", "__created_at": "2026-04-01 10:00:00" },
    { "transaction_id": "PTX-006", "teacher_id": "TCH-EF263ECD", "payment_type": "ADVANCE", "amount": 1000, "payment_method": "UPI", "transaction_date": "2026-04-05", "reference_number": "REF-1006", "salary_month": "2026-04", "notes": "", "created_by": "Sarger Soni", "__tx_id": "TX-9006", "__tx_status": "SUCCESS", "__created_at": "2026-04-05 14:00:00" },
    { "transaction_id": "PTX-007", "teacher_id": "TCH-EF263ECD", "payment_type": "SALARY", "amount": 5000, "payment_method": "BANK_TRANSFER", "transaction_date": "2026-04-01", "reference_number": "REF-1007", "salary_month": "2026-04", "notes": "", "created_by": "Manish Kumar", "__tx_id": "TX-9007", "__tx_status": "SUCCESS", "__created_at": "2026-04-01 10:00:00" },
    { "transaction_id": "PTX-008", "teacher_id": "TCH-EF263ECD", "payment_type": "BONUS", "amount": 500, "payment_method": "CASH", "transaction_date": "2026-04-15", "reference_number": "REF-1008", "salary_month": "2026-04", "notes": "", "created_by": "Sarger Soni", "__tx_id": "TX-9008", "__tx_status": "SUCCESS", "__created_at": "2026-04-15 11:00:00" },
    { "transaction_id": "PTX-009", "teacher_id": "TCH-EF263ECD", "payment_type": "ADVANCE", "amount": 2000, "payment_method": "BANK_TRANSFER", "transaction_date": "2026-04-20", "reference_number": "REF-1009", "salary_month": "2026-04", "notes": "", "created_by": "Manish Kumar", "__tx_id": "TX-9009", "__tx_status": "PENDING", "__created_at": "2026-04-20 09:30:00" },
    { "transaction_id": "PTX-010", "teacher_id": "TCH-EF263ECD", "payment_type": "SALARY", "amount": 5000, "payment_method": "BANK_TRANSFER", "transaction_date": "2026-05-01", "reference_number": "REF-1010", "salary_month": "2026-05", "notes": "", "created_by": "Sarger Soni", "__tx_id": "TX-9010", "__tx_status": "SUCCESS", "__created_at": "2026-05-01 10:00:00" },
    { "transaction_id": "PTX-011", "teacher_id": "TCH-EF263ECD", "payment_type": "SALARY", "amount": 5000, "payment_method": "BANK_TRANSFER", "transaction_date": "2026-05-01", "reference_number": "REF-1011", "salary_month": "2026-05", "notes": "", "created_by": "Manish Kumar", "__tx_id": "TX-9011", "__tx_status": "SUCCESS", "__created_at": "2026-05-01 10:00:00" },
    { "transaction_id": "PTX-012", "teacher_id": "TCH-EF263ECD", "payment_type": "SALARY", "amount": 4500, "payment_method": "BANK_TRANSFER", "transaction_date": "2026-05-01", "reference_number": "REF-1012", "salary_month": "2026-05", "notes": "", "created_by": "Sarger Soni", "__tx_id": "TX-9012", "__tx_status": "SUCCESS", "__created_at": "2026-05-01 10:00:00" },
    { "transaction_id": "PTX-013", "teacher_id": "TCH-EF263ECD", "payment_type": "SALARY", "amount": 5500, "payment_method": "BANK_TRANSFER", "transaction_date": "2026-05-01", "reference_number": "REF-1013", "salary_month": "2026-05", "notes": "", "created_by": "Manish Kumar", "__tx_id": "TX-9013", "__tx_status": "SUCCESS", "__created_at": "2026-05-01 10:00:00" }
  ];

  // Render Loading Spinner only on initial fetch when no cached data exists (silent background refresh does not freeze UI)
  if (isPending && salaryConfigs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Active Salary Configuration Card */}
        <div className="lg:col-span-8">
          <SalaryConfigsCard
            salaryConfigs={salaryConfigs}
            activeConfig={activeConfig}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onCreate={handleOpenCreate}
          />
        </div>

        {/* Financial KPI Stack / Faculty Ledger Account & Audit Card */}
        <div className="lg:col-span-4">
          <FacultyLedgerAuditCard
            teacherId={teacherId}
            salaryConfigs={salaryConfigs}
            activeConfig={activeConfig}
            transactions={mock_payment_transaction_list}
            onReconcile={() => console.log('Reconcile Ledger Callback')}
            onDisburse={() => console.log('Disburse Salary Callback')}
            onIssueAdvance={() => console.log('Issue Advance Callback')}
            onViewLogs={() => console.log('View Logs Callback')}
          />
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Payroll Ledger Card */}
        <div className="lg:col-span-8">
          <TeacherPaymentTransactionsCard transactions={mock_payment_transaction_list} />
        </div>

        {/* Config History Timeline Card */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <Card.Header border={true} className="flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-text-secondary text-xl">history</span>
                <h3 className="text-lg font-bold text-text-main dark:text-white">
                  Config History
                </h3>
              </div>
            </Card.Header>

            <Card.Body className="p-6">
              {sortedHistory.length > 0 ? (
                <div className="relative pl-2">
                  {sortedHistory.map((item, index) => {
                    const isCurrent = item.salary_config_id === activeConfig?.salary_config_id;
                    const val = item.base_value || item.base_amount || 0;

                    const dateFrom = item.effective_from ? new Date(item.effective_from).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '';
                    const dateTo = item.effective_to ? new Date(item.effective_to).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present';

                    return (
                      <div key={item.salary_config_id} className="relative pl-6 pb-6 last:pb-0 group">
                        {index < sortedHistory.length - 1 && (
                          <div className="absolute left-[5.5px] top-4 bottom-0 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
                        )}
                        <div className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-surface-light dark:border-surface-dark ${isCurrent ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-700'}`}></div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">{dateFrom} - {dateTo}</span>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-text-main dark:text-white capitalize">
                              {(item.salary_config_type || 'recurring_monthly').replace('_', ' ')}
                            </span>
                            <span className="text-sm font-mono font-bold text-text-main dark:text-white">
                              ₹{val.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge variant={
                              item.contract_status === 'active' ? 'success' :
                                item.contract_status === 'drafted' ? 'default' :
                                  item.contract_status === 'expired' ? 'warning' : 'danger'
                            } className="font-extrabold text-[8px] uppercase px-1.5 py-0.5 scale-90 origin-left">
                              {item.contract_status || 'drafted'}
                            </Badge>
                            <Badge variant={
                              item.settlement_state === 'settled' ? 'success' :
                                item.settlement_state === 'unsettled' ? 'warning' : 'danger'
                            } className="font-extrabold text-[8px] uppercase px-1.5 py-0.5 scale-90 origin-left">
                              {(item.settlement_state || 'unsettled').replace('_', ' ')}
                            </Badge>
                          </div>

                          {item.remark && (
                            <p className="text-xs text-text-secondary leading-relaxed font-medium mt-1">
                              {item.remark}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="text-[11px] font-bold text-primary hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleOpenDelete(item.salary_config_id)}
                              className="text-[11px] font-bold text-rose-500 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-text-secondary/20 text-4xl mb-2">history</span>
                  <p className="text-xs text-text-secondary">No contract history found.</p>
                </div>
              )}
            </Card.Body>

            <Card.Footer border={true} className="text-center py-3 bg-slate-50/5 dark:bg-slate-800/10">
              <button className="text-xs font-bold text-text-secondary hover:text-primary transition-colors">
                Archive Records
              </button>
            </Card.Footer>
          </Card>
        </div>

      </div>

      {
        isFormOpen && <SalaryConfigModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          teacherId={teacherId}
          config={editingConfig}
        />
      }

      {/* Confirmation Modal for Deletion */}
      {
        isDeleteOpen && <ConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Salary Configuration"
          message="Are you sure you want to permanently delete this salary configuration? This action will remove the record from the sheets database and cannot be undone."
          confirmText="Confirm Delete"
          isProcessing={deleteConfigMutation.isPending}
        />
      }


    </div >
  );
};

export default TeacherSalaryPayroll;
