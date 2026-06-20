---
Date: 2026-06-15T00:55:00+05:30
Status: Verified
---

# Walkthrough - Standardizing the Schema based caching

Verification and implementation walkthrough for schema-based caching and validation.

## Changes Implemented

### 1. Schema Definitions & Registry
- Created schema files for target entities in the hydration process under `src/lib/react-query/schemas/`:
  - [package.schema.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/schemas/package.schema.js)
  - [course.schema.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/schemas/course.schema.js)
  - [teacher.schema.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/schemas/teacher.schema.js)
  - [student.schema.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/schemas/student.schema.js)
  - [batch.schema.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/schemas/batch.schema.js)
  - [branch.schema.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/schemas/branch.schema.js)
  - [packageItem.schema.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/schemas/packageItem.schema.js)
  - [packagePerk.schema.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/schemas/packagePerk.schema.js)
- Created [schemaRegistry.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/schemaRegistry.js) to expose check, get, and list functions for all schemas.

### 2. Validation Engine
- Created [validationEngine.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/validationEngine.js) containing `validateRecordSchema` supporting `'lazy'` failMode (console warning details logging) and `'fast'` failMode (throwing custom `SchemaValidationError` immediately).

### 3. Caching Layer Integration
- Integrated the validation engine into `resolveRecord` and `resolveList` in [cacheHelper.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js) with `'lazy'` failure reporting.

### 4. Redundancy Cleanup & Refactoring
- Simplified `hydratePackageRelations` in [usePackageQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js) by removing deprecated fields like `included_courses` and `package_items`.
- Updated dependent components:
  - [AcademicEnrollmentStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx)
  - [PackageCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/components/PackageCard.jsx)
  - [CourseDetails.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CourseDetails.jsx)
  - [packageSchema.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/schemas/packageSchema.jsx)
- Refactored [useErpHydration.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/hooks/useErpHydration.js) to implement the Strategy Pattern, resolving normalizations and validations via strategies, including a custom hydration strategy for `Package`.

## Verification Results

- Verified that all schemas map exact field names, required checks, choices, and description payloads.
- Verified that target queries map matching lowercase identifiers with the registry keys.
