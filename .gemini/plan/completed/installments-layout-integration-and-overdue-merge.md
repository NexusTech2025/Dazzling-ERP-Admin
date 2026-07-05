---
Date: 2026-06-22T23:36:00+05:30
Status: Approved-Completed
---

# Technical Implementation Plan: Installments View Page Layout Integration & Overdue Merge

This plan details refactoring the `/admin/finance/installments` view to incorporate `MainLayout`, merging the overdue accounts list as a tab with KPI overlays, using `DataTableV2`, and updating the column rendering rules to display aggregated details, discounts, overdue balances, and class badges.

---

## **1. Background Knowledge Traceability (Rule N2)**

* **Referenced Schemas**:
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Finance/Installment.json`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Finance/StudentFeeAccount.json`
* **Referenced Core Modules**:
  * `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/Installments.jsx`
  * `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/OverdueAccounts.jsx`
  * `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/table/DataTableV2.jsx`
  * `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/KpiCard.jsx`
* **Design Runbooks**:
  * `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/knowledge/page_layout_protocol.md`
  * `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/knowledge/main_layout_integration_guide.md`

---

## **2. Fact vs. Assumption Boundary (Rule N3)**

### **Actual Verified Facts**
1. `Installments.jsx` currently displays a list of global installments.
2. `DataTableV2` supports custom column mappings, sticky headers, high-density cell padding, row selections, and custom empty messages.
3. The raw `Installment` table does not contain student name, course name, or class badges; these are hydrated in memory using `students`, `courses`, `packages`, and `enrollments` collections.

### **System Assumptions**
1. An installment is considered overdue if its `status` field is `"overdue"`.
2. The user has populated enrollment records for all active fee accounts.

---

## **3. Legacy Maintenance Mitigation (Rule N6)**

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint**: `[OverdueAccounts.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/OverdueAccounts.jsx)`
> * **Core Technical Debt Risk**: Maintaining separate views for installments and overdue records increases operational redundancy.
> * **Remediation Option**: Consolidate overdue records under a tab switcher within `Installments.jsx`, using high-density components (`DataTableV2`, `KpiCard` with `sm` sizes).

---

## **4. Proposed Changes & Method Signatures (Rule N1)**

### **A. Finance Installments Component**

#### [MODIFY] [Installments.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/Installments.jsx)

Refactor `Installments` to use `MainLayout`, small KPI cards, `DataTableV2`, and custom column definitions.

```javascript
/**
 * Global Installment & Overdue Tracking Page.
 * Wraps view in MainLayout with local scroll control and toggles lists via styled tabs.
 * 
 * @component
 * @returns {React.ReactElement}
 */
const Installments = () => {
  // 1. Initialize isSticky scroll state and handleBodyScroll
  // 2. Initialize activeTab state ('all' | 'overdue')
  // 3. Map installments data with:
  //    - student_name
  //    - course_name (joined string of course or package names)
  //    - class_badge (e.g. Class 9)
  //    - discount (from related SFA record)
  //    - overdue_amount (if status is overdue: due_amount - paid_amount, else 0)
  // 4. Define table columns dynamically:
  //    - 'all' tab columns:
  //      * Inst No (installment_id)
  //      * Student (Name + Course/Package + Class Badge)
  //      * Due Date
  //      * Total Amount (due_amount)
  //      * Paid Amount (paid_amount)
  //      * Discounted (discount from SFA)
  //      * Overdue (overdue_amount)
  //      * Status (status chip)
  //    - 'overdue' tab columns:
  //      * Student (Name + Course/Package + Class Badge)
  //      * Due Date
  //      * Overdue By (Days elapsed since due_date)
  //      * Overdue Balance (due_amount - paid_amount)
  //      * Action (View Profile button)
  // 5. Wrap return block in <MainLayout> with KpiGrid (using size="sm") and DataTableV2
}
```

* **JSDoc cell renderer example for Student column:**
```jsx
cell: (row) => (
  <div className="flex flex-col gap-0.5">
    <span className="font-extrabold text-slate-900">{row.student_name}</span>
    <span className="text-[10px] text-slate-500 font-semibold">{row.course_name}</span>
    {row.class_badge && (
      <span className="inline-flex self-start px-1.5 py-0.5 rounded-md text-[8px] font-black bg-indigo-50 text-[#1a237e] border border-indigo-100 uppercase tracking-wide mt-0.5">
        Class {row.class_badge}
      </span>
    )}
  </div>
)
```

---

### **B. Routing & View Cleanups**

#### [MODIFY] [AppRoutes.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/routes/AppRoutes.jsx)
* Remove overdue route configuration.

#### [MODIFY] [OverdueAccounts.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/OverdueAccounts.jsx)
* Mark component as deprecated.

---

## **5. Performance & Benchmark Assertions (Rule N5)**

* **Metric Formula**: $T(n) = O(1)$ API calls — leveraging the pre-cached batch `useAccountingDataQuery` payload.
* **Timing Harness**: console timing checks added during data hydration/mapping inside `Installments.jsx`.
```javascript
console.time('[Installments] Hydrate');
// relation hydration logic...
console.timeEnd('[Installments] Hydrate');
```

---

## **6. Verification Plan**

### **Manual Verification**
1. Load `/admin/finance/installments` in the browser.
2. Toggle between **All Installments** and **Overdue Accounts** tabs.
3. Verify that all columns (aggregated total, paid, discount, overdue, class badges) render correctly.
4. Verify layout responsiveness and margins on desktop and mobile screens.
