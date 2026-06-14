---
date: 2026-05-22T20:38:00+05:30
status: Completed
---

# Walkthrough - Batch Add/Edit Error Handling & Validation

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

## Verification
- Code has been inspected and verified against schema constraints in [full_schemav3.json](file:///E:/NAST/Dazzling/GAS/DazzlingDB/full_schemav3.json).
- Layout alignment matches V2 dark-mode slate styling.
