import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import RightDrawer from '../../../../../components/ui/v2/RightDrawer';
import FormField from '../../../../../components/ui/v2/FormField';
import TextInput from '../../../../../components/ui/v2/TextInput';
import Button from '../../../../../components/ui/v2/Button';
import Badge from '../../../../../components/ui/Badge';
import AlertCard from '../../../../../components/ui/v2/AlertCard';
import ConfirmModal from '../../../../../components/ui/ConfirmModal';

import {
  DiscardSettlementAlertStrategy,
  DiscardPolicy
} from '../../../utils/enrollmentAlertStrategies';

/**
 * Discard Enrollment Side Drawer component.
 * Allows administrative resolution of an un-continuable enrollment with either "refund" or "no_refund" settlement.
 * Uses DiscardSettlementAlertStrategy for dynamic stateful alerts and DiscardPolicy for business rules.
 * 
 * @component
 * @param {object} props
 * @param {boolean} props.isOpen - Controls drawer open/close visibility.
 * @param {function} props.onClose - Callback function to close the drawer.
 * @param {object} props.enrollment - Hydrated enrollment contract object.
 * @param {boolean} props.isSubmitting - Pending state during API execution.
 * @param {function} props.onExecute - Callback function receiving payload { enrollment_id, discard_mode, remarks }.
 */
