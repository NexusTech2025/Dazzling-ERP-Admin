---
date: 2026-05-22T20:25:30+05:30
status: Approved
---

# Implementation Plan - Batch Add/Edit Error Handling & Validation

Provide robust error handling, user-facing error feedback, and programmatic form validation on the Batch creation/editing page.

## User Review Required

> [!IMPORTANT]
> The `AddBatch` page currently does not provide visual error messages to the user if a mutation fails (e.g., network timeout or server validation error). 
> 
> This plan introduces:
> 1. Programmatic pre-submission form validation.
> 2. Visual error alerts rendering standard API error messages directly above the form layout.
> 3. Appropriate React Query mutation error handling callbacks (`onError`).

## Proposed Changes

### Batch Feature

#### [MODIFY] [AddBatch.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/AddBatch.jsx)
- Introduce `error` state using `useState`.
- Add a `validateForm` function to ensure required fields are not empty before submission.
- Update `handleSubmit` to run `validateForm` before mutating.
- Provide `onError` callbacks for both `createMutation.mutate` and `updateMutation.mutate` to capture and display the API error message.
- Render a red alert box in the UI above the form showing the error.

## Verification Plan

### Automated/Manual Verification
- Attempt to submit the form without selecting a course or name, verifying that the programmatic validation catches it and shows the alert.
- Induce a network error (e.g., disconnect network or mock an API failure) and submit the form, verifying that the mapped `ApiError` message is correctly shown in the visual alert container.
