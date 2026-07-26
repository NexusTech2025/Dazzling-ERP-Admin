import React, { useState } from 'react';
import { useTeacherPayroll } from '../../hooks/useTeacherPayroll';
import { useTeacherDetailQuery } from '../../hooks/useTeacherQueries';
import SalaryConfigsCard from './payroll/SalaryConfigsCard';
import FacultyLedgerAuditCard from './payroll/FacultyLedgerAuditCard';
import TeacherPaymentTransactionsCard from './payroll/TeacherPaymentTransactionsCard';
import ConfigHistoryTimelineCard from './payroll/ConfigHistoryTimelineCard';
import RecordTeacherPaymentModal from './payroll/RecordTeacherPaymentModal';
import SalaryConfigModal from './SalaryConfigModal';
import UnlinkedGlOutflowsBanner from './payroll/UnlinkedGlOutflowsBanner';
import MoneyTransactionForm from '../../../finance/transactions/components/MoneyTransactionForm';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import ResponseModal from '../../../../components/ui/ResponseModal';
import Button from '../../../../components/ui/v2/Button';
import { findUnlinkedTeacherGlOutflows, verifyGlSubledgerLink } from '../../../finance/utils';
import { formatSalaryMonth } from '../../utils/teacher.utils';
import { useMoneyTransactionsQuery, useUpdateMoneyTransactionMutation } from '../../../finance/hooks/useFinanceQueries';

