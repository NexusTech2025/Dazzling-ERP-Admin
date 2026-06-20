---
Date: 2026-06-15T00:55:00+05:30
Status: Approved-Completed
---

# Standardizing the Schema based caching

Establishing schema-based caching, structural blueprints, and validation engine for Package offers.

## User Review Required

> [!IMPORTANT]
> **Scoped Rollout Strategy:**
> 1. To ensure stability and prevent widespread regressions, we are rolling out schema validation **only for the `Package` model** in this session. Once the validation engine is mature, we can define and register schemas for other tables (Students, Teachers, Batches, Courses).
> 2. **Included Courses Redundancy Cleanup:**
>    - The raw array of course ID strings (`included_courses`) and custom `package_items` maps will be removed.
>    - We will rely exclusively on the client-hydrated `courses` list (hydrated Course records belonging to the current package).
>    - Affected UI code (catalog lists, details, wizard steps) will be updated to consume `courses` directly.

---

## Proposed Changes

### Cache & Query Validation Engine

#### [NEW] [package.schema.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/schemas/package.schema.js)
- Schema blueprint mapping allowed fields, required keys, and descriptions for the `Package` model. Includes relations like `courses`, `perks`, `packageitems` and `packageperks`.

#### [NEW] [schemaRegistry.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/schemaRegistry.js)
- Imports `package.schema.js` and registers it in `SCHEMA_REGISTRY`. Other models will not be registered yet.

#### [NEW] [validationEngine.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/validationEngine.js)
- Implement `SchemaValidationError` custom exception.
- Implement `validateRecordSchema(entityName, record, options)` supporting:
  - `options.failMode`: `'fast'` (throw immediately) or `'lazy'` (collect all errors and log/throw at the end).
  - `options.context`: `'read'`, `'create'`, or `'update'` (skip missing required fields during updates).
- Logs descriptions from `package.schema.js` to assist developers/agents on validation mismatch.

---

### Ingestion Pipeline Integration

#### [MODIFY] [cacheHelper.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)
- Import the validation engine.
- Call `validateRecordSchema` in `resolveList` and `resolveRecord`.
- Only validate if the entity is registered in `SCHEMA_REGISTRY` (making this a safe, opt-in validation system).
- Use `'lazy'` failMode during read data ingestion to log clean console warnings instead of crashing the frontend.

---

### UI & Hydration Redundancy Cleanup

#### [MODIFY] [usePackageQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js)
- Simplify `hydratePackageRelations` to remove `included_courses` and `package_items`.
- Return only `courses` (hydrated objects) and `perks` arrays directly inside the package record.

#### [MODIFY] [AcademicEnrollmentStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx)
- Update package course mapping to map over `pkg.courses` directly instead of matching codes from `pkg.included_courses`.

#### [MODIFY] [PackageCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/components/PackageCard.jsx)
- Update card counters to read `pkg.courses?.length`.
- Resolve course list directly using the hydrated `pkg.courses` elements.

#### [MODIFY] [CourseDetails.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CourseDetails.jsx)
- Update `connectedPackages` query to search package course items using `pkg.courses?.some(c => c.course_id === id)` instead of checking `included_courses`.

#### [MODIFY] [packageSchema.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/schemas/packageSchema.jsx)
- Update Table Column schema for "Included Courses" to render subject names from `row.courses` instead of listing IDs from `row.included_courses`.

---

## Verification Plan

### Automated Tests
- Run existing test suites:
  ```powershell
  npm run test
  ```

### Manual Verification
- Ingest packages via `useErpHydration.js` and verify warnings/validations log cleanly in the console.
- Confirm packages list displays correct hydrated subject names in the Admin packages table and grid cards.
- Test student registration wizard (Academic Enrollment Step) to ensure packages and batches select and validate correctly.
