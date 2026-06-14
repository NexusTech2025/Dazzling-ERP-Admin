---
Date: 2026-05-25T22:05:40+05:30
Status: Approved-Completed
---

# Plan: Synchronize Edit Profile Mutations and Split Payload

## Goal Description
Clean up the primary Teacher update mutation payload in `AddTeacher.jsx` by stripping deprecated columns (`subject_code` and `metadata`). Implement dedicated mutations for assigning subjects and setting salary configs in `useTeacherQueries.js` and call them during submission to sync with relational database records.

## Proposed Changes

### Teacher Queries & Mutations

#### [MODIFY] [useTeacherQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)
- Implement and export the mutations:
  - `useAssignTeacherSubjectsMutation()`: Invokes `API_REGISTRY.STAFF.ASSIGN_SUBJECTS` with `{ teacherId, subjectIds }`.
  - `useSetTeacherSalaryConfigMutation()`: Invokes `API_REGISTRY.STAFF.SET_SALARY_CONFIG` with `{ teacherId, salaryType, baseAmount, effectiveFrom }`.

---

### Pages (Admin)

#### [MODIFY] [AddTeacher.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/AddTeacher.jsx)
- Import mutations (`useAssignTeacherSubjectsMutation`, `useSetTeacherSalaryConfigMutation`).
- Refactor the update branch of `handleSubmit`:
  - Strip `subject_code` and `metadata` from the core `profileData` payload.
  - In the `onSuccess` callback of the `updateMutation.mutate` call, invoke `assignSubjectsMutation.mutate` and `setSalaryConfigMutation.mutate` to update subjects and salary configuration.
  - Navigate back to `/admin/teachers/:id` only after all updates complete successfully.

---

## Verification Plan

### Manual Verification
1. Navigate to `/admin/teachers/edit/TCH-001`.
2. Edit the teacher's profile details, assigned subjects, and salary configuration rate.
3. Submit the form and monitor the browser network tab.
4. Verify that:
   - The main update request does not transmit `metadata` or `subject_code`.
   - Sequential requests are fired to `staff_assign_subjects` and `staff_set_salary_config`.
   - The page redirects to the detailed view after all mutations succeed.
