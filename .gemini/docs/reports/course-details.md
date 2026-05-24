# Report: Course Details Diagnostic Analysis

This report documents the architectural, React Query, and schema field analysis of the Course Details page (`CourseDetails.jsx`).

---

## 1. React Query Cache Usage
- **Hook Used**: `useCourseDetailQuery(id)`
- **Diagnosis**: 
  - **Correct Implementation**: The hook implements `initialData` correctly. It checks the specific detail cache first (`queryKeys.course.detail(id)`). If not found, it queries the general list caches using `queryClient.getQueriesData({ queryKey: queryKeys.course.lists() })` and searches the cached items by `course_id` or `id`.
  - This avoids unnecessary network roundtrips when navigating from the course directory to a course detail view.

---

## 2. Refetch on Mount
- **Diagnosis**:
  - `useCourseDetailQuery` specifies a `staleTime` of 5 minutes (`1000 * 60 * 5`), which correctly caches details and prevents redundant network requests on mount.
  - The other tabs ("Enrolled Students", "Revenue Summary", "Fee Structure") are placeholder/under-development views and do not trigger extra fetches.

---

## 3. Form Submission Alignment
- **Diagnosis**:
  - There are no form submissions or mutations (such as course status toggling, course deletion, or student enrollment) executed inside `CourseDetails.jsx` itself.
  - Buttons like "Add Student" are placeholder buttons under development.

---

## 4. Schema Field Alignment
- **Target Schema**: `Course` table.
- **Diagnosis & Field Gaps**:
  - **`course.is_active`** (used in lines 45 & 129): The schema defines **`status`** as a string with choices `["active", "inactive"]`, not a boolean `is_active`. Using `course.is_active` will evaluate to `undefined` or fail depending on how the data is mapped. The UI should evaluate `course.status === 'active'`.
  - **`course.segment_name`** (used in line 140): The database column is **`segment_id`** (referencing the `CourseType` table). `segment_name` does not exist in the `Course` table schema. The API registry or a mapper must join and resolve this relation; otherwise, this field will be blank.
