---
Date: 2026-06-11T14:15:00+05:30
Status: Proposed
---

# Teacher Bulk Deletion

This implementation plan outlines the steps to add a bulk delete option to the Faculty Directory (Teachers) dashboard using selection hooks and floating action bars.

## User Review Required
> [!IMPORTANT]
> - A checkbox column will be prepended to the Faculty Directory table, allowing row selection.
> - A floating selection action bar (SelectionActionBar) will appear when one or more teachers are checked, showing options to clear selection, delete selected, or delete all filtered items.
> - The delete confirmation dialog (ConfirmModal) will handle both single-row deletions and bulk-row deletions cascadingly.

## Proposed Changes

### UI Pages & Dashboards

#### [MODIFY] [Teachers.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/Teachers.jsx)
- Import `useMemo`, `useSelection` hook, `useDeleteManyMutation` hook, and `SelectionActionBar` component.
- Initialize `useSelection` to manage selected row state.
- Initialize `useDeleteManyMutation` for the `'Teacher'` table, invalidating `queryKeys.teacher.all`.
- Add a `handleBatchDelete` function to perform bulk delete mutations and handle response states.
- Wrap dynamic columns to prepend a checkbox selection column using selection helpers (`isAllSelected`, `isSomeSelected`, `toggleSelectAll`, `toggleSelect`).
- Update `handleConfirmDelete` to switch between single deletion and bulk deletion based on modal type.
- Integrate the `<SelectionActionBar>` at the bottom of the layout, showing options when items are selected.
- Update `<ConfirmModal>` labels and messages to describe bulk deletion and display correct processing states.

## Verification Plan

### Manual Verification
- Navigate to the Faculty Directory page.
- Check individual rows and check the header box; verify select-all and indeterminate checkbox states.
- Check that the floating `SelectionActionBar` appears at the bottom with the correct count of selected teachers.
- Click "Delete Selected" on the action bar, verify the confirmation modal appears showing the count of teachers to delete.
- Confirm deletion and check that the table updates, selection is cleared, and query caches are invalidated.
- Verify single-row deletion still works as expected.
