import React from 'react';
import { useTeacherPayroll } from '../../hooks/useTeacherPayroll';
import SalaryConfigsCard from './payroll/SalaryConfigsCard';
import FacultyLedgerAuditCard from './payroll/FacultyLedgerAuditCard';
import TeacherPaymentTransactionsCard from './payroll/TeacherPaymentTransactionsCard';
import ConfigHistoryTimelineCard from './payroll/ConfigHistoryTimelineCard';
import SalaryConfigModal from './SalaryConfigModal';
import ConfirmModal from '../../../../components/ui/ConfirmModal';

const TeacherSalaryPayroll = ({ teacherId }) => {
  const { state, actions } = useTeacherPayroll(teacherId);

  // Render loading spinner only on initial fetch when no cached configs exist
  if (state.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Salary Configuration Card */}
        <div className="lg:col-span-8">
          <SalaryConfigsCard
            salaryConfigs={state.salaryConfigs}
            activeConfig={state.activeConfig}
            onEdit={actions.handleOpenEdit}
            onDelete={actions.handleOpenDelete}
            onCreate={actions.handleOpenCreate}
          />
        </div>

        {/* Financial KPI Stack / Faculty Ledger Account & Audit Card */}
        <div className="lg:col-span-4">
          <FacultyLedgerAuditCard
            calculations={state.ledgerAuditMetrics}
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
          <TeacherPaymentTransactionsCard transactions={state.transactions} />
        </div>

        {/* Config History Timeline Card */}
        <div className="lg:col-span-4">
          <ConfigHistoryTimelineCard
            sortedHistory={state.sortedConfigs}
            activeConfig={state.activeConfig}
            onEdit={actions.handleOpenEdit}
            onDelete={actions.handleOpenDelete}
          />
        </div>

      </div>

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
