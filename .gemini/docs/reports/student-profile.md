# Report: Student Profile Diagnostic Analysis

This report documents the architectural, React Query, and schema field analysis of the Student Profile page (`StudentProfile.jsx`).

---

## 1. React Query Cache Usage
- **Hook Used**: `useStudentById` (composite hook) which invokes `useStudentsQuery({ student_id: studentId })`.
- **Diagnosis**: 
  - Instead of looking up the student record from the pre-existing general students list cache (`queryKeys.student.list(EMPTY_FILTER)`), `useStudentById` fires a new query with key `['students', 'list', { student_id: '...' }]`. This bypasses the cache entirely and causes an unnecessary network fetch.
  - No `initialData` or localized relation resolver logic is used to pre-populate the page from the general student list query.

---

## 2. Refetch on Mount
- **Diagnosis**:
  - `useProfileDetailsQuery` (extended profile data) does not set `staleTime`, `refetchOnMount: false`, or `refetchOnWindowFocus: false`.
  - `useStudentFeeOverviewQuery` (fee installments data) also lacks `staleTime` and refetch configurations.
  - Consequently, both queries trigger redundant refetch requests every time the `StudentProfile` component mounts.

---

## 3. Form Submission Alignment
- **Diagnosis**:
  - There are no active form submissions or mutations inside `StudentProfile.jsx` itself.
  - Interactive elements like "Edit Profile", "+ Add Tag", and "Message" are purely presentational placeholder buttons without event handlers or mutations.

---

## 4. Schema Field Alignment
- **Target Schema**: `Student` table, `Address` table, `ContactInfo` table, `Education` table.
- **Diagnosis & Field Gaps**:
  - **`student.date_of_birth`** (used in `PersonalDetails.jsx` line 11) does not exist in the schema. The schema defines **`dob`** instead.
  - **`student.avatar`** (used in `ProfileHeader.jsx` line 13) does not exist in the schema. The schema defines **`avatarUrl`** instead.
  - **`student.admission_date`** (used in `ProfileHeader.jsx` line 30) does not exist in the schema. There is only a system-managed **`__created_at`** column.
  - **Mock Dependency**: The extended profile is fetched via `fetchProfileDetails` from `profile.mockApi.js`. There is no production API endpoint counterpart in `profile.api.js` to query student address, contacts, or education records from the live backend.
