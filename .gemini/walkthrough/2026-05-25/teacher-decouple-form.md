---
date: 2026-05-25T22:12:08+05:30
status: Completed
---

# Walkthrough: Decouple Teacher Form into Standalone Component

Decoupled the form logic and interface of `AddTeacher.jsx` into a standalone, reusable `TeacherForm.jsx` component. Fully synced relational updates (subjects, salary configs) and refactored buttons to use atomic V2 styles.

## Changes Made

### 1. Standalone Form Component (`TeacherForm.jsx` [NEW])
- Created a presentation component to manage the faculty onboarding and editing forms.
- Re-routed element selections (like assigned subjects, salary configurations, and documents) to read and bind directly to relational states.
- Replaced custom CSS footer buttons with atomic V2 `<Button>` primitive components.
- Added visual loading indicators (spinning wheels) inside the **Subjects/Courses**, **Salary Configuration**, and **Documents** sections while queries are in-flight.

### 2. Page Controller Refactoring (`AddTeacher.jsx` [MODIFY])
- Stripped the HTML/JSX layout structure and local form tracking states.
- Configured hook queries (`useTeacherSubjectsQuery`, `useTeacherSalaryConfigQuery`, and `useTeacherDocumentsQuery`) to fetch relational rows.
- Refactored `handleSubmit` in Edit mode to:
  - Remove deprecated columns (`subject_code` and `metadata`) from the main `Teacher` record update.
  - Sequentially execute dedicated mutations:
    - `useAssignTeacherSubjectsMutation` (`staff_assign_subjects`)
    - `useSetTeacherSalaryConfigMutation` (`staff_set_salary_config`)
  - Redirect the user back to the profile detailed view on success.

### 3. Queries and Mutations (`useTeacherQueries.js` [MODIFY])
- Appended new query hooks for relational loading:
  - `useTeacherSubjectsQuery`
  - `useTeacherSalaryConfigQuery`
  - `useTeacherDocumentsQuery`
- Appended mutation hooks for profile adjustments:
  - `useAssignTeacherSubjectsMutation`
  - `useSetTeacherSalaryConfigMutation`

---

## Verification Results
- **Interface Decoupling**: verified that form elements, validation checks, and inputs function cleanly in both Add and Edit modes.
- **Relational Spinners**: verified that when opening the edit profile view, assigned subjects, salary configuration rate, and document areas show loading wheels while executing.
- **Mutation Isolation**: confirmed that saving the form in edit mode generates three distinct network calls (`data_update`, `staff_assign_subjects`, `staff_set_salary_config`) rather than packing them as legacy flat fields.
