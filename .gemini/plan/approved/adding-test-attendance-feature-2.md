---
Date: 2026-06-11T12:35:00+05:30
Status: Approved-Completed
---

# Adding Test & Attendance Feature 2

This plan details the implementation of bulk/single student and teacher attendance dashboards using the dark glassmorphic Slate design from our downloaded Stitch prototypes. We will refactor student and teacher profiles, introduce a daily bulk registry for faculty, and synchronize all required API client actions.

## User Review Required

> [!IMPORTANT]
> **Component Refactoring Scope:**
> 1. **Student Daily Registry:** We will refactor [AttendanceMatrix.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/profile/AttendanceMatrix.jsx) to match the bento KPI cards, inline Entry/Exit time inputs, and remarks input fields from the prototype.
> 2. **Teacher Daily Registry:** A new view [TeacherAttendanceManager.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherAttendanceManager.jsx) will be created to manage all faculty check-in/out registers.
> 3. **Teacher Profile Monthly Dashboard:** We will rewrite [TeachersAttendance.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/TeachersAttendance.jsx) to match the monthly calendar layout, exception logs, and the 95.8% consistency badge/gauge.

---

## Proposed Changes

### 1. API Services & Registry

We will map the new attendance endpoints in the React frontend.

#### [MODIFY] [apiRegistry.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/services/apiRegistry.js)
- Update `ATTENDANCE` and `STAFF` sub-menus:
  ```javascript
  ATTENDANCE: {
    GET_BATCH_REGISTRY: 'attendance_get_batch_registry',
    GET_MATRIX: 'attendance_get_matrix',
    MARK: 'student_mark_attendance', // Map to correct student endpoint
    MARK_BULK: 'student_mark_attendance_bulk',
    QUERY: 'student_query_attendance',
    GET_STUDENT_STATS: 'attendance_get_student_stats'
  },
  STAFF: {
    ...
    MARK_ATTENDANCE: 'staff_mark_attendance',
    MARK_ATTENDANCE_BULK: 'staff_mark_attendance_bulk',
    QUERY_ATTENDANCE: 'staff_query_attendance'
  }
  ```

---

### 2. React Query Hooks

We will expose hooks for daily check-ins and monthly query logs.

#### [MODIFY] [useAttendanceQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/hooks/useAttendanceQueries.js)
- Update `useMarkAttendanceMutation` to use `student_mark_attendance_bulk` for saving the entire registry table state in one transaction.

#### [MODIFY] [useTeacherQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)
- Expose `useTeacherAttendanceListQuery` (calling `staff_query_attendance`) to fetch daily registry states.
- Expose `useMarkTeacherAttendanceBulkMutation` (calling `staff_mark_attendance_bulk`) to submit teacher lists.

---

### 3. UI Components (Stitch Prototype Integrations)

#### [MODIFY] [AttendanceMatrix.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/profile/AttendanceMatrix.jsx)
- Integrate the high-density Student daily table layout:
  - Add KPI Cards: Active Students, Present Today, Absent, and On Leave.
  - Implement P/A/L Segmented controls for each student row.
  - Provide inline `entry_time`/`exit_time` fields and a remarks input line.
  - Set up a bottom bar with **Save Attendance** triggering the bulk query mutation.

#### [MODIFY] [TeachersAttendance.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/TeachersAttendance.jsx)
- Redesign the monthly profile view:
  - Add department header and navigation.
  - Add summary metrics row (Present ratio progress bar, late arrival count, remaining leave days).
  - Implement the glassmorphic monthly grid day tiles showing time punches and status colorings.
  - Create the side panels for **Exception Log** and **Consistency Badge** gauge.

#### [NEW] [TeacherAttendanceManager.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherAttendanceManager.jsx)
- Build the daily faculty punch-card board:
  - KPI rows for Total Active Faculty, Present Today, Late, and Leave.
  - Date and status filters.
  - Interactive grid to mark P/A/L status, time inputs (which disable if "Absent" is toggled), calculated shift hours, and note remarks.
  - Bottom bar with **Save Faculty Attendance**.

#### [MODIFY] [AppRoutes.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/routes/AppRoutes.jsx)
- Add route `teachers/attendance` linking to `TeacherAttendanceManager`.

#### [MODIFY] [Sidebar.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/layout/Sidebar.jsx)
- Add "Teacher Attendance" menu link under the **Teachers** navigation folder.

---

## Verification Plan

### Automated Tests
- Run `npm run compile-graph:prod` to check schema compilation.
- Execute `runAttendanceSystemTests()` in Google Apps Script.

### Manual Verification
1. Navigate to **Batches -> [Select Batch] -> Attendance** and mark student records. Save and verify database updates.
2. Navigate to **Staff -> Teacher Attendance** and save daily registers. Verify calculated hours.
3. Open a **Teacher Profile -> Attendance** tab and check monthly calendars, gauges, and exception logs.
