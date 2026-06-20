---
Date: 2026-06-16T03:27:49+05:30
Status: Approved-Completed
---

# Implementation Plan - Decouple Category (Course Types) Loading from Workspaces

We will refactor the Category (Course Types) query and workspaces state hooks to decouple course types loading from the workspace loading parameters. This ensures that category updates execute silently in the background without triggering blocking visual skeletons or layout resets when course or package datasets are already available.

## Proposed Changes

### Query Hooks Caching Strategy

#### [MODIFY] [useCourseQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js)
- Update `useCourseTypesQuery` caching settings:
  - Set `staleTime: 1000 * 60 * 2.5` (2.5 minutes).
  - Set `refetchOnMount: true` to enable silent background revalidation on mounting once stale.

---

### Workspace State Hooks

#### [MODIFY] [useCourseWorkspaceState.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/useCourseWorkspaceState.js)
- Remove `isLoadingTypes` from driving the returned `isLoading` state: `isLoading: isLoadingCourses`.
- Add a safety fallback wrapper to `segmentOptions` mapping (`const typesList = Array.isArray(courseTypes) ? courseTypes : []`) to prevent rendering crashes if the category list is empty on mount.

#### [MODIFY] [usePackageWorkspaceState.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageWorkspaceState.js)
- Remove `isLoadingTypes` from driving the returned `isLoading` state: `isLoading: isLoadingPackages`.
- Add a safety fallback wrapper to `segmentOptions` mapping (`const typesList = Array.isArray(courseTypes) ? courseTypes : []`) to prevent rendering crashes if the category list is empty on mount.

---

## Verification Plan

### Automated Tests
- Run React compilation verify command:
  ```powershell
  npm run build
  ```

### Manual Verification
1. Navigate to the Curriculum Library page.
2. Invalidate the course types query cache while keeping courses and packages cached.
3. Reload or navigate into the view and verify that existing courses/packages render instantly from cache, and no loading card skeletons mount.
4. Verify that once the course types fetch completes in the background, the filter bar categories update smoothly without layout shifts.
