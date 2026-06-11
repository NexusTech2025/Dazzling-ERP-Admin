---
Date: 2026-06-03T07:15:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Packages Perks & Items Hydration

Resolve the missing perks and items in the Package Detailed View. We will configure the list catalog to pre-fetch and cache three core relational collections: `packages`, `PackageItems`, and `PackagePerks`. Using this query-cached data, we will hydrate individual package records with their correct courses and perks dynamically.

## Proposed Changes

### 1. Central Query Keys
#### [MODIFY] [queryKeys.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/queryKeys.js)
* Insert `packagePerk` key factory nested under `course`:
  ```javascript
  packagePerk: {
    all: ['package-perk'],
    list: () => [...queryKeys.course.packagePerk.all, 'list'],
  }
  ```

---

### 2. Service & API Layer
#### [MODIFY] [course.api.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/api/course.api.js)
* Implement and export `fetchPackagePerks(token, options)` calling the generic `DATA.QUERY` action targeting the `'PackagePerk'` table.

---

### 3. Hooks Layer
#### [MODIFY] [useCourseQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js)
* Import `fetchPackagePerks` from `../api/course.api`.
* In `ensurePackageRelations(queryClient, token)`, add a third promise to load and cache the list of perks:
  `queryKeys.course.packagePerk.list()` via `fetchPackagePerks`.
* In `hydratePackageRelations(pkg, queryClient)`:
  * Pull `packagePerks` from the query cache.
  * Filter perks matching `pkg.package_id`.
  * Return `perks` array inside the hydrated package object.
* In mutation hooks (`useCreatePackageMutation`, `useUpdatePackageMutation`, `useDeletePackageMutation`), invalidate `queryKeys.course.packagePerk.all` on success.

---

## Verification Plan

### Automated Tests
* None.

### Manual Verification
* **All check verifications will be conducted manually by the user:**
  * Open `/admin/packages` list view, verify fetch operations for Packages, PackageItems, and PackagePerks are completed.
  * View `/admin/packages/:id` details page, verify that package items list and package perks are displayed correctly using the local query cache.
