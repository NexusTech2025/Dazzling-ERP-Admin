import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';

import Card from '../../../../components/ui/Card';
import FormField from '../../../../components/ui/v2/FormField';
import TextInput from '../../../../components/ui/v2/TextInput';
import SelectInput from '../../../../components/ui/v2/SelectInput';
import RadioGroup from '../../../../components/ui/v2/RadioGroup';
import KpiCard from '../../../../components/ui/v2/KpiCard';
import KpiGrid from '../../../../components/ui/v2/KpiGrid';
import AlertCard from '../../../../components/ui/v2/AlertCard';
import Badge from '../../../../components/ui/Badge';

import {
  SETTLEMENT_POLICY_CONFIG,
  SETTLEMENT_POLICY_OPTIONS
} from '../../config/withdrawalSettlementConfig';
import { WithdrawalSettlementAlertStrategy } from '../../utils/enrollmentAlertStrategies';

/**
 * Config-driven Withdrawal & Financial Settlement Policy Input Section.
 * Gated to appear dynamically when Enrollment Status is set to 'withdrawn' or 'discarded'.
 * 
 * Features:
 * - Dynamic financial snapshot via KpiCard metrics.
 * - Declarative policy selection via RadioGroup.
 * - Dynamic field rendering driven by SETTLEMENT_POLICY_CONFIG.
 * - Real-time accounting simulation powered by WithdrawalSettlementAlertStrategy.
 * - Automatic seating allocation cascade warning banner.
 *
 * @component
 * @param {object} props
 * @param {object} props.control - react-hook-form control object.
 * @param {object} props.errors - react-hook-form validation errors object.
 * @param {function} props.watch - react-hook-form watch function.
 * @param {object} props.financialContext - Extracted accounting numbers for live simulation.
 * @param {number} props.financialContext.amountPaid - Total collected payments on SFA.
 * @param {number} props.financialContext.balanceDue - Outstanding fee balance on SFA.
 * @param {number} props.financialContext.totalFee - Original contract fee.
 * @param {number} props.financialContext.pendingInstallments - Count of unpaid/pending installments.
 * @param {number} props.financialContext.totalInstallments - Total installment schedule count.
 * @param {number} props.financialContext.allocationsCount - Total batch seat allocations.
 */
