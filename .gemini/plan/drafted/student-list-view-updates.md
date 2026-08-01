# Architectural Implementation Plan: Decoupling KPI Metric Aggregation into `studentKpiHelper.js`

---
Date: 2026-08-02T00:35:00+05:30
Status: Proposed
---

## Executive Summary

Currently, the business logic for calculating KPI metrics (`feeDueCount`, `overdueCount`, `paidFullCount`, `newAdmissionsCount`, `lowAttendanceCount`, `unassignedCount`) is written inline inside `students.forEach(...)` inside `useStudentListView.js` and duplicated inside `useFilteredStudents.js`.

This plan decouples that inline block into a enterprise-grade, pure, zero-side-effect utility module: **`src/features/student/utils/studentKpiHelper.js`**. 

---

## 1. Non-Domain Infrastructure & Technical Rules Compliance

### Rule N1: Explicit Positional Signatures & Execution Blueprints

```javascript
/**
 * 1. Evaluates student account status (active, inactive, suspended).
 * @param {Object} student - Student entity record.
 * @returns {{ isActive: boolean, isInactive: boolean, status: string }}
 */
export function evaluateStudentStatus(student) { ... }

/**
 * 2. Evaluates student batch allocations via batchRepo hydrator.
 * @param {Object} student - Student entity record.
 * @param {Array} batches - Cached batches.
 * @param {Array} courses - Cached courses.
 * @param {Array} courseTypes - Cached course types.
 * @returns {{ isUnassigned: boolean, allocations: Array<Object> }}
 */
export function evaluateStudentAllocations(student, batches, courses, courseTypes) { ... }

/**
 * 3. Evaluates student enrollment date against a day threshold.
 * @param {Object} student - Student entity record.
 * @param {number} [daysThreshold=30] - Number of days lookback window.
 * @returns {{ isNewAdmission: boolean, admissionDate: string|null }}
 */
export function evaluateStudentAdmissionDate(student, daysThreshold = 30) { ... }

/**
 * 4. Safely extracts fee accounting metrics for a student via embedded records or enrollmentRepo O(1) cache.
 * @param {Object} student - Student entity record.
 * @returns {{ balanceDue: number, nextDueDate: string|null, isOverdue: boolean, isPaidFull: boolean, isFeeDue: boolean }}
 */
export function extractStudentFeeSummary(student) { ... }

/**
 * 5. Evaluates student attendance summary score against a threshold percentage.
 * @param {Object} student - Student entity record.
 * @param {number} [threshold=75] - Minimum acceptable percentage boundary.
 * @returns {{ isLowAttendance: boolean, percentage: number|null }}
 */
export function evaluateStudentAttendance(student, threshold = 75) { ... }

/**
 * Master composer: Calculates aggregate KPI metrics across an array of student records in a single O(N) pass.
 * @param {Array<Object>} [students=[]] - Array of student entity records.
 * @param {Array<Object>} [batches=[]] - Cached batches list.
 * @param {Array<Object>} [courses=[]] - Cached courses list.
 * @param {Array<Object>} [courseTypes=[]] - Cached course types list.
 * @returns {StudentKpiMetrics} Aggregate metrics object.
 */
export function calculateStudentKpiMetrics(students = [], batches = [], courses = [], courseTypes = []) { ... }
```

---

### Rule N2: Absolute Base Knowledge Traceability

- **Target Helper**: `src/features/student/utils/studentKpiHelper.js`
- **Fee Repository**: [enrollmentCacheHelper.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/enrollmentCacheHelper.js)
- **Attendance Repository**: [studentCacheHelper.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/studentCacheHelper.js)
- **Batch Repository**: [batchCacheHelper.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchCacheHelper.js)
- **Hook Controller**: [useStudentListView.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentListView.js)

---

### Rule N3: Fact vs. Assumption Boundary Declaration

#### Actual Verified Facts:
1. `StudentMobileCard.jsx` uses `extractStudentFeeSummary(student)` to resolve fee accounts via `enrollmentRepo` O(1) cache maps, ensuring `balanceDue` and `nextDueDate` are accurate even when nested records are unhydrated.
2. `useStudentListView.js` previously used inline `s.enrollments?.[0]?.studentfeeaccounts?.[0]` which missed unhydrated records or secondary enrollments.
3. Decoupling each KPI into a dedicated evaluator function (`evaluateStudentStatus`, `evaluateStudentAllocations`, `evaluateStudentAdmissionDate`, `extractStudentFeeSummary`, `evaluateStudentAttendance`) allows each metric rule to be unit-tested and refactored independently.

