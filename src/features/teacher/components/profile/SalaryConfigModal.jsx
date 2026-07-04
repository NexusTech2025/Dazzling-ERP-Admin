import React, { useState, useEffect, useMemo } from 'react';
import { parseISO, format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormField from '../../../../components/ui/v2/FormField';
import TextInput from '../../../../components/ui/v2/TextInput';
import SelectInput from '../../../../components/ui/v2/SelectInput';
import Button from '../../../../components/ui/v2/Button';
import { salaryConfigSchema } from '../../utils/salaryConfigValidation';
import { useBatchesQuery } from '../../../batch/hooks/useBatchQueries';
import BatchSelectionModal from '../../../batch/components/BatchSelectionModal';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import APIErrorModal from '../../../../components/ui/APIErrorModal';
import {
  useSetTeacherSalaryConfigMutation,
  useUpdateTeacherSalaryConfigMutation
} from '../../hooks/useTeacherQueries';

const helpDescriptions = {
  salaryConfigType: "Defines the macro financial and budgetary behavior of the contract. 'recurring_monthly' treats payouts as ongoing expenses, while 'fixed_duration_pool' isolates a fixed up-front capital cap.",
  rateType: "Dictates the distinct mathematical strategy to compute payouts: monthly flat amount, yearly fraction, or variable percentage shares of course revenue.",
  baseValue: "The core numerical coefficient. Calculated automatically for Yearly rates, or input manually for Monthly/Revenue configurations.",
  scopeType: "Determines the application boundary. 'global' covers all activities, while 'single_batch' or 'batch_group' localizes this rule to specific class schedules.",
  totalContractValue: "The absolute financial commitment assigned to the entire contract duration. Required for Fixed Duration Pools and Yearly rates.",
  scopeId: "Holds target batch ID(s). For batch groups, it parses weight splits (e.g., {'BTC-101': 0.6, 'BTC-102': 0.4}) to distribute base payouts.",
  effectiveFrom: "The explicit calendar date marking when this compensation strategy starts taking effect.",
  effectiveTo: "The expiration date of this contractual config. Auto-calculated for Yearly rates, or custom offset via months.",
  remark: "A short label defining the core purpose of this configuration block (e.g., 'Summer Bootcamp Supplement').",
  notes: "An extensive note section for logging detailed contract terms, triggers, or administrative context.",
  contractStatus: "The contract execution phase. Governs whether the payroll system resolves payouts for this active config. Default is 'drafted'.",
  settlementState: "Represents the structural financial reconciliation state of the contract (e.g., 'unsettled', 'settled').",
  durationMonths: "Optional helper input. Specify duration in months to automatically set the expiration (Effective To) date."
};

/**
 * Decoupled helper to calculate monthly base salary value from total contract value.
 * @param {string|number} totalContractVal - The total contract value.
 * @returns {number|string} Calculated monthly base value.
 */
export const calculateBaseValue = (totalContractVal) => {
  const val = Number(totalContractVal);
  return isNaN(val) || val <= 0 ? '' : Number((val / 12).toFixed(2));
};

/**
 * Decoupled helper to calculate expiration date given a commencement date and month offset.
 * @param {string} effectiveFrom - The starting ISO/string date YYYY-MM-DD.
 * @param {number|string} durationMonths - The offset in months.
 * @returns {string} The computed expiration date YYYY-MM-DD.
 */
export const calculateEffectiveTo = (effectiveFrom, durationMonths) => {
  if (!effectiveFrom || !durationMonths) return '';
  const fromDate = new Date(effectiveFrom);
  fromDate.setMonth(fromDate.getMonth() + Number(durationMonths));
  fromDate.setDate(fromDate.getDate() - 1);
  return fromDate.toISOString().split('T')[0];
};

/**
 * Decoupled helper to calculate expiration date for exactly one year contract.
 * @param {string} effectiveFrom - The starting ISO/string date YYYY-MM-DD.
 * @returns {string} The computed expiration date YYYY-MM-DD.
 */
export const calculateYearlyEffectiveTo = (effectiveFrom) => {
  if (!effectiveFrom) return '';
  const fromDate = new Date(effectiveFrom);
  fromDate.setFullYear(fromDate.getFullYear() + 1);
  fromDate.setDate(fromDate.getDate() - 1);
  return fromDate.toISOString().split('T')[0];
};

/**
 * Decoupled helper to equally distribute weights among selected batch ids.
 * @param {Array} selection - Selected batch objects.
 * @returns {Object} Key-value map of { batch_id: weight }.
 */
export const distributeWeightsEqually = (selection) => {
  const count = selection.length;
  const newWeights = {};
  if (count > 0) {
    const baseWeight = Math.floor((1.0 / count) * 100) / 100;
    const remainder = Number((1.0 - (baseWeight * count)).toFixed(2));
    selection.forEach((batch, idx) => {
      newWeights[batch.batch_id] = idx === 0 ? Number((baseWeight + remainder).toFixed(2)) : baseWeight;
    });
  }
  return newWeights;
};

/**
 * Decoupled helper to map existing batch selection weights without re-distributing.
 * @param {Array} selection - Selected batch objects.
 * @param {Object} currentWeights - Already allocated weights.
 * @returns {Object} Key-value map of { batch_id: weight }.
 */
export const distributeWeightsRetained = (selection, currentWeights = {}) => {
  const newWeights = {};
  selection.forEach(batch => {
    newWeights[batch.batch_id] = currentWeights[batch.batch_id] !== undefined ? currentWeights[batch.batch_id] : 0;
  });
  return newWeights;
};

const RateTypeStrategies = {
  monthly: {
    requiresContractValue: false,
    isBaseValueDisabled: false,
    isEffectiveToDisabled: false,
    showDurationHelper: true,
    calculateBaseValue: () => undefined,
    calculateEffectiveTo: calculateEffectiveTo,
    distributeWeights: distributeWeightsRetained
  },
  revenue_percentage: {
    requiresContractValue: false,
    isBaseValueDisabled: false,
    isEffectiveToDisabled: false,
    showDurationHelper: true,
    calculateBaseValue: () => undefined,
    calculateEffectiveTo: calculateEffectiveTo,
    distributeWeights: distributeWeightsRetained
  },
  yearly: {
    requiresContractValue: true,
    isBaseValueDisabled: true,
    isEffectiveToDisabled: true,
    showDurationHelper: false,
    calculateBaseValue: calculateBaseValue,
    calculateEffectiveTo: calculateYearlyEffectiveTo,
    distributeWeights: distributeWeightsEqually
  }
};

const SalaryConfigModal = ({ isOpen, onClose, teacherId, config }) => {
  const setConfigMutation = useSetTeacherSalaryConfigMutation();
  const updateConfigMutation = useUpdateTeacherSalaryConfigMutation();

  // Load available batches for description mapping
  const { data: availableBatches = [] } = useBatchesQuery();

  const [showHelp, setShowHelp] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [allocatedWeights, setAllocatedWeights] = useState({});
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: 'idle', // 'success' | 'error'
    error: null,
    resultMessage: ''
  });

  const handleDismissModals = () => {
    const isSuccess = modalState.status === 'success';
    setModalState({ isOpen: false, status: 'idle', error: null, resultMessage: '' });
    if (isSuccess) {
      onClose();
    }
  };

  const initialFormState = {
    salaryConfigType: 'recurring_monthly',
    rateType: 'monthly',
    baseValue: '',
    scopeType: 'global',
    scopeId: '',
    totalContractValue: '',
    effectiveFrom: '',
    effectiveTo: '',
    remark: '',
    notes: '',
    contractStatus: 'drafted',
    settlementState: 'unsettled',
    durationMonths: ''
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(salaryConfigSchema),
    defaultValues: initialFormState
  });

  const salaryConfigType = watch('salaryConfigType');
  const scopeType = watch('scopeType');
  const scopeId = watch('scopeId');
  const rateType = watch('rateType');
  const effectiveFrom = watch('effectiveFrom');
  const totalContractValue = watch('totalContractValue');
  const durationMonths = watch('durationMonths');

  // Resolve active strategy
  const strategy = useMemo(() => {
    return RateTypeStrategies[rateType] || RateTypeStrategies.monthly;
  }, [rateType]);

  // Reactive strategy-based value automations
  useEffect(() => {
    const computedBase = strategy.calculateBaseValue(totalContractValue);
    if (computedBase !== undefined) {
      setValue('baseValue', computedBase, { shouldValidate: true });
    }
  }, [totalContractValue, strategy, setValue]);

  useEffect(() => {
    const computedTo = strategy.calculateEffectiveTo(effectiveFrom, durationMonths);
    if (computedTo !== undefined) {
      setValue('effectiveTo', computedTo, { shouldValidate: true });
    }
  }, [effectiveFrom, durationMonths, strategy, setValue]);

  // Sync state when modal opens or config changes
  useEffect(() => {
    if (isOpen) {
      if (config) {
        // Safe date-fns parsing to format date fields into YYYY-MM-DD for date input elements
        const formatForDateInput = (dateStr) => {
          if (!dateStr) return '';
          try {
            const normalizedStr = typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr;
            const parsedDate = parseISO(normalizedStr);
            return !isNaN(parsedDate.getTime()) ? format(parsedDate, 'yyyy-MM-dd') : '';
          } catch (e) {
            console.error('[SalaryConfigModal] Error parsing date:', dateStr, e);
            return '';
          }
        };

        const fromDate = formatForDateInput(config.effective_from);
        const toDate = formatForDateInput(config.effective_to);

        // Dynamically compute duration in months when editing
        let initialDuration = '';
        if (config.effective_from && config.effective_to) {
          try {
            const parsedFrom = parseISO(config.effective_from.replace(' ', 'T'));
            const parsedTo = parseISO(config.effective_to.replace(' ', 'T'));
            if (!isNaN(parsedFrom.getTime()) && !isNaN(parsedTo.getTime())) {
              // Add a slight adjustment (+1 day) to handle standard end-of-month boundaries correctly
              const adjustedTo = new Date(parsedTo.getTime() + 24 * 60 * 60 * 1000);
              const months = Math.round((adjustedTo - parsedFrom) / (1000 * 60 * 60 * 24 * 30.4375));
              initialDuration = months > 0 ? String(months) : '';
            }
          } catch (e) {
            console.error('[SalaryConfigModal] Error computing duration months:', e);
          }
        }
        
        const scopeIdStr = typeof config.scope_id === 'object' && config.scope_id !== null
          ? JSON.stringify(config.scope_id)
          : (config.scope_id || '');

        // Reset React Hook Form values
        reset({
          salaryConfigType: config.salary_config_type || 'recurring_monthly',
          rateType: config.rate_type || 'monthly',
          baseValue: config.base_value || config.base_amount || '',
          scopeType: config.scope_type || 'global',
          scopeId: scopeIdStr,
          totalContractValue: config.total_contract_value || '',
          effectiveFrom: fromDate,
          effectiveTo: toDate,
          remark: config.remark || '',
          notes: config.notes || '',
          contractStatus: config.contract_status || 'drafted',
          settlementState: config.settlement_state || 'unsettled',
          durationMonths: initialDuration
        });

        // Initialize allocated weights if batch_group
        if (config.scope_type === 'batch_group' && config.scope_id) {
          try {
            if (typeof config.scope_id === 'object') {
              setAllocatedWeights(config.scope_id);
            } else {
              setAllocatedWeights(JSON.parse(config.scope_id));
            }
          } catch (e) {
            setAllocatedWeights({});
          }
        } else {
          setAllocatedWeights({});
        }
      } else {
        reset({
          ...initialFormState,
          effectiveFrom: new Date().toISOString().split('T')[0]
        });
        setAllocatedWeights({});
      }
      setShowHelp(false);
    }
  }, [config, isOpen, reset]);

  // Map batch IDs to names
  const selectedBatchesInfo = useMemo(() => {
    if (scopeType === 'single_batch' && scopeId) {
      const batch = availableBatches.find(b => b.batch_id === scopeId);
      return batch ? [batch] : [{ batch_id: scopeId, batch_name: 'Loading/Unknown Batch' }];
    }
    if (scopeType === 'batch_group') {
      return Object.keys(allocatedWeights).map(id => {
        const batch = availableBatches.find(b => b.batch_id === id);
        return batch || { batch_id: id, batch_name: `Batch ID: ${id}` };
      });
    }
    return [];
  }, [scopeType, scopeId, allocatedWeights, availableBatches]);

  // Running sum of weights
  const totalWeight = useMemo(() => {
    if (scopeType !== 'batch_group') return 0;
    return Object.values(allocatedWeights).reduce((sum, w) => sum + Number(w || 0), 0);
  }, [allocatedWeights, scopeType]);

  const handleBatchSelect = (selection) => {
    if (scopeType === 'single_batch') {
      setValue('scopeId', selection.batch_id, { shouldValidate: true });
    } else if (scopeType === 'batch_group') {
      const newWeights = strategy.distributeWeights(selection, allocatedWeights);
      setAllocatedWeights(newWeights);
      setValue('scopeId', JSON.stringify(newWeights), { shouldValidate: true });
    }
  };

  const handleWeightChange = (batchId, rawValue) => {
    if (rawValue === '') {
      const updated = { ...allocatedWeights, [batchId]: '' };
      setAllocatedWeights(updated);
      setValue('scopeId', JSON.stringify(updated), { shouldValidate: true });
      return;
    }
    let val = Number(rawValue);
    if (isNaN(val)) return;
    if (val < 0) val = 0;
    if (val > 1) val = 1;

    const updated = {
      ...allocatedWeights,
      [batchId]: Number(val.toFixed(2))
    };
    setAllocatedWeights(updated);
    setValue('scopeId', JSON.stringify(updated), { shouldValidate: true });
  };

  const handleRemoveBatchFromGroup = (batchId) => {
    const updated = { ...allocatedWeights };
    delete updated[batchId];
    // Re-distribute weights equally for the remaining selection if yearly
    const remainingInfo = selectedBatchesInfo.filter(b => b.batch_id !== batchId);
    const reallocated = strategy.distributeWeights(remainingInfo, updated);
    setAllocatedWeights(reallocated);
    setValue('scopeId', Object.keys(reallocated).length > 0 ? JSON.stringify(reallocated) : '', { shouldValidate: true });
  };

  const onSubmitForm = (data) => {
    const payload = {
      teacherId,
      salaryConfigType: data.salaryConfigType,
      rateType: data.rateType,
      baseValue: Number(data.baseValue),
      scopeType: data.scopeType,
      scopeId: data.scopeId || null,
      totalContractValue: data.totalContractValue ? Number(data.totalContractValue) : null,
      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo || null,
      remark: data.remark || null,
      notes: data.notes || null,
      contractStatus: data.contractStatus,
      settlementState: data.settlementState
    };

    const options = {
      onSuccess: (res) => {
        if (res.success) {
          setModalState({
            isOpen: true,
            status: 'success',
            resultMessage: config 
              ? 'Salary configuration updated successfully.' 
              : 'Salary configuration created successfully.'
          });
        } else {
          setModalState({
            isOpen: true,
            status: 'error',
            error: res.error || { message: res.message || 'Failed to save configuration.' }
          });
        }
      },
      onError: (err) => {
        setModalState({
          isOpen: true,
          status: 'error',
          error: err
        });
      }
    };

    if (config) {
      updateConfigMutation.mutate({
        teacherId,
        salaryConfigId: config.salary_config_id,
        data: payload
      }, options);
    } else {
      setConfigMutation.mutate(payload, options);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-background-light dark:bg-slate-950/20">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-text-main dark:text-white leading-none">
              {config ? 'Update Salary Configuration' : 'Create Salary Configuration'}
            </h3>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className={`size-6 rounded-full flex items-center justify-center border transition-all ${showHelp ? 'bg-primary/20 border-primary text-primary' : 'border-border-light dark:border-border-dark text-text-secondary hover:text-text-main dark:hover:text-white'}`}
              title="Toggle Description Help"
            >
              <span className="material-symbols-outlined text-[15px] font-bold">info</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-main dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Salary Config Type" required error={errors.salaryConfigType?.message}>
                <Controller
                  name="salaryConfigType"
                  control={control}
                  render={({ field }) => (
                    <SelectInput
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.salaryConfigType?.message}
                      options={[
                        { value: 'recurring_monthly', label: 'Recurring Monthly' },
                        { value: 'fixed_duration_pool', label: 'Fixed Duration Pool' }
                      ]}
                    />
                  )}
                />
                {showHelp && (
                  <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                    {helpDescriptions.salaryConfigType}
                  </p>
                )}
              </FormField>

              <FormField label="Rate Type" required error={errors.rateType?.message}>
                <Controller
                  name="rateType"
                  control={control}
                  render={({ field }) => (
                    <SelectInput
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.rateType?.message}
                      options={[
                        { value: 'monthly', label: 'Monthly' },
                        { value: 'yearly', label: 'Yearly' },
                        { value: 'revenue_percentage', label: 'Revenue Percentage' }
                      ]}
                    />
                  )}
                />
                {showHelp && (
                  <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                    {helpDescriptions.rateType}
                  </p>
                )}
              </FormField>
            </div>

            {/* Status & Settlement Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Contract Status" required error={errors.contractStatus?.message}>
                <Controller
                  name="contractStatus"
                  control={control}
                  render={({ field }) => (
                    <SelectInput
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.contractStatus?.message}
                      options={[
                        { value: 'drafted', label: 'Drafted' },
                        { value: 'active', label: 'Active' },
                        { value: 'expired', label: 'Expired' },
                        { value: 'terminated', label: 'Terminated' },
                        { value: 'voided', label: 'Voided' }
                      ]}
                    />
                  )}
                />
                {showHelp && (
                  <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                    {helpDescriptions.contractStatus}
                  </p>
                )}
              </FormField>

              <FormField label="Settlement State" required error={errors.settlementState?.message}>
                <Controller
                  name="settlementState"
                  control={control}
                  render={({ field }) => (
                    <SelectInput
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.settlementState?.message}
                      options={[
                        { value: 'unsettled', label: 'Unsettled' },
                        { value: 'settled', label: 'Settled' },
                        { value: 'arrears_due', label: 'Arrears Due' }
                      ]}
                    />
                  )}
                />
                {showHelp && (
                  <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                    {helpDescriptions.settlementState}
                  </p>
                )}
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Base Value (₹ / %)" required error={errors.baseValue?.message}>
                <Controller
                  name="baseValue"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      type="number"
                      value={field.value}
                      placeholder={rateType === 'revenue_percentage' ? 'e.g. 25.0' : 'e.g. 50000'}
                      onChange={field.onChange}
                      disabled={strategy.isBaseValueDisabled}
                      error={errors.baseValue?.message}
                    />
                  )}
                />
                {showHelp && (
                  <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                    {helpDescriptions.baseValue}
                  </p>
                )}
              </FormField>

              <FormField label="Scope Type" required error={errors.scopeType?.message}>
                <Controller
                  name="scopeType"
                  control={control}
                  render={({ field }) => (
                    <SelectInput
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        setValue('scopeId', '');
                        setAllocatedWeights({});
                      }}
                      error={errors.scopeType?.message}
                      options={[
                        { value: 'global', label: 'Global' },
                        { value: 'batch_group', label: 'Batch Group' },
                        { value: 'single_batch', label: 'Single Batch' }
                      ]}
                    />
                  )}
                />
                {showHelp && (
                  <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                    {helpDescriptions.scopeType}
                  </p>
                )}
              </FormField>
            </div>

            {(salaryConfigType === 'fixed_duration_pool' || strategy.requiresContractValue) && (
              <FormField label="Total Contract Value (₹)" required error={errors.totalContractValue?.message}>
                <Controller
                  name="totalContractValue"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      type="number"
                      value={field.value}
                      placeholder="e.g. 300000"
                      onChange={field.onChange}
                      error={errors.totalContractValue?.message}
                    />
                  )}
                />
                {showHelp && (
                  <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                    {helpDescriptions.totalContractValue}
                  </p>
                )}
              </FormField>
            )}

            {/* Scope ID / Batch config - conditional for batch scopes */}
            {(scopeType === 'single_batch' || scopeType === 'batch_group') && (
              <FormField label="Batch Scope Selection" required error={errors.scopeId?.message}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                      {scopeType === 'single_batch' ? 'Assigned Target Batch' : 'Assigned Batch Group List'}
                    </span>
                    <Button
                      type="button"
                      variant="outlined"
                      size="sm"
                      startIcon="search"
                      onClick={() => setIsBatchModalOpen(true)}
                    >
                      {scopeType === 'single_batch' ? 'Select Batch' : 'Select Batches'}
                    </Button>
                  </div>

                  {/* Render Single Batch details */}
                  {scopeType === 'single_batch' && selectedBatchesInfo.length > 0 && selectedBatchesInfo[0].batch_id && (
                    <div className="bg-background-light dark:bg-slate-950 border border-border-light dark:border-border-dark p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-primary tracking-wider uppercase font-mono">{selectedBatchesInfo[0].batch_id}</span>
                        <p className="text-sm font-bold text-text-main dark:text-white">{selectedBatchesInfo[0].batch_name}</p>
                      </div>
                    </div>
                  )}

                  {/* Render Batch Group weights list */}
                  {scopeType === 'batch_group' && selectedBatchesInfo.length > 0 && (
                    <div className="space-y-2 border border-border-light dark:border-border-dark rounded-xl p-3 bg-background-light/50 dark:bg-slate-950/20">
                      {selectedBatchesInfo.map(b => (
                        <div key={b.batch_id} className="flex items-center gap-3 justify-between bg-surface-light dark:bg-slate-950 p-2.5 rounded-lg border border-border-light dark:border-border-dark/60">
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-bold text-primary font-mono leading-none block mb-0.5">{b.batch_id}</span>
                            <p className="text-xs font-bold text-text-main dark:text-white truncate">{b.batch_name}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              placeholder="0.00"
                              value={allocatedWeights[b.batch_id] !== undefined ? allocatedWeights[b.batch_id] : ''}
                              onChange={(e) => handleWeightChange(b.batch_id, Math.min(1, Math.max(0, Number(e.target.value))))}
                              className="w-16 h-8 text-center bg-background-light dark:bg-slate-950 border border-border-light dark:border-border-dark rounded-lg text-xs font-bold text-text-main dark:text-white focus:outline-none focus:border-primary"
                            />
                            <span className="text-[10px] text-text-secondary w-8 font-mono">
                              ({Math.round((allocatedWeights[b.batch_id] || 0) * 100)}%)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBatchFromGroup(b.batch_id)}
                              className="text-text-secondary hover:text-rose-500 transition-colors p-1"
                            >
                              <span className="material-symbols-outlined text-sm leading-none">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="pt-2 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs font-bold">
                        <span className="text-text-secondary uppercase tracking-widest text-[9px]">Total Allocation Weight:</span>
                        <span className={`${Math.abs(totalWeight - 1.0) < 0.001 ? 'text-emerald-500' : 'text-amber-500'} font-mono`}>
                          {totalWeight.toFixed(2)} ({Math.round(totalWeight * 100)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {showHelp && (
                  <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                    {helpDescriptions.scopeId}
                  </p>
                )}
              </FormField>
            )}

            {strategy.showDurationHelper ? (
              <div className="grid grid-cols-10 gap-4">
                <div className="col-span-4">
                  <FormField label="Effective From" required error={errors.effectiveFrom?.message}>
                    <Controller
                      name="effectiveFrom"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          type="date"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.effectiveFrom?.message}
                        />
                      )}
                    />
                    {showHelp && (
                      <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                        {helpDescriptions.effectiveFrom}
                      </p>
                    )}
                  </FormField>
                </div>

                <div className="col-span-4">
                  <FormField label="Effective To (Optional)" error={errors.effectiveTo?.message}>
                    <Controller
                      name="effectiveTo"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          type="date"
                          value={field.value}
                          onChange={field.onChange}
                          disabled={strategy.isEffectiveToDisabled}
                          error={errors.effectiveTo?.message}
                        />
                      )}
                    />
                    {showHelp && (
                      <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                        {helpDescriptions.effectiveTo}
                      </p>
                    )}
                  </FormField>
                </div>

                <div className="col-span-2">
                  <FormField label="Duration" error={errors.durationMonths?.message}>
                    <Controller
                      name="durationMonths"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          type="number"
                          value={field.value || ''}
                          placeholder="Months"
                          onChange={field.onChange}
                          error={errors.durationMonths?.message}
                        />
                      )}
                    />
                    {showHelp && (
                      <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                        {helpDescriptions.durationMonths}
                      </p>
                    )}
                  </FormField>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Effective From" required error={errors.effectiveFrom?.message}>
                  <Controller
                    name="effectiveFrom"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        type="date"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.effectiveFrom?.message}
                      />
                    )}
                  />
                  {showHelp && (
                    <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                      {helpDescriptions.effectiveFrom}
                    </p>
                  )}
                </FormField>

                <FormField label="Effective To (Optional)" error={errors.effectiveTo?.message}>
                  <Controller
                    name="effectiveTo"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        type="date"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={strategy.isEffectiveToDisabled}
                        error={errors.effectiveTo?.message}
                      />
                    )}
                  />
                  {showHelp && (
                    <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                      {helpDescriptions.effectiveTo}
                    </p>
                  )}
                </FormField>
              </div>
            )}

            <FormField label="Remark (Summary Label)" error={errors.remark?.message}>
              <Controller
                name="remark"
                control={control}
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    placeholder="e.g. Summer Batch Bonus, Standard Monthly Contract..."
                    onChange={field.onChange}
                    error={errors.remark?.message}
                  />
                )}
              />
              {showHelp && (
                <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                  {helpDescriptions.remark}
                </p>
              )}
            </FormField>

            <FormField label="Detailed Notes / Contract Terms" error={errors.notes?.message}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <textarea
                    rows="3"
                    value={field.value}
                    placeholder="Enter detailed faculty contract terms, bonus settings, or unique calculations..."
                    onChange={field.onChange}
                    className={`w-full bg-background-light dark:bg-slate-950 border ${errors.notes?.message ? 'border-red-500 focus:border-red-500' : 'border-border-light dark:border-border-dark'} rounded-xl p-3 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary transition-colors`}
                  ></textarea>
                )}
              />
              {errors.notes?.message && (
                <p className="text-[10px] font-medium text-red-500 pl-1 mt-1">{errors.notes.message}</p>
              )}
              {showHelp && (
                <p className="text-[10px] text-primary mt-1 font-medium italic leading-relaxed">
                  {helpDescriptions.notes}
                </p>
              )}
            </FormField>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-background-light dark:bg-slate-950/40 border-t border-border-light dark:border-border-dark flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outlined"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={setConfigMutation.isPending || updateConfigMutation.isPending}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      </div>

      {/* Embedded BatchSelectionModal */}
      <BatchSelectionModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSelect={handleBatchSelect}
        multiple={scopeType === 'batch_group'}
        selectedBatchId={scopeType === 'single_batch' ? scopeId : null}
        selectedBatchIds={scopeType === 'batch_group' ? Object.keys(allocatedWeights) : []}
        availableBatches={availableBatches}
      />

      {/* Success Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.status === 'success'}
        onClose={handleDismissModals}
        onConfirm={handleDismissModals}
        status="success"
        title="Configuration Saved Successfully"
        resultMessage={modalState.resultMessage}
      />

      {/* Error Modal */}
      <APIErrorModal
        isOpen={modalState.isOpen && modalState.status === 'error'}
        onClose={handleDismissModals}
        title="Salary Configuration Error"
        error={modalState.error}
      />

    </div>
  );
};

export default SalaryConfigModal;
