---
Date: 2026-07-26T20:02:00+05:30
Status: Proposed
---

# Master Plan: 3-Way Teacher Payment & General Ledger Reconciliation Engine Architecture

Build a double-entry reconciliation and smart-matching subsystem in the Teacher Payroll UI ([TeacherSalaryPayroll.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherSalaryPayroll.jsx)) to discover, flag, and resolve two primary accounting discrepancies between General Ledger outflows (`MoneyTransaction`, `MTX-xxx`) and Teacher Sub-Ledger payouts (`TeacherPaymentTransaction`, `TPT-xxx`).

---

## Phased Implementation Roadmap

- **Phase 0**: Implement finance reconciliation pure business logic inside [src/features/finance/utils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/utils.js).
- **Phase 1**: Implement **Scenario 1** (Unlinked GL Outflow $\rightarrow$ Create Payroll TPT via `UnlinkedGlOutflowsBanner.jsx` & `RecordTeacherPaymentModal.jsx`).
- **Phase 2**: Implement **Scenario 2** (Smart Matching & Direct Link Engine on `TeacherPaymentTransactionsCard.jsx`).

---

## Detailed Technical Design

### Rule N1: Explicit Positional Signatures & Execution Blueprints

```javascript
/**
 * Scans General Ledger MoneyTransactions to find outflows for a teacher without a linked TPT record.
 * @param {Array<Object>} moneyTransactions - List of MoneyTransactions from cache.
 * @param {string} teacherId - Unique target teacher ID (e.g. 'TCH-00001').
 * @returns {Array<Object>} Unlinked GL outflow records.
 */
export const findUnlinkedTeacherGlOutflows = (moneyTransactions = [], teacherId = '') => {
  if (!teacherId || !Array.isArray(moneyTransactions)) return [];
  
  return moneyTransactions.filter(mt => {
    const isOutflow = mt.transaction_type === 'expense' || mt.type === 'DEBIT';
    if (!isOutflow) return false;

    // Check party association
    const isTeacherParty = mt.party_id === teacherId || mt.party_type === 'teacher';
    if (!isTeacherParty) return false;

    // Must lack a TPT reference key
    const hasTptKey = mt.payment_reference && mt.payment_reference.includes('TPT-');
    const isNonSalary = mt.payment_reference === 'NON_SALARY_REIMBURSEMENT';
    return !hasTptKey && !isNonSalary;
  });
};

/**
 * Utility helper to identify candidate matching General Ledger transactions for an unlinked Teacher Payment.
 * @param {Object} tptRecord - Unsynced TeacherPaymentTransaction record.
 * @param {Array<Object>} unlinkedGlOutflows - List of unlinked GL MoneyTransactions.
 * @returns {Object|null} Matching MoneyTransaction candidate or null if no match found within window.
 */
export const findSmartGlMatch = (tptRecord, unlinkedGlOutflows = []) => {
  if (!tptRecord || !tptRecord.amount) return null;

  return unlinkedGlOutflows.find(mt => {
    // 1. Exact amount match check
    const isAmountEqual = Math.abs(Number(mt.amount) - Number(tptRecord.amount)) < 0.01;
    if (!isAmountEqual) return false;

    // 2. Date proximity heuristic: Math.abs(diffDays) <= 7
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

## Scenario 1 Architecture (Phase 1)
- Banner notification `UnlinkedGlOutflowsBanner.jsx` mounted above payment table.
- 1-Click **"Convert to Payroll Payment"** launches `RecordTeacherPaymentModal` with pre-filled fields.
- Submitting creates `TPT-xxx` and updates `MoneyTransaction.payment_reference` to `${teacherId}_${salaryMonth}_${tptId}`.

## Scenario 2 Architecture (Phase 2)
- Smart match pill & **"Link with TXN-xxx"** button rendered on unsynced `TPT` table rows.
- Direct link via `useUpdateMoneyTransactionMutation` with zero duplicate GL entry creation.
