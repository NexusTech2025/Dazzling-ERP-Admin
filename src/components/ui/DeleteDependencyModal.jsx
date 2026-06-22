import React from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Dictionary to map database tables to humanized singular and plural labels
const tableLabels = {
  Student: { singular: 'Student Profile', plural: 'Student Profiles' },
  Enrollment: { singular: 'Course Enrollment', plural: 'Course Enrollments', btnText: 'View Enrollment' },
  StudentFeeAccount: { singular: 'Fee Account Ledger', plural: 'Fee Account Ledgers', btnText: 'View Ledger' },
  Installment: { singular: 'Installment Due', plural: 'Installment Dues', btnText: 'View Ledger' },
  Payment: { singular: 'Cash/UPI Payment', plural: 'Cash/UPI Payments', btnText: 'View Transaction' },
  Batch: { singular: 'Subject Batch Section', plural: 'Subject Batch Sections', btnText: 'View Batch' },
  Course: { singular: 'Subject Course', plural: 'Subject Courses', btnText: 'View Course' },
  Package: { singular: 'Academic Program Package', plural: 'Academic Program Packages', btnText: 'View Package' }
};

/**
 * Normalizes database table name to humanized label.
 */
const getTableLabel = (tableName) => {
  return tableLabels[tableName]?.singular || tableName.replace(/([A-Z])/g, ' $1').trim();
};

/**
 * Returns the action button label based on the entity table.
 */
const getButtonText = (tableName) => {
  return tableLabels[tableName]?.btnText || 'View Details';
};

/**
 * Resolves the redirection URL for the blocker entity.
 */
const getRedirectPath = (tableName, id, studentId) => {
  if (tableName === 'StudentFeeAccount' || tableName === 'Installment') {
    return `/admin/finance/student/${studentId || id}`;
  }
  if (tableName === 'Payment') {
    return `/admin/finance/transactions?search=${id}`;
  }
  if (tableName === 'Enrollment') {
    return `/admin/students/${studentId || id}`;
  }
  if (tableName === 'Batch') {
    return `/admin/batches/${id}`;
  }
  if (tableName === 'Course') {
    return `/admin/courses/${id}`;
  }
  if (tableName === 'Package') {
    return `/admin/packages/${id}`;
  }
  return '#';
};

/**
 * Helper to parse backend delete blocker violations from single or batch operations.
 */
export function parseDeleteBlockers(responseError, parentTable = 'Student') {
  if (!responseError) return [];
  const details = responseError.details || responseError || {};
  const blockers = [];

  // Case 1: Single Record Delete Failure
  if (details.violations && Array.isArray(details.violations)) {
    details.violations.forEach(v => {
      v.ids.forEach(id => {
        blockers.push({
          targetId: details.parentId,
          targetTable: details.parentTable || parentTable,
          blockerTable: v.table,
          foreignKey: v.foreignKey,
          blockerId: id,
          policy: v.policy,
          detailLabel: v.detailLabel || ''
        });
      });
    });
  }

  // Case 2: Batch Record Delete Failure (Aggregated)
  if (details.failed && typeof details.failed === 'object') {
    Object.keys(details.failed).forEach(id => {
      const failItem = details.failed[id];
      if (failItem.violations && Array.isArray(failItem.violations)) {
        failItem.violations.forEach(v => {
          v.ids.forEach(bid => {
            blockers.push({
              targetId: id,
              targetTable: details.parentTable || parentTable,
              blockerTable: v.table,
              foreignKey: v.foreignKey,
              blockerId: bid,
              policy: v.policy,
              detailLabel: v.detailLabel || ''
            });
          });
        });
      }
    });
  }

  return blockers;
}

/**
 * DeleteDependencyModal component.
 * Displays referential integrity blocks in a modern dark-slate theme matching glassmorphic specs.
 */
