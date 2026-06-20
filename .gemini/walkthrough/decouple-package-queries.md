---
Date: 2026-06-14T22:03:00+05:30
Status: Verified
---

# Walkthrough: Decouple Package Queries & Cache Lifecycle Fixes

We have successfully decoupled all package-related queries, mutations, and helper functions from [useCourseQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js) into a dedicated [usePackageQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js) file. In addition, we solved critical cache lifecycle and invalidation bugs under [cacheHelper.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js) and updated the dashboard refresh handlers.

## Changes Made

### 1. Isolated Package-Specific Queries & Hooks
*   **[usePackageQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js)**: Created a new modular file containing:
    - Helper: `ensurePackageRelations(queryClient, token)`
    - Helper: `hydratePackageRelations(pkg, queryClient)`
    - Hook: `usePackagesQuery(filter)`
    - Hook: `usePackageDetailQuery(id)`
    - Hook: `useCreatePackageMutation()`
    - Hook: `useUpdatePackageMutation()`
    - Hook: `useDeletePackageMutation()`
    - All hooks feature comprehensive JSDoc production-ready documentation.

### 2. Cleaned Course Queries
*   **[useCourseQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js)**: Removed all package-related hook definitions, helper functions, and imports. Kept only core course, course type, and course teacher assignment queries/mutations.

### 3. Centralized Cache Garbage Collection Fix
*   **[cacheHelper.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)**: Modified `resolveList` and `resolveRecord` functions to dynamically define query defaults:
    - Sets both `staleTime: Infinity` and `gcTime: Infinity` on target list and record detail keys.
    - Locks query cache entries in memory permanently even when observers drop to 0 (`inactive` state), eliminating silent relation-hydration breakages.

### 4. Cache Invalidation Fix (Refresh Button Fix)
*   **[cacheHelper.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)**: Patched `resolveList` and `resolveRecord` to bypass the local cache check if the query is marked as stale (`isStale === true`):
    - When a user clicks the **Refresh** button, `queryClient.invalidateQueries` marks matching query keys as stale.
    - **Fix Details**: Replaced `queryState.isStale` (which is `undefined` on TanStack Query state objects) with the computed `query.isStale()` method fetched from the query cache. This guarantees that stale states are correctly detected and query functions execute real network requests.

### 5. API-Based Relations Inclusions
*   **[course.api.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/api/course.api.js)**: Refactored `fetchPackages` and `fetchPackageDetail` to pass `include: { packageitems: {}, packageperks: {} }` inside the payload. This leverages the database relational query join engine to fetch all nested item and perk relation structures in a single transaction, removing the need for separate standalone packageItem and packagePerk collection queries.
*   **[usePackageQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js)**: Simplified `ensurePackageRelations` to only fetch `courses` and updated `hydratePackageRelations` to read nested items and perks directly from the parent package record. Deleted the obsolete `usePackageItemsQuery` hook.
*   **[AcademicEnrollmentStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx)**: Removed references and dependency states on `usePackageItemsQuery`, relying exclusively on the hydrated `included_courses` array from the package object cache.

### 6. Updated Workspace Refresh Triggers
*   **[Courses.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/Courses.jsx)**:
    - Updated `CourseHeader` `onRefresh` to invalidate both courses and packages query keys (along with package-items and perks query keys), ensuring all data refreshes cleanly from the network.
    - Watched both `isFetchingCourses` and `isFetchingPackages` to display the active refresh/loader spinner in the header.

---

## Verification Results

*   **Import Resolution**: All modified files successfully resolve imports.
*   **Refactoring Quality**: Ensured correct segregation between Course and Package queries, avoiding any circular dependencies.
*   **State Integrity**: Confirmed that `gcTime: Infinity` prevents garbage collection of relational indexes under zero active observers.
*   **Refresh/Invalidation**: Verified that invalidating cache keys correctly forces the cache helper to fetch from the server.
