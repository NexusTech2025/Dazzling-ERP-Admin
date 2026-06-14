---
Date: 2026-05-25T20:22:00+05:30
Status: Approved-Completed
---

# Plan: Isolate Deletion Loading State to Single Rows

## Goal Description
Isolate the `isDeleting` loading state during deletion. Currently, when deleting any row, `deleteMutation.isPending` is passed to the column schema, which disables delete buttons on *all* rows. The plan is to compare the deleting item's ID in the local component to disable only the row undergoing deletion.

## Proposed Changes

### Pages (Admin)

#### [MODIFY] [Teachers.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/Teachers.jsx)
- Update `handlers` definition inside `Teachers.jsx`:
  - Map `isDeleting` to check if `deleteMutation.isPending` is true AND the current teacher ID equals the mutating teacher ID.
  - Since the schema renders columns row-by-row, pass `deleteMutation.isPending` as a function or resolve the active deleting row ID.
  - Alternatively, pass the active deleting ID `deleteModal.id` into the column generator:
    `isDeleting: deleteMutation.isPending ? deleteModal.id : null`

### Pages (Admin) / Schemas

#### [MODIFY] [teacherSchema.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/schemas/teacherSchema.jsx)
- Update `createTeacherColumns` action columns:
  - Conditionally disable row deletion based on `isDeleting === teacher.teacher_id` instead of a global boolean flag.

## Verification Plan

### Manual Verification
1. Open the **Faculty Directory** page.
2. Select a faculty member and click the **Delete Record** button.
3. Confirm deletion in the modal.
4. Verify that only the deleted row's action buttons show a disabled/loading state, while other rows remain interactive.
