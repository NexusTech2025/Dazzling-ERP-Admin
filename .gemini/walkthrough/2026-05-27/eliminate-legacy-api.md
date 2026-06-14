---
Date: 2026-05-27T21:39:00+05:30
Status: Completed
---

# Walkthrough: Eliminate Legacy `api.js` Module

This document summarizes the changes, testing, and validation completed to migrate all legacy API operations to the Fetch-based unified `apiClient.js` module, including robust production-grade JSDoc documentation across all services.

---

## Completed Tasks

All checklist items from `task.md` have been fully implemented and verified:

1. **Centralized Service Mappings**:
   * Registered `FINANCE` namespace actions (`FINANCE.GET_STUDENT_FEES`, `FINANCE.RECORD_PAYMENT`, `FINANCE.GENERATE_FEE_PLAN`) in `src/services/apiRegistry.js`.
   * Registered `STUDENT` namespace CRUD actions (`STUDENT.ADD`, `STUDENT.UPDATE`, `STUDENT.DELETE`) in `src/services/apiRegistry.js`.

2. **Feature API Layer Migration**:
   * Fully refactored `src/features/finance/api/finance.api.js` to run on top of native fetch `executeAction` and `API_REGISTRY` mapping.
   * Fully refactored `src/features/student/api/student.api.js` to run on top of native fetch `executeAction` and `API_REGISTRY` mapping.
   * Fully refactored `src/features/teacher/api/teacher.api.js` to run on top of native fetch `executeAction` and `API_REGISTRY` mapping.

3. **Global React Query Hooks Migration**:
   * Refactored `src/hooks/useStudents.js` to query via the modern `apiClient` using `API_REGISTRY.DATA.QUERY` on the `'Student'` table.
   * Refactored `src/hooks/useTeachers.js` to query via the modern `apiClient` using `API_REGISTRY.DATA.QUERY` on the `'Teacher'` table.

4. **Legacy UI Views Alignment**:
   * Replaced deprecated `deleteStudent` and `deleteTeacher` Axios-based imports in `Students2.jsx` and `Teachers2.jsx` with the modernized, fetch-driven `removeStudent` and `removeTeacher` exports from their respective feature API layers.

5. **Legacy Client Deprecation**:
   * Emptying and deprecating `src/services/api.js` using a tombstone safety export.

6. **Production-Grade JSDoc Annotations**:
   * Added module-level and function-level JSDoc blocks across all five `*.api.js` modules, documenting type signatures, structural arguments, return envelopes, and target GAS actions.

---

## Exact Inventory of `*.api.js` Modules (100% Documented & Migrated)

The system now contains exactly five feature API modules, all of which are 100% migrated to `apiClient.js` and heavily documented:

1.  **[course.api.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/api/course.api.js)**: Integrates modern course segments and relational updates using `DATA.QUERY`, `ACADEMIC`, `DATA.UPDATE`, and `DATA.DELETE`.
2.  **[finance.api.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/api/finance.api.js)**: Runs on native fetch `executeAction` using `DATA.QUERY` and custom `FINANCE` actions.
3.  **[profile.api.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/profile/api/profile.api.js)**: Performs parallel queries and relation aggregations using unified `DATA.QUERY` logic.
4.  **[student.api.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/api/student.api.js)**: Integrates student listings, leads registration, and safe relational deletions.
5.  **[teacher.api.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/api/teacher.api.js)**: Operates on staff onboarding, salary configs, and custom documents using modern `STAFF` namespace actions.

---

## Validation Results

* **No Axios leftovers**: Inspected imports across all modules to verify that `src/services/api.js` is no longer imported anywhere in the project.
* **Registry Integrity**: Verified that all action pathways successfully resolve and construct standard `{ action, payload, token }` request body envelopes.
* **JSDoc Lint Readiness**: Confirmed all JSDoc constructs adhere to strict parameters, types, and return values matching our REST documentation specs.
