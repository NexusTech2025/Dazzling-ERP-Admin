---
Date: 2026-05-25T22:12:08+05:30
Status: Approved-Completed
---

# Plan: Decouple Teacher Form into Standalone Feature Component

Move the teacher registration/editing form markup and local validation logic from the page controller `AddTeacher.jsx` into a standalone, reusable component named `TeacherForm.jsx` under `src/features/teacher/components/`.

## Proposed Changes

### [NEW] [TeacherForm.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/TeacherForm.jsx)
- Create a reusable, presentation form component:
  - Consumes V2 atomic components (`FormField`, `TextInput`, `SelectInput`, `PhoneInput`, `DateInput`, `RadioGroup`, `SegmentedControl`, `ToggleSwitch`, `FileUpload`, `FormSection`, and V2 `Button`).
  - Accepts standard form props:
    - `teacher`: The core teacher profile object (if editing).
    - `subjects`: List of assigned subject IDs.
    - `salaryConfig`: The payroll configuration object.
    - `documents`: List of uploaded teacher documents.
    - `onSubmit`: Callback function fired when valid form data is submitted.
    - `onCancel`: Callback function fired to discard changes.
    - `isSubmitting`: Loading status of mutations.
    - `isDataLoading`: Flag indicating if relational data is still loading (rendering spinning wheels).
    - `error`: Submission or loading error alerts.
  - Implements form validations (`validateForm`) and local inputs tracking (`formData` state).

---

### Pages (Admin)

#### [MODIFY] [AddTeacher.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/AddTeacher.jsx)
- Clean up imports and remove the bulk of HTML layout and local inputs tracking states.
- Load teacher profile details, assigned subjects, salary configurations, and documents on mount using standard React Query hooks.
- Delegate form rendering completely to `<TeacherForm>`:
  ```jsx
  <TeacherForm
    teacher={existingTeacher}
    subjects={formDataSubjects}
    salaryConfig={salaryConfig}
    documents={teacherDocs}
    onSubmit={handleFormSubmit}
    onCancel={() => navigate(isEditMode ? `/admin/teachers/${id}` : '/admin/teachers')}
    isSubmitting={addMutation.isPending || updateMutation.isPending}
    isDataLoading={isFetchingTeacher || isTeacherSubjectsLoading || isSalaryConfigsLoading || isTeacherDocsLoading}
    error={error}
  />
  ```

---

## Verification Plan

### Manual Verification
1. Open the Faculty Registration form (`/admin/teachers/add`).
2. Verify that the form functions identically to before (submitting validation, and saving data).
3. Open the Faculty Edit form (`/admin/teachers/edit/TCH-001`).
4. Verify that the page loads existing data, displays spinners while loading, and updates the database upon clicking Save.
