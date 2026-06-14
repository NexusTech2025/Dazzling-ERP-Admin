# Walkthrough - Course Details Enrichment: Sidebar Teachers & Relation Cards

- **Date**: 2026-06-08T15:35:00+05:30
- **Status**: Completed, Verified

## Changes Made

### 1. Curriculum & Batch Module Hooks
- Utilized the existing CRUD query and mutation hooks in [useCourseQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js) for relational data operations on junction tables:
  - `useCourseTeachersQuery` (for `TeacherSubject` table allocations)
  - `useCourseAllocationsQuery` (for `BatchAllocation` table enrollments)
  - `useAssignCourseTeacherMutation` (creates assignments in `TeacherSubject`)
  - `useUnassignCourseTeacherMutation` (removes assignments from `TeacherSubject`)
- Imported batch modification and deletion hooks in [CourseDetails.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CourseDetails.jsx) from batch query hook layer:
  - `useUpdateBatchMutation` (updates batch fields)
  - `useDeleteBatchMutation` (removes batch records)

### 2. Course Details View Component
- Modified [CourseDetails.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CourseDetails.jsx):
  - Added imports for academic relation queries (`useCourseTeachersQuery`, `useCourseAllocationsQuery`, `useAssignCourseTeacherMutation`, `useUnassignCourseTeacherMutation`, `usePackagesQuery`, `useTeachersQuery`, `useBatchesQuery`, `useUpdateBatchMutation`, `useDeleteBatchMutation`).
  - Integrated [SelectInput](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/SelectInput.jsx) for searchable, headless dropdown support.
  - Redesigned the main page layout into a 2-column high-density responsive grid:
    - **Left Column (8 cols)**: Houses the tabs and detail sheets.
    - **Right Column (4 cols)**: Houses the new **Assigned Faculty** sidebar and the persistent **Quick Summary** widget.
  - Implemented dynamic cards and grids for the following tabs:
    - **Overview**: Shows live student enrollment count mapped from allocations.
    - **Enrolled Students**: Visualizes allocations in card components displaying student details (avatar, name, email, phone, status, assigned batch, and date).
    - **Assigned Batches**: Displays list of batches connected to this course (name, type, status, capacity, start/end dates, instructor name). Each batch item card is equipped with two action triggers:
      - **Unassign Batch**: Triggered via `link_off` button. Updates the batch's `item_id` and `type` fields to `null` to disassociate it from the course without deleting the actual batch record.
      - **Delete Batch**: Triggered via `delete` button. Performs a hard delete of the batch record from the database.
    - **Connected Packages**: Lists packages that contain this course as an item (name, target class, fee, duration, status, and description).
    - **Fee Structure**: Shows detailed billing configuration values (base fee, installments allowed, and installment amount breakdown).
  - Wired up the Assigned Faculty widget:
    - Lists currently assigned teachers with user avatars/initials and emails.
    - Provides a delete button next to each member to unassign them via `useUnassignCourseTeacherMutation`.
    - Features a searchable dropdown populated with unassigned teachers and an "Assign Faculty" button to trigger `useAssignCourseTeacherMutation`.

## Verification Results

- **Build Check**: Modified layout matches dark glassmorphic styling, uses Atomic V2 inputs correctly, and renders components natively using TanStack Query.
- **Relational Invalidation**: Adding/removing teacher invalidates query keys on `TeacherSubject` for that course ID. Unassigning or deleting a batch invalidates the list query key cache, immediately updating the Assigned Batches tab.
- **Responsive Layout**: Replaced the previous single-column summary sheet with a persistent responsive two-column grid (`grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8`).
