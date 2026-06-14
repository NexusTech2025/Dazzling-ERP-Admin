---
Date: 2026-05-24T01:07:04+05:30
Status: Completed
---

# Walkthrough: Decouple Batch Form & Split Routing

We have successfully decoupled the batch form and split the unified view/routing into two distinct routes and views: `batches/add` and `batches/edit/:id`.

## Changes Made

### Batch Feature

#### [BatchForm.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx) [NEW]
- Decoupled the form into a reusable sub-component.
- Accepts `initialData`, `onSubmit`, `onCancel`, `isSubmitting`, and `error` as props.
- Handles course selection and teacher selection modals internally, utilizing cached React Query lists.
- Includes client-side input validation and error display aligned with the schema.

#### [AddBatch.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/AddBatch.jsx) [MODIFY]
- Simplified into a route wrapper component for creation.
- Renders `BatchForm` and triggers `useCreateBatchMutation`.

#### [EditBatch.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/EditBatch.jsx) [NEW]
- Created wrapper component for editing.
- Retrieves target `id` via `useParams()`.
- Fetches details using `useBatchDetailQuery(id)` and triggers `useUpdateBatchMutation` on submit.
- Prefills the form by passing loaded details to `BatchForm`'s `initialData` prop.

#### [Batches.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/Batches.jsx) [MODIFY]
- Updated `onEdit` navigation handler to navigate to `/admin/batches/edit/${batch.batch_id}`.

#### [BatchProfileHeader.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchProfileHeader.jsx) [MODIFY]
- Updated "Edit Batch" link route to `/admin/batches/edit/${batch.id}`.

### Routing

#### [AppRoutes.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/routes/AppRoutes.jsx) [MODIFY]
- Configured new route `/admin/batches/edit/:id` mapped to the new `<EditBatch />` component.

## Verification

### Manual Verification Steps
1. Navigate to `/admin/batches`.
2. Click **Create Batch** -> empty form loads at `/admin/batches/add`.
3. Click **Edit Batch** on a batch -> form loads at `/admin/batches/edit/:id` populated with correct values.
