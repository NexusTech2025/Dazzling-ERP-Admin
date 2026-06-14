---
date: 2026-05-22T18:14:43+05:30
status: Completed
---

# Walkthrough: Omit Batch & Course Names from Student Add Lead Payload

We have updated the quick lead creation logic to exclude the descriptive batch/course fields from the API request payload, in accordance with the backend schema requirements.

## Changes Made

### Student Feature

#### [QuickAddStudent.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/QuickAddStudent.jsx)

- Modified `handleSubmit` to omit the following parameters from the `leadData` payload sent to the backend:
  - `batch_name`
  - `course_id`
  - `course_name`
- Maintained the query lookup for `selectedBatch` from local cache, so that the fields are still correctly resolved and forwarded during a wizard upgrade (`workflowAction === 'upgrade'`).

---

## Verification Results

### Manual Verification
- The user will verify manually in their browser environment:
  1. Open the Student page in the Admin app.
  2. Select the **Quick Student Lead** form.
  3. Fill in the required fields (Full Name, Mobile Number, and Target Batch).
  4. Inspect the outgoing payload in the console (verified via logged output). Verify that `batch_name`, `course_id`, and `course_name` are **not** present in the payload.
  5. Select "Upgrade to Full Wizard" Submit Action and verify that all fields, including batch and course, are successfully populated in Step 2 of the registration wizard.
