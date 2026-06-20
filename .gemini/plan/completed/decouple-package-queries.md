---
Date: 2026-06-14T20:36:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Decouple Package Queries

Decouple all package-related React Query queries, mutations, and helper functions from [useCourseQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js) into a dedicated [usePackageQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js) file, refactoring all consumer files.

## Proposed Changes

### Core Queries & Hooks

#### [NEW] [usePackageQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js)
- Implement and export:
  - `ensurePackageRelations(queryClient, token)`
  - `hydratePackageRelations(pkg, queryClient)`
  - `usePackagesQuery(filter)`
  - `usePackageDetailQuery(id)`
  - `useCreatePackageMutation()`
  - `useUpdatePackageMutation()`
  - `useDeletePackageMutation()`
  - `usePackageItemsQuery()`

#### [MODIFY] [useCourseQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js)
- Delete `ensurePackageRelations`, `hydratePackageRelations`, `usePackagesQuery`, `usePackageDetailQuery`, `useCreatePackageMutation`, `useUpdatePackageMutation`, `useDeletePackageMutation`, and `usePackageItemsQuery`.
- Keep only Course, CourseType, CourseTeachers, CourseAllocations, and AssignCourseTeacher queries.

---

### Adjust Consumer Imports

Modify package query imports in the following files to point to `./usePackageQueries` or `.../course/hooks/usePackageQueries`:

1.  **[usePackageWorkspaceState.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageWorkspaceState.js)**
2.  **[Courses.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/Courses.jsx)**
3.  **[CourseDetails.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CourseDetails.jsx)**
4.  **[PackageDetails.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/PackageDetails.jsx)**
5.  **[CoursePackagesForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CoursePackagesForm.jsx)**
6.  **[InlineCoursePackagesForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/InlineCoursePackagesForm.jsx)**
7.  **[AcademicEnrollmentStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx)**

---

## Verification Plan

### Manual Verification
- Compile the application and ensure no build or import issues exist.
- Inspect developer tools network panel to check package requests.
- Verify packages, package detail views, package creation form, and academic enrollment steps work correctly.
