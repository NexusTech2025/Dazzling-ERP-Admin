---
Date: 2026-06-13T20:59:00+05:30
Status: Verified
---

# Slot-Based Style Override and Spacing Customization Walkthrough

Successfully implemented a unified slot-based customization pattern (`slotClasses`) across all card layouts (`LowDensityCard`, `MediumDensityCard`, and `HighDensityCard`) and forwarded it cleanly inside `TeacherCard`. This provides infinite layout control and spacing override capabilities using standard Tailwind CSS classes while preserving style consistency.

## Changes Made

### 1. Spacing and Styling Class Merger Utility
- File: [cardUtils.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/cards/cardUtils.js)
- Created the helper `mergeSlotClasses` function.
- It groups conflicting layout rules (e.g. padding `p-`, margin `m-`, gap `gap-`, height `h-` or `min-h-`, width `w-` or `min-w-`). When a custom override is passed in `slotClasses` (or `className`), it automatically strips the default classes of the same group prefix from the component, avoiding layout/spacing conflicts.

### 2. Multi-Density Card Refactoring
- **`LowDensityCard.jsx`**:
  - Added support for `slotClasses = {}`.
  - Configured overrides for `container`, `avatar`, `title`, `subtitle1`, `subtitle2`, `body`, and `actions`.
- **`MediumDensityCard.jsx`**:
  - Added support for `slotClasses = {}`.
  - Configured overrides for `container`, `header`, `avatar`, `title`, `subtitle`, `badge`, `body`, and `footer`.
  - Grouped tags, metrics, and progress elements inside a semantic body slot container to allow vertical gap customization.
- **`HighDensityCard.jsx`**:
  - Added support for `slotClasses = {}`.
  - Configured overrides for `container`, `header`, `avatar`, `title`, `subtitle`, `body`, `metricsGrid`, `metricItem`, `description`, `checklist`, `progress`, and `footer`.

### 3. Sibling Component Integration
- File: [TeacherCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherCard.jsx)
- Added the `slotClasses` configuration prop and forwarded it to the underlying `LowDensityCard`, `MediumDensityCard`, and `HighDensityCard` rendering slots.
- Fixed the `className` prop merging so that height classes (e.g., `min-h-[165px]` on `MediumDensityCard`) correctly override the default `min-h-[190px]`, shrinking the card to its content and removing extra blank space at the bottom.

## Verification Details
- Confirmed that standard components export correctly in [index.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/cards/index.js).
- Verified that all layouts compile cleanly without console regressions or layout shifts.
