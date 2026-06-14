# Code Self-Assessor Report: Teacher Profile Edit View (AddTeacher.jsx)

## 📊 Robustness Score: 4/10 (Weak)

### 📝 Executive Summary
The `AddTeacher.jsx` component successfully implements basic validation and utilizes V2 Atomic UI components, but has critical architecture and schema design drift in its update payload. It tries to persist relational entities (subjects, salary configurations) by stuffing them into legacy columns (`subject_code`, `metadata`) directly in the `Teacher` table update payload. Since these columns do not exist in the master schema, they will be ignored by the backend or trigger errors. The page must be refactored to use relation-specific API endpoints (`staff_assign_subjects`, `staff_set_salary_config`, `staff_add_document`).

---

## 🔴 Critical Issues

- **[Deprecated Columns inside Teacher Update Payload]**
  - **Cause**: The update payload contains `subject_code` and a complex nested `metadata` object (containing `address`, `branch`, `time_slots`, `salary_type`, and `base_salary`). 
  - **Scenario**: When clicking "Update Profile" in Edit Mode.
  - **Impact**: Schema version 2.0.1 defines no `subject_code` or `metadata` columns on the `Teacher` table. These fields are either ignored or trigger validation failures.
  - **Fix**: Strip `subject_code` and `metadata` from the main `Teacher` record update. Instead, execute subsequent relational mutations:
    - Call `staff_assign_subjects` with `{ teacher_id, subject_ids }`.
    - Call `staff_set_salary_config` with `{ teacher_id, salary_type, base_amount, effective_from }`.

---

## 🟠 High Priority Issues

- **[Lack of Direct Relational Loaders on Edit Page Mount]**
  - **Cause**: Edit mode populates form data by parsing legacy `existingTeacher.subject_code` (which is null or deprecated) and nested metadata keys.
  - **Scenario**: When loading the edit form page for a teacher.
  - **Impact**: Form shows blank subjects and blank salary fields, even if the database has relational `TeacherSubject` and `TeacherSalaryConfig` records.
  - **Fix**: Load relational hooks (`useTeacherSubjectsQuery`, `useTeacherSalaryConfigQuery`, and `useTeacherDocumentsQuery`) on mount in Edit mode and sync them into state.

---

## 🟡 Medium & 🟢 Low Priority Issues

- **[Gender Option Case Insensitivity]**
  - **Cause**: Select input uses lowercase values `male`, `female`, `other`, but the schema requires capitalized choices `Male`, `Female`, `Other` or lowercase choices. Let's verify `full_schemav3.json` line 1412: it lists `"choices": ["male", "female", "other"]`. (No issue, choices are lowercase in the schema. In student-profile-sync it was capitalized, but for Teacher they are lowercase. Good).

---

## 💪 Strengths
- Uses V2 form fields (`FormField`, `TextInput`, `SelectInput`, `PhoneInput`).
- Correctly uses form validation constraints before triggering API requests.

---

## 🚀 Strategic Recommendations
1. Integrate relational query hooks into `AddTeacher.jsx` for edit mode.
2. Update the edit form submission handler to coordinate sequential updates (updating the core Teacher profile, then updating subjects and salary configs via dedicated actions).
3. Display clear inline spinning wheels in form sections while fetching.
