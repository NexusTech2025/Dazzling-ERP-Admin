---
Date: 2026-06-16T14:52:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Unrecorded Past Attendance Badges

We will implement a visual badge `NR` (Not Recorded) to indicate unrecorded attendance entries for previous dates, helping administrators quickly identify gaps.

## Proposed Changes

### Teacher Attendance Manager

#### [MODIFY] [TeacherAttendanceManager.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherAttendanceManager.jsx)
- In the `useEffect` sync map loop (both for `selectedBatchId === 'all'` and single batch modes), determine if no log matches for a past date:
  `const isUnrecorded = !matchingLog && isPastLocalDate(selectedDate);`
- Pass `isUnmarkedPastDate: isUnrecorded` inside the staged records initial values configuration.
- Update the desktop `DataTable`'s `Teacher Details` column rendering:
  - Add an inline badge with a slate ball icon and text `NR` when `row.isUnmarkedPastDate` is true.
- Update the mobile view cards mapping:
  - Render a matching micro `NR` badge inline next to the teacher name if `row.isUnmarkedPastDate` is true.
- Increase the text size and size of P, A, L buttons inside `TeacherAttendanceManager.jsx` (both in the desktop DataTable columns and mobile card status selectors) to `text-[32px]` and adjust their padding/dimensions to `size-12` (with flex alignment) to optimize tap-target accessibility.
- Refactor the bulky stats (KPI) card grid in `TeacherAttendanceManager.jsx` into a compact horizontal flex-wrap metrics ribbon that sits directly in the header row next to/underneath the page titles, conserving vertical layout space.
- Refactor the attendance query layer in `useTeacherQueries.js` and local state handlers in `TeacherAttendanceManager.jsx` to fetch all batch registries for the selected date at once, caching the results and performing batch filtering and KPI metrics summaries purely client-side inside `useMemo` hooks. This prevents network calls when changing the batch dropdown filter selection.

---

### Teacher Attendance Query Hook

#### [MODIFY] [useTeacherQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)
- Update `useTeacherAttendanceListQuery` hook signature to remove `batchId` parameter.
- Modify the query key to only track the selected `date` and a static key suffix `all_batches`.
- Update the API request payload to omit specific batch IDs, fetching the full day's registry block.

---

### Deep-Dive Teacher Profile Attendance Calendar

#### [MODIFY] [TeachersAttendance.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/TeachersAttendance.jsx)
- In `CalendarDayCellCell`, update the unmarked fallback render logic (when not Present, Absent, or Late) to display a styled neutral indicator with a slate dot and label `NR`.
- Add the `Not Recorded (NR)` badge description to the bottom legend panel of `TeachersAttendance.jsx`.

---

## Verification Plan

### Manual Verification
1. **Desktop View check**: Select a past date with unrecorded logs. Verify the `NR` badge (slate dot + `NR` label) appears next to the teacher details inside the grid row.
2. **Mobile View check**: Shrink screen size and verify that the `NR` badge displays inline next to the teacher's name inside the card.
3. **Calendar View check**: Navigate to profile tab. Verify that unmarked past days render the custom neutral micro-badge (`NR`) with the corresponding legend description at the bottom.
