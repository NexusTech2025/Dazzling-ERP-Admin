---
Date: 2026-06-01T22:20:00+05:30
Status: Proposed
---

# API Error Popup Modal Implementation Plan

This plan details the creation and integration of a premium, custom `APIErrorModal` component to replace browser-default alerts with aesthetic modal overlays.

## User Review Required

> [!WARNING]
> **Premium Features**
> * **Adaptive Theme**: Renders beautifully in both dark and light modes, aligning with the slate-dark styling guidelines.
> * **Interactive Debugging**: Includes a collapsible monospace detail viewer for stack traces or relational details.
> * **One-Click Copy**: Offers a "Copy Details" button with a dynamic inline status indicator ("Copied!") to aid technical diagnostics.
> * **Unified Integration**: Replaces standard window alerts in `StudentRegistrationWizard.jsx` during registration submissions.

## Proposed Changes

---

### UI Components Layer

#### [NEW] [APIErrorModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/APIErrorModal.jsx)
* Build the custom error popup component:
  - Props: `isOpen`, `onClose`, `title`, `error` (object with type/message/details), `onRetry`.
  - Design: Glassmorphic slate layout, pulsing warning icon container, mono tags for system error codes, and smooth entry transitions.
  - Clipboard utility with inline state confirmation for copy logs.

---

### Student Registration Wizard Integration

#### [MODIFY] [StudentRegistrationWizard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/StudentRegistrationWizard.jsx)
* **Modal Trigger State**:
  - Add `errorModal` state object `{ isOpen: false, title: '', error: null }`.
* **API Mutation Callback Refactoring**:
  - Replace the registration `onError` alert hook with `setErrorModal({ isOpen: true, title: 'Registration Failed', error })`.
  - Replace the registration `onSuccess` failure alert hook with `setErrorModal({ isOpen: true, title: 'Server Error', error: { message: response.message } })`.
* **Rendering**:
  - Render the `<APIErrorModal>` at the bottom of the JSX template.

---

## Verification Plan

### Automated Verification
* Verify component compiling and react render integrity.

### Manual Verification
* Run the registration flow, enter invalid parameters or trigger a mockup request failure (e.g., temporary disconnection), click submit, and verify the modal overlays correctly, can copy logs, and can be dismissed.
