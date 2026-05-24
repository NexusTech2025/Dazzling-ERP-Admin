---
Date: 2026-05-24T01:05:23+05:30
Status: Approved
---

# Plan: Decouple Batch Form & Split Routing

Decouple the Batch Form component and split the unified `AddBatch.jsx` view into two separate views and routes: `batches/add` and `batches/edit/:id`.

## User Review Required

> [!IMPORTANT]
> - Route change: The edit URL will change from `/admin/batches/add?id=<id>` to `/admin/batches/edit/<id>`.
> - The new `BatchForm` component will be reusable, accepting initial data as a prop and maintaining local state aligned with the batch database schema.

## Proposed Changes

### Batch Feature

#### [NEW] [BatchForm.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx)
- Decouple the batch form from the page view.
- Support `initialData`, `onSubmit`, `onCancel`, `isSubmitting`, and `error` as props.
- Implement course and teacher selection modals internally or via shared state, utilizing cached data from React Query queries.
- Validate inputs according to the schema rules (e.g. batch name, start/end dates, scheduling).

#### [MODIFY] [AddBatch.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/AddBatch.jsx)
- Convert to a simple wrapper view for the "Add Batch" route.
- Set up initial blank state or predefined form structure.
- Trigger `useCreateBatchMutation` on submit.

#### [NEW] [EditBatch.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/EditBatch.jsx)
- Create a new wrapper view for the "Edit Batch" route.
- Retrieve the batch ID using `useParams()` from `react-router`.
- Fetch the batch details using `useBatchDetailQuery(id)`.
- Trigger `useUpdateBatchMutation` on submit.
- Render the `BatchForm` with prefilled values from the query.

#### [MODIFY] [Batches.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/Batches.jsx)
- Update `onEdit` handler to navigate to `/admin/batches/edit/${batch.batch_id}`.

#### [MODIFY] [BatchProfileHeader.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchProfileHeader.jsx)
- Update "Edit Batch" button link `to` path to `/admin/batches/edit/${batch.id}`.

### Routing

#### [MODIFY] [AppRoutes.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/routes/AppRoutes.jsx)
- Import `EditBatch` component.
- Add route `<Route path="batches/edit/:id" element={<EditBatch />} />`.

## Verification Plan

### Automated/Build Verification
- Confirm that the codebase builds correctly without any syntax/import errors.

### Manual Verification
- Navigate to `/admin/batches` and click "Create Batch" -> Verify that the empty form loads under `/admin/batches/add`.
- Fill in fields and create a batch -> Verify redirection and list update.
- Click "Edit Batch" on any batch in the directory or profile -> Verify it navigates to `/admin/batches/edit/:id` and loads the form pre-filled with the exact batch details.
- Modify values and save -> Verify that it updates correctly and redirects.