export default function DiscardEnrollmentDrawer({
  isOpen,
  onClose,
  enrollment,
  isSubmitting,
  onExecute
}) {
  const [discardMode, setDiscardMode] = useState('refund');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Instantiate Strategy Engine via useMemo
  const settlementStrategy = useMemo(() => new DiscardSettlementAlertStrategy(), []);

  // Extract financial data for impact preview
  const feeAccount = useMemo(() => {
    const accounts = Array.isArray(enrollment?.studentfeeaccounts)
      ? enrollment.studentfeeaccounts
      : (Array.isArray(enrollment?.StudentFeeAccount) ? enrollment.StudentFeeAccount : []);
    return accounts[0] || null;
  }, [enrollment]);

  const paidAmount = Number(feeAccount?.amount_paid || feeAccount?.paid_amount || 0);
  const balanceDue = Number(feeAccount?.balance_due || feeAccount?.balance_amount || 0);
  const totalInstallments = Array.isArray(feeAccount?.installments) ? feeAccount.installments.length : 0;
  const allocationsCount = Array.isArray(enrollment?.allocations) ? enrollment.allocations.length : 0;

  // Dynamic Settlement Alert Strategy Evaluation
  const settlementAlert = useMemo(
    () => settlementStrategy.evaluate({ discardMode, paidAmount, balanceDue, allocationsCount }),
    [settlementStrategy, discardMode, paidAmount, balanceDue, allocationsCount]
  );

  const handleExecuteClick = () => {
    // Policy Pattern Validation Check
    const policyResult = DiscardPolicy.validate({ reason });
    if (!policyResult.isValid) {
      setValidationError(policyResult.violationReason);
      return;
    }
    setValidationError('');
    setShowConfirmModal(true);
  };

  const handleConfirmExecute = () => {
    setShowConfirmModal(false);
    const combinedRemarks = reason.trim() + (remarks.trim() ? ` — ${remarks.trim()}` : '');
    onExecute({
      enrollment_id: enrollment?.enrollment_id || enrollment?.id,
      discard_mode: discardMode,
      remarks: combinedRemarks
    });
  };

  const enrId = enrollment?.enrollment_id || enrollment?.id || 'ENR-000';

  return (
    <>
      <RightDrawer
        isOpen={isOpen}
        onClose={onClose}
        title="Discard Enrollment"
        subtitle="Discard this enrollment and settle financials."
        icon="delete_forever"
        iconColor="text-rose-500"
        width="max-w-3xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button type="button" variant="outlined" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={isSubmitting}
              onClick={handleExecuteClick}
              startIcon="delete_forever"
            >
              {discardMode === 'refund' ? 'Discard Enrollment (Refund)' : 'Discard Enrollment (No Refund)'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Section 1: Settlement Mode Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-text-main dark:text-white uppercase tracking-wider block">
              1. Settlement Mode
            </label>
            <p className="text-xs text-text-secondary">Choose how to settle the fee account for this enrollment.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Refund Option */}
              <button
                type="button"
                onClick={() => setDiscardMode('refund')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  discardMode === 'refund'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-text-main dark:text-white">
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    discardMode === 'refund' ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-400'
                  }`}>
                    {discardMode === 'refund' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>Refund Student</span>
                </div>
                <p className="text-xs text-text-secondary mt-1.5 ml-6">
                  Issue full refund for the amount paid (₹{paidAmount.toLocaleString()}).
                </p>
              </button>

              {/* No Refund Option */}
              <button
                type="button"
                onClick={() => setDiscardMode('no_refund')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  discardMode === 'no_refund'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-text-main dark:text-white">
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    discardMode === 'no_refund' ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-400'
                  }`}>
                    {discardMode === 'no_refund' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>No Refund</span>
                </div>
                <p className="text-xs text-text-secondary mt-1.5 ml-6">
                  Do not refund. Close account without refund.
                </p>
              </button>
            </div>

            {/* Dynamic Stateful Strategy Settlement AlertCard */}
            {settlementAlert && <AlertCard {...settlementAlert} />}
          </div>

          {/* Section 2: Reason for Discard */}
          <div className="space-y-2">
            <FormField label="2. Reason for Discard *" error={validationError}>
              <TextInput
                multiline
                rows={3}
                maxLength={500}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim()) setValidationError('');
                }}
                placeholder="Please provide the administrative or student cancellation reason..."
              />
            </FormField>
          </div>

          {/* Section 3: Impact Preview */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-main dark:text-white uppercase tracking-wider">
                3. Impact Preview
              </span>
              <span className="text-[10px] text-text-secondary">Review changes that will be applied</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Enrollment Status */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-500 text-base">assignment</span>
                  <span className="font-semibold text-text-main dark:text-white">Enrollment Status ({enrId})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Active</Badge>
                  <span className="text-text-secondary">→</span>
                  <Badge variant="danger">Discarded</Badge>
                </div>
              </div>

              {/* Batch Allocations */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-base">groups</span>
                  <span className="font-semibold text-text-main dark:text-white">Batch Allocations ({allocationsCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Active</Badge>
                  <span className="text-text-secondary">→</span>
                  <Badge variant="warning">Dropped</Badge>
                </div>
              </div>

              {/* Fee Account */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-base">account_balance_wallet</span>
                  <span className="font-semibold text-text-main dark:text-white">Fee Account</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Active</Badge>
                  <span className="text-text-secondary">→</span>
                  <Badge variant={discardMode === 'refund' ? 'info' : 'default'}>
                    {discardMode === 'refund' ? 'Refunded' : 'Cancelled'}
                  </Badge>
                </div>
              </div>

              {/* Installments */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-base">calendar_month</span>
                  <span className="font-semibold text-text-main dark:text-white">Installments ({totalInstallments})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Active</Badge>
                  <span className="text-text-secondary">→</span>
                  <Badge variant="default">Cancelled</Badge>
                </div>
              </div>

              {/* Refund Amount */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-500 text-base">payments</span>
                  <span className="text-text-main dark:text-white">Net Settlement Amount</span>
                </div>
                <span className={discardMode === 'refund' ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-secondary'}>
                  {discardMode === 'refund' ? `₹${paidAmount.toLocaleString()} (Refund)` : '₹0 (No Refund)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </RightDrawer>

      {/* Double Confirmation Modal rendered via createPortal at document.body level */}
      {showConfirmModal && createPortal(
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmExecute}
          title="Confirm Discarding Enrollment"
          message={`Are you sure you want to discard contract ${enrId}? Mode: ${discardMode === 'refund' ? 'Refund Student' : 'No Refund'}. This action cannot be undone.`}
          confirmText="Confirm & Discard"
          cancelText="Cancel"
          type="warning"
        />,
        document.body
      )}
    </>
  );
}

DiscardEnrollmentDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  enrollment: PropTypes.object,
  isSubmitting: PropTypes.bool,
  onExecute: PropTypes.func.isRequired
};
