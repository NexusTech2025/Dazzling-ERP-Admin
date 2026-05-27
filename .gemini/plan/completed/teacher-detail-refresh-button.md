---
Date: 2026-05-25T21:27:20+05:30
Status: Approved-Completed
---

# Plan: Add Refresh Button to Teacher Detail View

Introduce a `RefreshButton` component in the Teacher Profile detailed view (`TeacherProfile.jsx`) to trigger a clean data refetch of the teacher detail and associated sub-resources (such as attendance) using the correct React Query query key invalidation patterns.

## Proposed Changes

### Pages (Admin)

#### [MODIFY] [TeacherProfile.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/TeacherProfile.jsx)
- Import `useQueryClient` and `useIsFetching` from `@tanstack/react-query`.
- Import `queryKeys` from `../../lib/react-query/queryKeys`.
- Import `RefreshButton` from `../../components/ui/btn/RefreshButton`.
- Retrieve the `queryClient` instance.
- Determine if any queries for the current teacher's detail prefix are fetching:
  ```javascript
  const isFetching = useIsFetching({ queryKey: queryKeys.teacher.detail(id) }) > 0;
  ```
- Add a `handleRefresh` function to invalidate the teacher's query key:
  ```javascript
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.teacher.detail(id) });
  };
  ```
- Wrap the top navigation breadcrumbs in a flex container and render the `RefreshButton` aligned to the right:
  ```jsx
  <div className="flex items-center justify-between px-4">
    <nav className="flex items-center gap-2 text-sm font-medium text-text-secondary">
      ...
    </nav>
    <RefreshButton isFetching={isFetching} onRefresh={handleRefresh} />
  </div>
  ```

---

## Verification Plan

### Manual Verification
1. Navigate to a Teacher Detailed View page (`/admin/teachers/TCH-001`).
2. Verify that the **Refresh** button appears next to the breadcrumbs.
3. Click the **Refresh** button and monitor the network panel to confirm it refetches:
   - The Teacher Detail data (`target: "Teacher"`)
   - The Teacher Attendance data (`target: "TeacherAttendance"` if on the Attendance tab)
4. Confirm that the button shows a loading/spinner state while fetching and returns to normal once completed.
