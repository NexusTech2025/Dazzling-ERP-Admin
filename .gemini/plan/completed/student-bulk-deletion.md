---
Date: 2026-06-06T13:50:00+05:30
Status: Approved-Completed
---

# Integrate bulk SelectMany & DeleteMany in Student Directory

Integrate bulk record selection and deletion features in the Student Directory view (`/admin/students`), utilizing the generic selection hook `useSelection`, the generic bulk delete query hook `useDeleteManyMutation`, and the floating action bar `SelectionActionBar`.

## User Review Required

> [!IMPORTANT]
> **Students View Selection Integration**
> * **Checkbox Headers & Cells**: Prepend a checkbox column dynamically to the dynamic columns array returned by `createStudentColumns(handlers)` in `Students.jsx`. This enables selection/deselection of individual students or bulk select-all rows directly from the table layout.
> * **Action Bar**: Displays the floating `SelectionActionBar` at the bottom of the viewport when students are checked, showing the selected count and exposing "Delete Selected" and "Delete All" operations.
> * **Cascade Constraint Manifests**: Leverages the generic delete_many response parser inside `ConfirmModal` to cleanly report successful deletions vs. blocked student accounts (e.g. students with pending ledger balances).

## Proposed Changes

### 1. Student Directory View
#### [MODIFY] [Students.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/Students.jsx)
* Import generic hooks and components:
  * `useSelection` from `../../hooks/useSelection`
  * `useDeleteManyMutation` from `../../hooks/useDeleteManyMutation`
  * `SelectionActionBar` from `../../components/ui/v2/SelectionActionBar`
* Setup selection state using `useSelection()`.
* Setup student bulk deletion mutation using `useDeleteManyMutation('Student', [queryKeys.student.all])`.
* Prepend select checkboxes dynamically by wrapping `createStudentColumns(handlers)` in a `useMemo` that adds checkbox headers and cells mapped to `row.student_id`.
* Render `SelectionActionBar` when `selectedIds.length > 0`:
  * `onDeleteSelected`: opens `ConfirmModal` with type `'bulk_student'` passing `selectedIds`.
  * `onDeleteAll`: opens `ConfirmModal` with type `'bulk_student'` passing all `filteredStudents` IDs.
* Update `ConfirmModal` parameters and callbacks:
  * Title: dynamic text (`Delete Student` or `Delete Multiple Students`).
  * Message: dynamic description warning about cascade delete outcomes.
  * `onConfirm`: intercepts type `'bulk_student'` and invokes the bulk delete student mutation, handles manifest reports (success/fail counts), and clears selection list.

---

## Verification Plan

### Automated Tests
* None.

### Manual Verification
* **Selection Checks**:
  * Open `/admin/students`.
  * Toggle the checkbox in the table header to verify select-all and deselect-all work correctly.
  * Manually uncheck a single student and verify the table header checkbox switches to an indeterminate visual dash state.
  * Verify the floating `SelectionActionBar` appears at the bottom.
* **Bulk Delete Selected Flow**:
  * Select 2 student records.
  * Click `Delete Selected` on the floating bar.
  * Confirm deletion in the pop-up modal. Verify the records are deleted, the cache invalidates, and the list refreshes.
* **Delete All Matching Filters**:
  * Filter students by a specific course (e.g. "Class 10").
  * Check a student row. Click `Delete All` on the floating bar.
  * Verify the prompt asks to delete all students matching current Class 10 filters.
* **Constraint Checks**:
  * Try deleting a student record that has active ledger entries/payments and verify that referential constraint logs appear correctly on failures.
