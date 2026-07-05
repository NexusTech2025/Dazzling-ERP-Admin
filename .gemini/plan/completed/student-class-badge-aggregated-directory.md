---
Date: 2026-06-22T21:35:00+05:30
Status: Approved-Completed
---

# Technical Implementation Plan: Student Class Badge in Aggregated Billing Directory

This plan details the addition of a Class/Grade badge next to the student's name in the aggregated `Student Billing Directory` table, mapping class data from course and package schemas.

---

## **1. Background Context & Data Flow (Rule N2)**

* **Data Mapping**:
  - For individual `Package` items: Class is defined on the `target_class` column.
  - For individual `Course` items: Class is defined under `metadata.class`.
* **Flow**:
  1. Extract the class string (`item?.target_class || item?.metadata?.class || ''`) for each account in [FinanceDashboard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/FinanceDashboard.jsx).
  2. Modify [utils.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/utils.js) to aggregate classes per student inside `aggregateBillingAccountsByStudent` (preventing duplicates using a `Set`).
  3. Render the aggregated class badge directly under the student name in the left directory table.

---

## **2. Proposed Changes & Method Signatures (Rule N1)**

### **A. Finance Feature Utilities**

#### [MODIFY] [utils.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/utils.js)

Update `aggregateBillingAccountsByStudent` to accumulate classes:
```javascript
// Inside the acc iteration
if (!studentMap.has(studentId)) {
  studentMap.set(studentId, {
    ...,
    classes: new Set()
  });
}
const record = studentMap.get(studentId);
if (acc.studentClass) {
  record.classes.add(acc.studentClass);
}

// Inside the final mapping
return {
  ...,
  studentClass: Array.from(record.classes).filter(Boolean).join(', ') || 'N/A'
};
```

---

### **B. Finance Dashboard UI**

#### [MODIFY] [FinanceDashboard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/FinanceDashboard.jsx)

1. **Hydration Mapping**:
   Map the individual student class from the hydrated item:
   ```javascript
   const targetClass = item?.target_class || item?.metadata?.class || '';
   return {
     ...acc,
     studentClass: targetClass
   };
   ```

2. **Column Custom Cell Rendering**:
   Modify `directoryColumns` to render a class badge below the student's name:
   ```jsx
   {
     header: 'Student Name',
     className: 'font-bold text-slate-900',
     cell: (row) => (
       <div className="flex flex-col gap-0.5">
         <span className="font-extrabold text-slate-900">{row.studentName}</span>
         {row.studentClass && row.studentClass !== 'N/A' && (
           <span className="inline-flex self-start px-1.5 py-0.5 rounded-md text-[8px] font-black bg-indigo-50 text-[#1a237e] border border-indigo-100 uppercase tracking-wide mt-0.5">
             Class {row.studentClass}
           </span>
         )}
       </div>
     )
   }
   ```

---

## **3. Verification Plan**

### **Manual Verification**
1. Load `/admin/finance` in the browser.
2. Verify that class badges (e.g. `Class 9`, `Class 10`) appear cleanly under the student names in the left table.
3. Verify that students with multiple enrollments show aggregated class values correctly (e.g., `Class 9, Class 10`).
