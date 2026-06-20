---
Date: 2026-06-16T23:50:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Student Attendance UI Optimizations

We will implement client-side batch caching, unrecorded past/current date badges (`NR`), large PAL accessibility buttons, and responsive stats cards to improve the Student Attendance Manager (`/admin/students/attendance`).

## Proposed Changes

### Student Attendance Manager

#### [MODIFY] [StudentAttendanceManager.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/components/StudentAttendanceManager.jsx)

##### 1. Imports & Authentication Context
- Import `useAuth` to retrieve the logged-in user context.
- Import `isPastLocalDate` from `src/lib/dateUtils.js`.

##### 2. Query Call
- Alter the registry query call to always pass `'all'` for `batchId`:
  `const { data: registry = EMPTY_ARRAY, ... } = useBatchAttendanceQuery('all', selectedDate);`
  This caches all batch registries for the date at once.

##### 3. State Synchronization (`useEffect`)
- Refactor the staging `useEffect` hook to ingest all student records from `registry` regardless of `selectedBatchId`.
- Compare the selected date with the local timezone-safe today's date string.
- If today is selected and no attendance log exists in the database for the student, initialize `status: ''` (unselected) and set `isUnmarkedCurrentDate: true`.
- If a past date is selected and no database log exists, default `status: 'P'` and set `isUnmarkedPastDate: true`.
- Store the initial state list into both `stagedRecords` and a new `initialSnapshot` state variable (deep copy backup).

##### 4. Edit Guards & Lock Banners
- Compute `isEditingDisabled` using `isPastLocalDate(selectedDate) && user?.role !== 'superadmin'`.
- Display the lock alert banner next to the header titles if past edits are disabled.
- Disable all PAL status buttons, time check-ins, remarks fields, and save actions when `isEditingDisabled` is true.

##### 5. Reset Action
- Re-engineer the footer Reset button click handler to cleanly load and restore values straight from `initialSnapshot`.

##### 6. Validation & Save Operations
- Inside `handleSave`, add a validation check to alert the user and block saving if any student in the active batch selection has an unselected status (`status === ''`).
- Update saving logic: if `selectedBatchId !== 'all'`, filter `stagedRecords` to only send payloads for students assigned to the active batch.

##### 7. Responsive KPI Stats Layouts
- **Desktop**: Replaces the four bulky KPI blocks with 5 smaller stats cards (Total, Present, Late, Absent, Not Recorded) using `hidden md:grid`.
- **Mobile**: Uses the compact horizontal ribbon badge view (`flex md:hidden`).

##### 8. Table & Mobile Card Layouts
- **DataTable Column (Desktop)**: Render the inline `NR` badge (with Swedish-pulsing dot if today) in the `Student Details` column when unrecorded.
- **DataTable Status Buttons (Desktop)**: Render `w-12 h-12 rounded-xl text-[32px] font-black` buttons.
- **Mobile List Cards**: Render the inline `NR` badge next to the student name in mobile card layouts.
- **Mobile Status Buttons**: Render `w-10 h-10 rounded-xl text-[26px] font-black` buttons.
- **Mobile Collapsible Drawer**: Update summary text trigger to display `Not Recorded (NR)` when unrecorded.

---

## Verification Plan

### Manual Verification
1. **Unrecorded Today Default**: Navigate to today's date with no logs. Verify students default to an unselected status with a pulsing `NR` badge.
2. **Form Validation**: Click save on today's date without selecting a status for all students. Verify the validation alert blocks the save.
3. **Reset Operation**: Mark some students, then click Reset. Verify the list returns to the unselected/original state.
4. **Accessibility Sizes**: Verify desktop buttons are `32px` and mobile buttons are `26px`.
5. **Stats Presentation**: Switch viewports and check if small cards display on desktop and the ribbon displays on mobile.
