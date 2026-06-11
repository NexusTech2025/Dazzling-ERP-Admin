---
Date: 2026-05-27T17:42:00+05:30
Status: Approved-Completed
---

# Fix Course Filters in Courses.jsx

Fix the broken CourseType (segment), Medium, Board, and Class filters in [Courses.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx).

## Root Cause Analysis

1. **Hardcoded Segment IDs**: 
   The segment filter buttons hardcoded options like `SEG-ACA` (Academic), `SEG-CMP` (Computer), and `SEG-FND` (Foundation). However, in production, segment IDs are dynamically generated strings (e.g., `SEG-123456`). This caused all course-to-segment matches to fail, returning an empty list when any segment was selected.
2. **Hidden Academic Filters**:
   Because the academic filters (Medium, Board, Class) only rendered when `segmentFilter === 'SEG-ACA'`, and no course could ever have that hardcoded ID in production, the academic filters were rendered over an already empty list, rendering them useless.
3. **Broken Packages Segment Filter**:
   The package filtering logic also relied on checking `segmentFilter === 'SEG-ACA'`, causing package segmentation to fail under production segment IDs.

## Proposed Changes

### Course Feature Filtering Refactor

#### [MODIFY] [Courses.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx)
- Import `useCourseTypesQuery` to fetch real active categories from the database.
- Replace the hardcoded `segmentOptions` array with a dynamically computed `useMemo` list derived from `courseTypes`.
- Dynamically determine if the selected segment is "Academic" by checking if `selectedType.entity_label === 'Subject'` or if the segment name contains `'academic'`.
- Render the academic specialized filters based on this dynamic condition rather than the hardcoded `segmentFilter === 'SEG-ACA'`.
- Align package filtering logic to check this dynamic academic condition.

---

## Verification Plan

### Manual Verification
> [!NOTE]
> The user will perform manual testing to verify that selecting different segments (Academic, Computer, etc.) displays the correct courses and packages, and that selecting Medium, Board, or Class filters correctly subsets the list.
