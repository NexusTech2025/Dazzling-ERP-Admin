# Walkthrough - Generic SelectMany & DeleteMany Package Management

Implemented a generic, decoupled selection and bulk deletion architecture (hooks, mutations, and UI components) and integrated it into the Packages list/grid views in the curriculum manager.

## Changes Made

### 1. API Actions Registry
* **File**: [apiRegistry.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/services/apiRegistry.js)
* **Description**: Registered `DELETE_MANY: 'data_delete_many'` under the `DATA` namespace to connect frontend operations to the relational database engine's bulk deletion endpoint.

### 2. Reusable Decoupled Hooks & Components
* **File [NEW]**: [useSelection.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/hooks/useSelection.js)
  * Implemented an array-based selection tracker with helpers for single toggle, select-all toggle, clear, and indeterminate checkbox states.
* **File [NEW]**: [useDeleteManyMutation.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/hooks/useDeleteManyMutation.js)
  * Implemented a generic react-query mutation supporting the bulk deletion payload (`{ table, ids, dryRun: false }`) and invalidating lists of cache query keys.
* **File [NEW]**: [SelectionActionBar.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/SelectionActionBar.jsx)
  * Implemented a bottom-floating actions bar styled with dark slate glassmorphism and slide-in transition animations. Renders selection counts, a close/clear button, a `Delete Selected` action, and a secondary `Delete All` action.

### 3. Package Grid Card & Main View Integration
* **File**: [PackageCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/components/PackageCard.jsx)
  * Configured active border ring highlight states when checked.
  * Added a checkbox overlay in the visual header that scales/fades in on hover or when checked.
* **File**: [Courses.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/Courses.jsx)
  * Integrated `useSelection` and `useDeleteManyMutation` hooks.
  * Memoized `packageColumns` to dynamically prepend checkbox selection header/cells when rendering the packages `DataTable` list.
  * Rendered the floating `SelectionActionBar` at the bottom of the page when items are checked.
  * Configured `ConfirmModal` to intercept bulk deletions and display detailed summary results from the backend's constraint check manifest.

## Verification Details

* **Interactive Selection**: Checking checkboxes in either Grid mode (hover checkboxes) or List mode (DataTable column) successfully updates counts and floats the selection bar.
* **Indeterminate Checkbox**: Clicking select-all in the list header toggles all visible package rows, and manually unchecking one properly triggers the indeterminate header checkbox state.
* **Confirm Manifest Reports**: Deleting multiple packages initiates the query mutation. On success, the query cache is cleared, the floating bar fades out, and the modal presents count results.
