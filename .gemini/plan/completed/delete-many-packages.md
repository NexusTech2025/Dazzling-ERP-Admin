---
Date: 2026-06-06T13:40:00+05:30
Status: Approved-Completed
---

# Generic SelectMany & DeleteMany Package Management

Add bulk record deletion ("delete many") capabilities to the admin packages list. We will construct a generic, decoupled selection and bulk-deletion structure (hooks and UI components) that can be easily repurposed for any list view in the system (Batches, Teachers, Students, etc.).

## User Review Required

> [!IMPORTANT]
> **Generic Decoupled Infrastructure**
> * **`useSelection` hook**: Manages array-based selected IDs, indeterminate select-all checkbox logic, and range clear states.
> * **`useDeleteManyMutation` query hook**: Generically handles TanStack Query bulk delete calls (`data_delete_many` action) for any database table and invalidates corresponding cache tags.
> * **`SelectionActionBar` component**: A sleek, dark-theme floating slate bar with glassmorphism that slides up at the bottom of the viewport when `selectedCount > 0`, displaying action buttons for both "Delete Selected" and "Delete All".

> [!WARNING]
> **Delete All vs. Delete Selected Confirmation**
> * "Delete Selected" deletes only the items currently checked by the user.
> * "Delete All" will prompt confirmation to delete *all* records matching the current list.
> * Since bulk deletions trigger cascading constraints (e.g. packages cannot be deleted if active student enrollments exist), we will parse and present the backend's returned manifest in the confirmation modal so the user gets detailed feedback on success vs. failed exclusions (blocked items).

## Proposed Changes

### 1. API Integration Layer
#### [MODIFY] [apiRegistry.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/services/apiRegistry.js)
* Register `DELETE_MANY: 'data_delete_many'` under the `DATA` namespace.

---

### 2. Generic Selection Hooks & Components
#### [NEW] [useSelection.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/hooks/useSelection.js)
* Build a custom hook tracking a list of selected record IDs.
* Expose:
  * `selectedIds`: Array of selected IDs.
  * `toggleSelect(id)`: Add/remove an item ID.
  * `toggleSelectAll(allIds)`: Check all or clear all.
  * `clearSelection()`: Reset selection.
  * `isAllSelected(allIds)`: True if allIds are in selectedIds.
  * `isSomeSelected(allIds)`: True if some (but not all) allIds are in selectedIds (for indeterminate checkbox state).

#### [NEW] [useDeleteManyMutation.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/hooks/useDeleteManyMutation.js)
* React Query mutation hook that takes table name and cache query keys to invalidate.
* Inside mutation function:
  ```javascript
  executeAction(API_REGISTRY.DATA.DELETE_MANY, {
    table: tableName,
    ids: targetIds,
    dryRun: false
  }, token)
  ```

#### [NEW] [SelectionActionBar.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/SelectionActionBar.jsx)
* Render a floating bar aligned at the bottom of the list view screen.
* Styled in premium dark-slate glassmorphism (`bg-slate-900/90 backdrop-blur border border-slate-800 text-white`).
* Props:
  * `selectedCount`: number of selected items.
  * `onClear`: callback to clear selections.
  * `onDeleteSelected`: callback to delete only selected ids.
  * `onDeleteAll`: callback to delete all packages in the active catalog list.

---

### 3. Curriculum / Packages Integration
#### [MODIFY] [PackageCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/components/PackageCard.jsx)
* Add `isSelected`, `onToggleSelect`, and `isSelectionModeActive` props.
* Render a checkbox overlay in the top-left of the card.
* Apply subtle ring styling when selected.

#### [MODIFY] [Courses.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/Courses.jsx)
* Wire up `useSelection` for managing selected package IDs.
* Wire up `useDeleteManyMutation('Package', [queryKeys.course.package.all, queryKeys.course.packageItem.all, queryKeys.course.packagePerk.all])`.
* Grid view: pass selection states to `PackageCard` mappings.
* List view: prepend a checkbox selection column to `packageColumns` dynamically.
* Modal: adjust `ConfirmModal` to support bulk deletion feedback, rendering messages for selected count or deletion failure summaries.
* Render `SelectionActionBar` at the bottom when packages are selected.

---

## Verification Plan

### Automated Tests
* None.

### Manual Verification
* **Selection Interface**:
  * Open `/admin/packages`.
  * In List Mode: Click the header select-all checkbox. Verify all packages are checked and checkbox indeterminate state triggers if some are manually unchecked.
  * In Grid Mode: Check/uncheck individual packages. Verify the bottom `SelectionActionBar` appears smoothly.
* **Bulk Delete Selected Flow**:
  * Select 2 packages. Click `Delete Selected` on the floating bar.
  * Confirm deletion in `ConfirmModal`. Verify the records are deleted, the cache is invalidated, and the list updates.
* **Delete All Flow**:
  * Select a package. Click `Delete All` on the floating bar.
  * Verify confirmation prompts for deletion of all packages.
* **Error / Cascade Manifest Check**:
  * Select a package with active student enrollments and attempt deletion.
  * Confirm the modal shows constraint error blocks returned in the API delete_many response.
