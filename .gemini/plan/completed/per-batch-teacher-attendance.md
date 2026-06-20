---
Date: 2026-06-15T17:45:15+05:30
Status: Approved-Completed
---

# Implementation Plan - Per-Batch Teacher Attendance Register (Frontend Only)

We will update the teacher attendance query hooks and the React UI component to support recording and managing teacher attendance separately for each assigned batch. This ensures that teachers assigned to multiple batches will have distinct attendance slots and cards, preventing records from overwriting each other.

A detailed request detailing the required database schema and service updates has been created for the backend developer in [backend_change_request.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/backend_change_request.md).

The frontend implementation will be built defensively to support existing logs that might not have a `batch_id` populated yet, ensuring graceful degradation.

## Proposed Changes

### Frontend Query Hooks

#### [MODIFY] [queryKeys.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/queryKeys.js)
- Update `queryKeys.teacher.attendanceDaily(date)` to accept an optional `batchId` parameter: `attendanceDaily: (date, batchId) => [...queryKeys.teacher.all, 'attendance-daily', date, batchId]`.

#### [MODIFY] [useTeacherQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)
- Update `useTeacherAttendanceListQuery` to accept `batchId` as an optional second parameter.
- Use `queryKeys.teacher.attendanceDaily(date, batchId)` for the query key.
- Pass `batchId` in the query parameters:
  ```javascript
  const where = { attendance_date: date };
  if (batchId && batchId !== 'all') {
    where.batch_id = batchId;
  }
  ```

---

### Frontend UI Component

#### [MODIFY] [TeacherAttendanceManager.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherAttendanceManager.jsx)
- **Daily logs loading**: Call `useTeacherAttendanceListQuery` with both `selectedDate` and `selectedBatchId`.
- **Staging Sync (`useEffect`)**:
  - Key `stagedRecords` by a composite key: `${teacher_id}_${batch_id}` to support multiple slots for a single teacher.
  - If `selectedBatchId === 'all'`, find all batches in the loaded `batches` array assigned to each teacher (where `batch.teacher_id === teacher.teacher_id`). Create a separate staging card entry for each assigned batch.
  - If a specific batch ID is selected, populate a single staging slot for the teacher assigned to that batch (where `selectedBatchObj?.teacher_id === teacher.teacher_id`).
  - Search daily logs for existing records using the match criteria: `log.teacher_id === teacher.teacher_id && log.batch_id === batch.batch_id`. Add a defensive fallback to match on `log.teacher_id === teacher.teacher_id` if the log's `batch_id` is empty/undefined.
- **Status/Time/Remarks change handlers**: Update to modify staged records using the composite row ID (`row.id`).
- **Save Action (`handleSave`)**:
  - Include `batch_id` in the records list sent in the bulk mark mutation.
- **Columns & Mobile Card layout**:
  - Bind inputs and toggle actions to `row.id` (the composite key).
  - Clean up the batch display: directly output `row.batch_name` which is stored inside the staging object.
  - Retain the collapsible time-punch and remarks drawer on mobile cards using `row.id` as the expansion state trigger.

---

## Verification Plan

### Automated Tests
- Run build to verify clean React compile:
  ```powershell
  npm run build
  ```

### Manual Verification
1. Open the Teacher Attendance view.
2. Verify that teachers assigned to multiple batches are shown as separate cards/rows when "All Batches" is selected.
3. Verify that each card/row displays the correct batch name and time range.
4. Toggle attendance states and update check-in/out times. Verify that changes stage separately for each card/row.
5. Click "Save Attendance" and verify that all records are saved successfully and sent to the mutation hook.
