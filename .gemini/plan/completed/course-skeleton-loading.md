---
Date: 2026-06-16T02:56:11+05:30
Status: Approved-Completed
---

# Implementation Plan - Localized Skeleton Loading and Caching Strategy for Courses/Packages

We will refactor the `Courses` module to replace the full-screen blocking loading indicator with localized card skeletons. Additionally, we will update the query caching configurations for courses and packages to use a finite 2.5-minute Stale-While-Revalidate (SWR) window. This keeps the application fully interactive, prevents layout shift, and manages background data synchronization seamlessly.

## Proposed Changes

### Parent Layout Frame

#### [MODIFY] [Courses.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/Courses.jsx)
- Remove the global blocking `isLoading` check and early return statement of `<LoadingState />`.
- Clean up unused imports (specifically `LoadingState`).
- Keep the `isBackgroundRefreshing` indicator active in the top-bar header to signal query revalidations cleanly.

---

### Query Hooks & Caching Strategy

#### [MODIFY] [useCourseQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js)
- Update `useCoursesQuery` caching settings:
  - Change `staleTime` from `Infinity` to `1000 * 60 * 2.5` (2.5 minutes).
  - Change `refetchOnMount` from `false` to `true` to allow query revalidation in the background once stale.

#### [MODIFY] [usePackageQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js)
- Update `usePackagesQuery` caching settings:
  - Change `staleTime` from `Infinity` to `1000 * 60 * 2.5` (2.5 minutes).
  - Change `refetchOnMount` from `false` to `true` to allow query revalidation in the background once stale.

---

### Course Management Workspace

#### [MODIFY] [CourseWorkspace.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/workspaces/CourseWorkspace.jsx)
- Implement a helper function `renderGridSkeletons` that renders a grid layout filled with animated skeleton placeholder cards.
- Integrate a conditional check on `isLoading` (returned from `useCourseWorkspaceState`) inside the JSX representation block:
  - If `isLoading` is `true`, render the `renderGridSkeletons()` block.
  - If `isLoading` is `false`, render the standard grid view or list view depending on the active `viewMode`.

---

### Package Management Workspace

#### [MODIFY] [PackageWorkspace.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/workspaces/PackageWorkspace.jsx)
- Implement a helper function `renderGridSkeletons` to render package-specific card skeletons.
- Integrate a conditional check on `isLoading` (returned from `usePackageWorkspaceState`) inside the JSX representation block:
  - If `isLoading` is `true`, render the `renderGridSkeletons()` block.
  - If `isLoading` is `false`, render the standard grid cards or list table view.

---

## Verification Plan

### Automated Tests
- Run build command to verify React syntax and imports compile cleanly:
  ```powershell
  npm run build
  ```

### Manual Verification
1. Navigate to `/admin/courses` (Curriculum Library).
2. Verify that the MainLayout frame, Breadcrumbs, header, Tab selectors ("Courses" and "Packages") paint instantly on cold start.
3. Observe the localized animated loading card skeletons in the workspace area during initial load.
4. Verify that filters remain interactive while in the loading state.
5. Invalidate the query or perform a warm-start navigation to verify that background refreshes display the `"Updating..."` badge in the header without flashing skeletons or blocking the viewport.