export default function WithdrawalSettlementSection({
  control,
  errors,
  watch,
  financialContext
}) {
  const alertStrategy = useMemo(() => new WithdrawalSettlementAlertStrategy(), []);

  const selectedPolicy = watch('financial_settlement.policy') || 'waive_unpaid';
  const requiredAmount = watch('financial_settlement.required_amount');
  const refundAmount = watch('financial_settlement.refund_amount');

  const currentPolicyConfig = SETTLEMENT_POLICY_CONFIG[selectedPolicy] || SETTLEMENT_POLICY_CONFIG.waive_unpaid;

  // Real-time evaluation of accounting simulation impact
  const simulationImpact = useMemo(() => {
    return alertStrategy.evaluate({
      policy: selectedPolicy,
      amountPaid: financialContext?.amountPaid || 0,
      balanceDue: financialContext?.balanceDue || 0,
      totalFee: financialContext?.totalFee || 0,
      pendingInstallments: financialContext?.pendingInstallments || 0,
      totalInstallments: financialContext?.totalInstallments || 0,
      allocationsCount: financialContext?.allocationsCount || 0,
      requiredAmount,
      refundAmount
    });
  }, [alertStrategy, selectedPolicy, financialContext, requiredAmount, refundAmount]);

  return (
    <Card className="border border-rose-200 dark:border-rose-900/60 bg-surface-light dark:bg-surface-dark shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <Card.Header
        border={true}
        className="flex items-center justify-between font-semibold text-text-main dark:text-white bg-rose-50/50 dark:bg-rose-950/20"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-500">account_balance</span>
          <span>Withdrawal Financial Settlement Policy</span>
        </div>
        <Badge variant="danger" className="text-xs">
          WITHDRAWAL CONFIGURATION
        </Badge>
      </Card.Header>

      <Card.Body className="p-6 space-y-6">
        {/* 1. Financial Ledger Snapshot Metrics */}
        <div>
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary">analytics</span>
            Current Financial Ledger Snapshot
          </div>
          <KpiGrid columns={4} className="gap-3">
            <KpiCard
              label="TOTAL CONTRACT FEE"
              value={financialContext?.totalFee || 0}
              icon="receipt_long"
              size="sm"
              variant="neutral"
            />
            <KpiCard
              label="TOTAL AMOUNT PAID"
              value={financialContext?.amountPaid || 0}
              icon="payments"
              size="sm"
              variant="success"
            />
            <KpiCard
              label="OUTSTANDING BALANCE"
              value={financialContext?.balanceDue || 0}
              icon="account_balance_wallet"
              size="sm"
              variant={financialContext?.balanceDue > 0 ? 'warning' : 'neutral'}
            />
            <KpiCard
              label="SCHEDULED INSTALLMENTS"
              value={financialContext?.totalInstallments || 0}
              icon="calendar_month"
              size="sm"
              variant="info"
              isCount={true}
              trend={
                <span className="text-[10px] text-amber-500 font-semibold">
                  {financialContext?.pendingInstallments || 0} Pending
                </span>
              }
            />
          </KpiGrid>
        </div>

        {/* 2. Settlement Policy Selection (RadioGroup - 2 Columns on Desktop) */}
        <div>
          <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-indigo-500">rule</span>
            Select Settlement Strategy
          </div>
          <Controller
            name="financial_settlement.policy"
            control={control}
            render={({ field }) => (
              <RadioGroup
                name={field.name}
                options={SETTLEMENT_POLICY_OPTIONS}
                value={field.value || 'waive_unpaid'}
                onChange={field.onChange}
                layout="grid"
                columns={2}
                error={errors?.financial_settlement?.policy?.message}
              />
            )}
          />
        </div>

        {/* 3. Dynamic Policy Input Fields (Config-Driven) */}
        {currentPolicyConfig?.fields?.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="text-xs font-bold text-text-main dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="material-symbols-outlined text-sm text-primary">edit_attributes</span>
              {currentPolicyConfig.label} Configuration
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {currentPolicyConfig.fields.map((fieldDef) => {
                const fieldError = errors?.financial_settlement?.[fieldDef.name]?.message;
                const helperMsg = typeof fieldDef.helperText === 'function'
                  ? fieldDef.helperText(financialContext || {})
                  : fieldDef.helperText;

                return (
                  <div
                    key={fieldDef.name}
                    className={fieldDef.colSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'}
                  >
                    <FormField
                      label={fieldDef.label}
                      required={fieldDef.required}
                      error={fieldError}
                    >
                      <Controller
                        name={`financial_settlement.${fieldDef.name}`}
                        control={control}
                        render={({ field }) => {
                          if (fieldDef.type === 'select') {
                            return (
                              <SelectInput
                                {...field}
                                options={fieldDef.options || []}
                                value={field.value || ''}
                                onChange={field.onChange}
                              />
                            );
                          }

                          return (
                            <TextInput
                              {...field}
                              type={fieldDef.type}
                              placeholder={fieldDef.placeholder}
                              startIcon={fieldDef.startIcon}
                              value={field.value ?? ''}
                              onChange={field.onChange}
                            />
                          );
                        }}
                      />
                    </FormField>
                    {helperMsg && !fieldError && (
                      <p className="text-[11px] text-text-secondary mt-1 pl-1">{helperMsg}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Live Accounting Simulation Impact Alert */}
        {simulationImpact && (
          <AlertCard
            variant={simulationImpact.variant || 'info'}
            title={simulationImpact.title}
            message={
              Array.isArray(simulationImpact.bullets) && simulationImpact.bullets.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 mt-1 text-xs">
                  {simulationImpact.bullets.map((bullet, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : (
                simulationImpact.message || simulationImpact.description || ''
              )
            }
          />
        )}

        {/* 5. Automatic Seating Allocations Cascade Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
          <span className="material-symbols-outlined text-amber-500 text-base mt-0.5 shrink-0">
            warning
          </span>
          <div>
            <div className="font-bold text-amber-900 dark:text-amber-200">
              Automatic Seating Allocation Cascade
            </div>
            <div className="text-[11px] text-amber-700/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
              All active batch seating allocations ({financialContext?.allocationsCount || 0} course slots) for this enrollment will automatically transition to <span className="font-bold">DROPPED</span> status with the current timestamp upon saving.
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

WithdrawalSettlementSection.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  financialContext: PropTypes.shape({
    amountPaid: PropTypes.number,
    balanceDue: PropTypes.number,
    totalFee: PropTypes.number,
    pendingInstallments: PropTypes.number,
    totalInstallments: PropTypes.number,
    allocationsCount: PropTypes.number
  })
};
