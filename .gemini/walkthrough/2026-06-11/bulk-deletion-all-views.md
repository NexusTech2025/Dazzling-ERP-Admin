# Walkthrough: Bulk Deletion Across All List Views

- **Date**: 2026-06-11T14:41:00+05:30
- **Status**: Completed

This walkthrough documents the implemented changes for the unified, SOLID-compliant bulk deletion feature across the admin directories.

---

## 🛠️ Changes Implemented

### 1. Centralized API Registry Updates
- Registered specialized bulk actions in [apiRegistry.js](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js):
  - `STAFF.DELETE_MANY` maps to `'staff_delete_many_teachers'`
  - `ACADEMIC.DELETE_MANY_PACKAGES` maps to `'academic_delete_many_packages'`

### 2. Columns Decorator/Adapter Pattern
- Created [useSelectableTable.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useSelectableTable.jsx):
  - Dynamically prepends selection checkbox columns to any standard configuration.
  - Implements the select-all header checkbox with an indeterminate status ref.
  - Memoizes column definitions using serialized visible row IDs to ensure reference stability.
  - Standardized as `.jsx` to support embedded React/HTML tags correctly.

### 3. Teachers (Faculty) Integration
- Updated [Teachers.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/Teachers.jsx):
  - Integrated `useSelection`, `useDeleteManyMutation` (targeting specialized `'staff_delete_many_teachers'`), and `useSelectableTable`.
  - Memoized column generators and handlers to prevent infinite render loops.
  - Updated deletion handling to clear only successfully deleted IDs on partial success.
  - Rendered `SelectionActionBar` at the bottom of the table.

### 4. Batches Integration
- Updated [Batches.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/Batches.jsx):
  - Integrated `useSelection`, `useDeleteManyMutation` (generic `data_delete_many` on `'Batch'`), and `useSelectableTable`.
  - Aligned delete modal structure with error/status reporting.
  - Updated deletion handlers to handle partial success manifests.

### 5. Student Leads Integration
- Updated [StudentLeads.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/StudentLeads.jsx):
  - Integrated hooks to enable row selection, generic bulk deletes, and floating selection bar actions.

### 6. Courses & Packages Integration
- Updated [CourseListView.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseListView.jsx):
  - Added optional `selection` prop compatibility to dynamically inject selection columns.
- Updated [Courses.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx):
  - Instantiated generic bulk deletion for courses (`deleteManyCoursesMutation`).
  - Updated the existing packages delete mutation hook to pass the specialized `'academic_delete_many_packages'` action path.
  - Refactored Packages list view columns to use the DRY `useSelectableTable` hook.
  - Added specific wording/loading state mappings for `bulk_course` archiving actions.

---

## 🔍 Verification & Testing Results

- **Reference Stability**: Confirmed that columns and handlers do not trigger infinite re-renders.
- **UI State Coordination**: Verified that selecting items, switching views (e.g. List to Grid in Courses), or switching tabs correctly updates or hides the floating selection bar.
- **Relational Constraints**: Verified that partial deletion success reports are processed correctly and failed records remain selected for direct user visibility.
