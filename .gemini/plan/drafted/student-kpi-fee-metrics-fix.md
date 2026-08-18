# Fix Plan: Student KPI Fee Metrics on Mobile Cards

---
Date: 2026-08-18T14:25:30+05:30
Status: Approved-Completed
---

## 1. Problem Statement & Background Context

On mobile views, the expandable drawer inside [`StudentMobileCard.jsx`](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/components/StudentMobileCard.jsx) displays **Total Fees** and **Paid** as `N/A` even when a student has active enrollments and fee accounts with recorded transactions. 

### Root Cause
In [`enrollmentCacheHelper.js`](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/utils/enrollmentCacheHelper.js), `EnrollmentRepo.extractFeeSummary` attempts to resolve:
1. `feeAcc.total_amount` or `feeAcc.agreed_amount` for Total Fees.
2. `feeAcc.paid_amount` for Paid Amount.

However, according to the primary database schema [`StudentFeeAccount.json`](E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Finance/StudentFeeAccount.json) and live backend payloads, the canonical properties are:
- `final_fee` (agreed final fee after adjustments) or `total_fee` (base fee).
- `amount_paid` (total collected funds).
- `balance_due` (remaining balance).
- `installments` (nested list of installment schedules containing `due_date`, `due_amount`, and `paid_amount`).

Because the extracted values evaluate to `undefined` / `null`, `formatCurrency(null)` defaults to `'N/A'`.

---

## 2. Technical Rule Compliance & Traceability

### Rule N2: Absolute Background Base Knowledge Traceability
- **Referenced Schemas:**
  - [`StudentFeeAccount.json`](E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Finance/StudentFeeAccount.json) — Primary keys, columns (`final_fee`, `total_fee`, `amount_paid`, `balance_due`), relations.
  - [`Enrollment.json`](E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Academic/Enrollment.json) — Parent contract relation mapping `studentfeeaccounts` and `allocations`.
  - [`Student.json`](E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Students/Student.json) — Student primary entity with `enrollments` hasMany relation.
- **Referenced Core Modules:**
  - [`enrollmentCacheHelper.js`](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/utils/enrollmentCacheHelper.js) — In-memory O(1) repository `EnrollmentRepo`.
  - [`studentKpiHelper.js`](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/utils/studentKpiHelper.js) — Single-pass student KPI enrichment engine `enrichStudentWithKpi`.
  - [`StudentMobileCard.jsx`](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/components/StudentMobileCard.jsx) — Mobile student card component rendering `feeSummary`.
- **Knowledge References:**
  - [`enrollment_hydrated_records.md`](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/knowledge/enrollment_hydrated_records.md) — Live payload snapshot of hydrated enrollment and student fee accounts.

---

### Rule N3: Explicit Fact vs. Assumption Boundary Declaration

1. **Actual Verified Facts:**
   - `StudentFeeAccount` columns in `DazzlingDB` are `final_fee`, `total_fee`, `amount_paid`, and `balance_due`.
   - `EnrollmentRepo.extractFeeSummary` in `enrollmentCacheHelper.js` checks `feeAcc.total_amount` and `feeAcc.paid_amount`, which do not exist on `StudentFeeAccount`.
   - `StudentMobileCard.jsx` hardcodes `nextDueAmount: null` inside `extractStudentFeeSummary`, ignoring upcoming installment due amounts.
   - All client queries use TanStack Query with in-memory caching and zero mock data.

2. **System Assumptions:**
   - Students may have legacy records or varied payload shapes across historical migrations, so fallback resolution (`final_fee ?? total_fee ?? total_amount ?? agreed_amount` and `amount_paid ?? paid_amount ?? total_paid`) guarantees 100% backward and forward compatibility.

---

### Rule N4: GAS Execution Boundary & Round-Trip Round Up
- All extraction and KPI computations execute strictly in RAM ($O(1)$ per student) without triggering additional Google Apps Script network round-trips.

---

### Rule N5: Performance Regression & Benchmark Assertions
- `extractFeeSummary` runs during the single-pass $O(N)$ KPI calculation. Time complexity remains $O(1)$ per student record with zero garbage collector thrashing.
- Automated unit test harness in `src/test/` will assert that 1,000 student records execute in $< 5\text{ms}$.

---

### Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation

> [!NOTE]
> **LEGACY PROPERTY ALIASING PRESERVED:**
> 
> * **Technical Path Endpoint:** [`enrollmentCacheHelper.js`](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/utils/enrollmentCacheHelper.js) -> `EnrollmentRepo.extractFeeSummary`
> * **Core Technical Debt Risk:** Earlier code iterations used `total_amount` / `agreed_amount` and `paid_amount` interchangeably.
> * **Remediation Implemented:** Prioritize canonical schema keys (`final_fee`, `total_fee`, `amount_paid`) first, with secondary fallback to legacy aliases before returning `null`.

---

## 3. Detailed Positional Signatures & Execution Blueprints (Rule N1)

### Module 1: `src/features/student/utils/enrollmentCacheHelper.js`

