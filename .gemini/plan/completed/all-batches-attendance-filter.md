---
Date: 2026-06-15T16:05:00+05:30
Status: Approved-Completed
---

# Implementation Plan - "All Batches" Option for Attendance Registers

We will add an "All Batches" option to the batch dropdown filter in both the Student and Teacher Attendance Register views and make it the default selection. Selecting "All Batches" will retrieve and display records across all batches.

## Proposed Changes

### Centralized Query Hooks

#### [MODIFY] [useAttendanceQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/hooks/useAttendanceQueries.js)
*   Update [useBatchAttendanceQuery](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/hooks/useAttendanceQueries.js#L7-L22) to allow querying without a `batch_id` filter when `batchId === 'all'` by only passing `attendance_date` in the `where` parameter block.

---

### Student Attendance Register

#### [MODIFY] [StudentAttendanceManager.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/components/StudentAttendanceManager.jsx)
*   **Batch Dropdown Default**: Set the initial state of `selectedBatchId` to `'all'`.
*   **Dropdown Filter Items**: Prepend an `{ value: 'all', label: 'All Batches' }` option to the dropdown select list.
*   **Registry Loading & Layout**:
    *   Change query enabling logic so it is enabled when `selectedBatchId === 'all'`.
    *   When `selectedBatchId === 'all'`, display student records from all active batches.
    *   For each student card/row:
        *   Determine their specific batch schedule by finding their `batch_id` in the loaded `batches` array.
        *   Display their batch name and formatted scheduled time duration.
*   **Save Callback**:
    *   If `selectedBatchId === 'all'`, group the modified staged records by their respective batch IDs and submit bulk save requests for each batch using `Promise.all` and `markMutation.mutateAsync`.
    *   Ensure the unsaved staged changes footer handles resetting and saving correctly in "All" mode.

---

### Teacher Attendance Register

#### [MODIFY] [TeacherAttendanceManager.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherAttendanceManager.jsx)
*   **Batch Dropdown Default**: Set the initial state of `selectedBatchId` to `'all'`.
*   **Dropdown Filter Items**: Prepend an `{ value: 'all', label: 'All Batches' }` option to the dropdown select list.
*   **Registry Loading & Layout**:
    *   When `selectedBatchId === 'all'`, populate staging records for all teachers loaded in `useTeachersQuery()`.
    *   For each teacher card/row:
        *   Determine their assigned batches from the loaded `batches` array (where `b.teacher_id === teacher.teacher_id`).
        *   Display their assigned batch name(s) and time duration(s).
*   **Save Callback**:
    *   Submit all modified teacher records in a single payload to the bulk teacher attendance mutation (`bulkMarkMutation.mutate`).

---

## Verification Plan

### Automated Tests
*   Run the production build command to check for syntax and compilation errors:
    ```powershell
    npm run build
    ```

### Manual Verification
1.  Navigate to `/admin/students/attendance` and `/admin/teachers/attendance`.
2.  Verify the Batch selection dropdown defaults to "All Batches".
3.  Confirm that students/teachers from all batches are listed with their respective batch details and schedule ranges.
4.  Toggle attendance status (P/A/L), edit remarks, check-in/out times, and verify the unsaved changes footer appears.
5.  Click Save and verify the changes are submitted and query caches are invalidated successfully.
6.  Change the dropdown selection from "All Batches" to a specific batch and back to confirm the filtering behaves correctly.
