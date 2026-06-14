---
Date: 2026-06-12T01:15:00+05:30
Status: Approved-Completed
---

# Create Batch Redesign (Two-Column Layout, Dialog Modals, Branch Selector & Validations)

This plan outlines the layout and behavioral updates for the Create and Edit Batch views to use a 7:5 two-column grid on desktop, add standard success/error overlay dialogs, integrate a required Branch Selection field without fallbacks, and strictly validate all mandatory inputs.

## User Review Required

> [!IMPORTANT]
> - **No Default Branch**: We will initialize `branch_id` to an empty string `""` in the form's initial state so that the user is forced to select a branch.
> - **OnSuccess and OnFailure Dialog Modals**: We will integrate [ConfirmModal](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/ConfirmModal.jsx) and [APIErrorModal](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/APIErrorModal.jsx) inside the page controllers [AddBatch.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/AddBatch.jsx) and [EditBatch.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/EditBatch.jsx) to display feedback on submission.
> - **Mandatory Constraints**: The following fields are set as strictly required in the form validation layer:
>   - **Course Selection**
>   - **Branch Selection**
>   - **Batch Name** (max 255 characters)
>   - **Start Date** and **End Date** (start date cannot be after end date)
>   - **Schedule Days** (at least one day must be selected)

## Proposed Changes

### Batches Module

#### [MODIFY] [AddBatch.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/AddBatch.jsx)
- Update container width to `max-w-6xl`.
- Import and render `ConfirmModal` (success state) and `APIErrorModal` (failure state).
- Handle the mutation onSuccess and onError callbacks to update the local `modalState` and trigger the overlays.

#### [MODIFY] [EditBatch.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/EditBatch.jsx)
- Update container width to `max-w-6xl`.
- Import and render `ConfirmModal` (success state) and `APIErrorModal` (failure state).
- Handle the mutation onSuccess and onError callbacks to update the local `modalState` and trigger the overlays.

#### [MODIFY] [BatchForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx)
- **Imports**:
  - Import `useBranchesQuery` from `../../../features/core/hooks/useBranchQueries`.
- **Query Hook Call**:
  - Call `const { data: branches = [] } = useBranchesQuery();` to populate branch listings.
- **Form Wrapper Tag**:
  - Remove `overflow-hidden` from `<form>` tag.
  - Increase wrapper size class limit to `max-w-6xl`.
- **Grid Layout**:
  - Change form body container:
    - From: `className="p-8 space-y-8"`
    - To: `className="p-6 md:p-8 grid grid-cols-12 gap-6 lg:gap-8 items-start"`
- **FormSection Modifiers**:
  - Pass `className="col-span-12 lg:col-span-7"` to Basic Details section.
  - Pass `className="col-span-12 lg:col-span-5"` to Schedule & Capacity section.
- **Initial Form Data State**:
  - Change `branch_id: 'BR-001'` default value to `branch_id: ''` (forcing selection).
- **Branch Selection Input**:
  - Render the new `SelectInput` dropdown field for Branch Selection in Basic Details, right after Batch Name.
- **Required Fields Validation**:
  - Ensure `validateForm()` strictly checks `formData.branch_id` and all other mandatory constraints.

## Self-Review & Refinements

1. **Inactive Branch Filtration (Refinement)**:
   - *Issue*: Stale or inactive branches in the database would be visible in the dropdown.
   - *Fix*: Filter out branches where `b.status === 'inactive'` to prevent scheduling errors on closed locations.
2. **Modal Consistency**:
   - Standardized using the project's verified `ConfirmModal` and `APIErrorModal` components, ensuring that notifications match the other module forms in the admin portal.
3. **Zero Fallback Compliance**:
   - Removing `branch_id: 'BR-001'` default ensures no silent batch assignments are made.
4. **Responsive Grid**:
   - The `grid-cols-12` container with `lg:col-span-7` / `lg:col-span-5` matches the redesigned Stitch desktop layout while scaling back to vertical stacks on mobile (`col-span-12`).

## Verification Plan

### Manual Verification
- Open `/admin/batches/add`.
- Try submitting without selecting Course, Branch, or Batch Name, and verify that the local validation error alert is shown.
- Fill all fields, submit, and verify that the `ConfirmModal` success dialog is shown.
- Attempt to create a batch with details that trigger a server error and check that `APIErrorModal` pops up with structured error info.
- Shrink the browser window size to verify that the form layout reflows into a single column stack on mobile layout (under 1024px).
