---
Date: 2026-06-02T00:55:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Restructure & Focus /admin/packages/ Route

Establish a cohesive, RESTful route tree for Course Packages under `/admin/packages` in `AppRoutes.jsx`, aligning the sidebar navigation, catalog view tabs, creation form, details view, and breadcrumbs. Also, enhance `PackageDetails.jsx` to render raw `PackageItem` records and navigate to linked course detail views, and align form keys in `CoursePackagesForm.jsx` with schema v2.1.1.

## User Review Required

> [!IMPORTANT]
> **Cohesive Packages Routing Structure**
> * Instead of treating packages as an accessory tab of the courses catalog under `/admin/courses` and creating them at `/admin/courses/packages`, we will promote packages to a first-class route path: `/admin/packages`.
> * This will make packages management fully RESTful:
>   * `GET` `/admin/packages` -> List Packages (renders `Courses` with the packages tab pre-selected)
>   * `GET` `/admin/packages/add` -> Create Package Form (renders `CoursePackagesForm`)
>   * `GET` `/admin/packages/:id` -> Package Details (renders `PackageDetails`)
>   * `GET` `/admin/packages/edit/:id` -> Edit Package Form (renders `CoursePackagesForm`)

> [!IMPORTANT]
> **Package Items & Deep Dive Navigation**
> * The package detailed view will fetch and map raw `PackageItem` mappings (from the `PackageItem` table).
> * It will show the unique `item_id` (e.g. `PKI-XXXXXX`) alongside resolved course metadata (name, description, short code) for each bundled item.
> * Users will be able to click on any package item to navigate to its detailed course view at `/admin/courses/:course_id`.

> [!IMPORTANT]
> **Strict Field Alignment with Schema v2.1.1**
> * Following Section 10 of `schema_design.md`, we will refactor `CoursePackagesForm.jsx` to use database-aligned snake_case properties in the local form state (e.g. `package_id`, `target_class`, `package_fee`, `status`, `month`, `board`) instead of camelCase variables (`packageId`, `targetClass`, `packageFee`).

## Proposed Changes

### Core Routing & Layout Components

#### [MODIFY] [AppRoutes.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/routes/AppRoutes.jsx)
* Add `/admin/packages` route rendering `<Courses defaultTab="packages" />`.
* Update `/admin/courses/packages` route to `/admin/packages/add`.

#### [MODIFY] [Sidebar.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/layout/Sidebar.jsx)
* Insert a "Packages" navigation item under the "Courses" submenu pointing to `/admin/packages`.

---

### Course Catalog View

#### [MODIFY] [Courses.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx)
* Modify the component signature to accept a `defaultTab` prop (defaults to `'courses'`).
* Initialize `activeTab` state using the `defaultTab` prop.

#### [MODIFY] [CourseHeader.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseHeader.jsx)
* Update the "Create Package" button link destination to `/admin/packages/add`.

---

### Package Form & Details Components

#### [MODIFY] [useCourseQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js)
* Update `hydratePackageRelations(pkg, queryClient)` to map `package_items` containing full `PackageItem` table properties (`item_id`, `entity_type`, `entity_id`) and the resolved `course` object.

#### [MODIFY] [CoursePackagesForm.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/CoursePackagesForm.jsx)
* Update breadcrumbs list to reference "Packages" -> `/admin/packages`.
* Update the cancel button and save completion navigations to route back to `/admin/packages`.
* Refactor local state `formData` to use database-aligned snake_case keys:
  * `packageId` -> `package_id`
  * `targetClass` -> `target_class`
  * `packageFee` -> `package_fee`
  * `recurringBilling` -> `recurring_billing`
* Update form input name attributes and values to align with the new schema fields.

#### [MODIFY] [PackageDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/PackageDetails.jsx)
* Update breadcrumbs list to point "Course Packages" link to `/admin/packages`.
* Update error/not-found screen redirects to `/admin/packages`.
* Update "Included Courses" tab to map over `pkg.package_items`.
* For each item, display:
  * Unique `PackageItem` identifier (`item_id`) and `entity_type` pill.
  * Resolved Course name, short code, and description.
* Wrap the card in a React Router `Link` or add a click handler to navigate to `/admin/courses/:id` for a deep-dive detail view of that course.

---

## Verification Plan

### Automated Tests
* None.

### Manual Verification
* **All verification checks will be conducted manually by the user.** The user will verify the following flows in the browser:
  * Navigating to `/admin/packages` to check active "Packages" tab catalog.
  * Creating a package at `/admin/packages/add` and saving.
  * Viewing a package detailed view to see list of `PackageItem` IDs and navigating to `/admin/courses/:id` via card clicks.
