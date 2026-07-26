---
Date: 2026-07-26T21:46:00+05:30
Status: Proposed
---

# Technical Implementation Plan: Unified Refresh Button for Teacher Payroll

Implement a unified `<RefreshButton />` in [TeacherSalaryPayroll.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherSalaryPayroll.jsx) that simultaneously invalidates and refetches **Salary Configurations**, **Payment Transactions Ledger**, and **Unlinked General Ledger Outflows**.

---

## Architectural Principles & Decrees

### Rule N1: Explicit Positional Signatures & Execution Blueprint

```javascript
const handleRefreshPayrollData = async (teacherId) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.teacher.detail(teacherId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.finance.moneyTransactions() })
  ]);
};
```

---

## Proposed Changes

1. **`TeacherSalaryPayroll.jsx`**:
   - Mount `<RefreshButton isFetching={isRefreshing} onRefresh={handleRefreshAll} />` in top action bar.
   - Use `useIsFetching` to compute `isRefreshing` state across `teacher.detail` and `finance.moneyTransactions`.
   - Invalidate all 3 datasets on click.
