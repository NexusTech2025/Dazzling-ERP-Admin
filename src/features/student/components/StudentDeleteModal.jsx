import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../context/AuthContextCore';
import Button from '../../../components/ui/v2/Button';
import FormField from '../../../components/ui/v2/FormField';
import TextInput from '../../../components/ui/v2/TextInput';
import RadioGroup from '../../../components/ui/v2/RadioGroup';
import Badge from '../../../components/ui/Badge';
import AlertCard from '../../../components/ui/v2/AlertCard';

const SETTLEMENT_OPTIONS = [
  {
    value: 'waive_unpaid',
    label: 'Waive Remaining Balance (Recommended)',
    description: 'Caps final fee to amount paid, cancels unpaid installments, balance due becomes ₹0.'
  },
  {
    value: 'retain_ledger',
    label: 'Retain Financial Ledger As-Is',
    description: 'Marks student deleted without adjusting installments or fee balances (Audit Hold).'
  },
  {
    value: 'settle_liability',
    label: 'Settle Fixed Liability / Penalty',
    description: 'Sets required fee amount and recalculates remaining balance due.'
  },
  {
    value: 'refund',
    label: 'Issue Direct Refund',
    description: 'Issues a refund entry up to accumulated paid amount and cancels remaining dues.'
  }
];

/**
 * Dedicated Student Deletion Modal.
 * Supports soft-delete with cascading seat release and financial settlement,
 * clean physical hard deletion for untouched records, or superadmin force purge.
 * 
 * @component
 * @param {object} props
 * @param {boolean} props.isOpen - Visibility switch.
 * @param {function} props.onClose - Dismiss callback.
 * @param {function} props.onConfirm - Confirm submission callback receiving deletion payload.
 * @param {object} props.student - Hydrated or summarized student object { student_id, student_name, ... }.
 * @param {string} [props.status="idle"] - 'idle' | 'processing' | 'success' | 'error'.
 * @param {string} [props.resultMessage] - Feedback message from API response.
 * @param {boolean} [props.isProcessing=false] - Loading indicator state.
 */