---

### Rule N4: Performance & Exception Isolation Constraints

- **Execution Complexity**: $O(N)$ single-pass array iteration over $N$ students.
- **Exception Isolation Boundary**: Each small evaluator function handles null/undefined safety internally, and each student iteration in `calculateStudentKpiMetrics` is wrapped in a `try { ... } catch (err)` block. If a single student object contains corrupted structures, `console.warn` logs the error, and calculation safely continues for all remaining students without crashing the UI.

---

## User Review Required

> [!IMPORTANT]
> **Decoupled KPI Evaluators**: Every KPI metric (Status, Allocations, Admission Date, Fees, Attendance) now has its own pure evaluator function. Modifying one metric's business logic will never side-effect or break other KPI calculations.

---

## Proposed Technical Changes

### 1. `[NEW]` [studentKpiHelper.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/studentKpiHelper.js)

Create `studentKpiHelper.js` with decoupled KPI evaluator functions and per-record error handling:

```javascript
/**
 * @file studentKpiHelper.js
 * Enterprise Modular KPI Aggregation Engine for Student Directory & Analytics.
 * Houses decoupled, independently unit-testable KPI evaluator functions.
 */

import { enrollmentRepo, getStudentAllocationsViewModel } from './enrollmentCacheHelper';
import { studentRepo } from './studentCacheHelper';

/**
 * 1. Evaluates student account status.
 * @param {Object} student - Student record.
 * @returns {{ isActive: boolean, isInactive: boolean, status: string }}
 */
export function evaluateStudentStatus(student) {
  if (!student || typeof student !== 'object') {
    return { isActive: false, isInactive: false, status: 'unknown' };
  }
  const statusStr = String(student.status || '').toLowerCase();
  const isActive = statusStr === 'active';
  const isInactive = statusStr === 'inactive' || statusStr === 'suspended';
  return { isActive, isInactive, status: statusStr };
}

/**
 * 2. Evaluates student batch allocations.
 * @param {Object} student - Student record.
 * @param {Array} [batches=[]] - Batches list.
 * @param {Array} [courses=[]] - Courses list.
 * @param {Array} [courseTypes=[]] - Course types list.
 * @returns {{ isUnassigned: boolean, allocations: Array<Object> }}
 */
export function evaluateStudentAllocations(student, batches = [], courses = [], courseTypes = []) {
  if (!student || typeof student !== 'object') {
    return { isUnassigned: true, allocations: [] };
  }
  try {
    const allocations = getStudentAllocationsViewModel(student, batches, courses, courseTypes);
    return {
      isUnassigned: allocations.length === 0,
      allocations
    };
  } catch (err) {
    console.warn('[studentKpiHelper:evaluateStudentAllocations] Error:', err);
    return { isUnassigned: true, allocations: [] };
  }
}

/**
 * 3. Evaluates student enrollment date against lookback threshold.
 * @param {Object} student - Student record.
 * @param {number} [daysThreshold=30] - Lookback window in days.
 * @returns {{ isNewAdmission: boolean, admissionDate: string|null }}
 */
export function evaluateStudentAdmissionDate(student, daysThreshold = 30) {
  if (!student || typeof student !== 'object') {
    return { isNewAdmission: false, admissionDate: null };
  }
  try {
    const enrollments = Array.isArray(student.enrollments) ? student.enrollments : (Array.isArray(student.Enrollment) ? student.Enrollment : []);
    const enrDate = enrollments[0]?.enrollment_date || null;
    if (!enrDate) return { isNewAdmission: false, admissionDate: null };

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
    const parsed = new Date(enrDate);
    const isNewAdmission = !isNaN(parsed.getTime()) && parsed >= thresholdDate;

    return { isNewAdmission, admissionDate: enrDate };
  } catch (err) {
    console.warn('[studentKpiHelper:evaluateStudentAdmissionDate] Error:', err);
    return { isNewAdmission: false, admissionDate: null };
  }
}

/**
 * 4. Safely extracts fee accounting metrics via embedded records or enrollmentRepo O(1) cache.
 * @param {Object} student - Student record.
 * @returns {{ balanceDue: number, nextDueDate: string|null, isOverdue: boolean, isPaidFull: boolean, isFeeDue: boolean }}
 */
export function extractStudentFeeSummary(student) {
  if (!student || typeof student !== 'object') {
    return { balanceDue: 0, nextDueDate: null, isOverdue: false, isPaidFull: false, isFeeDue: false };
  }

  try {
    const enrollments = Array.isArray(student.enrollments) 
      ? student.enrollments 
      : (Array.isArray(student.Enrollment) ? student.Enrollment : []);
    
    let feeAcc = null;
    let enr = enrollments[0];

    for (const rawEnr of enrollments) {
      const enrId = rawEnr?.enrollment_id || rawEnr?.id;
      const hydrated = enrId ? enrollmentRepo.getByEnrollmentId(enrId) : null;
      const targetEnr = hydrated || rawEnr;

      const feeAccounts = Array.isArray(targetEnr?.studentfeeaccounts)
        ? targetEnr.studentfeeaccounts
        : (Array.isArray(targetEnr?.StudentFeeAccount) ? targetEnr.StudentFeeAccount : []);
      
      if (feeAccounts.length > 0) {
        feeAcc = feeAccounts[0];
        enr = targetEnr;
        break;
      }
    }

    if (!feeAcc && enr) {
      const feeAccounts = Array.isArray(enr?.studentfeeaccounts)
        ? enr.studentfeeaccounts
        : (Array.isArray(enr?.StudentFeeAccount) ? enr.StudentFeeAccount : []);
      feeAcc = feeAccounts[0] || enr?.feeAccount || enr?.student_fee_account || null;
    }

    const totalFees = feeAcc?.total_amount != null ? Number(feeAcc.total_amount) : (feeAcc?.agreed_amount != null ? Number(feeAcc.agreed_amount) : null);
    const paidAmount = feeAcc?.paid_amount != null ? Number(feeAcc.paid_amount) : null;
    const balanceDue = feeAcc?.balance_due != null
      ? Number(feeAcc.balance_due)
      : (feeAcc?.balance_amount != null
        ? Number(feeAcc.balance_amount)
        : (totalFees != null && paidAmount != null ? Math.max(0, totalFees - paidAmount) : 0));

    let nextDueDate = feeAcc?.next_due_date || null;

    if (Array.isArray(feeAcc?.installments) && feeAcc.installments.length > 0) {
      const pending = feeAcc.installments
        .filter(i => i.status === 'pending' || i.status === 'partially_paid')
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      if (pending.length > 0) {
        nextDueDate = pending[0].due_date || nextDueDate;
      }
    }

    const isFeeDue = balanceDue > 0;
    const isOverdue = !!(nextDueDate && new Date(nextDueDate) < new Date() && isFeeDue);
    const isPaidFull = balanceDue === 0 && enrollments.length > 0;

    return { balanceDue, nextDueDate, isOverdue, isPaidFull, isFeeDue };
  } catch (err) {
    console.warn('[studentKpiHelper:extractStudentFeeSummary] Failed to resolve fee summary:', err);
    return { balanceDue: 0, nextDueDate: null, isOverdue: false, isPaidFull: false, isFeeDue: false };
  }
}

/**
 * 5. Evaluates student attendance summary score.
 * @param {Object} student - Student record.
 * @param {number} [threshold=75] - Minimum score percentage threshold.
 * @returns {{ isLowAttendance: boolean, percentage: number|null }}
 */
export function evaluateStudentAttendance(student, threshold = 75) {
  if (!student || typeof student !== 'object') {
    return { isLowAttendance: false, percentage: null };
  }
  try {
    const attn = studentRepo.calculateSummarizedAttendanceScore(student);
    const isLowAttendance = attn.percentage != null && attn.percentage < threshold;
    return { isLowAttendance, percentage: attn.percentage };
  } catch (err) {
    console.warn('[studentKpiHelper:evaluateStudentAttendance] Error:', err);
    return { isLowAttendance: false, percentage: null };
  }
}

/**
 * Master composer: Calculates aggregate KPI metrics across an array of student records in a single O(N) pass.
 * Delegates per-student evaluations to decoupled functions (Status, Allocations, AdmissionDate, FeeSummary, Attendance).
 * 
 * @param {Array<Object>} [students=[]] - Students array.
 * @param {Array<Object>} [batches=[]] - Batches array.
 * @param {Array<Object>} [courses=[]] - Courses array.
 * @param {Array<Object>} [courseTypes=[]] - Course types array.
 * @returns {{ total: number, active: number, inactive: number, feeDueCount: number, overdueCount: number, paidFullCount: number, newAdmissionsCount: number, lowAttendanceCount: number, unassignedCount: number }}
 */
export function calculateStudentKpiMetrics(students = [], batches = [], courses = [], courseTypes = []) {
  if (!Array.isArray(students) || students.length === 0) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      feeDueCount: 0,
      overdueCount: 0,
      paidFullCount: 0,
      newAdmissionsCount: 0,
      lowAttendanceCount: 0,
      unassignedCount: 0
    };
  }

  let active = 0;
  let inactive = 0;
  let feeDueCount = 0;
  let overdueCount = 0;
  let paidFullCount = 0;
  let newAdmissionsCount = 0;
  let lowAttendanceCount = 0;
  let unassignedCount = 0;

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    if (!s || typeof s !== 'object') continue;

    try {
      // 1. Decoupled Status Check
      const statusRes = evaluateStudentStatus(s);
      if (statusRes.isActive) active++;
      else if (statusRes.isInactive) inactive++;

      // 2. Decoupled Allocation Check
      const allocRes = evaluateStudentAllocations(s, batches, courses, courseTypes);
      if (allocRes.isUnassigned) unassignedCount++;

      // 3. Decoupled Admission Date Check
      const enrRes = evaluateStudentAdmissionDate(s, 30);
      if (enrRes.isNewAdmission) newAdmissionsCount++;

      // 4. Decoupled Fee Summary Check
      const feeRes = extractStudentFeeSummary(s);
      if (feeRes.isFeeDue) {
        feeDueCount++;
        if (feeRes.isOverdue) overdueCount++;
      } else if (feeRes.isPaidFull) {
        paidFullCount++;
      }

      // 5. Decoupled Attendance Score Check
      const attnRes = evaluateStudentAttendance(s, 75);
      if (attnRes.isLowAttendance) lowAttendanceCount++;

    } catch (recordError) {
      console.warn(`[studentKpiHelper:calculateStudentKpiMetrics] Non-fatal error evaluating student at index ${i}:`, recordError);
    }
  }

  return {
    total: students.length,
    active,
    inactive,
    feeDueCount,
    overdueCount,
    paidFullCount,
    newAdmissionsCount,
    lowAttendanceCount,
    unassignedCount
  };
}
```

