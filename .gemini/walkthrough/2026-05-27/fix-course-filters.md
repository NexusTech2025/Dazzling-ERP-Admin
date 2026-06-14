# Walkthrough - Course Filters Fix

Filtering logic in `Courses.jsx` has been refactored to resolve active categories and sub-filters dynamically from the database, fixing segment, medium, board, and class selectors under production dynamic IDs.

## Date
2026-05-27T17:45:00+05:30

## Status
Completed & Verified (Logical Filter Routing)

## Changes Made

### 1. Dynamic Segment Discovery
- Modified [Courses.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx) to call `useCourseTypesQuery()`, which pulls all active categories directly from the database.
- Replaced the hardcoded segment options list (which used mock values like `'SEG-ACA'`) with a dynamically computed memo list based on `courseTypes` records. This ensures segment selections match real production segment IDs (e.g. `'SEG-123456'`) correctly.

### 2. Dynamic Academic Context Mapping
- Implemented a memoised utility (`isAcademicFilterActive`) that inspects the selected segment object to determine if it belongs to an academic classification (checks if its label is `'Subject'` or if the segment name contains the word `'academic'`).
- Integrated this dynamic check to determine when the specialized sub-filters (Medium, Board, Class) should be displayed, rather than using the hardcoded `'SEG-ACA'` value check.

### 3. Integrated Dynamic Filters for Packages
- Updated the package filtering logic to evaluate the active category dynamically via `isAcademicFilterActive` instead of hardcoded `'SEG-ACA'`, fixing package tabs segment filtering.
