---
Date: 2026-07-05T18:39:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Course, Package, and Batch Status Toggles

This plan details the implementation of the `StatusButton` component on the Course, Package, and Batch detailed views to allow administrators to toggle entity statuses.

---

## 1. Non-Domain Driven Infrastructure Rules

### Rule N1: Explicit Positional Signatures & Execution Blueprints

#### 1. Course Details Status Toggle Callback
* **Path Reference:** `src/features/course/CourseDetails.jsx`
```javascript
/**
 * Triggers mutation to update course status.
 * @param {string} nextStatus - The new status to set ('active' or 'inactive').
 * @returns {Promise<void>}
 */
const handleStatusToggle = useCallback(async (nextStatus) => {
  await updateCourseMutation.mutateAsync({
    id,
    data: { status: nextStatus }
  });
}, [id, updateCourseMutation]);
```

#### 2. Package Details Status Toggle Callback
* **Path Reference:** `src/features/course/PackageDetails.jsx`
```javascript
/**
 * Triggers mutation to update package status.
 * @param {string} nextStatus - The new status to set ('active' or 'inactive').
 * @returns {Promise<void>}
 */
const handleStatusToggle = useCallback(async (nextStatus) => {
  await updatePackageMutation.mutateAsync({
    id,
    data: { status: nextStatus }
  });
}, [id, updatePackageMutation]);
```

#### 3. Batch Details Status Toggle Callback
* **Path Reference:** `src/pages/admin/BatchProfile.jsx`
```javascript
/**
 * Triggers mutation to update batch status. Maps standard toggle outputs to Batch choices.
 * @param {string} nextStatus - The status toggle output ('active' or 'inactive').
 * @returns {Promise<void>}
 */
const handleStatusToggle = useCallback(async (nextStatus) => {
  const statusValue = nextStatus === 'inactive' ? 'cancelled' : 'active';
  await updateBatchMutation.mutateAsync({
    id,
    data: { status: statusValue }
  });
}, [id, updateBatchMutation]);
```

---

## Proposed Changes

### Course & Package Details Pages

---

#### [MODIFY] [CourseDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/CourseDetails.jsx)
* Import `StatusButton` from `../../components/ui/v2/StatusButton`.
* Bind `useUpdateCourseMutation` as `updateCourseMutation`.
* Implement status toggle handler.
* Replace static status badges in desktop header and mobile hero layout with `<StatusButton />`.

---

#### [MODIFY] [PackageDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/PackageDetails.jsx)
* Import `StatusButton` from `../../components/ui/v2/StatusButton`.
* Bind `useUpdatePackageMutation` as `updatePackageMutation`.
* Implement status toggle handler.
* Replace static status badges in desktop header and mobile hero layout with `<StatusButton />`.

---

#### [MODIFY] [BatchProfile.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/BatchProfile.jsx)
* Import `useUpdateBatchMutation` from `../../features/batch/hooks/useBatchQueries`.
* Import `StatusButton` from `../../components/ui/v2/StatusButton`.
* Bind `useUpdateBatchMutation` as `updateBatchMutation`.
* Implement status toggle handler.
* Pass `onStatusToggle` callback and `isStatusLoading` to `BatchProfileHeader`.

---

#### [MODIFY] [BatchProfileHeader.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchProfileHeader.jsx)
* Accept `onStatusToggle` and `isStatusLoading` props.
* Replace static badge representing status with the `<StatusButton />` component.
