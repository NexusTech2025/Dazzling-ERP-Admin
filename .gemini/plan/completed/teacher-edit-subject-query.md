---
Date: 2026-05-25T22:00:55+05:30
Status: Approved-Completed
---

# Plan: Fetch & Display Relational Teacher Data in Edit Profile

Update the Faculty Edit flow to load subjects, salary configuration, and uploaded documents directly from their respective relational tables (`TeacherSubject`, `TeacherSalaryConfig`, and `TeacherDocument`) instead of metadata fallback variables. Provide clear visual spinning wheel feedback during loading.

## Proposed Changes

### Teacher Queries & Mutations

#### [MODIFY] [useTeacherQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)
- Implement and export query hooks:
  - `useTeacherSubjectsQuery(teacherId)`: Queries `TeacherSubject` table.
  - `useTeacherSalaryConfigQuery(teacherId)`: Queries `TeacherSalaryConfig` table.
  - `useTeacherDocumentsQuery(teacherId)`: Queries `TeacherDocument` table.

---

### Pages (Admin)

#### [MODIFY] [AddTeacher.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/AddTeacher.jsx)
- Import query hooks (`useTeacherSubjectsQuery`, `useTeacherSalaryConfigQuery`, `useTeacherDocumentsQuery`).
- Invoke queries inside the component in edit mode:
  ```javascript
  const { data: teacherSubjects, isLoading: isTeacherSubjectsLoading } = useTeacherSubjectsQuery(id);
  const { data: salaryConfigs, isLoading: isSalaryConfigsLoading } = useTeacherSalaryConfigQuery(id);
  const { data: teacherDocs, isLoading: isTeacherDocsLoading } = useTeacherDocumentsQuery(id);
  ```
- Sync data into component state using `useEffect` once loaded:
  - Extract subject IDs and populate `formData.subjects`.
  - Extract salary configuration values (`salary_type`, `base_amount`) and populate `formData.salary_type` and `formData.base_salary`.
- Render inline spinners/spinning wheels inside respective form blocks (Assigned Subjects, Salary Configuration, Documents) when queries are in loading states.

---

## Verification Plan

### Manual Verification
1. Open the Faculty Edit Profile view for a teacher (`/admin/teachers/edit/TCH-001`).
2. Verify that the Subjects, Salary, and Documents blocks display loaders (spinning wheels) while fetching their respective datasets from the relational tables.
3. Confirm that form values are correctly updated once the fetch completes.
