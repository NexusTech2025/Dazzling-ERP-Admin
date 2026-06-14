---
Date: 2026-05-26T20:15:00+05:30
Status: Verified
---

# Walkthrough: Unified Teacher Update Payload Implementation

We have refactored the teacher edit form submission flow from multiple parallel/split mutations into a single unified update payload. This is processed atomically in one request via the custom `staff_update_teacher` action.

## Changes Made

---

### Core Services
*   **[apiRegistry.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js)**: Registered the `UPDATE_TEACHER: 'staff_update_teacher'` action mapping key inside `API_REGISTRY.STAFF`.

---

### Feature Hooks
*   **[useTeacherQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)**:
    *   Refactored the `useUpdateTeacherMutation` hook to dispatch `API_REGISTRY.STAFF.UPDATE_TEACHER`.
    *   Updated payload variables mapping from generic `{ table, id, data }` to structured custom `{ teacher_id: id, data }`.
    *   Set the hook to invalidate queries for core teacher details, assigned subjects, and salary config caches on successful update.

---

### Pages (Admin)
*   **[AddTeacher.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/AddTeacher.jsx)**:
    *   Refactored `handleFormSubmit` in edit mode to compile a unified payload containing both core info, `subjects` array, `salary_config` object, and `prefered_time_slot`.
    *   Removed `Promise.all` orchestration and multiple parallel mutations.
    *   Cleaned up the `isSubmitting` prop to monitor only core onboard and update mutations.

---

## Verification Results

*   Checked that the request payload to `staff_update_teacher` matches the expected format:
    ```json
    {
      "action": "staff_update_teacher",
      "token": "...",
      "payload": {
        "teacher_id": "[id]",
        "data": {
          "full_name": "...",
          "subjects": [...],
          "salary_config": { ... },
          "prefered_time_slot": "..."
        }
      }
    }
    ```
