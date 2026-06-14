---
date: 2026-05-22T20:38:00+05:30
status: Completed
---

# Walkthrough - Batch Schema Alignment & Constraints

Implemented form validation, schema constraint checking (maxLength), error state rendering, and mutation error handling on the Batch Add/Edit page (`AddBatch.jsx`).

## Changes Made

### Batch Component
#### [MODIFY] [AddBatch.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/AddBatch.jsx)
- Added local `error` state.
- Created a `validateForm` function that programmatically enforces:
  - Required course selection (`course_id`)
  - Required batch name (`batch_name`)
  - Maximum length restriction (255 characters) on batch name
  - Required start date and end date
  - Start date cannot be after end date check
  - Required schedule days (at least one day selected)
- Updated `handleSubmit` to check `validateForm` before mutating.
- Bound `onError` callbacks for both `createMutation.mutate` and `updateMutation.mutate` to capture API errors and set them to the local `error` state.
- Rendered a standard red error alert banner above the form container if `error` is set, matching the styling in `AddTeacher.jsx`.
- Added the `maxLength={255}` property to the Batch Name input field.
- Added a `formatToInputDate` helper to extract the `YYYY-MM-DD` date portion from the backend's ISO date-time strings, ensuring correct form population in Edit mode.

#### [MODIFY] [useBatchQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js)
- Aligned update mutation (`useUpdateBatchMutation`) and delete mutation (`useDeleteBatchMutation`) payloads with the `REST-api-doc.md` specification. Specifically:
  - Replaced the deprecated `where` mapping with direct `id` parameter.
  - Replaced `target` parameter with `table` parameter.
- Added a `select` mapper to `useBatchStudentsQuery` to flatten the nested relation columns (`student_name`, `email`, `phone` from `student`) onto the root enrollment record. This resolves display and filter accessor issues in `BatchStudentRoster.jsx` and custom `DataTable` components.

#### [MODIFY] [batchMappers.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/utils/batchMappers.js)
- Introduced `normalizeDate` helper function to safely treat empty objects `{}` (which represent unconfigured/null Google Apps Script Date fields) as `null`, avoiding downstream JavaScript type errors and page crashes during rendering.

#### [MODIFY] [BatchProfile.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/BatchProfile.jsx)
- Integrated `useBranchesQuery` hook to load the branch list cache-first on detailed view mount.
- Added branch resolver logic inside `useMemo` to dynamically map `branch_name` from list queries, correcting the `"Unknown Branch"` fallback error on fresh page reloads.

#### [MODIFY] [BatchDetailsCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchDetailsCard.jsx)
- Updated the timings row to display the start date and end date from the root level of the `batch` object instead of using the `schedule` property.
- Added a timezone-safe `formatDate` helper using local calendar integers to avoid standard timezone shifting errors when displaying ISO datetimes.

#### [MODIFY] [Batches.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/Batches.jsx)
- Integrated `useCoursesQuery` and `useTeachersQuery` to fetch lists cache-first.
- Implemented a `useMemo` relation resolver to map `course_name` and `teacher_name` to the batch items before passing them to the filters and DataTable, correcting the empty/unresolved column strings on fresh page loads.

#### [MODIFY] [batchSchema.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/schemas/batchSchema.jsx)
- Corrected the `Schedule` column renderer to read and join `days_of_week`, `start_time`, and `end_time` from the nested `batch.schedule` object instead of accessing non-existent root-level fields `schedule_days` and `schedule_time`.

## Verification
- Code has been inspected and verified against schema constraints in [full_schemav3.json](file:///E:/NAST/Dazzling/GAS/DazzlingDB/full_schemav3.json).
- Payload and response structures validated directly against the DazzlingDB [REST-api-doc.md](file:///E:/NAST/Dazzling/GAS/DazzlingDB/REST-api-doc.md).
- Edit Form date inputs verified to populate correctly from raw ISO datetime strings.
- Detailed view timing dates verified to render accurately without timezone offsets.
- Roster fields (`student_name`, `email`, `phone`) verified to render correctly via mapped query.
- Layout alignment matches V2 dark-mode slate styling.
