import React, { useState, useMemo } from 'react';
import ExpandableLowDensityCard from '../../../components/ui/v2/cards/ExpandableLowDensityCard';
import Badge from '../../../components/ui/Badge';
import AllocatedBatchesBadgeGroup from './AllocatedBatchesBadgeGroup';
import { enrollmentRepo, getStudentAllocationsViewModel, getCourseTypeSummary } from '../utils/enrollmentCacheHelper';
import { studentRepo } from '../utils/studentCacheHelper';
import { useBatchesQuery } from '../../batch/hooks/useBatchQueries';
import { useCoursesQuery, useCourseTypesQuery } from '../../course/hooks/useCourseQueries';

/**
 * Safely formats numbers into localized Indian Rupee currency strings (e.g. ₹24,000) or a fallback.
 * Guarantees zero crashes when values are null, undefined, or non-numeric.
 * 
 * @param {number|string|null|undefined} value - Numeric value to format.
 * @param {string} [fallback='N/A'] - Fallback string if value is null/non-numeric.
 * @returns {string} Formatted currency string or fallback.
 */
export function formatCurrency(value, fallback = 'N/A') {
  if (value == null || value === '' || isNaN(Number(value))) {
    return fallback;
  }
  return `₹${Number(value).toLocaleString()}`;
}

/**
 * Extracts fee accounting summary metrics for a student by delegating to enrollmentRepo.extractFeeSummary.
 */
