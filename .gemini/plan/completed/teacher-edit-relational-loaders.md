---
Date: 2026-05-25T22:05:40+05:30
Status: Approved-Completed
---

# Plan: Implement Relational Data Loaders on Edit Page Mount

## Goal Description
Enhance `AddTeacher.jsx` in Edit mode by fetching teacher relation records directly from the database tables (`TeacherSubject`, `TeacherSalaryConfig`, and `TeacherDocument`) instead of parsing outdated/deprecated nested properties inside the primary `Teacher` object. Provide clear spinning wheels inside respective form modules while queries are loading.

## Proposed Changes

### Teacher Queries & Mutations

#### [MODIFY] [useTeacherQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)
- Implement and export the query hooks:
  - `useTeacherSubjectsQuery(teacherId)` to fetch subjects from the `TeacherSubject` table.
  - `useTeacherSalaryConfigQuery(teacherId)` to fetch salary details from the `TeacherSalaryConfig` table.
  - `useTeacherDocumentsQuery(teacherId)` to fetch documents from the `TeacherDocument` table.

---

### Pages (Admin)

#### [MODIFY] [AddTeacher.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/AddTeacher.jsx)
- Import query hooks (`useTeacherSubjectsQuery`, `useTeacherSalaryConfigQuery`, `useTeacherDocumentsQuery`).
- Call the queries in edit mode:
  ```javascript
  const { data: teacherSubjects, isLoading: isTeacherSubjectsLoading } = useTeacherSubjectsQuery(id);
  const { data: salaryConfigs, isLoading: isSalaryConfigsLoading } = useTeacherSalaryConfigQuery(id);
  const { data: teacherDocs, isLoading: isTeacherDocsLoading } = useTeacherDocumentsQuery(id);
  ```
- Sync fetched data into form state using `useEffect` hooks:
  - `TeacherSubject`: Map records to extract `subject_id`s and assign to `formData.subjects`.
  - `TeacherSalaryConfig`: Extract `salary_type` and `base_amount`, formatting `salary_type` to match form fields, and assign to `formData.salary_type` and `formData.base_salary`.
- Display spinning wheel elements inside:
  - **Subjects block**: If `isTeacherSubjectsLoading` is true.
  - **Salary Configuration block**: If `isSalaryConfigsLoading` is true.

---

## Verification Plan

### Manual Verification
1. Navigate to `/admin/teachers/edit/TCH-001`.
2. Confirm the Subjects, Salary, and Documents modules show spinning wheel loaders while retrieving records.
3. Confirm that once loading completes, the fields correctly populate with values from their database tables.
