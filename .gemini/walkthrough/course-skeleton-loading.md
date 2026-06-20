---
Date: 2026-06-16T02:56:11+05:30
Status: Completed
---

# Walkthrough - Localized Skeletons & Caching Strategy for Courses/Packages

I have completed the implementation of localized skeleton loaders and stale-while-revalidate query configuration settings.

Here is a summary of the changes made:

---

## Changes Implemented

### 1. Parent Frame Controller (`Courses.jsx`)
*   Removed the global viewport-blocking `<LoadingState />` checks.
*   The page structure (`MainLayout`, `CourseHeader`, and navigation tabs) now paints immediately on mount.
*   Added a localized background revalidation update indicator in the top-bar header (`isBackgroundRefreshing`) that pulses cleanly during TanStack Query revalidations.

### 2. Query Hooks and Caching Strategy
*   Refactored `useCoursesQuery` inside [useCourseQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js) to set `staleTime: 1000 * 60 * 2.5` and `refetchOnMount: true`.
*   Refactored `usePackagesQuery` inside [usePackageQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js) to set `staleTime: 1000 * 60 * 2.5` and `refetchOnMount: true`.
*   This enables a 2.5-minute cache grace window to avoid duplicate fetches, serving stale data instantly from memory while refreshing records silenty on mount.

### 3. Children Workspaces (Course & Package)
*   **CourseWorkspace**: Added `renderGridSkeletons()` generating premium animated grid placeholder cards matching the dark slate style, rendered when `isLoading` is active.
*   **PackageWorkspace**: Added `renderGridSkeletons()` generating package-specific card skeletons, rendered when `isLoading` is active.
