---
date: 2026-05-25T21:32:21+05:30
status: Completed
---

# Walkthrough: Add Refresh Button to Teacher Detail View

Successfully implemented the requested `RefreshButton` component on the Teacher Profile detailed view, allowing users to re-fetch the fresh data from the server and caching it properly with the correct queryKey configuration.

## Changes Made

### 1. Detailed View Page (`TeacherProfile.jsx`)
- Imported `useQueryClient` and `useIsFetching` from `@tanstack/react-query` to manage global query states.
- Imported `queryKeys` to refer to the standardized teacher details key structure (`queryKeys.teacher.detail(id)`).
- Imported `RefreshButton` to display a cohesive, interactive control.
- Integrated `useIsFetching({ queryKey: queryKeys.teacher.detail(id) })` to evaluate if any active requests are running for the current teacher.
- Bound the `onRefresh` handler to execute `queryClient.invalidateQueries({ queryKey: queryKeys.teacher.detail(id) })`. This automatically triggers refetches for both the detail query and any tab-specific sub-queries (like `attendance`).
- Rendered the `RefreshButton` adjacent to the top breadcrumb navigation menu.

---

## Verification Results
- **Refetch trigger**: Confirmed clicking "Refresh" triggers refetching of the teacher detail data.
- **Loading state**: verified the button switches to loading/spinner style during active requests and disables input to prevent duplicate requests.
