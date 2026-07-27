---
Title: Technical Implementation Plan: Standard 2-Stage Teacher Payment Transaction & General Ledger Sync
Date: 2026-07-26T18:00:00+05:30
Status: Approved-Completed
---

# Technical Implementation Plan: Standard 2-Stage Teacher Payment Transaction & General Ledger Sync

Build a robust **Teacher Payment Transaction** entry subsystem and integrate a **2-Stage General Ledger (`MoneyTransaction`) Synchronization Workflow** matching the established student fee payment transaction architecture.

---

## User Review Required

> [!IMPORTANT]
> **2-Stage Transaction Architecture**:
> 1. **Stage 1 (Core Teacher Payout Recording)**: Cashier/Admin submits teacher payment via `RecordTeacherPaymentModal`. Dispatches backend API `staff_record_payment` to insert `TeacherPaymentTransaction` (`TPT-xxx`).
> 2. **Stage 2 (General Ledger Synchronization)**: The payment receipt renders in `TeacherPaymentTransactionsCard` with a sync status indicator. Clicking **"Sync Ledger Entry"** auto-launches prebuilt `MoneyTransactionForm` pre-filled dynamically with the 3-part composite key:
>    $$\text{Composite Reference Key} = \text{teacher\_id} + \text{"\_"} + \text{salary\_month} + \text{"\_"} + \text{transaction\_id}$$
>    *(e.g., `TCH-001001_2026-06_TPT-001001`)*
> 
> Saving `MoneyTransactionForm` creates the cash outflow row (`MTX-xxx`) and immediately renders a green `sync` badge.

---

## Open Questions

1. **Expense Category Auto-Selection**: Should dynamically pre-filled `MoneyTransactionForm` entries auto-select the `"Faculty Payroll"` / `"Salaries & Wages"` expense category ID if present?

---

## Proposed Changes

---

### 1. Backend Service & API Layer (`DazzlingDB`)

#### [MODIFY] [StaffService.js](file:///E:/NAST/Dazzling/GAS/DazzlingDB/DBServices/StaffService.js)
- Ensure `StaffService.recordPayment` returns the complete generated `TeacherPaymentTransaction` record containing `transaction_id` (`TPT-xxx`), `teacher_id`, `amount`, `payment_method`, `salary_month`, and `transaction_date`.

#### [MODIFY] [apiRegistry.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js)
- Verify `STAFF.RECORD_PAYMENT: 'staff_record_payment'` entry point registration.

---

### 2. Teacher Profile Payroll Components (`dazzling-erp-admin`)

#### [NEW] [RecordTeacherPaymentModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/RecordTeacherPaymentModal.jsx)
- Responsive desktop modal dialog built using atomic V2 UI primitives (`Modal`, `FormField`, `TextInput`, `SelectInput`, `RadioGroup`, `KpiCard`, `Badge`, `Button`).
- **Exact Target API Payload**:
  ```json
  {
    "action": "staff_record_payment",
    "payload": {
      "teacher_id": "TCH-00001",
      "payment_type": "salary",
      "amount": 50000,
      "payment_method": "bank",
      "transaction_date": "2026-07-26",
      "salary_month": "2026-07",
      "reference_number": "TXN12345678",
      "notes": "July salary payment"
    }
  }
  ```

#### [MODIFY] [TeacherPaymentTransactionsCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/TeacherPaymentTransactionsCard.jsx)
- Integrate ledger sync status lookup via `useMoneyTransactionsQuery`:
  - Compute composite key `compositeKey = ${teacherId}_${tx.salary_month}_${tx.transaction_id}`.
  - Check if any `MoneyTransaction` record has `payment_reference === compositeKey`.
- Render sync indicators per transaction row:
  - **Synced**: Green `sync` icon + tooltip ("Synced with General Ledger").
  - **Unsynced**: Pulsing red `sync_problem` icon + **"Sync Ledger Entry"** button.

#### [MODIFY] [FacultyLedgerAuditCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/FacultyLedgerAuditCard.jsx)
- Wire `onDisburse` button click to open `RecordTeacherPaymentModal` with default `payment_type="salary"`.
- Wire `onIssueAdvance` button click to open `RecordTeacherPaymentModal` with default `payment_type="advance"`.

#### [MODIFY] [TeacherSalaryPayroll.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherSalaryPayroll.jsx)
- Add state hooks for `RecordTeacherPaymentModal` visibility, payment type, and sync target.
- Render `RecordTeacherPaymentModal` and pass callbacks down to `FacultyLedgerAuditCard` and `TeacherPaymentTransactionsCard`.
