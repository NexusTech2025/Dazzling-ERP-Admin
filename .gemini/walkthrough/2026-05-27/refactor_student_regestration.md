---
Date: 2026-05-27T23:55:00+05:30
Status: Completed
---

# Walkthrough: Student Registration Refactoring & Dynamic Billing

This document outlines the modifications made to the multi-step student registration wizard under `/admin/students/add` to implement dynamic billing, automated schedule generators, ₹ (Rupee) localization, and a premium z-50 modal-driven batch selector.

---

## 1. Summary of Changes

### A. API Registry updates (`apiRegistry.js`)
* Added `FINANCE.PREVIEW_FEE: 'finance_preview_fee'` within the `FINANCE` namespace mapping to support subsequent validation pipelines.

### B. Encapsulated Batch Selector (`AcademicEnrollmentStep.jsx`)
* **UX decluttering**: Removed the massive scrollable grid of batches from Step 2, preventing excessive vertical clutter on mobile layouts.
* **BatchSelectionModal**: Created a fully responsive slide-over dialog that displays only when selecting or changing a batch.
* **Premium Closed Summary Card**: When a batch is selected, renders a gorgeous V2 selection pill card on Step 2. Leverages `useQueryClient` to perform real-time cache lookups and display resolved branch name, teacher name, and timetables.

### C. Dynamic Financial Contract Refactoring (`FinanceStep.jsx`)
* **Dynamic pricing query**: Integrated the TanStack `useCourseDetailQuery` hook to load real `base_fee` rates from course definitions dynamically (`courseDetail?.base_fee || 12000`).
* **Dynamic Installments Builder**: Spaced installments dynamically 30 days apart based on the course standard `default_installment_count` parameter.
* **Remainder Checksum Balancing**: Distributed rounding differences mathematically to the first installment (deposit) to ensure a bulletproof checksum sum match.
* **Visual Checksum Indicator**: Built a clean indicator card confirming `Checksum Verified` or flagging validation warnings in real-time.
* **Rupee Symbol Localization**: Replaced all legacy `$` representations with standard Indian Rupees (`₹`).
* **Calculation State Persistence**: Wired the `Next` button to trigger a `handleNext` function that stores `baseFee`, `scholarshipAmount`, `discount`, `finalFee`, and the compiled `installments` array directly inside the master registration wizard `formData` state.

### D. Currency Synchronization (`ActivationStep.jsx`)
* Replaced hardcoded "USD" labels with "INR" and changed the currency symbol from `$` to `₹` inside Step 4 to ensure consistent financial representations across the entire enrollment pipeline.

---

## 2. Verification Outcomes

* **Mathematical Safety**: Confirmed that installments sum perfectly to the `finalFee` under any installment count (1, 2, 4, etc.) without losing rounding fractions.
* **Responsive Layouts**: Verified the registration wizard forms scale down neatly on small viewports with zero horizontal overflow.
* **State Persistence**: Verified all dynamically generated pricing parameters flow directly into the final `formData` registration payload for correct server-side recording.
