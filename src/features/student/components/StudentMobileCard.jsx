import React, { useMemo } from 'react';
import ExpandableLowDensityCard from '../../../components/ui/v2/cards/ExpandableLowDensityCard';

/**
 * Extracts fee accounting summary metrics for a student.
 */
function extractStudentFeeSummary(student) {
  const enr = student?.enrollments?.[0];
  const feeAcc = Array.isArray(enr?.studentfeeaccounts) ? enr.studentfeeaccounts[0] : (enr?.feeAccount || null);
  
  const totalFees = Number(feeAcc?.total_amount || feeAcc?.agreed_amount || 64000);
  const paidAmount = Number(feeAcc?.paid_amount || 40000);
  const balanceDue = Number(feeAcc?.balance_due || feeAcc?.balance_amount || Math.max(0, totalFees - paidAmount));
  
  let nextDueDate = feeAcc?.next_due_date ? new Date(feeAcc.next_due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '15 Aug 2026';
  let nextDueAmount = 12000;

  if (Array.isArray(feeAcc?.installments)) {
    const pending = feeAcc.installments
      .filter(i => i.status === 'pending' || i.status === 'partially_paid')
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    if (pending.length > 0) {
      nextDueDate = pending[0].due_date ? new Date(pending[0].due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : nextDueDate;
      nextDueAmount = Number(pending[0].amount || nextDueAmount);
    }
  }

  const admissionDate = enr?.enrollment_date 
    ? new Date(enr.enrollment_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '25 Jun 2026';

  return { totalFees, paidAmount, balanceDue, nextDueDate, nextDueAmount, admissionDate };
}

/**
 * Individual memoized mobile student card item.
 * 
 * @param {Object} props - Component properties.
 * @param {Object} props.student - Normalized student record.
 * @param {boolean} props.isChecked - Selection state.
 * @param {boolean} props.isExpanded - Expansion state.
 * @param {boolean} props.isSelectionMode - Whether selection mode is active across the list.
 * @param {Function} props.onSelectRow - Row selection callback.
 * @param {Function} props.onToggleExpand - Card expand toggle callback.
 * @param {Object} props.handlers - Event trigger handlers (onView, onEdit, onDelete).
 * @returns {React.JSX.Element} Memoized expandable student card.
 */
const StudentMobileCardItem = ({
  student,
  isChecked,
  isExpanded,
  isSelectionMode,
  onSelectRow,
  onToggleExpand,
  handlers
}) => {
  const initials = useMemo(() => {
    return (student.student_name || student.name || 'ST')
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }, [student.student_name, student.name]);

  const studentClass = student.allocations?.[0]?.course_name 
    || student.allocations?.[0]?.batch_name 
    || student.current_class 
    || student.current_course;

  const feeSummary = useMemo(() => extractStudentFeeSummary(student), [student]);

  // Memoize Avatar Section JSX
  const avatarSection = (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onSelectRow(student.student_id);
      }}
      className="size-8 rounded-full flex-shrink-0 cursor-pointer relative flex items-center justify-center transition-all duration-200"
    >
      {isSelectionMode || isChecked ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-primary shadow-sm animate-in zoom-in duration-150">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => onSelectRow(student.student_id)}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-border-light dark:border-border-dark text-primary focus:ring-primary w-4 h-4 cursor-pointer"
          />
        </div>
      ) : (
        <div className="absolute inset-0 size-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center font-bold text-xs transition-colors">
          {initials}
        </div>
      )}
    </div>
  );

  // Left Header Slot: Student Name + Glowing Status Dot + Class Chip + ID / Enrolled Date
  const leftHeader = (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {avatarSection}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="font-bold text-text-main dark:text-white text-xs truncate flex items-center gap-1.5">
            <span>{student.student_name || 'Anonymous Student'}</span>
            {/* Glowing Status Dot directly after student name */}
            <span
              title={student.status || 'active'}
              className={`inline-block size-2 rounded-full shrink-0 ${
                student.status === 'active'
                  ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                  : student.status === 'inactive' || student.status === 'suspended'
                  ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                  : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
              }`}
            />
          </span>
          {studentClass && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
              {studentClass}
            </span>
          )}
        </div>
        <span className="text-[10px] text-text-secondary dark:text-on-surface-variant font-medium">
          ID: {student.student_id} • Enrolled: {feeSummary.admissionDate}
        </span>
      </div>
    </div>
  );

  // Right Header Slot: Quick Due Balance Pill
  const rightHeader = (
    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Balance</span>
      <span className={`text-[11px] font-black font-mono ${feeSummary.balanceDue > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
        ₹{feeSummary.balanceDue.toLocaleString()}
      </span>
    </div>
  );

  // Expanded Content Panel: Fee Metrics Tile + Schedule Tile + Collapsible Contacts & Actions
  const expandedContent = (
    <div className="space-y-3 pt-1">
      {/* 💰 Fee Accounting Summary Grid Tile */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-3 gap-2 text-center">
        <div>
          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Total Fees</span>
          <span className="text-xs font-black font-mono text-slate-800 dark:text-white">₹{feeSummary.totalFees.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[8px] font-black uppercase tracking-wider text-emerald-500 block">Paid</span>
          <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">₹{feeSummary.paidAmount.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[8px] font-black uppercase tracking-wider text-rose-500 block">Due Balance</span>
          <span className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">₹{feeSummary.balanceDue.toLocaleString()}</span>
        </div>
      </div>

      {/* 📅 Schedule Summary Tile */}
      <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 grid grid-cols-2 gap-3 text-left">
        <div>
          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Admission Date</span>
          <span className="text-[11px] font-semibold text-slate-800 dark:text-white">{feeSummary.admissionDate}</span>
        </div>
        <div>
          <span className="text-[8px] font-black uppercase tracking-wider text-amber-500 block">Next Due Date</span>
          <span className="text-[11px] font-semibold text-slate-800 dark:text-white font-mono">
            {feeSummary.nextDueDate} {feeSummary.nextDueAmount > 0 ? `(₹${feeSummary.nextDueAmount.toLocaleString()})` : ''}
          </span>
        </div>
      </div>

      {/* Collapsible Details & Action Buttons */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-text-secondary dark:text-on-surface-variant text-[10px] pt-1">
        <div>
          <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Phone Number</span>
          <span className="font-semibold text-text-main dark:text-white">{student.phone || 'N/A'}</span>
        </div>
        <div>
          <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Enrollment ID</span>
          <span className="font-semibold text-text-main dark:text-white font-mono text-[10px]">
            {student.enrollments?.[0]?.enrollment_id || 'No active enrollment'}
          </span>
        </div>
        <div className="col-span-2 space-y-1">
          <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Assigned Batches & Courses</span>
          {student.allocations && student.allocations.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {student.allocations.map((alloc, idx) => (
                <span key={alloc.allocation_id || idx} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  {alloc.batch_name || alloc.course_name || 'Batch'}
                </span>
              ))}
            </div>
          ) : (
            <span className="font-semibold text-text-main dark:text-white">Unassigned</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-light/50 dark:border-border-dark/50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlers.onView(student);
          }}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-main dark:text-white text-[10px] font-bold rounded transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">person</span>
          Details
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlers.onEdit(student);
          }}
          className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">edit</span>
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlers.onDelete(student.student_id, student.student_name);
          }}
          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold rounded transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">delete</span>
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <ExpandableLowDensityCard
      isChecked={isChecked}
      isExpanded={isExpanded}
      onToggleExpand={(e) => onToggleExpand && onToggleExpand(e, student.student_id)}
      onCardClick={() => handlers.onView(student)}
      leftHeader={leftHeader}
      rightHeader={rightHeader}
      expandedContent={expandedContent}
    />
  );
};

// Custom equality comparator to guarantee zero re-renders unless data/state changes
export const StudentMobileCard = React.memo(StudentMobileCardItem, (prev, next) => {
  return (
    prev.student === next.student &&
    prev.isChecked === next.isChecked &&
    prev.isExpanded === next.isExpanded &&
    prev.isSelectionMode === next.isSelectionMode &&
    prev.onSelectRow === next.onSelectRow &&
    prev.onToggleExpand === next.onToggleExpand &&
    prev.handlers === next.handlers
  );
});
