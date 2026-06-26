import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ResolveDeleteConflict } from './ResolveDeleteConflict';

// Dictionary to map database tables to humanized singular and plural labels
const tableLabels = {
  Student: { singular: 'Student Profile', plural: 'Student Profiles' },
  Enrollment: { singular: 'Course Enrollment', plural: 'Course Enrollments', btnText: 'View Enrollment' },
  StudentFeeAccount: { singular: 'Fee Account Ledger', plural: 'Fee Account Ledgers', btnText: 'View Ledger' },
  Installment: { singular: 'Installment Due', plural: 'Installment Dues', btnText: 'View Ledger' },
  Payment: { singular: 'Cash/UPI Payment', plural: 'Cash/UPI Payments', btnText: 'View Transaction' },
  Batch: { singular: 'Subject Batch Section', plural: 'Subject Batch Sections', btnText: 'View Batch' },
  Course: { singular: 'Subject Course', plural: 'Subject Courses', btnText: 'View Course' },
  Package: { singular: 'Academic Program Package', plural: 'Academic Program Packages', btnText: 'View Package' },
  CourseType: { singular: 'Course Category', plural: 'Course Categories', btnText: 'View Category' }
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
    return `/admin/students/${studentId || id}?tab=overview`;
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
  if (tableName === 'CourseType') {
    return `/admin/courses/types`;
  }
  return '#';
};

/**
 * Helper to parse backend delete blocker violations from single or batch operations.
 */
export function parseDeleteBlockers(responseError, parentTable) {
  if (!parentTable) {
    console.warn('[parseDeleteBlockers] Warning: parentTable is missing.');
  }
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
  onResolve,
  parentType
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (!isOpen) return null;

  if (!parentType) {
    console.warn('[DeleteDependencyModal] Warning: parentType prop is missing.');
  }

  // Parse blockers
  const blockers = parseDeleteBlockers(errorPayload, parentType);

  // Fallback if no blockers parsed but we are open
  if (blockers.length === 0 && errorPayload) {
    // If it's a simple custom list of items already parsed passed directly
    if (Array.isArray(errorPayload)) {
      blockers.push(...errorPayload);
    }
  }

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
              No changes have been made to the database. These records must be resolved or deleted before the {parentType ? parentType.toLowerCase() : 'entity'} can be removed.
            </p>
          </div>

          {/* Active Dependencies List */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-slate-400">
              Active Dependencies Detected
            </h4>

            <ResolveDeleteConflict
              blockers={blockers}
              parentType={parentType}
              onItemDeleted={onResolve}
            />
          </div>

          {/* Context Banner */}
          <div className="text-center py-2 text-xs text-text-secondary dark:text-slate-400 italic">
            Referenced {parentType || 'Entity'}: <span className="font-bold text-text-main dark:text-slate-200 not-italic">{parentId || blockers[0]?.targetId || 'STU-001'} ({parentName})</span>
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
          
          {errorPayload?.deleted?.length > 0 && (
            <button 
              type="button"
              onClick={() => {
                if (onResolve) {
                  onResolve(blockers, true);
                }
              }}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-lg shadow-rose-500/20 rounded-lg text-xs font-bold transition-all"
            >
              Delete Safe Items ({errorPayload.deleted.length})
            </button>
          )}

          <button 
            type="button"
            onClick={() => {
              navigate('/admin/resolve-conflict', {
                state: {
                  blockers,
                  parentId,
                  parentName,
                  parentType
                }
              });
              onClose();
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
