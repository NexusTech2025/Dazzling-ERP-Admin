---
Title: Consolidated Refactoring Plan: Dual-Flow Reconciliation Handshake & Salary Month Formatting
Date: 2026-07-26T21:01:30+05:30
Status: Proposed
---

# Consolidated Refactoring Plan: Dual-Flow Reconciliation Handshake & Salary Month Formatting

Implement a context-aware dual-flow feedback architecture for Teacher Payouts (Flow A: Standalone Payout vs. Flow B: Converted GL Outflow Reconciliation) and refactor the `Salary Month` table column in [TeacherPaymentTransactionsCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/TeacherPaymentTransactionsCard.jsx) to display `"July 2026"` format.

---

## Architectural Principles & Decrees

### Rule N1: Explicit Positional Signatures & Execution Blueprints

```javascript
import { parseISO, format } from 'date-fns';

export const formatSalaryMonth = (salaryMonthStr, fallback = 'N/A') => { ... };
export const verifyGlSubledgerLink = (glRecord = {}, tptRecord = {}) => { ... };
```

---

## Proposed Changes

1. **`src/features/finance/utils.js`**: Add `verifyGlSubledgerLink`.
2. **`src/features/teacher/utils/teacher.utils.js`**: Add `formatSalaryMonth`.
3. **`RecordTeacherPaymentModal.jsx`**: Pass handshake metadata (`isGlConverted`, `glRecord`, `compositeKey`) to `onSuccess`.
4. **`TeacherPaymentTransactionsCard.jsx`**: Integrate `formatSalaryMonth`.
5. **`TeacherSalaryPayroll.jsx`**: Dynamic `ResponseModal` rendering (Flow A: "Sync General Ledger Now" vs Flow B: "Reconciliation & Sync Complete - 100% RECONCILED").
