---
Title: Refactoring Plan: Salary Month Formatting (`July 2026` Format)
Date: 2026-07-26T20:56:00+05:30
Status: Proposed
---

# Refactoring Plan: Salary Month Formatting (`July 2026` Format)

Refactor the `Salary Month` table column in [TeacherPaymentTransactionsCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/TeacherPaymentTransactionsCard.jsx) to format raw date/month strings (`"2026-07"`, `"2026-07-01T00:00:00.000Z"`) into human-readable `"July 2026"` format using a date-fns helper in [teacher.utils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/utils/teacher.utils.js).

---

## Architectural Principles & Decrees

### Rule N1: Explicit Positional Signatures & Execution Blueprint

```javascript
import { parseISO, format } from 'date-fns';

/**
 * Formats a raw salary month string ('2026-07', '2026-07-01', or ISO string) into 'July 2026' format.
 * @param {string} salaryMonthStr - Raw month or date string.
 * @param {string} [fallback='N/A'] - Fallback label.
 * @returns {string} Formatted month label (e.g., 'July 2026').
 */
export const formatSalaryMonth = (salaryMonthStr, fallback = 'N/A') => {
  if (!salaryMonthStr) return fallback;
  try {
    // Normalize YYYY-MM to YYYY-MM-01 for parseISO
    const normalizedStr = salaryMonthStr.length === 7 ? `${salaryMonthStr}-01` : salaryMonthStr;
    const parsedDate = parseISO(normalizedStr);
    if (isNaN(parsedDate.getTime())) return salaryMonthStr;
    return format(parsedDate, 'MMMM yyyy');
  } catch {
    return salaryMonthStr || fallback;
  }
};
```

---

## Proposed Changes

1. Add `formatSalaryMonth` to [teacher.utils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/utils/teacher.utils.js).
2. Update [TeacherPaymentTransactionsCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/TeacherPaymentTransactionsCard.jsx) to import `formatSalaryMonth` and render `{formatSalaryMonth(tx.salary_month)}`.
