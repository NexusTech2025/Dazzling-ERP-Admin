---
date: 2026-05-25T20:53:39+05:30
status: Approved-Completed
---

# Plan: Teacher Profile Detail View Alignment & Optimization

Sync the Teacher Detail view components and queries with the master database schema (`full_schemav3.json` version 2.0.1) and follow the official API payload specifications in `REST-api-doc.md`.

## Proposed Changes

### Teacher Queries & Mutations

#### [MODIFY] [useTeacherQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)
- **`useTeacherAttendanceQuery`**: Add `staleTime: 1000 * 60 * 5` (5 minutes) and `refetchOnWindowFocus: false` to prevent redundant network refetches on tab changes.
- **`useUpdateTeacherMutation`**: Modify payload to use generic `data_update` schema (using `{ table: 'Teacher', id, data }`) instead of `{ target, where }` which is out of sync with `REST-api-doc.md`.

---

### Component Schema Mappings

#### [MODIFY] [TeacherProfileHeader.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherProfileHeader.jsx)
- Map `teacher.profile_photo_url` instead of legacy `teacher.avatar`.
- Map `teacher.full_name` instead of legacy `teacher.teacher_name`.

#### [MODIFY] [TeacherPersonalInfo.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherPersonalInfo.jsx)
- Map `teacher.full_name` instead of legacy `teacher.teacher_name`.
- Since `department` does not exist on the `Teacher` schema, replace the Department key-value field with `teacher.specialization` to represent their academic focus.

#### [MODIFY] [TeacherProfessionalCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherProfessionalCard.jsx)
- Map `teacher.qualification` instead of legacy `teacher.designation`.
- Map `teacher.notes` directly on the record instead of nested `teacher.metadata?.internal_notes` (aligning with the schema's `notes` column).

#### [MODIFY] [TeacherContactDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherContactDetails.jsx)
- Map `teacher.mobile_number` instead of legacy `teacher.mobile`.

#### [MODIFY] [TeachersAttendance.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeachersAttendance.jsx)
- Update time parsing in `formatTime` and `lateArrivals` to safely support full ISO datetime strings (splitting on `T` if present), preventing NaN calculations.
- Update check-in and check-out mutation payloads to combine date (`dateStr`) and time into a valid ISO datetime string (e.g. `${dateStr}T${time}`), matching the `datetime` type constraint on `check_in_time` and `check_out_time`.

---

## Verification Plan

### Automated/Local Testing
- Verify that navigating to the teacher profile view does not trigger redundant queries for the attendance tab when switching tabs (checking react-query devtools or network console).
- Edit the teacher profile to verify that update mutations correctly target the backend with `{ table, id, data }` payloads.
- Log out attendance mutations to confirm that check-in/out updates are sent in full ISO datetime format.
