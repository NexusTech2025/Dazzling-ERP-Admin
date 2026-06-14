# Restructured Low Density Card Layout Walkthrough

This walkthrough outlines the layout restructuring of the `LowDensityCard` component and its integration across the main entity components to support a 3-tier vertical typography stack, custom body text on the right, and responsive actions that collapse into a dropdown menu on mobile device screen widths.

---

## Metadata
* **Date**: 2026-06-13T14:55:00+05:30
* **Status**: Completed, Verified

---

## Changes Implemented

### 1. Card Layout and Containers

* **[CardContainer.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/cards/CardContainer.jsx)**:
  - Added the `@container` class to the outer wrapper `div` to enable CSS container queries on child elements.
  - Retained `overflowVisible` boolean prop logic.

* **[LowDensityCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/cards/LowDensityCard.jsx)**:
  - Enforced strict horizontal column layout ratios: Left side (`w-[60%]`), Middle side (`w-[30%]`), and Right side (`w-[10%]`).
  - Added action priority sorting:
    - Sorts the `actions` array using a weight mapping: `primary` (1), `secondary` (2), `tertiary` (3).
    - Guarantees action triggers render in consistent order (most important action leftmost on desktop, and topmost in the dropdown list).
  - Swapped viewport media queries with CSS Container Queries:
    - Side-by-side action buttons display only when the card width is at least `512px` (using `@lg:flex`).
    - Actions collapse to a single three-dot dropdown menu trigger when the card width is less than `512px` (using `@lg:hidden`).
  - Unified shape: Modified icon container class to use `rounded-full` instead of `rounded-lg sm:rounded-xl`, ensuring consistent circular layouts across avatars, initials, and symbols.
  - **Sizing Constraints Fix**: Enforced height parameters (`min-h-[36px] max-h-[36px] sm:min-h-[44px] sm:max-h-[44px]`) on the avatar image, initials container, and icon wrappers. This prevents browser layout engines from stretching the height of circular containers and guarantees perfectly symmetrical, rounded-circle boxes.
  - Applied strict constraints to button wrappers (`min-w-[28px] max-w-[28px] min-h-[28px] max-h-[28px]`).

### 2. Entity Adapter Alignments & Action Priorities

Restructured all entity adapters to provide explicit `priority: 'primary' | 'secondary' | 'tertiary'` details for their low-density action lists:

* **[StudentCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/components/StudentCard.jsx)**:
  - Message: `priority: 'primary'`
  - Edit: `priority: 'secondary'`
  - History: `priority: 'tertiary'`

* **[TeacherCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherCard.jsx)**:
  - Message: `priority: 'primary'`
  - Edit: `priority: 'secondary'`
  - History: `priority: 'tertiary'`

* **[CourseCardV2.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/components/CourseCardV2.jsx)**:
  - Assign Task: `priority: 'primary'`
  - Edit Course: `priority: 'secondary'`

* **[BatchCardV2.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchCardV2.jsx)**:
  - View Roster: `priority: 'primary'`
  - Schedule: `priority: 'secondary'`

* **[FinanceCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/components/FinanceCard.jsx)**:
  - Message/Receipt: `priority: 'primary'`
  - Refund: `priority: 'secondary'`

---

## Verification Results

### CSS Container Breakpoints and Overflow
- Verified that cards inside layout grid columns (with widths less than 512px) collapse actions into the three-dot button automatically, even on widescreen desktop monitors.
- Verified action buttons display in correct priority order (Primary first).
- Verified icons, initials, and images are perfect circles (`rounded-full`) and sit symmetrically within the card's leftmost slot.