function extractStudentFeeSummary(student) {
  const summary = enrollmentRepo.extractFeeSummary(student);
  const enrollments = student?.enrollments || student?.Enrollment || [];
  const enr = enrollments[0];
  const admissionDate = enr?.enrollment_date
    ? new Date(enr.enrollment_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  return {
    totalFees: summary.totalFees,
    paidAmount: summary.paidAmount,
    balanceDue: summary.balanceDue,
    nextDueDate: summary.nextDueDate,
    nextDueAmount: null,
    admissionDate
  };
}

/**
 * Formats due amount and next payment date into combined right header pill label.
 * Format: [due_amount | next_payment_date] or [due_amount | DUE] if date has passed.
 */
function formatDueSummary(dueAmount, nextDueDate) {
  if (dueAmount == null) {
    return { label: 'No Fee Data', isOverdue: false, isPaid: false, isMissing: true };
  }

  if (dueAmount <= 0) {
    return { label: 'Paid in Full', isOverdue: false, isPaid: true };
  }

  const formattedAmount = formatCurrency(dueAmount);

  if (!nextDueDate) {
    return { label: `${formattedAmount} | DUE`, isOverdue: true, isPaid: false };
  }

  const dueDateObj = new Date(nextDueDate);
  const isPassed = !isNaN(dueDateObj.getTime()) && dueDateObj < new Date();

  if (isPassed) {
    return { label: `${formattedAmount} | DUE`, isOverdue: true, isPaid: false };
  }

  const shortDate = dueDateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return { label: `${formattedAmount} | ${shortDate}`, isOverdue: false, isPaid: false };
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
  batches = [],
  courses = [],
  courseTypes = [],
  enrollmentsList = [],
  isChecked,
  isExpanded,
  isSelectionMode,
  onSelectRow,
  onToggleExpand,
  onOpenAllocationsModal,
  handlers
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  const avatarUrl = useMemo(() => {
    const url = student.avatarUrl || student.profile_picture_url || student.avatar_url || student.photo_url || student.image_url;
    if (!url || url === 'null' || url === 'undefined' || url === '') {
      return student.gender?.toLowerCase() === 'female' || student.gender?.toLowerCase() === 'f'
        ? 'https://img.icons8.com/color/150/girl.png'
        : 'https://img.icons8.com/color/150/boy.png';
    }
    return url;
  }, [student.avatarUrl, student.profile_picture_url, student.avatar_url, student.photo_url, student.image_url, student.gender]);

  const initials = useMemo(() => {
    return (student.student_name || student.name || 'ST')
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }, [student.student_name, student.name]);

  const allocations = useMemo(() => student._kpi?.allocations || getStudentAllocationsViewModel(student, batches, courses, courseTypes), [student, batches, courses, courseTypes]);
  const courseTypeSummary = useMemo(() => getCourseTypeSummary(allocations), [allocations]);
  const attendanceScore = useMemo(() => student._kpi?.attendanceScore || studentRepo.calculateSummarizedAttendanceScore(student), [student]);

  const feeSummary = useMemo(() => student._kpi?.feeSummary || extractStudentFeeSummary(student), [student, enrollmentsList]);
  const dueSummary = useMemo(() => formatDueSummary(feeSummary.balanceDue, feeSummary.nextDueDate), [feeSummary]);

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
      ) : avatarUrl && !hasImageError ? (
        <img
          src={avatarUrl}
          alt={student.student_name || 'Student'}
          onError={() => setHasImageError(true)}
          className="size-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
        />
      ) : (
        <div className="absolute inset-0 size-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center font-bold text-xs transition-colors">
          {initials}
        </div>
      )}
    </div>
  );

  // Left Header Slot: Row 1 = Name + Glowing Dot + CourseType Badges | Row 2 = Assigned Batches Badge Group directly below name
  const leftHeader = (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {avatarSection}
      <div className="flex flex-col min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <span className="font-bold text-text-main dark:text-white text-xs truncate flex items-center gap-1.5">
            <span>{student.student_name || 'Anonymous Student'}</span>
            {/* Glowing Status Dot directly after student name */}
            <span
              title={student.status || 'active'}
              className={`inline-block size-2 rounded-full shrink-0 ${student.status === 'active'
                ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                : student.status === 'inactive' || student.status === 'suspended'
                  ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                  : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                }`}
            />
          </span>
          {courseTypeSummary.badges.map((b, idx) => (
            <Badge key={b.type || idx} variant="primary" className="text-[7px] py-0.5 px-1.5 font-bold uppercase tracking-wider shrink-0">
              {b.label}
            </Badge>
          ))}
          {courseTypeSummary.overflowCount > 0 && (
            <Badge variant="default" className="text-[7px] py-0.5 px-1.5 font-bold uppercase tracking-wider shrink-0">
              +{courseTypeSummary.overflowCount}
            </Badge>
          )}
        </div>

        {/* Assigned Batches Badge Group directly below student name */}
        <AllocatedBatchesBadgeGroup
          allocations={allocations}
          onOpenModal={() => onOpenAllocationsModal && onOpenAllocationsModal(student)}
        />
      </div>
    </div>
  );

  // Right Header Slot: Attendance % KPI Badge + Combined Due Pill
  const attendancePct = attendanceScore?.percentage;
  const rightHeader = (
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      {/* Top Line: Attendance KPI Badge */}
      <span
        className={`text-[9px] font-extrabold font-mono px-1.5 py-0.25 rounded ${attendancePct == null
          ? 'bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80'
          : attendancePct >= 85
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
            : attendancePct >= 70
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60'
              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60'
          }`}
      >
        {attendancePct != null ? `${attendancePct}% Attendance` : 'N/A Attendance'}
      </span>

      {/* Bottom Line: Combined Due Summary Pill */}
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono tracking-tight border transition-all ${dueSummary.isMissing
          ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
          : dueSummary.isPaid
            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
            : dueSummary.isOverdue
              ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
          }`}
      >
        {dueSummary.label}
      </span>
    </div>
  );

  // Expanded Content Panel: Fee Metrics Tile + Schedule Tile + Collapsible Student ID, Enrolled Date & Contacts
  const expandedContent = (
    <div className="space-y-3 pt-1">
      {/* 💰 Fee Accounting Summary Grid Tile */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-3 gap-2 text-center">
        <div>
          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Total Fees</span>
          <span className="text-xs font-black font-mono text-slate-800 dark:text-white">{formatCurrency(feeSummary.totalFees)}</span>
        </div>
        <div>
          <span className="text-[8px] font-black uppercase tracking-wider text-emerald-500 block">Paid</span>
          <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(feeSummary.paidAmount)}</span>
        </div>
        <div>
          <span className="text-[8px] font-black uppercase tracking-wider text-rose-500 block">Due Balance</span>
          <span className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">{formatCurrency(feeSummary.balanceDue)}</span>
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
            {dueSummary.isPaid
              ? 'Paid'
              : feeSummary.nextDueDate
                ? `${feeSummary.nextDueDate}${feeSummary.nextDueAmount != null ? ` (${formatCurrency(feeSummary.nextDueAmount)})` : ''}`
                : 'N/A'}
          </span>
        </div>
      </div>

      {/* Collapsible Details (Student ID, Enrolled Date, Phone, Enrollment ID) */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-text-secondary dark:text-on-surface-variant text-[10px] pt-1">
        <div>
          <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Student Identifier</span>
          <span className="font-semibold text-text-main dark:text-white font-mono">{student.student_id}</span>
        </div>
        <div>
          <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Enrolled Date</span>
          <span className="font-semibold text-text-main dark:text-white">{feeSummary.admissionDate}</span>
        </div>
        <div>
          <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Contact Phone</span>
          <span className="font-semibold text-text-main dark:text-white">{student.phone || 'N/A'}</span>
        </div>
        <div>
          <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Enrollment ID</span>
          <span className="font-semibold text-text-main dark:text-white font-mono text-[10px]">
            {student.enrollments?.[0]?.enrollment_id || 'No active enrollment'}
          </span>
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
            handlers.onDelete(student.student_id, student.student_name, student);
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
    prev.batches === next.batches &&
    prev.courses === next.courses &&
    prev.courseTypes === next.courseTypes &&
    prev.enrollmentsList === next.enrollmentsList &&
    prev.isChecked === next.isChecked &&
    prev.isExpanded === next.isExpanded &&
    prev.isSelectionMode === next.isSelectionMode &&
    prev.onSelectRow === next.onSelectRow &&
    prev.onToggleExpand === next.onToggleExpand &&
    prev.onOpenAllocationsModal === next.onOpenAllocationsModal &&
    prev.handlers === next.handlers
  );
});
