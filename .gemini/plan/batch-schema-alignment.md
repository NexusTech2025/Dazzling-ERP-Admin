---
date: 2026-05-22T20:28:42+05:30
status: Approved
---

# Implementation Plan - Batch Schema Alignment & Constraints

Ensure that database schema constraints are correctly validated and enforced on the Batch creation and edit form, while maintaining consistent usage of `course_id` (without mapping to `item_id`) across the project.

## User Review Required

> [!IMPORTANT]
> To maintain project-wide consistency as instructed, the frontend will **only use `course_id`** and will **not** perform any mapping to `item_id` before transmitting payloads.
>
> This plan focuses on:
> 1. Enforcing schema-level constraints on form fields in the UI (specifically `batch_name` character limits).
> 2. Providing user-friendly validation error messages for these constraints directly on the frontend.

## Proposed Changes

### Batch Feature

#### [MODIFY] [AddBatch.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/AddBatch.jsx)
- **Constraint Enforcement & Validation**:
  - Add `maxLength={255}` to the `TextInput` for `batch_name` to prevent input overflows.
  - Implement programmatic form checks and error handling on submission:
    ```javascript
    const [error, setError] = useState(null);

    const validateForm = () => {
      if (!formData.course_id) return "Course selection is required.";
      if (!formData.batch_name.trim()) return "Batch name is required.";
      if (formData.batch_name.length > 255) {
        return "Batch name cannot exceed 255 characters.";
      }
      if (!formData.start_date) return "Start date is required.";
      if (!formData.end_date) return "End date is required.";
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        return "Start date cannot be after end date.";
      }
      if (formData.schedule.days_of_week.length === 0) {
        return "Please select at least one day for the batch schedule.";
      }
      return null;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      setError(null);

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      if (isEditMode) {
        updateMutation.mutate({ id, data: formData }, {
          onSuccess: () => navigate('/admin/batches'),
          onError: (err) => setError(err.message || 'Failed to update batch.')
        });
      } else {
        createMutation.mutate({ data: formData }, {
          onSuccess: () => navigate('/admin/batches'),
          onError: (err) => setError(err.message || 'Failed to create batch.')
        });
      }
    };
    ```
  - Render a red alert box in the UI above the form showing the error if it is set.

## Verification Plan

### Manual Verification
- Deploy the frontend updates to the preview environment.
- Try to input or paste a string longer than 255 characters into the Batch Name field and verify the character limit blocks input.
- Trigger programmatic validation by trying to submit a batch name exceeding the limit, checking that a user-friendly error is rendered.
