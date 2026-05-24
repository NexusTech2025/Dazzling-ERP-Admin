# Report: Batch Profile Diagnostic Analysis

This report documents the architectural, React Query, and schema field analysis of the Batch Profile page (`BatchProfile.jsx`).

---

## 1. React Query Cache Usage
- **Hook Used**: `useBatchDetailQuery(id)`
- **Diagnosis**:
  - **Successful Pattern**: It correctly implements the `initialData` cache fallback, searching across existing batch list query caches `queryKeys.batch.lists()` to find the batch record before doing a server fetch.
  - **Cache Resolver Bug**: In `resolveBatchRelations` (`batchMappers.js`), it attempts to resolve Course and Teacher names from the query cache using:
    - `queryClient.getQueryData(queryKeys.course.lists())` (evaluates to `['course', 'list']`)
    - `queryClient.getQueryData(queryKeys.teacher.lists())` (evaluates to `['teacher', 'list']`)
  - Because React Query's `getQueryData` requires an **exact** key match, and the cached queries actually use the keys `['course', 'list', { filter: {} }]` and `['teacher', 'list', { filter: {} }]`, these calls will **always return undefined**.
  - As a result, relation resolution for `course_name` and `instructor_name` fails, forcing UI fallbacks or rendering "Unknown Course" / "Unassigned".

---

## 2. Refetch on Mount
- **Diagnosis**:
  - `useBatchDetailQuery(id)` sets `staleTime: 1000 * 60 * 5` (5 minutes), which prevents unnecessary refetches on mount during this window.
  - However, `useBatchStudentsQuery(id)` (queries batch student list) and `useWeeklyScheduleQuery(id)` do not set `staleTime` or `refetchOnMount: false`, causing them to perform redundant fetches every time the Batch Profile page mounts.

---

## 3. Form Submission Alignment
- **Diagnosis**:
  - There are no active form submissions or mutations inside `BatchProfile.jsx` itself.
  - The page links to `/admin/batches/add?id=...` for editing, which handles its own form mutation.

---

## 4. Schema Field Alignment
- **Target Schema**: `Batch` table.
- **Diagnosis & Field Gaps**:
  - **`enrolled_students`**: The mapper `batchMappers.js` reads `raw.enrolled_students ?? 0`, but there is no such column in the database schema for the `Batch` table.
  - **Course Reference Key**: The schema specifies `item_id` to link a batch to a course, while the UI mapper handles `course_id: raw.course_id ?? raw.item_id ?? null` defensively.
