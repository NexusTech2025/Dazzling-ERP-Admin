---
Date: 2026-05-27T23:50:00+05:30
Status: Approved-Completed
---

# Refactoring Plan: Student Registration Form & Dynamic Billing

This plan outlines the refactoring of the multi-step student registration wizard under `/admin/students/add` to implement backend-driven pricing, dynamic installment configuration, and improved batch selection UX.

---

## 1. Identified Issues & Solutions

### A. Batch Card Missing Branch Information (Step 2)
- **Current Issue**: Raw batch objects lack branch names and locations, creating selection risks in multi-branch environments.
- **Required Solution**:
  - Integrate [BatchCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/BatchCard.jsx) to dynamically resolve course, teacher, and branch properties using the cache lookup pattern (querying `queryKeys.branch.detail(id)`).
  - Display the resolved location, timetable schedule, and class capacity parameters cleanly on each card.

### B. Excessive Vertical Scrolling on Batch Lists (Step 2)
- **Current Issue**: Listing all active batches directly on the step page creates excessive vertical scrolling, resulting in poor mobile usability.
- **Required Solution**:
  - Implement a dedicated `BatchSelectionModal` that handles filtering by branch, course, and schedule times.
  - **V2 UI Accordion Rule**: When the modal is closed, the parent form step must show a dynamic, live text summary pill (e.g. `Batch: Morning Foundation (BRN-01) • Fee: ₹15,000`) so the selection remains visible.

### C. Hardcoded Fee Structure & Local Calculations (Step 3)
- **Current Issue**: Base pricing and discounts are hardcoded or computed locally on the client, creating database consistency risks.
- **Required Solution**:
  - Relational mapping of fees directly from `Course` (`base_fee` column) or `Package` (`package_fee` column) defined in [full_schemav3.json](file:///E:/NAST/Dazzling/GAS/DazzlingDB/full_schemav3.json).
  - Implement backend-driven calculations via a unified validation endpoint:
    ```javascript
    apiClient.executeAction('FINANCE.PREVIEW_FEE', { 
      item_id: selectedCourseOrPackageId, 
      coupon_code: formData.couponCode, 
      scholarship_percent: formData.applicableScholarship 
    })
    ```

### D. Static Installment Generation (Step 4)
- **Current Issue**: Installment breakdown tables use static formulas or require manual configuration.
- **Required Solution**:
  - Read default installment count from `Course.default_installment_count`.
  - Enforce mathematical checksum validation before submission:
    $$\sum (\text{Installment Amounts}) = \text{Final Payable Amount}$$
  - Throw local validation warning errors if the checksum mismatches.

---

## 2. API & Data Flow Blueprint

### Action Registry Integration
Add required finance actions to [apiRegistry.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js):
```javascript
export const API_REGISTRY = {
  FINANCE: {
    PREVIEW_FEE: 'finance_preview_fee',
    GENERATE_INSTALLMENTS: 'finance_generate_installments'
  }
};
```

---

## 3. Implementation Checklist

- [ ] Add backend fee calculation keys to `apiRegistry.js`
- [ ] Migrate `AcademicEnrollmentStep.jsx` to render the selection summary pill
- [ ] Implement `BatchSelectionModal` with filters and search inputs
- [ ] Replace static fee states with the `FINANCE.PREVIEW_FEE` validation query
- [ ] Refactor the installments step to dynamically calculate rows based on `default_installment_count`
- [ ] Add checksum validation verifying installment sum matches final payable amount
- [ ] Run linter and verify compiling succeeds without warnings