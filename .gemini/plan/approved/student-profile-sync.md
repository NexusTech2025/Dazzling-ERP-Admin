---
Date: 2026-05-24T12:49:09+05:30
Status: Approved
---

# Student Profile Caching, Schema Sync, and Editing Plan (V3 Schema Sync)

This plan details the changes required to synchronize the student profile view with the database schema (`full_schemav3.json`), implement correct React Query detail caching, wire up the "Edit Profile" buttons to allow in-place editing of student details, and migrate data fetching from mock layers to production GAS backend endpoints.

## Primary Source of Truth
We are using `E:\NAST\Dazzling\GAS\DazzlingDB\full_schemav3.json` as the primary source of truth for syncing schemas.
- `"dob"` instead of `"date_of_birth"`.
- `"avatarUrl"` instead of `"avatar"`.
- `"gender"` values are capitalized: `"Male"`, `"Female"`, `"Other"`.

## User Review Required

> [!IMPORTANT]
> This change switches data-fetching from the mock JSON datasets to actual production API endpoints on the Google Apps Script backend.
> To prevent issues with profile views, we will implement a production `profile.api.js` using generic database entity queries to aggregate address, contact, education, and enrollment tables.

## Proposed Changes

---

### [Component Name] React Query & API Caching Layer

Refactor React Query query keys and hooks to support single student details directly instead of using filtered list queries.

#### [MODIFY] [useStudentQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentQueries.js)
- Add a new hook `useStudentDetailQuery(studentId)` using `queryKeys.student.detail(studentId)` (`['student', 'detail', studentId]`).
- Update `useUpdateStudentMutation` to invalidate the specific student detail query and the extended profile query:
  ```javascript
  queryClient.invalidateQueries({ queryKey: queryKeys.student.detail(id) });
  queryClient.invalidateQueries({ queryKey: ['profile', id] });
  ```

#### [MODIFY] [useStudentById.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentById.js)
- Import `useStudentDetailQuery` instead of using the list-based `useStudentsQuery` filtered by student ID.
- Simplify the hook to return the student object directly instead of running a find on a list of students.

---

### [Component Name] Production API Migration (No Mock Data)

Migrate imports from `mockApi` layers to the real backend `api` endpoints.

#### [MODIFY] [student.api.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/api/student.api.js)
- Define `registerStudentTransaction` to make a production call to the `STUDENT.REGISTER` action path:
  ```javascript
  export const registerStudentTransaction = (token, registrationData, options = {}) => 
    executeAction('STUDENT.REGISTER', registrationData, token, options);
  ```

#### [MODIFY] [useStudentQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentQueries.js)
- Change import source for `fetchStudents`, `modifyStudent`, `removeStudent`, and `registerStudentTransaction` from `../api/student.mockApi` to `../api/student.api`.

#### [NEW] [profile.api.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/profile/api/profile.api.js)
- Implement `fetchProfileDetails` using generic `query` helpers to retrieve Address, ContactInfo, Education, and Enrollment entities from the GAS database in parallel, and map their relationships.

#### [MODIFY] [useProfileDetailsQuery.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/profile/hooks/useProfileDetailsQuery.js)
- Change import source for `fetchProfileDetails` from `../api/profile.mockApi` to `../api/profile.api`.

#### [MODIFY] [useFinanceQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/hooks/useFinanceQueries.js)
- Change import source for all finance queries and mutations from `../api/finance.mockApi` to `../api/finance.api`.

---

### [Component Name] Student Profile Schema Synchronization

Rename `date_of_birth` -> `dob`, `avatar` -> `avatarUrl`, and update gender option values to capitalized strings (`"Male"`, `"Female"`, `"Other"`) to match the primary schema.

#### [MODIFY] [students.json](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/mockdata/student/students.json)
- Rename all occurrences of `"date_of_birth"` to `"dob"`.
- Capitalize `"gender"` values (`"male"` -> `"Male"`, `"female"` -> `"Female"`, `"other"` -> `"Other"`).

#### [MODIFY] [student.mockApi.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/api/student.mockApi.js)
- Update mock API responses and transaction mappings to use `dob` instead of `date_of_birth` for student profile mapping.
- Update default or set gender mappings to match capitalized values.

#### [MODIFY] [StudentEditModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentEditModal.jsx)
- Rename `date_of_birth` state, form fields, and properties to `dob` to match the official schema.
- Update `<select>` dropdown option values to `"Male"`, `"Female"`, and `"Other"` to match capitalized choices.

#### [MODIFY] [StudentRegistrationWizard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/StudentRegistrationWizard.jsx) and [ProfileStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/steps/ProfileStep.jsx)
- Sync `date_of_birth` to `dob` and capitalize gender values.

#### [MODIFY] [studentSchema.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/schemas/studentSchema.jsx)
- Update rendering function for `ProfileCell` to pass `avatarUrl={student.avatarUrl}` instead of `student.avatar`.

#### [MODIFY] [ProfileHeader.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/profile/ProfileHeader.jsx)
- Change avatar image reference from `student.avatar` to `student.avatarUrl`.

#### [MODIFY] [PersonalDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/profile/PersonalDetails.jsx)
- Change Date of Birth display value to `student.dob`.

#### [MODIFY] [StudentDetailModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentDetailModal.jsx)
- Change Date of Birth property mapping to use `student.dob`.

#### [MODIFY] [StudentCards.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/components/StudentCards.jsx), [RecentlyAdmitted.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/components/RecentlyAdmitted.jsx), and [EnrollmentStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/finance/components/EnrollmentStep.jsx)
- Align all image/avatar displays to read `avatarUrl` from the student record.

---

### [Component Name] Edit Button Wiring and Verification

Integrate `StudentEditModal` within the student profile view and bind the edit button actions.

#### [MODIFY] [ProfileHeader.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/profile/ProfileHeader.jsx)
- Expose an `onEdit` callback prop and bind it to the **Edit Profile** button.

#### [MODIFY] [PersonalDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/profile/PersonalDetails.jsx)
- Expose an `onEdit` callback prop and bind it to the personal details card's **Update** button.

#### [MODIFY] [StudentProfile.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/StudentProfile.jsx)
- Import `StudentEditModal` and `useUpdateStudentMutation`.
- Define an `isEditModalOpen` state.
- Define a `handleSaveStudent` function to execute `updateMutation.mutate` and close the modal.
- Render the `StudentEditModal` when `isEditModalOpen` is active.

## Verification Plan

### Automated Tests
- Run unit/integration tests or confirm dev server compiles properly after changes.

### Manual Verification
- Go to student profile view `admin/students/:id`.
- Click the **Edit Profile** button on the header or **Update** on the personal details card.
- Confirm the `StudentEditModal` opens pre-populated with correct details.
- Modify values (e.g., student name, dob, or gender) and click **Save Changes**.
- Confirm that the modal closes, the cache is invalidated, and the student's details update instantly in the profile view.