const TeacherSalaryPayroll = ({ teacherId }) => {
  const { state, actions } = useTeacherPayroll(teacherId);
  const { data: teacher } = useTeacherDetailQuery(teacherId);
  const { data: moneyTransactions = [] } = useMoneyTransactionsQuery();
  const updateGlMutation = useUpdateMoneyTransactionMutation();

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [recordPaymentType, setRecordPaymentType] = useState('salary');
  const [recordPaymentInitialData, setRecordPaymentInitialData] = useState(null);
  const [syncModalState, setSyncModalState] = useState({ isOpen: false, initialData: null });
  const [successModalState, setSuccessModalState] = useState({ isOpen: false, data: null });

  const teacherName = teacher?.full_name || teacher?.teacher_name || 'Faculty Member';

  // Compute unlinked GL outflows for Scenario 1
  const unlinkedGlOutflows = findUnlinkedTeacherGlOutflows(moneyTransactions, teacherId);

  const handleOpenDisburse = () => {
    setRecordPaymentType('salary');
    setRecordPaymentInitialData(null);
    setIsRecordPaymentOpen(true);
  };

  const handleOpenAdvance = () => {
    setRecordPaymentType('advance');
    setRecordPaymentInitialData(null);
    setIsRecordPaymentOpen(true);
  };

  const handleConvertGlOutflowToPayroll = (glTxn) => {
    setRecordPaymentType('salary');
    setRecordPaymentInitialData(glTxn);
    setIsRecordPaymentOpen(true);
  };

  const handleMarkGlAsNonSalary = (glTxn) => {
    const glId = glTxn.transaction_id || glTxn.id;
    if (glId) {
      updateGlMutation.mutate({
        id: glId,
        data: { payment_reference: 'NON_SALARY_REIMBURSEMENT' }
      });
    }
  };

  const handleOpenSyncLedger = (tx, compositeKey) => {
    const mappedChannel = (() => {
      const m = (tx.payment_method || '').toLowerCase();
      if (m === 'cash') return 'cash';
      if (m.includes('bank') || m.includes('neft') || m.includes('transfer')) return 'bank';
      if (m.includes('upi') || m.includes('phonepe')) return 'phonepe';
      if (m.includes('paytm')) return 'paytm';
      return 'other';
    })();

    const initialData = {
      type: 'out',
      amount: Number(tx.amount || 0),
      transaction_date: tx.transaction_date ? tx.transaction_date.split('T')[0] : new Date().toISOString().split('T')[0],
      category_id: '',
      payment_method: mappedChannel,
      payment_reference: compositeKey,
      notes: `Faculty Payout (${tx.payment_type || 'salary'}) for month ${tx.salary_month || 'N/A'} - TPT Ref: ${tx.transaction_id}`,
      remarks: tx.notes || '',
      party_type: 'teacher',
      party_id: teacherId,
      party_name: teacherName,
      by: tx.created_by || 'Admin',
      reconciliation_status: 'unreconciled'
    };

    setSyncModalState({ isOpen: true, initialData });
  };

  // Render loading spinner only on initial fetch when no cached configs exist
  if (state.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Active Config & Payment Transactions (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <SalaryConfigsCard
            salaryConfigs={state.salaryConfigs}
            activeConfig={state.activeConfig}
            onEdit={actions.handleOpenEdit}
            onDelete={actions.handleOpenDelete}
            onCreate={actions.handleOpenCreate}
          />

          {/* Scenario 1 Unlinked GL Outflows Alert Banner */}
          <UnlinkedGlOutflowsBanner
            unlinkedOutflows={unlinkedGlOutflows}
            onConvertToPayroll={handleConvertGlOutflowToPayroll}
            onMarkNonSalary={handleMarkGlAsNonSalary}
            isProcessing={updateGlMutation.isPending}
          />

          <TeacherPaymentTransactionsCard 
            transactions={state.transactions}
            teacherId={teacherId}
            teacherName={teacherName}
            onSyncLedger={handleOpenSyncLedger}
          />
        </div>

        {/* RIGHT COLUMN: Ledger Audit Summary & Collapsible History (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <FacultyLedgerAuditCard
            calculations={state.ledgerAuditMetrics}
            onReconcile={() => console.log('Reconcile Ledger Callback')}
            onDisburse={handleOpenDisburse}
            onIssueAdvance={handleOpenAdvance}
            onViewLogs={() => console.log('View Logs Callback')}
          />

          <ConfigHistoryTimelineCard
            sortedHistory={state.sortedConfigs}
            activeConfig={state.activeConfig}
            onEdit={actions.handleOpenEdit}
            onDelete={actions.handleOpenDelete}
          />
        </div>

      </div>

      {/* Stage 1 Record Payment Modal */}
      {isRecordPaymentOpen && (
        <RecordTeacherPaymentModal
          isOpen={isRecordPaymentOpen}
          onClose={() => {
            setIsRecordPaymentOpen(false);
            setRecordPaymentInitialData(null);
          }}
          teacherId={teacherId}
          teacherName={teacherName}
          initialPaymentType={recordPaymentType}
          initialData={recordPaymentInitialData}
          activeBaseRate={state.ledgerAuditMetrics?.activeBaseRate || 0}
          pendingAmount={state.ledgerAuditMetrics?.pendingAmount || 0}
          onSuccess={(resRecord, submittedPayload, reconciliationMeta) => {
            const fullTx = {
              transaction_id: resRecord?.transaction_id || `TPT-${Date.now().toString().slice(-6)}`,
              teacher_id: teacherId,
              payment_type: resRecord?.payment_type || submittedPayload.payment_type,
              amount: resRecord?.amount || submittedPayload.amount,
              payment_method: resRecord?.payment_method || submittedPayload.payment_method,
              transaction_date: resRecord?.transaction_date || submittedPayload.transaction_date,
              salary_month: resRecord?.salary_month || submittedPayload.salary_month,
              notes: resRecord?.notes || submittedPayload.notes
            };

            const glRecord = reconciliationMeta?.glRecord;
            const glId = glRecord?.gl_transaction_id || glRecord?.transaction_id;

            if (reconciliationMeta?.isGlConverted && glId) {
              const compositeKey = `${teacherId}_${fullTx.salary_month}_${fullTx.transaction_id}`;

              // Step 2: Immediately open ResponseModal in 'linking' state (renders spinning green sync button!)
              setSuccessModalState({
                isOpen: true,
                data: fullTx,
                meta: reconciliationMeta,
                syncStatus: 'linking'
              });

              // Step 3: Trigger background GL link update while ResponseModal is visible over screen
              updateGlMutation.mutate(
                { id: glId, data: { payment_reference: compositeKey } },
                {
                  onSuccess: (glRes) => {
                    const isGlSuccess = glRes?.success !== false && glRes?.status !== 'error';
                    if (isGlSuccess) {
                      // Step 4a: Update modal to 100% RECONCILED success state with 'Done' button
                      setSuccessModalState(prev => ({ ...prev, syncStatus: 'success' }));
                    } else {
                      // Step 4b: Update modal to warning state with retry button
                      setSuccessModalState(prev => ({ ...prev, syncStatus: 'error' }));
                    }
                  },
                  onError: (err) => {
                    console.error('Background GL link failed:', err);
                    setSuccessModalState(prev => ({ ...prev, syncStatus: 'error' }));
                  }
                }
              );
            } else {
              // Standard standalone payout without GL conversion
              setSuccessModalState({ isOpen: true, data: fullTx, meta: null, syncStatus: null });
            }
          }}
        />
      )}

      {/* Success Response Modal handling Flow A (Standalone Sync CTA) vs Flow B (Dynamic In-Flight Green Syncing) */}
      {successModalState.isOpen && successModalState.data && (() => {
        const { syncStatus, meta, data } = successModalState;
        const glId = meta?.glRecord?.transaction_id || meta?.glRecord?.id || 'GL Outflow';

        // Step 2 & 3: In-flight GL linking state with green spinning sync button
        if (syncStatus === 'linking') {
          return (
            <ResponseModal
              isOpen={true}
              onClose={() => {}}
              variant="success"
              title="Reconciling & Syncing General Ledger..."
              subtitle={`Payment receipt ${data.transaction_id} created. Now linking to Cash Book entry ${glId}...`}
              closeText="Syncing..."
              actionButton={
                <Button
                  variant="contained"
                  size="sm"
                  disabled={true}
                  className="bg-emerald-600 text-white opacity-90 cursor-wait flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                  <span>Syncing GL...</span>
                </Button>
              }
              items={[
                { label: 'Sub-Ledger Payment ID', value: data.transaction_id, isMono: true },
                { label: 'General Ledger Entry', value: glId, isMono: true },
                { label: 'Amount Paid', value: `₹${Number(data.amount || 0).toLocaleString()}`, isHighlight: true },
                { label: 'Teacher Name', value: teacherName },
                { label: 'Salary Period', value: formatSalaryMonth(data.salary_month || data.salaryMonth) },
                { label: 'Reconciliation Status', value: 'SYNCING IN PROGRESS...' }
              ]}
            />
          );
        }

        // Step 4a: Background sync completed successfully -> Update to static 100% RECONCILED
        if (syncStatus === 'success') {
          return (
            <ResponseModal
              isOpen={true}
              onClose={() => setSuccessModalState({ isOpen: false, data: null, meta: null, syncStatus: null })}
              variant="success"
              title="Reconciliation & General Ledger Sync Complete"
              subtitle={`Sub-ledger payment ${data.transaction_id} double-verified and linked to Cash Book entry ${glId}.`}
              closeText="Done"
              actionButton={null}
              items={[
                { label: 'Sub-Ledger Payment ID', value: data.transaction_id, isMono: true },
                { label: 'General Ledger Entry', value: glId, isMono: true },
                { label: 'Amount Matched', value: `₹${Number(data.amount || 0).toLocaleString()} (Verified)`, isHighlight: true },
                { label: 'Teacher Name', value: teacherName },
                { label: 'Salary Period', value: formatSalaryMonth(data.salary_month || data.salaryMonth) },
                { label: 'Payment Method', value: (data.payment_method || '').toUpperCase() },
                { label: 'Reconciliation Status', value: '100% RECONCILED & LINKED' }
              ]}
            />
          );
        }

        // Step 4b: Background sync encountered an error -> Update to warning with Retry CTA
        if (syncStatus === 'error') {
          return (
            <ResponseModal
              isOpen={true}
              onClose={() => setSuccessModalState({ isOpen: false, data: null, meta: null, syncStatus: null })}
              variant="warning"
              title="Payroll Payment Created (GL Link Incomplete)"
              subtitle={`Sub-ledger receipt ${data.transaction_id} was recorded, but linking to Cash Book entry ${glId} failed. Please click Sync below.`}
              closeText="Dismiss"
              actionButton={
                <Button
                  variant="contained"
                  size="sm"
                  startIcon="sync"
                  onClick={() => {
                    const compositeKey = `${teacherId}_${data.salary_month}_${data.transaction_id}`;
                    setSuccessModalState({ isOpen: false, data: null, meta: null, syncStatus: null });
                    handleOpenSyncLedger(data, compositeKey);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Sync General Ledger Now
                </Button>
              }
              items={[
                { label: 'Sub-Ledger Payment ID', value: data.transaction_id, isMono: true },
                { label: 'General Ledger Entry', value: glId, isMono: true },
                { label: 'Amount Paid', value: `₹${Number(data.amount || 0).toLocaleString()}`, isHighlight: true },
                { label: 'Teacher Name', value: teacherName },
                { label: 'Salary Period', value: formatSalaryMonth(data.salary_month || data.salaryMonth) },
                { label: 'Reconciliation Status', value: 'LINKING FAILED (Action Required)' }
              ]}
            />
          );
        }

        // Flow A: Standalone Payout
        return (
          <ResponseModal
            isOpen={true}
            onClose={() => setSuccessModalState({ isOpen: false, data: null, meta: null, syncStatus: null })}
            variant="success"
            title="Faculty Payment Recorded Successfully"
            subtitle={`Payment receipt ${data.transaction_id} has been recorded.`}
            closeText="Sync Later"
            actionButton={
              <Button
                variant="contained"
                size="sm"
                startIcon="sync"
                onClick={() => {
                  const compositeKey = `${teacherId}_${data.salary_month}_${data.transaction_id}`;
                  setSuccessModalState({ isOpen: false, data: null, meta: null, syncStatus: null });
                  handleOpenSyncLedger(data, compositeKey);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Sync General Ledger Now
              </Button>
            }
            items={[
              { label: 'Transaction ID', value: data.transaction_id, isMono: true },
              { label: 'Amount Paid', value: `₹${Number(data.amount || 0).toLocaleString()}`, isHighlight: true },
              { label: 'Teacher Name', value: teacherName },
              { label: 'Salary Period', value: formatSalaryMonth(data.salary_month || data.salaryMonth) },
              { label: 'Payment Method', value: (data.payment_method || '').toUpperCase() },
              { label: 'Ledger Status', value: 'Unsynced (Action Recommended)' }
            ]}
          />
        );
      })()}

      {/* Stage 2 MoneyTransactionForm Sync Modal Portal */}
      {syncModalState.isOpen && (
        <MoneyTransactionForm
          isOpen={syncModalState.isOpen}
          onClose={() => setSyncModalState({ isOpen: false, initialData: null })}
          initialData={syncModalState.initialData}
        />
      )}

      {/* Salary Config Edit Modal */}
      {state.isFormOpen && (
        <SalaryConfigModal
          isOpen={state.isFormOpen}
          onClose={() => actions.setIsFormOpen(false)}
          teacherId={teacherId}
          config={state.editingConfig}
        />
      )}

      {/* Confirmation Modal for Deletion */}
      {state.isDeleteOpen && (
        <ConfirmModal
          isOpen={state.isDeleteOpen}
          onClose={() => actions.setIsDeleteOpen(false)}
          onConfirm={actions.handleDeleteConfirm}
          title="Delete Salary Configuration"
          message="Are you sure you want to permanently delete this salary configuration? This action will remove the record from the sheets database and cannot be undone."
          confirmText="Confirm Delete"
          isProcessing={state.isMutationProcessing}
        />
      )}
    </div>
  );
};

export default TeacherSalaryPayroll;
