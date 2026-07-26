---
Date: 2026-07-26T19:57:45+05:30
Status: Proposed
---

# Technical Implementation Plan: 3-Way Teacher Payment & General Ledger Reconciliation Engine Architecture

Build a double-entry reconciliation and smart-matching subsystem in the Teacher Payroll UI ([TeacherSalaryPayroll.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherSalaryPayroll.jsx)) to discover, flag, and resolve two primary accounting discrepancies between General Ledger outflows (`MoneyTransaction`, `MTX-xxx`) and Teacher Sub-Ledger payouts (`TeacherPaymentTransaction`, `TPT-xxx`).

---

## Architectural Principles & Non-Domain Decrees

### Rule N1: Explicit Positional Signatures & Execution Blueprints

```javascript
/**
 * Utility helper to identify candidate matching General Ledger transactions for an unlinked Teacher Payment.
 * @param {Object} tptRecord - Unsynced TeacherPaymentTransaction record.
 * @param {string} tptRecord.transaction_id - Primary key (e.g., 'TPT-00005').
 * @param {number} tptRecord.amount - Payout monetary amount.
 * @param {string} tptRecord.transaction_date - Date string ('YYYY-MM-DD').
 * @param {Array<Object>} moneyTransactions - List of all General Ledger MoneyTransaction objects.
 * @returns {Object|null} Matching MoneyTransaction candidate or null if no match found within window.
 */
export const findSmartGlMatch = (tptRecord, moneyTransactions = []) => {
  if (!tptRecord || !tptRecord.amount) return null;

  return moneyTransactions.find(mt => {
    // 1. Must be an expense/outflow or teacher party transaction
    const isOutflow = mt.transaction_type === 'expense' || mt.type === 'DEBIT';
    const isUnlinked = !mt.payment_reference || !mt.payment_reference.includes('TPT-');
    if (!isOutflow || !isUnlinked) return false;

    // 2. Exact amount match check
    const isAmountEqual = Math.abs(Number(mt.amount) - Number(tptRecord.amount)) < 0.01;
    if (!isAmountEqual) return false;

    // 3. Date proximity heuristic: Math.abs(diffDays) <= 7
    try {
      const tptDate = new Date(tptRecord.transaction_date).getTime();
      const mtDate = new Date(mt.transaction_date).getTime();
      const diffDays = Math.abs(tptDate - mtDate) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    } catch {
      return false;
    }
  }) || null;
};
```

---

### Rule N2: Absolute Background Base Knowledge Traceability

- **Referenced JSON Schemas**:
  - `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Staff\TeacherPaymentTransaction.json`
  - `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Finance\MoneyTransaction.json`
- **Referenced Frontend Components**:
  - [TeacherSalaryPayroll.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherSalaryPayroll.jsx)
  - [TeacherPaymentTransactionsCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/TeacherPaymentTransactionsCard.jsx)
  - [RecordTeacherPaymentModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/RecordTeacherPaymentModal.jsx)
  - [MoneyTransactionForm.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/transactions/components/MoneyTransactionForm.jsx)
  - [useFinanceQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/hooks/useFinanceQueries.js)
  - [useTeacherQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)

---

### Rule N3: Explicit Fact vs. Assumption Boundary Declaration

#### Actual Verified Facts:
1. `TeacherPaymentTransaction` records contain `transaction_id` (`TPT-xxx`), `teacher_id`, `amount`, `payment_method`, `salary_month`, `transaction_date`.
2. `MoneyTransaction` records store external links inside `payment_reference`. The standard 3-part key convention is `${teacher_id}_${salary_month}_${tpt_id}`.
3. `useUpdateMoneyTransactionMutation` is fully implemented in `useFinanceQueries.js` and invalidates query cache key `queryKeys.finance.all` upon success.

#### System Assumptions:
1. `MoneyTransaction` records mapped to a teacher will store `party_type = 'teacher'` or reference the `teacher_id` / teacher name in notes.
2. Smart matching threshold of $\pm 7\text{ days}$ is optimal to pair unlinked entries created manually on different dates.

---

### Rule N4: GAS Execution Boundary & Round-Trip Round Up

- Updates to existing `MoneyTransaction` reference keys use a single atomic `data_update` API mutation (`useUpdateMoneyTransactionMutation`).
- Zero multiple round-trips are executed inside loops; array filtering and candidate matching are calculated entirely in-memory using JavaScript RAM structures.

---

### Rule N5: Performance Regression & Benchmark Assertions

- In-memory smart matching executes in $O(N \times M)$ where $N \le 50$ (teacher payout receipts) and $M \le 200$ (recent GL entries).
- **Target Assertion**: Matching loop completes in $< 2\text{ms}$ on standard mobile/desktop browsers.

---

### Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation

