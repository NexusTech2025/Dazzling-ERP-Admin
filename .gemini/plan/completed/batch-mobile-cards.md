---
Date: 2026-06-16T04:07:00+05:30
Status: Approved-Completed
---

# Responsive Mobile View with Low-Density Cards for Batches

We will add a responsive mobile-first view for the Batch Directory. On desktop viewports, the tabular `DataTable` will remain visible. On mobile viewports, the table is hidden and replaced by a vertical stack of compact low-density cards (`BatchCardV2` in `low` density mode) showing crucial fields (Batch Name, Teacher, Days as pills, Course, and Timings) without information labels to save space.

## Proposed Changes

### Batch Component Layer

#### [MODIFY] [BatchCardV2.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchCardV2.jsx)
- Refactor the `density === 'low'` block:
  - Exclude `capacity` completely from the rendering.
  - Set `avatarText` to a 2-character batch initials string derived from the batch name, or support checkbox rendering if `isSelected` and `selectionActive` are passed.
  - Display the teacher's name as `subtitle1` (no labels).
  - Render days of week as small rounded tags/badges in `subtitle2`.
  - Display the `course_name` and scheduled start/end times inside the `bodyText` slot.
  - Connect actions (`onView`, `onEdit`, `onDelete`) to the card's action trigger menu.

#### [MODIFY] [Batches.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/Batches.jsx)
- Wrap the main `<DataTable>` inside a `hidden md:block` desktop layout container.
- Implement a mobile-only layout block (`md:hidden`):
  - Render the standard title, filters, and controls.
  - Render a vertical list container mapping over `filteredBatches`.
  - For each batch, render `<BatchCardV2 density="low" />` mapping details and action handlers.
  - Support selection triggers on card tapping or checkbox click in mobile view.

---

## Verification Plan

### Manual Verification
1. **Desktop Viewport**: Verify that the desktop layout remains unchanged, continuing to render the tabular `DataTable`.
2. **Mobile Viewport**: Resize the browser window to mobile width. Verify that the table disappears and is replaced by a vertical listing of low-density cards.
3. **Card Contents**: Verify that each card displays the Batch Name, Status Pill, Teacher name, Day Pills, Course Name, and Time Slot with no redundant field labels.
4. **Actions & Selection**: Test opening the action menu on the card, and selecting cards to toggle the floating Selection Action Bar.
