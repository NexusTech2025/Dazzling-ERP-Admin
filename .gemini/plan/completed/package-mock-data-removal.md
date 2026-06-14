---
Date: 2026-06-02T00:05:00+05:30
Status: Approved-Completed
---

# Remove Mock Package Catalog Data from Student Registration

This plan outlines the steps to decouple the Student Registration wizard and the broader course catalog query hooks from mock package data dependencies, migrating them to use live database query actions combined with client-side React Query cache hydration.

## User Review Required

> [!IMPORTANT]
> **Client-Side Relational Resolution**
> * To avoid complex polymorphic joins on the Google Apps Script backend, the client will query the raw `Package` and `PackageItem` tables individually, then resolve the package-to-course relationship (`included_courses` array) dynamically on the client using React Query cached data.
> * This aligns with the client-side relation resolution pattern already successfully established for batch query hooks.

---

## Proposed Changes

### Course Service API Layer

#### [MODIFY] [course.api.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/api/course.api.js)
* Add production service actions targeting `Package` and `PackageItem` database tables:
  * **`fetchPackages(token, filter, options)`**: Queries the `Package` table using the generic query API `API_REGISTRY.DATA.QUERY` with active status.
  * **`fetchPackageItems(token, options)`**: Queries the `PackageItem` table using `API_REGISTRY.DATA.QUERY` to retrieve course-to-package mappings.
  * **`fetchPackageDetail(token, id, options)`**: Queries the `Package` table matching `package_id`.
  * **`createPackage(token, data, options)`**: Mutates package schema via `API_REGISTRY.ACADEMIC.CREATE_PACKAGE`.
  * **`updatePackage(token, id, data, options)`**: Updates columns in the `Package` table via `API_REGISTRY.DATA.UPDATE`.

---

### Course Queries React Query Layer

#### [MODIFY] [useCourseQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js)
* **Remove Mock Imports**: Remove imports for package actions from `../api/course.mockApi`.
* **Import Real API Actions**: Import `fetchPackages`, `fetchPackageItems`, `fetchPackageDetail`, `createPackage`, and `updatePackage` from `../api/course.api`.
* **Add Cache Hydration Helpers**:
  * **`ensurePackageRelations(queryClient, token)`**: Pre-fetches or ensures that `Course` list and `PackageItem` list are in the query client cache.
  * **`hydratePackageRelations(pkg, queryClient)`**: Dynamically maps list of courses associated with `pkg.package_id` in the `PackageItem` cache and constructs the `included_courses` array on the returned object.
* **Update Query Hooks**:
  * **`usePackagesQuery`**: Add pre-fetching check and relational hydration mapper in the query selector.
  * **`usePackageDetailQuery`**: Add pre-fetching check and relational hydration mapper.
  * **`useCreatePackageMutation` & `useUpdatePackageMutation`**: Invalidate both `'package'` and `'package-item'` query keys on success.

---

## Verification Plan

### Automated Tests
* Run compilation check via React build script.
  * `npm run build`

### Manual Verification
* Navigate to the Student Registration wizard.
* Go to Step 2 (Enrollment & Fees).
* Verify that packages are queried from the live database database, batches for their courses load properly, and no errors occur when selecting a package.
