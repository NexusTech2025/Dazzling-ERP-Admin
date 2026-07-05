---
Date: 2026-07-05T18:49:00+05:30
Status: Approved-Completed
---

# Implementation Plan - API Response Envelope Standard Integration

This plan details updating the `StatusButton` and parent pages to handle API success and failure responses using the standardized envelope context structures.

---

## 1. Non-Domain Driven Infrastructure Rules

### Rule N1: Explicit Positional Signatures & Execution Blueprints

#### Component: `StatusButton`
* **Path Reference:** `src/components/ui/v2/StatusButton.jsx`
```javascript
/**
 * Executes toggle operation, tracking processing, success, and error states using ConfirmModal APIs.
 */
const handleConfirm = async () => {
  setModalStatus('processing');
  try {
    const res = await onStatusToggle(targetStatus);
    if (res && res.success) {
      setModalStatus('success');
      setResultMessage(res.data?._presentation?.toast_message || `${entityName} status updated.`);
    } else {
      setModalStatus('error');
      setResultMessage(res?.error?.message || 'Failed to update status.');
    }
  } catch (err) {
    setModalStatus('error');
    setResultMessage(err.message || 'An unexpected error occurred.');
  }
};
```

---

## Proposed Changes

### UI Components

---

#### [MODIFY] [StatusButton.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/StatusButton.jsx)
* Add `modalStatus` and `resultMessage` states to manage `ConfirmModal` state tracking.
* Update `handleConfirm` to transition through `processing`, `success`, and `error` states.
* Bind `status`, `isProcessing`, and `resultMessage` props on `<ConfirmModal />`.
* Update closing handler to reset modal status states.

---

### Feature Pages

---

#### [MODIFY] [CourseDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/CourseDetails.jsx)
* Return mutation promise in `handleStatusToggle` callback.

---

#### [MODIFY] [PackageDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/PackageDetails.jsx)
* Return mutation promise in `handleStatusToggle` callback.

---

#### [MODIFY] [BatchProfile.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/BatchProfile.jsx)
* Return mutation promise in `handleStatusToggle` callback.