export default function StudentDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  student,
  status = 'idle',
  resultMessage = null,
  isProcessing = false
}) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin' || user?.isSuperAdmin === true;

  const studentId = student?.student_id || student?.id || 'STU-000';
  const studentName = student?.student_name || student?.name || 'Selected Student';
  const enrollmentsCount = Array.isArray(student?.enrollments) ? student.enrollments.length : 0;

  const parseSafeAmount = (val) => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.-]+/g, '')) || 0;
    return 0;
  };

  const paidAmount = parseSafeAmount(student?.amount_paid ?? student?.total_paid);
  const outstandingBalance = parseSafeAmount(student?.outstanding_balance ?? student?.balance_due);

  const isUntouchedRecord = enrollmentsCount === 0 && paidAmount === 0 && !student?.current_batch;

  // Local Form States
  const [mode, setMode] = useState(isUntouchedRecord ? 'hard' : 'soft');
  const [reason, setReason] = useState('');
  const [settlementPolicy, setSettlementPolicy] = useState('waive_unpaid');
  const [requiredAmount, setRequiredAmount] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [settlementRemarks, setSettlementRemarks] = useState('');
  const [forcePurge, setForcePurge] = useState(false);
  const [superadminAcknowledged, setSuperadminAcknowledged] = useState(false);

  // Sync mode with student profile context when opened
  useEffect(() => {
    if (isOpen) {
      setMode(isUntouchedRecord ? 'hard' : 'soft');
      setReason('');
      setSettlementPolicy('waive_unpaid');
      setRequiredAmount('');
      setRefundAmount('');
      setSettlementRemarks('');
      setForcePurge(false);
      setSuperadminAcknowledged(false);
    }
  }, [isOpen, isUntouchedRecord]);

  if (!isOpen) return null;

  const isIdle = status === 'idle';
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const processing = status === 'processing' || isProcessing;

  // Financial integrity protection: standard hard purge blocked if student has paid money
  const isHardBlockedByPayment = mode === 'hard' && paidAmount > 0 && !forcePurge;

  // Validation rules before confirming
  const isConfirmDisabled = useMemo(() => {
    if (processing) return true;
    if (isHardBlockedByPayment) return true;
    if (mode === 'hard' && forcePurge && !superadminAcknowledged) return true;
    if (mode === 'soft' && settlementPolicy === 'settle_liability' && (requiredAmount === '' || Number(requiredAmount) < 0)) return true;
    if (mode === 'soft' && settlementPolicy === 'refund' && (refundAmount === '' || Number(refundAmount) <= 0 || Number(refundAmount) > paidAmount)) return true;
    return false;
  }, [processing, isHardBlockedByPayment, mode, forcePurge, superadminAcknowledged, settlementPolicy, requiredAmount, refundAmount, paidAmount]);

  const handleExecute = () => {
    const payload = {
      student_id: studentId,
      mode: mode,
      force: mode === 'hard' ? forcePurge : false,
      reason: mode === 'soft' ? (reason.trim() || undefined) : undefined,
      financial_settlement: mode === 'soft' ? {
        policy: settlementPolicy,
        required_amount: settlementPolicy === 'settle_liability' ? Number(requiredAmount) : undefined,
        refund_amount: settlementPolicy === 'refund' ? Number(refundAmount) : undefined,
        remarks: settlementRemarks.trim() || undefined
      } : undefined
    };

    onConfirm(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div 
        className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-border-light dark:border-border-dark w-full max-w-xl overflow-hidden transform transition-all my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
              isSuccess ? 'bg-emerald-500/10 text-emerald-600' :
              isError ? 'bg-rose-500/10 text-rose-600' :
              'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {isSuccess ? 'check_circle' : isError ? 'error' : 'person_remove'}
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-text-main dark:text-white leading-tight">
                {isSuccess ? 'Deletion Complete' : isError ? 'Deletion Error' : 'Delete Student Profile'}
              </h3>
              <p className="text-xs text-text-secondary">
                {studentName} • <span className="font-mono">{studentId}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {/* Result / Success / Error Message Box */}
          {(isSuccess || isError || resultMessage) && (
            <AlertCard
              variant={isSuccess ? 'success' : isError ? 'error' : 'info'}
              title={isSuccess ? 'Operation Successful' : isError ? 'Action Failed' : 'Notice'}
              description={resultMessage || (isSuccess ? 'Student profile has been deleted.' : 'An error occurred during deletion.')}
            />
          )}

          {isIdle && (
            <>
              {/* Mode Switcher Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('soft')}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                    mode === 'soft'
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                      : 'border-border-light dark:border-border-dark hover:border-slate-300 dark:hover:border-slate-700 bg-surface-light dark:bg-surface-dark'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-text-main dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">archive</span>
                      Soft Delete & Archive
                    </span>
                    <Badge variant={mode === 'soft' ? 'primary' : 'default'} size="sm">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Withdraws contracts, drops batch seats, and balances fee accounts while preserving audit records.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('hard')}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                    mode === 'hard'
                      ? 'border-rose-500 bg-rose-500/5 shadow-sm ring-1 ring-rose-500/20'
                      : 'border-border-light dark:border-border-dark hover:border-slate-300 dark:hover:border-slate-700 bg-surface-light dark:bg-surface-dark'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">delete_forever</span>
                      Clean Hard Purge
                    </span>
                    {isUntouchedRecord && (
                      <Badge variant="warning" size="sm">
                        Zero Activity
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Permanently purges student and all foreign key references across 10 tables from Google Sheets.
                  </p>
                </button>
              </div>

              {/* Mode 1: Soft Delete Configuration Sheet */}
              {mode === 'soft' && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                  <FormField label="Administrative Reason (Optional)" subtext="Recorded on student metadata and audit logs.">
                    <TextInput
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g., Student relocated, course discontinued, administrative withdrawal..."
                    />
                  </FormField>

                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">
                      Financial Settlement Policy
                    </span>
                    <RadioGroup
                      name="settlementPolicy"
                      value={settlementPolicy}
                      onChange={setSettlementPolicy}
                      options={SETTLEMENT_OPTIONS}
                      layout="list"
                    />
                  </div>

                  {/* Policy Conditional Inputs */}
                  {settlementPolicy === 'settle_liability' && (
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border-light dark:border-border-dark space-y-3">
                      <FormField
                        label="Required Liability Amount (₹)"
                        subtext="Student will owe this revised final fee amount."
                        required
                      >
                        <TextInput
                          type="number"
                          value={requiredAmount}
                          onChange={(e) => setRequiredAmount(e.target.value)}
                          placeholder="e.g. 3000"
                        />
                      </FormField>
                    </div>
                  )}

                  {settlementPolicy === 'refund' && (
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border-light dark:border-border-dark space-y-3">
                      <FormField
                        label={`Refund Amount (Max ₹${paidAmount.toLocaleString()})`}
                        subtext="Recorded as a negative payment receipt."
                        required
                      >
                        <TextInput
                          type="number"
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          placeholder={`e.g. ${paidAmount}`}
                        />
                      </FormField>
                    </div>
                  )}

                  <FormField label="Settlement Audit Remarks (Optional)">
                    <TextInput
                      value={settlementRemarks}
                      onChange={(e) => setSettlementRemarks(e.target.value)}
                      placeholder="Optional notes regarding financial settlement..."
                    />
                  </FormField>

                  {/* Soft Delete Impact Summary Box */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-border-light dark:border-border-dark text-[11px] text-text-secondary space-y-1.5">
                    <div className="font-bold text-text-main dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-primary">info</span>
                      Automated Cascade Summary
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>• Student Status: <span className="font-semibold text-rose-500">Deleted</span></div>
                      <div>• Enrollments: <span className="font-semibold text-slate-700 dark:text-slate-300">Discarded</span></div>
                      <div>• Batch Seating: <span className="font-semibold text-emerald-600">Freed up</span></div>
                      <div>• Historical Marks & Attendance: <span className="font-semibold text-slate-700 dark:text-slate-300">Preserved</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 2 & 3: Hard Purge Configuration Sheet */}
              {mode === 'hard' && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                  {/* Financial Breach Guard Notice */}
                  {isHardBlockedByPayment ? (
                    <AlertCard
                      variant="warning"
                      title="Financial Integrity Protection"
                      description={`Student has collected fee payments of ₹${paidAmount.toLocaleString()}. Clean hard deletion is blocked to prevent revenue ledger disparity. Please switch to 'Soft Delete & Archive' or enable Superadmin Force Purge below.`}
                    />
                  ) : (
                    <AlertCard
                      variant="danger"
                      title="Permanent Database Purge"
                      description="This operation permanently purges the student across all 10 relational tables (Enrollments, Seating, Attendance, Marks, Address, Contacts, Fee Accounts). This action is irreversible."
                    />
                  )}

                  {/* Superadmin Force Purge Option */}
                  {isSuperAdmin && paidAmount > 0 && (
                    <div className="p-4 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-3">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={forcePurge}
                          onChange={(e) => setForcePurge(e.target.checked)}
                          className="mt-0.5 size-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-rose-700 dark:text-rose-400">
                            Superadmin Force Purge (Bypass Financial Guard)
                          </span>
                          <p className="text-text-secondary text-[11px] mt-0.5">
                            Permanently purge all payment receipts and fee records for compliance right-to-be-forgotten or test cleanup.
                          </p>
                        </div>
                      </label>

                      {forcePurge && (
                        <div className="pt-2 border-t border-rose-200 dark:border-rose-900/50 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={superadminAcknowledged}
                              onChange={(e) => setSuperadminAcknowledged(e.target.checked)}
                              className="size-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                              I confirm permanent destruction of all financial and student records.
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-border-light dark:border-border-dark bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-end gap-3 shrink-0">
          {!isSuccess && !isError && (
            <Button
              type="button"
              variant="outlined"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </Button>
          )}

          {isIdle && (
            <Button
              type="button"
              variant="danger"
              loading={processing}
              disabled={isConfirmDisabled}
              onClick={handleExecute}
              startIcon={mode === 'hard' ? 'delete_forever' : 'archive'}
            >
              {mode === 'hard'
                ? (forcePurge ? 'Force Purge Everything' : 'Purge Student')
                : 'Confirm Soft Delete'}
            </Button>
          )}

          {(isSuccess || isError) && (
            <Button
              type="button"
              variant={isSuccess ? 'contained' : 'outlined'}
              onClick={onClose}
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

StudentDeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  student: PropTypes.object,
  status: PropTypes.oneOf(['idle', 'processing', 'success', 'error']),
  resultMessage: PropTypes.string,
  isProcessing: PropTypes.bool
};
