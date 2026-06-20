---
Date: 2026-06-16T03:27:49+05:30
Status: Completed
---

# Walkthrough - Decoupling Category Loading from Course/Package Workspaces

I have completed the changes to decouple the category (course types) loading states from the main workspace loaders.

Here is a summary of the changes made:

---

## Changes Implemented

### 1. Caching Configuration
*   Updated `useCourseTypesQuery` in [useCourseQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js) to use `staleTime: 1000 * 60 * 2.5` and `refetchOnMount: true` (matching the courses/packages SWR caching strategy).

### 2. Workspace Hooks Refactored
*   **CourseWorkspaceState**: Updated [useCourseWorkspaceState.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/useCourseWorkspaceState.js) to set `isLoading: isLoadingCourses`, removing the blocking `isLoadingTypes` dependency. Added a fallback wrapper for `segmentOptions` mapping to prevent rendering exceptions if types are loading.
*   **PackageWorkspaceState**: Updated [usePackageWorkspaceState.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageWorkspaceState.js) to set `isLoading: isLoadingPackages`, removing the blocking `isLoadingTypes` dependency. Added a fallback wrapper for `segmentOptions` mapping to prevent rendering exceptions if types are loading.
