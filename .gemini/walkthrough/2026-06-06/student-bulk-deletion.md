# Walkthrough - Integrate bulk SelectMany & DeleteMany in Student Directory

Integrated bulk record selection and deletion features in the Student Directory view (`/admin/students`), utilizing the generic selection hook `useSelection`, the generic bulk delete query hook `useDeleteManyMutation`, and the floating action bar `SelectionActionBar`.

## Changes Made

### 1. Student Directory View Integration
* **File**: [Students.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/Students.jsx)
  * Integrated selection hooks, setup student bulk deletion mutation using `useDeleteManyMutation('Student', [queryKeys.student.all])`.
  * Prepend checkboxes to the table by wrapping column definitions dynamically in `useMemo`, mapping rows to `row.student_id`.
  * Positioned the floating `SelectionActionBar` at the bottom of the directory viewport.
  * Extended `ConfirmModal` to support student bulk delete mutations, parsing manifest results, and updating profile modal view states.
  * Refactored delete handlers by defining `handleBatchDelete` and `handleSingleDelete` at the top of the component and simplifying `handleConfirmDelete` to dynamically select the appropriate handler.

## Verification Details

* **Table Header Checks**: Clicking select-all toggles all visible rows. Manually deselecting a row switches the header check input to a visual dash (indeterminate state).
* **Selection Action Bar**: Toggles visibility and updates checked counts cleanly when rows are changed.
* **Bulk Executions**: Triggers mutations correctly and invalidates query client caches. The list views refresh, and the modal details success/failure manifest counts.
