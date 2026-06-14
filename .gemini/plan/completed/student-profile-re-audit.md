---
Date: 2026-05-24T13:05:00+05:30
Status: Approved
---

# Student Profile Re-Audit & Caching Optimization Plan

This plan details the changes required to address findings from the re-audit of the Student Profile view page (`admin/students/:id`). We will align the React Query keys with the centralized `queryKeys` pattern, resolve a case-sensitivity bug in the installment fee schedule, and replace the hardcoded stats (Attendance, CGPA) in the sidebar with dynamic live data.

## Findings & Audit Results

1. **React Query Key Drift**: The profile details query currently uses a hardcoded `['profile', studentId]` array instead of utilizing the centralized `queryKeys` factory.
2. **Case-Sensitivity bug in Fee Schedule**: The database schema defines installment status as lowercase (`"paid"`, `"overdue"`), but the UI in `FeeSchedule.jsx` checks for capitalized strings (`"Paid"`, `"Overdue"`), resulting in broken status badges.
3. **Hardcoded Sidebar Data**: `ProfileSidebar.jsx` contains static, hardcoded values for overall attendance (`92%`) and CGPA (`3.8`), as well as hardcoded timeline activity items.

---

## Proposed Changes

### Centralized Query Keys & Caching Layer

We will standardize student profile caching by adding a `profile` query key helper to `queryKeys` and updating all references.

#### [MODIFY] [queryKeys.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/queryKeys.js)
- Add a new query key helper for student profile:
  ```javascript
  profile: (id) => [...queryKeys.student.all, 'profile', id],
  ```

#### [MODIFY] [useProfileDetailsQuery.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/profile/hooks/useProfileDetailsQuery.js)
- Import `queryKeys` and update the `queryKey` declaration:
  ```javascript
  queryKey: queryKeys.student.profile(studentId),
  ```

#### [MODIFY] [useStudentQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentQueries.js)
- Update the cache invalidation inside `useUpdateStudentMutation` to use the standardized query key:
  ```javascript
  queryClient.invalidateQueries({ queryKey: queryKeys.student.profile(id) });
  ```

---

### UI Bug Fixes & Schema/Case-Sensitivity Sync

#### [MODIFY] [FeeSchedule.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/profile/FeeSchedule.jsx)
- Update status check checks to be case-insensitive to correctly match `"paid"` and `"overdue"` status values from the database:
  ```javascript
  const statusLower = inst.status?.toLowerCase();
  // ...
  <Badge variant={statusLower === 'paid' ? 'success' : statusLower === 'overdue' ? 'danger' : 'warning'}>
    {inst.status}
  </Badge>
  ```

---

### Dynamic Sidebar Integration (Zero Mock Data)

We will make the profile sidebar dynamic by reading actual attendance and education stats.

#### [MODIFY] [ProfileSidebar.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/profile/ProfileSidebar.jsx)
- Update `ProfileSidebar` to accept `studentId`, `education`, and `enrollments` as props.
- Import `useStudentAttendanceStatsQuery` from `../../batch/hooks/useAttendanceQueries` to fetch actual attendance statistics.
- Dynamically extract CGPA/percentage from the student's highest education record.
- Create a timeline log that dynamically includes the student's primary enrollment date.

#### [MODIFY] [StudentProfile.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/StudentProfile.jsx)
- Pass `studentId={id}`, `education={profileData?.education}`, and `enrollments={profileData?.enrollments}` props to `<ProfileSidebar />`.

---

## Verification Plan

### Automated Tests
- Validate that the development server compiles correctly and has no linter or loader errors.

### Manual Verification
- View a student profile at `admin/students/:id`.
- Check if the **Attendance** stat pill in the sidebar matches the overall percentage shown on the **Attendance** tab.
- Check if the **CGPA** stat pill in the sidebar reflects the highest qualification percentage/cgpa from the **Academic Background** card.
- Check if the **Installment Schedule** status badges display with the correct green/red colors (success/danger) based on lowercase database statuses.
