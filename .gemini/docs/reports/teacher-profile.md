# Report: Teacher Profile Diagnostic Analysis

This report documents the architectural, React Query, and schema field analysis of the Teacher Profile page (`TeacherProfile.jsx`) and its sub-components.

---

## 1. React Query Cache Usage
- **Hook Used**: `useTeacherDetailQuery(id)`
- **Diagnosis**: 
  - **Correct Implementation**: The hook implements `initialData` correctly. It first checks for specific detail cache via `queryKeys.teacher.detail(id)`. If missing, it queries existing list caches using `queryClient.getQueriesData({ queryKey: queryKeys.teacher.lists() })` and searches the items for a matching `teacher_id` or `id`.
  - This avoids unnecessary network roundtrips when navigating from the Teacher Directory to a specific Teacher Profile.

---

## 2. Refetch on Mount
- **Diagnosis**:
  - `useTeacherDetailQuery` specifies a `staleTime` of 5 minutes (`1000 * 60 * 5`), which correctly keeps data cached and prevents immediate refetching on mount.
  - `useTeacherAttendanceQuery(teacherId)` (defined in `useTeacherQueries.js` line 76) does not set any `staleTime`, `refetchOnMount`, or `refetchOnWindowFocus` options. 
  - When switching to the **Attendance** tab, `TeachersAttendance.jsx` mounts and triggers a redundant network refetch because of `staleTime: 0`.

---

## 3. Form Submission Alignment
- **Diagnosis**:
  - **Attendance Marking**: The inline attendance popover in `TeachersAttendance.jsx` calls `updateMutation.mutate` which uses `useUpdateTeacherAttendanceMutation()`.
  - On success, the mutation invalidates and refetches the attendance query `[...queryKeys.teacher.detail(teacherId), 'attendance']` which perfectly matches React Query's declarative cache synchronization pattern.

---

## 4. Schema Field Alignment
- **Target Schema**: `Teacher`, `TeacherAttendance`, and `TeacherDocument` tables.
- **Diagnosis & Field Gaps**:
  - **`teacher.teacher_name`** (used in `TeacherPersonalInfo.jsx` line 23, `TeacherProfileHeader.jsx` lines 27 & 35) does not exist in the schema. The schema defines **`full_name`** instead.
  - **`teacher.mobile`** (used in `TeacherContactDetails.jsx` line 29) does not exist in the schema. The schema defines **`mobile_number`** instead.
  - **`teacher.avatar`** (used in `TeacherProfileHeader.jsx` line 26) does not exist in the schema. The schema defines **`profile_photo_url`** instead.
  - **`teacher.designation`** (used in `TeacherProfessionalCard.jsx` line 28 for label "Qualification") does not exist in the schema. The schema defines **`qualification`** instead.
  - **`teacher.department`** (used in `TeacherPersonalInfo.jsx` line 51) does not exist in the schema.
  - **`teacher.metadata?.address`** (used in `TeacherContactDetails.jsx` line 36) and **`teacher.metadata?.internal_notes`** (used in `TeacherProfessionalCard.jsx` line 47) do not exist in the schema.
  - **Time vs. Datetime Types**: In `TeachersAttendance.jsx` lines 361 & 370, updates for `check_in_time` and `check_out_time` are sent as time-only strings (e.g. `09:00:00`), whereas the schema specifies both columns as **`datetime`** (which expects ISO timestamp strings like `2026-02-12T09:00:00`).
