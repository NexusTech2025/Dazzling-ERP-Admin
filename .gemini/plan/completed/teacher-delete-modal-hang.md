---
Date: 2026-05-25T20:18:00+05:30
Status: Approved-Completed
---

# Plan: Fix Deletion ConfirmModal Hang in Teachers List View

## Goal Description
Resolve the issue where the `ConfirmModal` is locked in a perpetual "Processing..." state upon faculty deletion. The fix will hook into the `deleteMutation.mutate` options callback (`onSuccess` and `onError`) to transition the modal status to `'success'` or `'error'` and display descriptive transaction feedback.

## Proposed Changes

### Pages (Admin)

#### [MODIFY] [Teachers.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/Teachers.jsx)
- Update the `onConfirm` callback in the `ConfirmModal` props:
  - Call `deleteMutation.mutate({ id: deleteModal.id })` with custom React Query lifecycle handlers.
  - On success, set `status: 'success'` and set `resultMessage` to indicate successful deletion.
  - On error, set `status: 'error'` and set `resultMessage` to display the error message.

## Verification Plan

### Manual Verification
1. Open the **Faculty Directory** page.
2. Select a faculty member and click the **Delete Record** button.
3. Confirm deletion in the modal.
4. Verify the modal transitions to "Success" and displays the success message.
5. Click **Done** to close the modal and verify the table refetches.
