# Changelog — Adding Test & Attendance Feature 2

* **Date**: 2026-06-11
* **Status**: Completed & Verified

This session implements student and teacher attendance UI dashboards, hooks, and routing pages with complete light/dark adaptive theme layouts, bulk query transactions, and rendering loop stability guards.

---

## Files Added
* **Teacher Daily Punch Register Component**: [TeacherAttendanceManager.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherAttendanceManager.jsx)
* **Anti-Pattern Blog Documentation**: [render_loops_query_destructuring.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/anti_patterns/render_loops_query_destructuring.md)

## Files Modified

### 1. Centralized Cache Keys & Hooks
* **[queryKeys.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/queryKeys.js)**:
  * Added keys `teacher.attendanceDaily(date)` and `teacher.attendanceProfile(teacherId, 'all')`.
* **[useAttendanceQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/hooks/useAttendanceQueries.js)**:
  * Restructured queries to pass `{ where: { batch_id, attendance_date } }` parameters.
  * Replaced standard mutation with `student_mark_attendance_bulk` mutation.
* **[useTeacherQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)**:
  * Added `useTeacherAttendanceListQuery` daily logs hook.
  * Added `useMarkTeacherAttendanceBulkMutation` bulk marking hook.
  * Refactored `useTeacherAttendanceQuery` to fetch monthly details from the `staff_query_attendance` endpoint.

### 2. UI Pages & Dashboards
* **[AttendanceMatrix.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/profile/AttendanceMatrix.jsx)**:
  * Refactored to stage local changes before committing bulk register updates.
  * Added KPI metric tiles, inline check-in/out pickers, and remarks.
  * Styled with adaptive theme variables supporting light and dark modes.
  * Stabilized query outputs using `EMPTY_ARRAY` to eliminate loading state loops.
* **[AttendanceHistoryMatrix.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/profile/AttendanceHistoryMatrix.jsx)**:
  * Formatted short status codes (`P`, `A`, `L`) along with long labels.
* **[TeachersAttendance.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/TeachersAttendance.jsx)**:
  * Rewritten to render monthly calendar day punch grids, edit menus, circular SVG efficiency gauges, and dynamic exception logs.
  * Configured light/dark adaptive layout styles.

### 3. Routing & Navigation Layouts
* **[AppRoutes.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/routes/AppRoutes.jsx)**:
  * Imported `TeacherAttendanceManager` and declared flat route `teachers/attendance` to resolve React Router v7 unmounting transition lockups.
* **[Sidebar.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/layout/Sidebar.jsx)**:
  * Converted the flat "Teachers" menu option to a sub-menu containing Directory, Attendance, and Add pages.
  * Added `end` property to sub-item `NavLink` elements to prevent incorrect active route highlighting.

### 4. Memory & Indices
* **[MEMORY_INDEX.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/MEMORY_INDEX.md)**:
  * Registered the new `anti_patterns/` memory subdirectory.
