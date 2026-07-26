import React, { useState } from 'react';
import { useTeacherPayroll } from '../../hooks/useTeacherPayroll';
import { useTeacherDetailQuery } from '../../hooks/useTeacherQueries';
import SalaryConfigsCard from './payroll/SalaryConfigsCard';
import FacultyLedgerAuditCard from './payroll/FacultyLedgerAuditCard';
import TeacherPaymentTransactionsCard from './payroll/TeacherPaymentTransactionsCard';
import ConfigHistoryTimelineCard from './payroll/ConfigHistoryTimelineCard';
import RecordTeacherPaymentModal from './payroll/RecordTeacherPaymentModal';
import SalaryConfigModal from './SalaryConfigModal';
import MoneyTransactionForm from '../../../finance/transactions/components/MoneyTransactionForm';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import ResponseModal from '../../../../components/ui/ResponseModal';
import Button from '../../../../components/ui/v2/Button';

const TeacherSalaryPayroll = ({ teacherId }) => {
  const { state, actions } = useTeacherPayroll(teacherId);
  const { data: teacher } = useTeacherDetailQuery(teacherId);

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [recordPaymentType, setRecordPaymentType] = useState('salary');
  const [syncModalState, setSyncModalState] = useState({ isOpen: false, initialData: null });
  const [successModalState, setSuccessModalState] = useState({ isOpen: false, data: null });

  const teacherName = teacher?.full_name || teacher?.teacher_name || 'Faculty Member';

  const handleOpenDisburse = () => {
    setRecordPaymentType('salary');
    setIsRecordPaymentOpen(true);
  };

  const handleOpenAdvance = () => {
    setRecordPaymentType('advance');
    setIsRecordPaymentOpen(true);
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
          onClose={() => setIsRecordPaymentOpen(false)}
          teacherId={teacherId}
          teacherName={teacherName}
          initialPaymentType={recordPaymentType}
          activeBaseRate={state.ledgerAuditMetrics?.activeBaseRate || 0}
          pendingAmount={state.ledgerAuditMetrics?.pendingAmount || 0}
          onSuccess={(resRecord, submittedPayload) => {
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
            setSuccessModalState({ isOpen: true, data: fullTx });
          }}
        />
      )}

      {/* Success Response Modal with Immediate General Ledger Sync CTA */}
      {successModalState.isOpen && successModalState.data && (
        <ResponseModal
          isOpen={successModalState.isOpen}
          onClose={() => setSuccessModalState({ isOpen: false, data: null })}
          variant="success"
          title="Faculty Payment Recorded Successfully"
          subtitle={`Payment receipt ${successModalState.data.transaction_id} has been recorded.`}
          closeText="Sync Later"
          actionButton={
            <Button
              variant="contained"
              size="sm"
              startIcon="sync"
              onClick={() => {
                const tx = successModalState.data;
                const compositeKey = `${teacherId}_${tx.salary_month}_${tx.transaction_id}`;
                setSuccessModalState({ isOpen: false, data: null });
                handleOpenSyncLedger(tx, compositeKey);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Sync General Ledger Now
            </Button>
          }
          items={[
            { label: 'Transaction ID', value: successModalState.data.transaction_id, isMono: true },
            { label: 'Amount Paid', value: `₹${Number(successModalState.data.amount || 0).toLocaleString()}`, isHighlight: true },
            { label: 'Teacher Name', value: teacherName },
            { label: 'Salary Period', value: successModalState.data.salary_month },
            { label: 'Payment Method', value: (successModalState.data.payment_method || '').toUpperCase() },
            { label: 'Ledger Status', value: 'Unsynced (Action Recommended)' }
          ]}
        />
      )}

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