---

### 2. `[MODIFY]` [useStudentListView.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentListView.js)

Refactor `useStudentListView.js` to consume `calculateStudentKpiMetrics`:

```javascript
import { calculateStudentKpiMetrics } from '../utils/studentKpiHelper';

// Inside useStudentListView hook:
const kpiMetrics = useMemo(() => {
  return calculateStudentKpiMetrics(students, batches, courses, courseTypes);
}, [students, batches, courses, courseTypes]);
```

---

### 3. `[MODIFY]` [useFilteredStudents.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useFilteredStudents.js)

Refactor `useFilteredStudents.js` to consume `extractStudentFeeSummary` from `studentKpiHelper.js`:

```javascript
import { extractStudentFeeSummary } from '../features/student/utils/studentKpiHelper';

// Inside kpiFilter matching logic:
switch (kpiFilter) {
  case 'fee_due':
    matchesKpi = feeSummary.balanceDue > 0;
    break;
  case 'overdue':
    matchesKpi = feeSummary.isOverdue;
    break;
  case 'paid_full':
    matchesKpi = feeSummary.isPaidFull;
    break;
  // ...
}
```

---

## Verification Plan

### Automated Verification
1. Verify module imports and exports cleanly without circular dependency errors.

### Manual Verification
1. Open Student Directory on mobile viewport.
2. Verify top Consolidated Hero Card (`Total`, `Active`, `Inactive`) match student list values.
3. Tap `Fee Due` KPI card ➔ Verify list matches fee-due students accurately.
4. Tap `Overdue` KPI card ➔ Verify list matches overdue students accurately.
