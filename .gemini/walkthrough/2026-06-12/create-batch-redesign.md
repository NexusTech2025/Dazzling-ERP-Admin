---
Date: 2026-06-12T01:50:00+05:30
Status: Completed, Verified
---

# Create Batch Redesign - Walkthrough

This walkthrough summarizes the layout and behavior updates implemented for the Create and Edit Batch views.

## Changes Completed

### 1. Two-Column Compact Layout
- Modified [BatchForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx) to restructure sections into a 7:5 ratio grid layout on large screens (`grid grid-cols-12 gap-6 lg:gap-8`).
- Basic Details occupies `col-span-12 lg:col-span-7`.
- Schedule & Capacity occupies `col-span-12 lg:col-span-5`.
- Updated container width limit to `max-w-7xl` in [BatchForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx), [AddBatch.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/AddBatch.jsx), and [EditBatch.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/EditBatch.jsx).
- Removed `overflow-hidden` from the `<form>` wrapper to allow dropdown menus to overlay without clipping.

### 2. Balanced Grid & Field Alignment
- Placed **Batch Name** and **Assigned Branch** side-by-side on the same row inside the Basic Details section.
- Moved **Operational Status** dropdown to the Schedule & Capacity section to balance the heights of the two cards.
- Placed **Student Capacity** and **Operational Status** side-by-side on the same row.
- Placed **Start Date** and **End Date** side-by-side on the same row, solving date input squishing.
- Placed **Start Time** and **End Time** side-by-side on the same row.
- **Global Input Height Standard**: Set **`38px`** (`h-[38px]`) as the default base height inside [BaseInput.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/BaseInput.jsx) and [SelectInput.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/SelectInput.jsx) when no custom height class is provided. Removed explicit layout height styling overrides from the form.
- Integrated the `useBranchesQuery` hook to load branches list from the database, filtering active ones (`status === 'active'`).
- Initialized `branch_id` state to `""` to enforce explicit selection and prevent silent default assignments.

### 3. Submission Feedback & Validations
- Handled mutation callbacks in [AddBatch.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/AddBatch.jsx) and [EditBatch.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/EditBatch.jsx) to trigger standard success ([ConfirmModal](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/ConfirmModal.jsx)) and error ([APIErrorModal](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/APIErrorModal.jsx)) dialog overlays.
- Updated `validateForm()` in [BatchForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx) to strictly check for course, branch, batch name length, start/end dates logic, and weekly schedule days.

## Verification Details

### Files Modified
- [BatchForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx)
- [AddBatch.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/AddBatch.jsx)
- [EditBatch.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/EditBatch.jsx)
