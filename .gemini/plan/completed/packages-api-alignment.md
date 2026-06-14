---
Date: 2026-06-02T21:30:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Packages API Alignment & Synchronization

Align the course packages management frontend actions with DazzlingDB's specialized transaction-safe backend endpoints (`academic_create_package`, `academic_update_package`, and `academic_delete_package`). Fix course relation payload mapping, register missing actions in the central registry, and implement full deletion support.

## User Review Required

> [!IMPORTANT]
> **Polymorphic Payload Shape Alignment**
> The backend expects courses in package creation/updating to be formatted as:
> `courses: [{ "entity_type": "course", "entity_id": "CRS-XXXXXX" }]`
> We will map the local `selectedCourses` array to this format before transmitting to the backend.

> [!IMPORTANT]
> **Dedicated Endpoints for Package Mutations**
> * Instead of hitting generic `DATA.UPDATE` (which fails to sync perks and course lists), we will route updates through `academic_update_package`.
> * We will implement package deletion using the specialized `academic_delete_package` endpoint, protecting database integrity with its built-in enrollment check validations.

## Proposed Changes

### 1. API Registry & Service Layer

#### [MODIFY] [apiRegistry.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js)
* Register `UPDATE_PACKAGE: 'academic_update_package'` and `DELETE_PACKAGE: 'academic_delete_package'` inside `API_REGISTRY.ACADEMIC`.

#### [MODIFY] [course.api.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/api/course.api.js)
* Update `updatePackage` to use `API_REGISTRY.ACADEMIC.UPDATE_PACKAGE` and format payload as:
  `{ package_id: id, ...data }`
* Add `deletePackage(token, id, options)` utilizing `API_REGISTRY.ACADEMIC.DELETE_PACKAGE` with payload:
  `{ package_id: id }`

---

### 2. React Query Hooks

#### [MODIFY] [useCourseQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js)
* Add and export `useDeletePackageMutation` query hook.
* Invalidate query keys `queryKeys.course.package.all` and `queryKeys.course.packageItem.all` on success.

---

### 3. Package Form & Catalog UI

#### [MODIFY] [CoursePackagesForm.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/CoursePackagesForm.jsx)
* In `handleSave`, map `selectedCourses` to the backend-expected shape containing `entity_type` and `entity_id`.
* Clean up fields sent to the mutations to perfectly match schema properties: `name`, `description`, `target_class`, `board`, `month`, `package_fee`, `discount_percent`, `status`, `courses`, `perks`.

#### [MODIFY] [Courses.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx)
* Import `useDeletePackageMutation` hook.
* Expand the `ConfirmModal` state to handle two different contexts: archiving a Course or deleting a Package.
* Add a `handleDeletePackageClick(pkg)` handler.
* Bind the delete button inside `packageColumns` to trigger the confirmation modal for deleting packages.
* On confirm, execute the package delete mutation.

---

## Verification Plan

### Automated Tests
* None.

### Manual Verification
* **All check verifications will be performed manually by the user:**
  * Create a package and verify the included courses are linked correctly in the database sheet.
  * Edit a package, adding a new course or removing a perk, and verify the relation updates are written and synced.
  * Delete a package, confirming that deletion is rejected if enrollments exist, and that cascading deletes clean up `PackagePerk` and `PackageItem` sheets.
