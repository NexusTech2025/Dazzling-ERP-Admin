---
Date: 2026-06-13T14:47:00+05:30
Status: Proposed
---

# Restructuring Low Density Card: Container Queries & Action Priority Rules

Refining the `LowDensityCard` layout to strictly allocate horizontal proportions of 60% for the left-most content stack, 30% for the middle bodyText stack, and 10% for the right actions stack. To prevent action icons from overflowing the 10% boundary on narrow cards, we will use Tailwind v4 CSS Container Queries (`@container`, `@lg:flex`, `@lg:hidden`) to collapse actions into a single three-dot dropdown menu whenever the card's container width is below `512px` (@lg).

Additionally, to ensure important buttons are positioned first, we will explicitly define a `priority: 'primary' | 'secondary' | 'tertiary'` field on action objects and sort them dynamically inside `LowDensityCard.jsx` before rendering.

## User Review Required

> [!IMPORTANT]
> **Container Query & Priority Rules**:
> - We will add `@container` to the base `CardContainer` wrapper.
> - Actions list will collapse to a single three-dot dropdown when the card's width is less than `512px` (using Tailwind `@lg:flex` and `@lg:hidden`).
> - Action objects will include a `priority` attribute (`'primary'`, `'secondary'`, or `'tertiary'`).
> - `LowDensityCard.jsx` will sort actions by priority weight (`primary` = 1, `secondary` = 2, `tertiary` = 3) so they render left-to-right (Primary first) and top-to-bottom in the dropdown menu.
> - Icon containers will be styled as perfect circles (`rounded-full`) to match the visual styling of avatars and initials containers.

## Proposed Changes

### Reusable UI Card Refactoring

#### [MODIFY] [CardContainer.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/cards/CardContainer.jsx)
*   Add `@container` class to the outer card wrapper `div`.

#### [MODIFY] [LowDensityCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/cards/LowDensityCard.jsx)
*   **Proportions**: Enforce strict `w-[60%]`, `w-[30%]`, and `w-[10%]` widths.
*   **Sorting Actions by Priority**:
    *   Sort incoming `actions` array using a priority weight map:
        ```javascript
        const priorityOrder = { primary: 1, secondary: 2, tertiary: 3 };
        const sortedActions = [...actions].sort((a, b) => {
          const wA = priorityOrder[a.priority] || 99;
          const wB = priorityOrder[b.priority] || 99;
          return wA - wB;
        });
        ```
*   **Container Query Collapsing**:
    *   Change side-by-side actions trigger to: `hidden @lg:flex` (using the sorted actions list).
    *   Change dropdown menu trigger to: `@lg:hidden`.
*   **Defined Sizing Constraints**:
    *   Avatar / Text Initials / Icons: Mobile `min-w-[36px] max-w-[36px] w-9 h-9`, Desktop `sm:min-w-[44px] sm:max-w-[44px] sm:w-11 sm:h-11`.
    *   Shape: All icons, avatars, and initials containers must use a perfect circular shape (`rounded-full`) to maintain visual uniformity. Centering must be handled via flex properties with no uneven paddings.
    *   Action Button wrappers: `min-w-[28px] max-w-[28px] min-h-[28px] max-h-[28px]`.

---

### Domain Card Adapters

#### [MODIFY] [StudentCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/components/StudentCard.jsx)
*   Update `actions` array to define priority names:
    *   Message: `priority: 'primary'`
    *   Edit: `priority: 'secondary'`
    *   History: `priority: 'tertiary'`

#### [MODIFY] [TeacherCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherCard.jsx)
*   Update `actions` array to define priority names:
    *   Message: `priority: 'primary'`
    *   Edit: `priority: 'secondary'`
    *   History: `priority: 'tertiary'`

#### [MODIFY] [CourseCardV2.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/components/CourseCardV2.jsx)
*   Update `actions` array to define priority names:
    *   Assign Task: `priority: 'primary'`
    *   Edit Course: `priority: 'secondary'`

#### [MODIFY] [BatchCardV2.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchCardV2.jsx)
*   Update `actions` array to define priority names:
    *   View Roster: `priority: 'primary'`
    *   Schedule: `priority: 'secondary'`

#### [MODIFY] [FinanceCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/components/FinanceCard.jsx)
*   Update `actions` array to define priority names:
    *   Receipt: `priority: 'primary'`
    *   Refund: `priority: 'secondary'`

---

## Wireframe Layouts

### 1. General Card Structure (60% / 30% / 10%)
```
+--------------------------------------------------------------------------------------------------------+
| LEFT SLOT (60%)                      | MIDDLE SLOT (30%)                     | RIGHT SLOT (10%)        |
| [Icon/Avatar]  Title (text-sm)       | Stacked Custom Body Text              | Sorted Action items:    |
|                Subtitle1 (font-mono) | (e.g. badges, phone numbers)          | - @lg: [P] [S] [T]      |
|                Subtitle2 (text-xs)   | - wraps and breaks long words         | - < @lg: dropdown       |
+--------------------------------------------------------------------------------------------------------+
```
*\*P = Primary, S = Secondary, T = Tertiary*

---

## Verification Plan

### Manual Verification
*   Open `/admin/test-pages/cards` in your browser.
*   Assert actions are ordered consistently: Primary action first (leftmost on desktop, top of list in dropdown).
*   Verify cards collapse dynamically at card width < 512px.
