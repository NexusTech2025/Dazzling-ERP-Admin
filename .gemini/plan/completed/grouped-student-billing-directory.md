---
Date: 2026-06-22T21:18:00+05:30
Status: Approved-Completed
---

# Technical Implementation Plan: Grouped/Aggregated Student Billing Directory & Side-by-Side Programs View

This plan describes the aggregation of student billing accounts (collapsing multiple enrollment/fee accounts per student into a single row) and the creation of a side-by-side split table view to display individual course/package billing details.

---

## **1. Background Context & Problem (Rule N2)**

* **Problem**: Currently, the `Student Billing Accounts Directory` table displays a row for each individual `StudentFeeAccount`. Since a student can register for multiple programs (Courses/Packages), this leads to duplicate rows for the same student, cluttering the view.
* **Solution**:
  - Aggregate the directory list to display only one row per student, summing their total fees, paid amounts, and balances.
  - Split the directory viewport into two side-by-side tables:
    1. **Left (cols-7)**: `Student Billing Directory (Aggregated)`
    2. **Right (cols-5)**: `Student Program Accounts` (showing the selected student's individual program list and fees).

* **Traceability References:**
  - [FinanceDashboard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/FinanceDashboard.jsx)
  - [DataTableV2.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/table/DataTableV2.jsx)

---

## **2. User Review Required**

> [!IMPORTANT]
> **LAYOUT & SELECTION FLOW:**
>
> * **Height Alignment**: Both Left and Right tables will use `maxHeight="220px"` (approx. 5 visible rows) to align cleanly side-by-side.
> * **Course/Package Filter**: Selecting a course filter in the top dropdown will filter the left student list, displaying students who are enrolled in that specific course/package.

---

### **A. Finance Feature Directory**

#### [MODIFY] [utils.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/utils.js)

Introduce a reusable aggregation helper function:

```javascript
/**
 * Aggregates a list of hydrated student fee accounts by student ID.
 * Collapses multiple program records per student into a single record with summed values.
 * 
 * @param {Array} mappedAccounts - Hydrated student fee accounts list.
 * @returns {Array} List of aggregated student billing records.
 */
export const aggregateBillingAccountsByStudent = (mappedAccounts = []) => {
  const studentMap = new Map();

  mappedAccounts.forEach(acc => {
    const studentId = acc.student_id;
    if (!studentId) return;

    if (!studentMap.has(studentId)) {
      studentMap.set(studentId, {
        student_id: studentId,
        studentName: acc.studentName || 'Unknown Student',
        accounts: [],
        total_fee: 0,
        amount_paid: 0,
        balance_due: 0,
        statuses: new Set()
      });
    }

    const record = studentMap.get(studentId);
    record.accounts.push(acc);
    
    const fee = Number(acc.final_fee !== undefined ? acc.final_fee : (acc.total_fee - (acc.discount || 0)));
    record.total_fee += fee;
    record.amount_paid += Number(acc.amount_paid || 0);
    record.balance_due += Number(acc.balance_due || 0);
    if (acc.status) {
      record.statuses.add(acc.status.toLowerCase());
    }
  });

  return Array.from(studentMap.values()).map(record => {
    // Determine aggregated status priority:
    // 1. overdue / defaulted -> overdue
    // 2. partially_paid -> partially_paid
    // 3. paid / completed -> completed (only if all accounts are completed)
    // 4. default to active
    let status = 'active';
    if (record.statuses.has('overdue') || record.statuses.has('defaulted')) {
      status = 'overdue';
    } else if (record.statuses.has('partially_paid')) {
      status = 'partially_paid';
    } else if (record.statuses.has('paid') || record.statuses.has('completed')) {
      const allCompleted = Array.from(record.statuses).every(s => s === 'paid' || s === 'completed');
      status = allCompleted ? 'completed' : 'active';
    }

    return {
      student_id: record.student_id,
      studentName: record.studentName,
      total_fee: record.total_fee,
      amount_paid: record.amount_paid,
      balance_due: record.balance_due,
      status: status,
      accounts: record.accounts
    };
  });
};
```

### **B. Finance Dashboard Controller**

#### [MODIFY] [FinanceDashboard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/FinanceDashboard.jsx)

1. **Aggregation Integration**:
   Import and invoke `aggregateBillingAccountsByStudent` on the hydrated list inside a `useMemo` block.

2. **Responsive Split Layout**:
   Replace the single table block with a side-by-side flex/grid layout:
   - Left side: Aggregated Student Directory (spans `lg:col-span-7`).
   - Right side: Selected Student Programs List (spans `lg:col-span-5`).

3. **Column Definitions**:
   - `directoryColumns` (Left Table): Student Name, Total Fee (Sum), Amount Paid (Sum), Balance Due (Sum), Aggregated Status.
   - `programColumns` (Right Table): Program Name (Course/Package), Total Fee, Amount Paid, Balance Due, Status.

---

## **4. Verification Plan**

### **Manual Verification**
1. Load `/admin/finance` in the browser.
2. Confirm the left table shows one row per student (no duplicates).
3. Click a student row; verify that the right table `Student Program Accounts` displays their individual programs, and the details panel below updates with their installments/payments.
4. Verify responsiveness and height matching between left and right tables.
5. Check filter controls (Course and Status) function as expected.
