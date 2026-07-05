---
Date: 2026-07-05T19:50:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Course Card Medium Density Design Alignment

This plan details refactoring `MediumDensityCard` and `CourseCardV2` (specifically for its `medium` density mode) to match the redesigned mockup assets.

---

## 1. Non-Domain Driven Infrastructure Rules

### Rule N1: Explicit Positional Signatures & Execution Blueprints

#### Component: `MediumDensityCard` Props Extension
* **Path Reference:** `src/components/ui/v2/cards/MediumDensityCard.jsx`
```javascript
/**
 * MediumDensityCard: Extended card layout with customized metrics rows and header actions.
 * @param {React.ReactNode} [props.headerAction] - Far-right header element (e.g., dropdowns, badges).
 * @param {string} [props.metricsLayout="grid"] - Layout of the metrics section ("grid" | "row").
 */
```

#### Component: `CourseCardV2` Menu Refactoring
* **Path Reference:** `src/features/course/components/CourseCardV2.jsx`
```javascript
// Local dropdown triggers for onDelete and custom context actions.
```

---

### Rule N2: Absolute Background Base Knowledge Traceability

* **Referenced Design Runbooks:**
  * [MediumDensityCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/cards/MediumDensityCard.jsx)
  * [CourseCardV2.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseCardV2.jsx)

---

### Rule N3: Explicit Fact vs. Assumption Boundary Declaration

#### Actual Verified Facts:
1. `CourseCardV2` medium density layout has `Edit` and `Details` buttons.
2. LowDensityCard has a three-dot dropdown action menu with click outside ref checks.

#### System Assumptions:
1. Moving `Delete` to the three-dot option is desired for all densities or specifically for the redesigned medium density view.

---

## Proposed Changes

### UI Components

---

#### [NEW] [HorizontalStatMetrics.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/cards/HorizontalStatMetrics.jsx)
* Created reusable stat columns component with vertical dividers.

---

#### [MODIFY] [index.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/cards/index.js)
* Exported `HorizontalStatMetrics`.

---

#### [MODIFY] [MediumDensityCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/cards/MediumDensityCard.jsx)
* Added `headerAction` and `metricsLayout` props.
* Rendered `headerAction` in header next to badge or trend.
* Supported `metricsLayout === 'row'` to split metrics into a 3-column row with thin vertical dividers, placing value on top (with icon) and label below.

---

#### [MODIFY] [CourseCardV2.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseCardV2.jsx)
* Added local state for options dropdown: `showMenu` and `menuRef` ref handler.
* Under `density === 'medium'`:
  * Mapped metrics into a 3-column row (Fee, Duration, Chapters).
  * Rendered tag capsules for CBS/English.
  * In the footer slot:
    * Rendered outlined `Edit`, `Analytics`, and `Details` buttons.
    * Rendered the options `⋮` button on the far right.
    * Triggered a dropdown overlay containing `Delete` action when clicked.
