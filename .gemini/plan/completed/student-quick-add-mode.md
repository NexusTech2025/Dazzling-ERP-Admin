---
date: 2026-05-22T18:01:25+05:30
status: Approved
---

# Omit Batch & Course Names from Student Add Lead Payload

Modify the `QuickAddStudent` component to exclude `batch_name`, `course_id`, and `course_name` from the `student_add_lead` action payload, in alignment with the updated GAS backend schema.

## User Review Required

> [!IMPORTANT]
> The properties `batchName`, `courseId`, and `courseName` will still be resolved locally from the cached batches array and passed to the `onUpgrade` callback. This guarantees that if the user upgrades a captured lead to the full registration wizard, the wizard fields remain perfectly prepopulated.

## Proposed Changes

### Student Feature

#### [MODIFY] [QuickAddStudent.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/QuickAddStudent.jsx)

- Update `handleSubmit` to omit the following keys from `leadData`:
  - `batch_name`
  - `course_id`
  - `course_name`
- Maintain the lookup logic:
  ```javascript
  const selectedBatch = batches.find(b => b.batch_id === formData.batchId);
  ```
  so that it can still be passed to `onUpgrade` for wizard state prepopulated.

---

## Verification Plan

### Manual Verification
1. Open the Student page in the Admin app.
2. Select the **Quick Student Lead** form.
3. Fill in the required fields (Full Name, Mobile Number, and Target Batch).
4. Inspect the outgoing payload in the console (verified via logged output). Verify that `batch_name`, `course_id`, and `course_name` are **not** present in the payload.
5. Select "Upgrade to Full Wizard" Submit Action and verify that all fields, including batch and course, are successfully populated in Step 2 of the registration wizard.
