---
Date: 2026-05-26T19:28:00+05:30
Status: Proposed
---

# Unified Teacher Update Payload Implementation Plan

Refactor the teacher edit submission flow to replace multiple parallel API calls (profile data, assigned subjects, salary configurations) with a single, unified update payload sent via the custom `staff_update_teacher` action.

## Proposed Changes

---

### Core Services

#### [MODIFY] [apiRegistry.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js)
- Add `UPDATE_TEACHER: 'staff_update_teacher'` key to `API_REGISTRY.STAFF`.

---

### Teacher Feature Hooks

#### [MODIFY] [useTeacherQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)
- Refactor `useUpdateTeacherMutation`:
  - Change the action parameter to `API_REGISTRY.STAFF.UPDATE_TEACHER`.
  - Pass the payload structure: `{ teacher_id: id, data }`.
  - Update `onSuccess` to invalidate/refetch query keys for both the core profile data, subjects, and salary config.

---

### Pages (Admin)

#### [MODIFY] [AddTeacher.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/AddTeacher.jsx)
- Refactor `handleFormSubmit` in edit mode to construct a single unified update payload:
  - Add `subjects` (as an array of subject IDs).
  - Add `salary_config` object containing `salary_type` (`monthly` or `per_class`), `base_amount`, and `effective_from`.
  - Add `prefered_time_slot` mapped to the selected preferred time slot string.
- Dispatch the update mutation and navigate directly on success, eliminating `Promise.all` orchestration and multiple parallel mutations.
- Remove redundant relational updates from `isSubmitting` status check.

---

## Verification Plan

### Manual Verification
1. Navigate to `/admin/teachers/edit/[id]`.
2. Edit core details, change assigned courses/subjects, update salary base rate, and change the preferred time slot.
3. Submit the form and inspect the outgoing network request payload in Chrome DevTools.
4. Verify that:
   - Only a single POST request is sent to `staff_update_teacher`.
   - The payload structure contains the `teacher_id` and the complete `data` object.
   - The `data` object correctly includes `subjects`, `salary_config`, and `prefered_time_slot`.
   - The UI redirects back to the teacher profile view upon success.
