---
Date: 2026-06-16T14:11:40+05:30
Status: Approved-Completed
---

# Implementation Plan - Lock Past Attendance Entries for Non-Superadmins

We will implement a security constraint to prevent standard users (e.g. Teachers, Staff) from editing past teacher attendance entries, while allowing `superadmin` users to make modifications.

## Proposed Changes

### Central Utility

#### [NEW] [dateUtils.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/dateUtils.js)
- Implement a robust timezone-safe helper function `isPastLocalDate(dateStr)` that parses a date string (`YYYY-MM-DD`) and compares it against local midnight today.
```javascript
/**
 * Checks if a target date (in YYYY-MM-DD format) is in the past compared to local system date.
 * Timezone-safe by parsing date components directly to local midnight boundary.
 * 
 * @param {string} dateStr - Target date in YYYY-MM-DD format.
 * @returns {boolean} True if target date is in the past.
 */
export const isPastLocalDate = (dateStr) => {
  if (!dateStr) return false;
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day, 0, 0, 0, 0);
  
  const today = new Date();
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  
  return target.getTime() < localToday.getTime();
};
```

---

### Teacher Attendance Manager

#### [MODIFY] [TeacherAttendanceManager.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherAttendanceManager.jsx)
- Import `useAuth` from `src/context/AuthContextCore.js`.
- Import `isPastLocalDate` from `src/lib/dateUtils.js`.
- Extract `user` context using `useAuth()`.
- Define `isEditingDisabled` via `isPastLocalDate(selectedDate) && user?.role !== 'superadmin'`.
- Disable status buttons, time input fields, and remarks inputs when `isEditingDisabled` is `true`.
- Disable the "Mark All Present" button.
- Add an alert badge `Past Attendance Logs Locked (Superadmin Only)` next to the header when inputs are locked.
- Guard the `handleSave` callback to alert and return early if editing is disabled.

---

### Deep-Dive Teacher Profile Attendance Calendar

#### [MODIFY] [TeachersAttendance.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/TeachersAttendance.jsx)
- Import `useAuth` from `src/context/AuthContextCore.js`.
- Import `isPastLocalDate` from `src/lib/dateUtils.js`.
- Extract `user` context using `useAuth()`.
- Calculate `isPastRecordLocked` for each calendar day: `isPastLocalDate(dateStr) && user?.role !== 'superadmin'`.
- Pass `isPastRecordLocked` as a prop to `CalendarDayCellCell`.
- In `CalendarDayCellCell`, hide the edit button and display a lock icon instead if `isPastRecordLocked` is `true`.
- Prevent the editing popover/panel from opening.

---

## Verification Plan

### Manual Verification
1. **Standard User Mode**: Log in as a teacher/staff user.
   - Select a past date in `TeacherAttendanceManager.jsx`. Verify that all input fields, status selectors, and "Mark All Present" button are disabled, and the locked banner is displayed.
   - Navigate to profile attendance calendar. Verify edit controls are replaced with locks for past dates, and popovers cannot be opened.
2. **Superadmin Mode**: Log in as a superadmin user.
   - Select a past date. Verify all edit controls remain enabled and functional.
