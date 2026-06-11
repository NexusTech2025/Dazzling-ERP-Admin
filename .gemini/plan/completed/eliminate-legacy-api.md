---
Date: 2026-05-27T21:16:00+05:30
Status: Approved-Completed
---

# Eliminate Legacy `api.js` Module and Migrate to Unified `apiClient.js`

This plan details the steps required to completely eliminate usage of the legacy Axios-based `src/services/api.js` client, migrate all active and legacy features to the new native Fetch-based `src/services/apiClient.js` module, and establish unified REST API payload and error handling architecture across the entire system.

## User Review Required

> [!IMPORTANT]
> **Relational Deletion Cascades & Transactions**
> In the new unified `apiClient.js` model, deleting a student relies on the specific `'deletestudent'` backend macro action (mapped under `STUDENT.DELETE` in the registry) rather than a generic `DATA.DELETE` endpoint. This is a critical security measure to prevent leaving orphaned database records in subordinate relational tables (`ContactInfo`, `Address`, `Education`).

> [!TIP]
> **Environment Agnostic Setup**
> Switching to `apiClient.js` dynamically binds API endpoints to `import.meta.env.VITE_API_BASE_URL` instead of relying on a hardcoded script URL, making deployment across testing, staging, and production environments seamlessly configurable.

## Open Questions

There are no unresolved questions. All legacy endpoint actions and payloads have been mapped precisely to match current GAS backend capabilities.

---

## Proposed Changes

### Centralized Service Layer

We will first expand `apiRegistry.js` to map all remaining legacy operations into standard namespace definitions.

#### [MODIFY] [apiRegistry.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js)
* Add a new `FINANCE` domain mapper:
  ```javascript
  FINANCE: {
    GET_STUDENT_FEES: 'getstudentfees',
    RECORD_PAYMENT: 'recordpayment',
    GENERATE_FEE_PLAN: 'generatefeeplan'
  }
  ```
* Expand the `STUDENT` domain mappings:
  ```javascript
  STUDENT: {
    REGISTER: 'student_register',
    ADD_LEAD: 'student_add_lead',
    ADD: 'addstudent',
    UPDATE: 'updatestudent',
    DELETE: 'deletestudent'
  }
  ```

---

### Finance Feature Area

We migrate the finance services from the legacy Axios helper to `apiClient.executeAction`.

#### [MODIFY] [finance.api.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/api/finance.api.js)
* Replace legacy `query` and `postToGoogleScript` imports from `src/services/api.js`.
* Integrate `executeAction` and `API_REGISTRY`.
* Rewrite `fetchInstallments`, `fetchRevenueSummary`, and `fetchOverdueAccounts` to use `DATA.QUERY` with appropriate targets.
* Rewrite `fetchStudentFeeOverview`, `recordPayment`, and `generateFeePlan` to call the newly registered `FINANCE` action paths under standard payload encapsulation.

---

### Student Feature Area

We migrate legacy CRUD functions in `student.api.js` to run on top of `apiClient.js`.

#### [MODIFY] [student.api.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/api/student.api.js)
* Remove legacy Axios-based imports.
* Import `executeAction` and `API_REGISTRY`.
* Convert legacy calls to run on top of modern action endpoints (`DATA.QUERY`, `STUDENT.ADD`, `STUDENT.UPDATE`, `STUDENT.DELETE`).

---

### Teacher Feature Area

We migrate legacy CRUD functions in `teacher.api.js` to run on top of `apiClient.js`.

#### [MODIFY] [teacher.api.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/api/teacher.api.js)
* Remove legacy Axios-based imports.
* Import `executeAction` and `API_REGISTRY`.
* Replace unused legacy endpoints with standard V2 staff endpoints (`DATA.QUERY`, `STAFF.ONBOARD_TEACHER`, `STAFF.UPDATE_TEACHER`, `DATA.DELETE`).

---

### Global Core Hooks & Old Views

We update old test/demo views and hooks to prevent imports of the deprecated client.

#### [MODIFY] [useStudents.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useStudents.js)
* Replace direct import of legacy `query` with `apiClient.executeAction` calling `API_REGISTRY.DATA.QUERY` on the `'Student'` table.

#### [MODIFY] [useTeachers.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useTeachers.js)
* Replace direct import of legacy `query` with `apiClient.executeAction` calling `API_REGISTRY.DATA.QUERY` on the `'Teacher'` table.

#### [MODIFY] [Students2.jsx](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/Students2.jsx)
* Migrate `deleteStudent` Axios-based import to load `removeStudent` as `deleteStudent` from the `student.api.js` module.

#### [MODIFY] [Teachers2.jsx](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/Teachers2.jsx)
* Migrate `deleteTeacher` Axios-based import to load `removeTeacher` as `deleteTeacher` from the `teacher.api.js` module.

---

### Cleanup

#### [DELETE] [api.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/api.js)
* Safely remove the legacy client code. *Note: We will perform this in a safe, non-destructive stage-only git manner without using aggressive physical disk purge commands.*

---

## Verification Plan

### Automated Tests
* Validate project compilations and build scripts to confirm no broken import paths or bundling crashes:
  ```bash
  npm run build
  ```

### Manual Verification
* Deploy/preview locally (`npm run dev`) and test CRUD flows:
  * Load Student Directory to verify list hydration via query client.
  * Trigger student deletion from student profile / list to verify that `STUDENT.DELETE` acts properly.
  * Verify Finance components (record payment and generate fee plan) trigger without API schema rejections.
