---
Date: 2026-06-11T18:30:00+05:30
Status: Approved-Completed
---

# Multi-Delete Feature for Course Categories

This plan outlines adding multi-select checkboxes, a floating selection action bar, and a bulk deletion confirmation process to the Course Categories page ([CourseTypes.jsx](file:///e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CourseTypes.jsx)).

## Proposed Changes

### Course Categories View

#### [MODIFY] [CourseTypes.jsx](file:///e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CourseTypes.jsx)
- Import `useSelection` hook from `src/hooks/useSelection`.
- Import `useDeleteManyMutation` hook from `src/hooks/useDeleteManyMutation`.
- Import `SelectionActionBar` from `src/components/ui/v2/SelectionActionBar`.
- Initialize selection state with `useSelection()`.
- Set up bulk deletion mutation using `useDeleteManyMutation('CourseType', [queryKeys.course.type.all])`.
- Modify columns definition to include a checkbox header (for select-all) and checkbox cell (for row selection) as the first column.
- Update `ConfirmModal` triggers and `onConfirm` handler to support both single and bulk deletion modes.
- Display `SelectionActionBar` at the bottom of the page when categories are selected.

## Verification Plan

## Manual Verification
- Navigate to `/admin/courses/types` in the browser.
- Verify that checkboxes are rendered on each category row and in the table header.
- Select one or more categories and check that the floating action bar slides up from the bottom showing the correct count.
- Click "Delete Selected", confirm inside the modal, and verify that all selected items are removed from the database and the table is refreshed.