const DeleteDependencyModal = ({
  isOpen,
  onClose,
  errorPayload,
  parentId,
  parentName = 'Rahul Sharma',
  onResolve
}) => {
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  // Parse blockers
  const blockers = parseDeleteBlockers(errorPayload);

  // Fallback if no blockers parsed but we are open
  if (blockers.length === 0 && errorPayload) {
    // If it's a simple custom list of items already parsed passed directly
    if (Array.isArray(errorPayload)) {
      blockers.push(...errorPayload);
    }
  }

  // Helper to dynamically get secondary detail name (looks up from query cache if possible)
  const getBlockerDetailName = (blocker) => {
    if (blocker.detailLabel) return blocker.detailLabel;
    
    const table = blocker.blockerTable;
    const id = blocker.blockerId;

    try {
      if (table === 'Enrollment') {
        const enrollments = queryClient.getQueryData(['enrollment', 'list']) || [];
        const item = enrollments.find(e => e.enrollment_id === id);
        if (item) return item.course_name || 'Class Core Enrollment';
        return 'Active Enrollment';
      }
      if (table === 'Payment') {
        return 'Installment Due';
      }
      if (table === 'StudentFeeAccount') {
        return 'Personal Ledger';
      }
    } catch (err) {
      console.warn('Failed to scan client cache for label:', err);
    }
    return 'System Dependency';
  };

  const handleActionClick = (path) => {
    onClose();
    // Navigate using browser behavior or parent handler if routing is not local
    window.location.hash = path; // basic hash fallback or standard router navigate
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-xl dark:shadow-[0_0_50px_rgba(99,102,241,0.15)] rounded-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-text-main dark:text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between p-5 border-b border-border-light dark:border-slate-900">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <svg className="size-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <circle cx="12" cy="11" r="1" className="fill-rose-500" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 13v2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-main dark:text-white tracking-tight">Deletion Blocked</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-text-main dark:text-slate-400 dark:hover:text-white flex items-center justify-center p-1.5 rounded-lg hover:bg-background-light dark:hover:bg-slate-900 transition-colors"
            title="Close dialog"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Warning Banner */}
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 rounded-xl p-3.5 flex items-start gap-3">
            <svg className="size-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-rose-700 dark:text-rose-200/90 leading-relaxed font-medium">
              No changes have been made to the database. These records must be resolved or deleted before the student profile can be removed.
            </p>
          </div>

          {/* Active Dependencies List */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">
              Active Dependencies Detected
            </h4>

            <div className="space-y-3">
              {blockers.map((blocker, index) => {
                const targetStudentId = blocker.targetId || parentId;
                const path = getRedirectPath(blocker.blockerTable, blocker.blockerId, targetStudentId);
                const tableLabel = getTableLabel(blocker.blockerTable);
                const btnLabel = getButtonText(blocker.blockerTable);
                const detailsLabel = getBlockerDetailName(blocker);

                return (
                  <div 
                    key={index}
                    className="bg-background-light/60 dark:bg-slate-900/30 border border-border-light dark:border-slate-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-350 dark:hover:border-slate-800/80 transition-all duration-300"
                  >
                    <div className="space-y-1.5">
                      <h5 className="font-bold text-sm text-text-main dark:text-slate-100">{tableLabel}</h5>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/30 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold">
                          {blocker.blockerId}
                        </span>
                        <span className="text-xs text-text-secondary dark:text-slate-400 font-medium">{detailsLabel}</span>
                      </div>
                    </div>

                    <a
                      href={path}
                      onClick={() => onClose()}
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border-light dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-900 text-text-main dark:text-slate-300 hover:text-primary dark:hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      {btnLabel}
                      <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Context Banner */}
          <div className="text-center py-2 text-xs text-text-secondary dark:text-slate-400 italic">
            Referenced Student: <span className="font-bold text-text-main dark:text-slate-200 not-italic">{parentId || blockers[0]?.targetId || 'STU-001'} ({parentName})</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-border-light dark:border-border-dark bg-background-light/50 dark:bg-slate-950/40">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-border-light dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-900 text-text-secondary hover:text-text-main dark:text-slate-300 dark:hover:text-white rounded-lg text-xs font-bold transition-all"
          >
            Close
          </button>
          <button 
            type="button"
            onClick={() => {
              if (onResolve) {
                onResolve(blockers);
              } else {
                onClose();
              }
            }}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-lg shadow-indigo-500/20 rounded-lg text-xs font-bold transition-all"
          >
            Resolve Dependencies
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDependencyModal;