> [!CAUTION]
> **LEGACY MAINTENANCE & DUPLICATE ENTRY RISK:**
> - Clicking "Sync Ledger Entry" on an unsynced `TPT` row when a matching GL entry ALREADY exists causes duplicate cash outflow entries in the General Ledger.
> - **Remediation**: The smart matching heuristic will detect existing unlinked GL entries first and offer a **"Link with TXN-xxx"** action button instead of opening a new GL creation form.

---

## User Review Required

> [!IMPORTANT]
> **1. Scenario 1 (Unlinked GL Outflow $\rightarrow$ Create Payroll TPT)**:
> - When an accountant logs an outflow directly in the Cash Book for a teacher, an alert banner will render above the Payment Transactions Ledger:
>   > ⚠️ *Found 1 General Ledger outflow of ₹50,000 (TXN-00045, 2026-07-26) with no linked payroll payout.*
> - Clicking **"Convert to Payroll Payment"** opens `RecordTeacherPaymentModal` pre-filled. Submitting it creates `TPT-xxx` AND links `TXN-00045.payment_reference`.
>
> **2. Scenario 2 (Smart Match & Direct Link $\rightarrow$ Zero Duplication)**:
> - If both `TPT-00005` and `TXN-00102` exist for ₹50,000 within a 7-day window, `TeacherPaymentTransactionsCard` will show a 🔗 **"Suggested Match: TXN-00102"** pill.
> - Clicking **"Link with TXN-00102"** directly updates `TXN-00102.payment_reference` without creating a duplicate record!

---

## Proposed Changes

---

### 1. Reconciliation Utility Engine (`dazzling-erp-admin`)

#### [NEW] [reconciliation.utils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/utils/reconciliation.utils.js)

- Pure JS utility methods:
  - `findUnlinkedGlOutflows(moneyTransactions, teacherId)`: Returns GL entries for this teacher missing a `TPT-` reference.
  - `findSmartGlMatch(tptRecord, unlinkedGlOutflows)`: Returns candidate GL entry matching amount & date within 7 days.

---

### 2. Unlinked GL Outflows Alert Banner

#### [NEW] [UnlinkedGlOutflowsBanner.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/UnlinkedGlOutflowsBanner.jsx)

- Reusable V2 alert card using `Card`, `Badge`, and `Button`:
  - Renders warning icon, transaction description, amount, date, and 2 action buttons:
    - **"Convert to Payroll Payment"** (Triggers `RecordTeacherPaymentModal` pre-filled).
    - **"Mark Non-Salary Reimbursement"** (Updates GL entry reference to `NON_SALARY`).

---

### 3. Payment Transactions Ledger Card Refactoring

#### [MODIFY] [TeacherPaymentTransactionsCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/TeacherPaymentTransactionsCard.jsx)

- Integrate `findSmartGlMatch` helper:
  - For unsynced rows (`isSynced === false`), check if a candidate match exists.
  - If match found:
    - Render 🔗 **"Match: TXN-xxx"** badge.
    - Render **"Link"** button (`variant="outlined"` / `variant="success"`) triggering link confirmation handler.
  - If no match found:
    - Render standard **"Sync"** button triggering `MoneyTransactionForm` modal.

---

### 4. Main Tab Layout & State Integration

#### [MODIFY] [TeacherSalaryPayroll.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherSalaryPayroll.jsx)

- Mount `UnlinkedGlOutflowsBanner` above `TeacherPaymentTransactionsCard`.
- Add link confirmation modal (`ConfirmModal`) handling direct link dispatch via `useUpdateMoneyTransactionMutation`.
- Pass pre-filled initial values to `RecordTeacherPaymentModal` when converting an unlinked GL outflow into a sub-ledger payout.

---

header

## Verification Plan

### Automated / Syntax Verification
- Run code search & build check to ensure no broken imports or missing component references.

### Manual Verification
1. **Scenario 1 Test**:
   - Create a manual `MoneyTransaction` expense of ₹45,000 for target teacher without `payment_reference`.
   - Open Teacher Salary & Payroll tab.
   - Confirm `UnlinkedGlOutflowsBanner` appears with warning message.
   - Click **"Convert to Payroll Payment"** -> Confirm modal opens pre-filled.
   - Submit form -> Confirm `TPT` created and banner disappears!

2. **Scenario 2 Test (Smart Match & Link)**:
   - Create a `TPT` record for ₹30,000 and an unlinked `MoneyTransaction` for ₹30,000 dated 2 days apart.
   - Confirm `TeacherPaymentTransactionsCard` displays 🔗 **"Match: TXN-xxx"** and **"Link"** button.
   - Click **"Link"** and confirm dialog -> Verify GL entry is updated, no duplicate is created, and status turns to **Synced (Green)**!
