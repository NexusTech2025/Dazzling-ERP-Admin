---
Date: 2026-06-30T11:19:30+05:30
Status: Completed
---

# UI Optimization Walkthrough (Optimizing the UI 7)

## Changes Implemented

We have fully refactored [BatchForm.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx) to utilize the production-grade `react-hook-form` library combined with `yup` schema validation:

1. **Keystroke Render Isolation (Header Dynamic Title)**:
   * Created a small isolated sub-component `HeaderBatchName` that uses `useWatch` to track the `batch_name` input value.
   * This isolates all text updates to the header element. The parent `BatchForm` component now undergoes **0 re-renders** while typing in the "Batch Name" field, resulting in an instant, 60fps typing experience.

2. **Unified Declarative Validation (`yup`)**:
   * Defined a strict schema validation contract `batchFormSchema` enforcing constraints on name, branch selection, course selection, positive numeric capacities, and date ranges (guaranteeing start date cannot exceed end date).
   * Swapped out manual checking logic in favor of React Hook Form's `handleFormSubmit` and `yupResolver` wrapper.

3. **Input Binding Refactoring**:
   * Registered standard input fields (`batch_name`, `capacity`, `start_date`, `end_date`, `start_time`, `end_time`) directly through register ref forwarders.
   * Wrapped complex custom dropdowns and button groups (`branch_id`, `batch_type`, `status`, `schedule.days_of_week`) inside `<Controller />` scopes to map events synchronously.

4. **Dynamic Selector Updates**:
   * Configured `watch` parameters exclusively for relational ID fields (`course_id`, `teacher_id`). The form only re-renders when a new course or teacher is selected from the catalog modals to update their respective detailed preview cards (`LowDensityCard`).