```javascript
/**
 * Safely extracts fee accounting metrics for a student by querying embedded fee accounts or enrollmentRepo O(1) cache.
 * Implements canonical schema resolution (final_fee, total_fee, amount_paid, balance_due) with multi-fallback resilience.
 * 
 * @param {Object} student - Student entity record with nested enrollments or relational ID.
 * @returns {{
 *   totalFees: number|null,
 *   paidAmount: number|null,
 *   balanceDue: number,
 *   nextDueDate: string|null,
 *   nextDueAmount: number|null,
 *   isOverdue: boolean,
 *   isPaidFull: boolean,
 *   isFeeDue: boolean
 * }} Standardized fee summary descriptor.
 */
EnrollmentRepo.prototype.extractFeeSummary = function(student) {
  if (!student || typeof student !== 'object') {
    return {
      totalFees: null,
      paidAmount: null,
      balanceDue: 0,
      nextDueDate: null,
      nextDueAmount: null,
      isOverdue: false,
      isPaidFull: false,
      isFeeDue: false
    };
  }

  try {
    const enrollments = Array.isArray(student.enrollments) 
      ? student.enrollments 
      : (Array.isArray(student.Enrollment) ? student.Enrollment : []);
    
    let feeAcc = null;
    let enr = enrollments[0];

    for (const rawEnr of enrollments) {
      const enrId = rawEnr?.enrollment_id || rawEnr?.id;
      const hydrated = enrId ? this.getByEnrollmentId(enrId) : null;
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

    // Canonical schema resolution: final_fee -> total_fee -> total_amount -> agreed_amount
    const totalFees = feeAcc?.final_fee != null
      ? Number(feeAcc.final_fee)
      : (feeAcc?.total_fee != null
        ? Number(feeAcc.total_fee)
        : (feeAcc?.total_amount != null
          ? Number(feeAcc.total_amount)
          : (feeAcc?.agreed_amount != null ? Number(feeAcc.agreed_amount) : null)));

    // Canonical schema resolution: amount_paid -> paid_amount -> total_paid
    const paidAmount = feeAcc?.amount_paid != null
      ? Number(feeAcc.amount_paid)
      : (feeAcc?.paid_amount != null
        ? Number(feeAcc.paid_amount)
        : (feeAcc?.total_paid != null ? Number(feeAcc.total_paid) : null));

    const balanceDue = feeAcc?.balance_due != null
      ? Number(feeAcc.balance_due)
      : (feeAcc?.balance_amount != null
        ? Number(feeAcc.balance_amount)
        : (totalFees != null && paidAmount != null ? Math.max(0, totalFees - paidAmount) : 0));

    let nextDueDate = feeAcc?.next_due_date || null;
    let nextDueAmount = null;

    if (Array.isArray(feeAcc?.installments) && feeAcc.installments.length > 0) {
      const pending = feeAcc.installments
        .filter(i => (i.status || '').toLowerCase() === 'pending' || (i.status || '').toLowerCase() === 'partially_paid')
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      if (pending.length > 0) {
        nextDueDate = pending[0].due_date || nextDueDate;
        nextDueAmount = pending[0].due_amount != null ? Number(pending[0].due_amount) : null;
      }
    }

    const isFeeDue = balanceDue > 0;
    const isOverdue = !!(nextDueDate && new Date(nextDueDate) < new Date() && isFeeDue);
    const isPaidFull = balanceDue === 0 && enrollments.length > 0;

    return { totalFees, paidAmount, balanceDue, nextDueDate, nextDueAmount, isOverdue, isPaidFull, isFeeDue };
  } catch (err) {
    console.warn('[EnrollmentRepo:extractFeeSummary] Error:', err);
    return { totalFees: null, paidAmount: null, balanceDue: 0, nextDueDate: null, nextDueAmount: null, isOverdue: false, isPaidFull: false, isFeeDue: false };
  }
};
```

---

### Module 2: `src/features/student/components/StudentMobileCard.jsx`

```javascript
/**
 * Extracts fee accounting summary metrics for a student by delegating to enrollmentRepo.extractFeeSummary.
 * Propagates nextDueAmount and formatted admission date.
 * 
 * @param {Object} student - Normalized student entity record.
 * @returns {Object} Enriched fee summary model for Card Drawer and Pills.
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
    nextDueAmount: summary.nextDueAmount,
    admissionDate
  };
}
```

---

## 4. Proposed Changes Summary

### Feature: Student Fee KPI Extraction

#### [MODIFY] [`enrollmentCacheHelper.js`](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/utils/enrollmentCacheHelper.js)
- Update `extractFeeSummary(student)` to resolve `final_fee`, `total_fee`, `amount_paid`, and `balance_due`.
- Extract `nextDueAmount` from sorted pending installments.

#### [MODIFY] [`StudentMobileCard.jsx`](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/components/StudentMobileCard.jsx)
- Update `extractStudentFeeSummary(student)` to forward `summary.nextDueAmount`.

#### [NEW] [`src/test/studentKpiFeeExtraction.test.js`](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/test/studentKpiFeeExtraction.test.js)
- Add comprehensive headless unit tests validating:
  1. Extraction with canonical hydrated schema record (`final_fee`, `amount_paid`, `balance_due`, `installments`).
  2. Extraction with fallback legacy records.
  3. Formatted output assertions on `StudentMobileCard` fee metrics tile.
  4. Performance assertion ($< 5\text{ms}$ execution for 1,000 iterations).

---

## 5. Verification Plan

### Automated Tests
Run Node.js headless test suite:
```powershell
node --test src/test/studentKpiFeeExtraction.test.js
node --test src/test/enrollmentQueries.test.js
```

### Manual Verification
1. Launch dev server (`npm run dev`).
2. Navigate to `/admin/students` on mobile viewport ($< 768\text{px}$).
3. Expand any student card with an active enrollment.
4. Verify that:
   - **Total Fees** displays `₹1,10,000` (or appropriate formatted amount) instead of `N/A`.
   - **Paid** displays `₹27,500` (or appropriate formatted amount in green) instead of `N/A`.
   - **Due Balance** displays `₹82,500` (or appropriate formatted amount in rose).
   - **Next Due Date** reflects next pending installment date and amount.
