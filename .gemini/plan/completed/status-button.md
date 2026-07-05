---
Date: 2026-07-05T18:30:00+05:30
Status: Approved-Completed
---

# Implementation Plan - StatusButton Component Integration

This plan details the implementation of a reusable `StatusButton` component under `src/components/ui/v2/StatusButton.jsx` to flip entities between active and inactive states.

---

## 1. Non-Domain Driven Infrastructure Rules

### Rule N1: Explicit Positional Signatures & Execution Blueprints

#### Component: `StatusButton`
* **Path Reference:** `src/components/ui/v2/StatusButton.jsx`
```javascript
/**
 * StatusButton: Reusable toggler that displays activation state and prompts the user via ConfirmModal before mutations.
 * @param {Object} props - Component properties.
 * @param {string} props.currentStatus - The current status value of the record.
 * @param {string} props.entityName - Name of the entity type (e.g. "Student", "Teacher").
 * @param {function} props.onStatusToggle - Callback function invoked upon state confirm.
 * @param {boolean} [props.isLoading=false] - In-flight loading status.
 * @returns {React.ReactElement} Status toggler button and modal fragments.
 */
const StatusButton = ({ currentStatus, entityName, onStatusToggle, isLoading, ...buttonProps }) => {
  // Details in Proposed Changes...
};
```

---

## Proposed Changes

### UI Components

---

#### [NEW] [StatusButton.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/StatusButton.jsx)
* Build the component utilizing V2 `Button` and `ConfirmModal` primitives.
* Handle click event isolation and propagation block.
* Renders a small button (size="sm").
* Displays success (green) variant when active, prompting to deactivate.
* Displays danger (red) variant when inactive, prompting to activate.
* Include prop types validation.
