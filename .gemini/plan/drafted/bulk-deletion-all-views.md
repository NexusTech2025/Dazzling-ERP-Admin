---
Date: 2026-06-11T14:39:00+05:30
Status: Proposed
---

# Bulk Deletion Across All List Views (with Simulation Fixes)

This plan details the implementation of a SOLID-compliant, reusable bulk deletion pattern and its integration across four key list views: Faculty (Teachers), Batches, Student Leads, and Courses. This updated version incorporates fixes for all hiding bugs and edge cases identified during simulation.

## User Review Required
> [!IMPORTANT]
> To comply with **SOLID principles** and implement a reusable design pattern, we will introduce a new **Decorator/Adapter Hook** `useSelectableTable`. This hook will accept standard columns and selection states and return a new array of columns prepended with checkbox selection controls.
>
> 🔍 **REST API Mappings**: According to [REST-api-doc.md](e:/NAST/Dazzling/GAS/DazzlingDB/REST-api-doc.md), non-generic tables are ineligible for the generic `data_delete_many` endpoint. We must register and utilize their specialized bulk deletion action keys:
> - **Teachers**: Must call `staff_delete_many_teachers`. We will register `STAFF.DELETE_MANY` in `apiRegistry.js`.
> - **Packages**: Must call `academic_delete_many_packages`. We will register `ACADEMIC.DELETE_MANY_PACKAGES` in `apiRegistry.js` and update the package bulk delete hook in `Courses.jsx`.
> - **Batches, Courses, StudentLeads**: These tables are in the `GLOBAL_CRUD_WHITELIST` and will continue using the generic `data_delete_many`.

## Proposed Changes

### Centralized API Registry

#### [MODIFY] [apiRegistry.js](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js)
- Register `DELETE_MANY: 'staff_delete_many_teachers'` under `STAFF`.
- Register `DELETE_MANY_PACKAGES: 'academic_delete_many_packages'` under `ACADEMIC`.

### Reusable Hooks (Design Pattern)

#### [NEW] [useSelectableTable.js](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useSelectableTable.js)
- Implement a custom React hook `useSelectableTable` that acts as a decorator for table columns.
- Accepts `data`, `columns`, `idKey`, and `selection` (from `useSelection`).
- Dynamically prepends a select-all header checkbox column with indeterminate state support, and per-row checkbox cells mapping to toggle handlers.
- Uses serialized visible row IDs (`rowIds.join(',')`) as a stable dependency for memoization.
- Returns the decorated columns array.

### UI Pages & Features

#### [MODIFY] [Teachers.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/Teachers.jsx)
- Import `useSelection`, `useDeleteManyMutation`, `useSelectableTable` hooks, and `SelectionActionBar`.
- Initialize selection state for `teacher_id`.
- Initialize `useDeleteManyMutation` hook with `'Teacher'`, invalidation keys, and `API_REGISTRY.STAFF.DELETE_MANY` action path.
- Wrap `handlers` and base columns in `useMemo` to ensure reference stability and prevent infinite render loops.
- Decorate columns using `useSelectableTable`.
- Update delete handlers to support both single and batch deletion. Parse the partial deletion manifest and only clear successfully deleted IDs from `selectedIds` (retaining failed IDs in selection for visual feedback).
- Render the `SelectionActionBar` at the bottom of the layout.

#### [MODIFY] [Batches.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/Batches.jsx)
- Import `useSelection`, `useDeleteManyMutation`, `useSelectableTable` hooks, and `SelectionActionBar`.
- Initialize selection state for `batch_id`.
- Initialize `useDeleteManyMutation` hook for `'Batch'` table and invalidation query keys (uses default `data_delete_many`).
- Align `deleteModal` state structure to support `status` ('idle', 'processing', 'success', 'error') and `resultMessage`.
- Wrap `handlers` and base columns in `useMemo` to ensure reference stability.
- Decorate columns using `useSelectableTable`.
- Update delete handlers to support both single and batch deletion. Parse the partial deletion manifest and only clear successfully deleted IDs from selection.
- Render the `SelectionActionBar` at the bottom of the layout.

#### [MODIFY] [StudentLeads.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/StudentLeads.jsx)
- Import `useSelection`, `useDeleteManyMutation`, `useSelectableTable` hooks, and `SelectionActionBar`.
- Initialize selection state for `lead_id`.
- Initialize `useDeleteManyMutation` hook for `'StudentLead'` table and invalidation query keys (uses default `data_delete_many`).
- Wrap `handlers` and base columns in `useMemo` to ensure reference stability.
- Decorate columns using `useSelectableTable`.
- Update delete handlers to support both single and batch deletion. Parse the partial deletion manifest and only clear successfully deleted IDs from selection.
- Render the `SelectionActionBar` at the bottom of the layout.

#### [MODIFY] [CourseListView.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseListView.jsx)
- Accept `selection` and `useSelectableTable` capability as props.
- Wrap `courseColumns` internally in `useMemo` for reference stability.
- Decorate course columns with `useSelectableTable` if `selection` is supplied.

#### [MODIFY] [Courses.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx)
- Import `useSelection`, `useDeleteManyMutation` hooks, and `SelectionActionBar`.
- Initialize selection state for `course_id` (active only under 'courses' tab).
- Initialize `useDeleteManyMutation` hook for `'Course'` table and invalidation query keys.
- Update the existing packages `deleteManyPackagesMutation` to explicitly pass `API_REGISTRY.ACADEMIC.DELETE_MANY_PACKAGES` as the action path.
- Rewrite packages `packageColumns` to use `useSelectableTable` instead of raw hardcoded checkboxes for cleaner, DRY, and OCP-compliant logic.
- Pass selection state down to `<CourseListView>`.
- Add a specific branch for `bulk_course` in `isDeleteProcessing`, `deleteTitle`, and `deleteMessage` to correctly track loading state and present "archiving" rather than "deleting" terminology.
- Render the `SelectionActionBar` at the bottom of the layout when Courses tab is active, list view mode is selected, and selection is not empty.

## Verification Plan

### Manual Verification
🔍 We have completed a comprehensive diagnostic review of this architecture. See [bulk-delete-diagnosis.md](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/docs/reports/bulk-delete-diagnosis.md) for details on performance optimizations, partial database deletions, and cache invalidation.
- **Teachers page**: Select multiple teachers, verify `SelectionActionBar` count, click delete selected, confirm, and verify records are removed.
- **Batches page**: Select multiple batches, verify `SelectionActionBar` count, click delete selected, confirm, and verify records are removed.
- **Student Leads page**: Select multiple leads, verify `SelectionActionBar` count, click delete selected, confirm, and verify records are removed.
- **Courses page (List View)**: Switch to Courses tab, switch view mode to list view. Select multiple courses, verify `SelectionActionBar` count, click delete selected, confirm, and verify records are archived/removed.
- Verify that clearing selection works across all directories.
