---
Date: 2026-07-07T19:47:00+05:30
Status: Proposed
---

# Implementation Plan - Optimizing the UI 9: Batch Views

This plan details the UI optimizations, rendering performance improvements, and standardized component integrations for the Batch list view (`Batches.jsx`), Batch detailed view (`BatchProfile.jsx`), and `BatchForm.jsx` / related components.

---

## 1. Non-Domain Driven Infrastructure Rules

### Rule N1: Explicit Positional Signatures & Execution Blueprints

#### Component: `Batches`
* **Path Reference:** `src/features/batch/Batches.jsx`
```javascript
/**
 * Batches list view rendering all batch tables and query/search layouts.
 * Integrates DataTable and SelectionActionBar.
 * @returns {React.ReactElement} The rendered Batches directory component tree.
 */
const Batches = () => {
  // Logic detailed below in Proposed Changes...
};
```

#### Component: `BatchProfile`
* **Path Reference:** `src/pages/admin/BatchProfile.jsx`
```javascript
/**
 * BatchProfile functional component representing the detailed view of a batch.
 * Derives active tab state from URL params to maintain a single source of truth.
 * Supports switching view modes (mobile-optimized vs desktop grids).
 * @returns {React.ReactElement} The rendered BatchProfile component tree.
 */
const BatchProfile = () => {
  // Logic detailed below in Proposed Changes...
};
```

#### Component: `BatchForm`
* **Path Reference:** `src/features/batch/components/BatchForm.jsx`
```javascript
/**
 * BatchForm component for creating or editing batch details.
 * Integrates standard FormField and inputs with validation.
 * @param {Object} props - Component properties.
 * @param {Object} [props.initialData] - Initial batch data for editing.
 * @param {function} props.onSubmit - Submission callback handler.
 * @param {function} props.onCancel - Cancellation handler.
 * @param {boolean} [props.isSubmitting] - Submitting status flag.
 * @param {Object} [props.error] - Backend error object.
 * @returns {React.ReactElement} The rendered BatchForm component.
 */
const BatchForm = ({ initialData, onSubmit, onCancel, isSubmitting, error }) => {
  // Logic detailed below in Proposed Changes...
};
```

---

### Rule N2: Absolute Background Base Knowledge Traceability

* **Referenced Core Modules & Rules:**
  * [Batches.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/Batches.jsx)
  * [BatchProfile.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/BatchProfile.jsx)
  * [BatchForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx)
  * [zero-new-ui-components-policy.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/rules/zero-new-ui-components-policy.md)
  * [GEMINI.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/rules/GEMINI.md)

---

### Rule N3: Explicit Fact vs. Assumption Boundary Declaration

#### Actual Verified Facts:
1. `BatchProfile.jsx` uses localized `useState` for tabs, which triggers redundant renders and clears tab selections upon page reloads.
2. `BatchProfile.jsx` uses custom nav elements for breadcrumbs instead of the `<Breadcrumbs>` component.
3. `Batches.jsx` uses manual filters and action bars that should align with modern V2 patterns.
4. `BatchForm.jsx` includes custom styling and form fields that need to conform strictly to the V2 inputs standard (`FormField`, `TextInput`, `SelectInput`, `Button`).

#### System Assumptions:
1. Standard components in `src/components/ui/v2` are fully functional and ready to be integrated without side-effects.

---

### Rule N4: GAS Execution Boundary & Round-Trip Round Up

> [!NOTE]
> This is a pure front-end UI styling, layout, and client-side performance optimization. There are no backend loops or Apps Script read/write operations introduced.

---

### Rule N5: Performance Regression & Benchmark Assertions

* **Metric Formula:** `T(n) = O(1) rendering time` for tab changes by using query parameters and rendering tab panels via hidden/block CSS layers instead of complete unmounting/re-mounting switch states.

---

### Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
> * **Technical Path Endpoint:** `src/pages/admin/BatchProfile.jsx` (Switch-case tab content rendering)
> * **Core Technical Debt Risk:** Re-rendering components from scratch on tab clicks loses form inputs or table scroll states.
> * **Remediation Option:** Migrate from conditional unmounting to a map/registry structure that controls tab visibility using CSS visibility classes.

---

## Proposed Changes

### Batch Directory & List View

#### [MODIFY] [Batches.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/Batches.jsx)
* Replace plain layout actions and buttons with `<Button>` from the component registry.
* Clean up layout structure, ensuring consistent padding, title alignments, and spacing using the centralized guidelines.

---

### Batch Detailed Profile

#### [MODIFY] [BatchProfile.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/BatchProfile.jsx)
* Import and integrate `<Breadcrumbs>` from `src/components/ui/Breadcrumbs`.
* Replace `activeTab` local state with `useSearchParams` synchronization.
* Replace switch-case rendering in `renderTabContent()` with a tab registry utilizing hidden/block classes to preserve component states across navigation toggles.

---

### Batch Form & Inputs

#### [MODIFY] [BatchForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx)
* Audit and replace any raw inputs or old input layouts with standard atomic components from `src/components/ui/v2/` (`FormField`, `TextInput`, `SelectInput`, `Button`).
* Ensure validation indicators, labels, and helper descriptions match the dark-mode slate theme.

---

## Verification Plan

### Manual Verification
1. Navigate to `/admin/batches` and verify search, filters, and layout responsiveness.
2. Click on a batch to view details, verify tab transitions update URL parameters (`?tab=Overview`, `?tab=Students`, `?tab=Attendance`).
3. Confirm that tab switches don't reset standard states, and breadcrumbs function properly.
4. Try editing/creating a batch, checking that `BatchForm` fields render correctly without visual defects.
