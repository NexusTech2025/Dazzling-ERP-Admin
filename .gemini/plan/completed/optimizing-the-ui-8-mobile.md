---
Date: 2026-07-05T14:24:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Redesigning Student Profile for Mobile

This plan details the design and implementation of four highly reusable mobile view components and their integration into `StudentProfile.jsx` using `useIsMobile()` to dynamically switch between mobile-optimized layouts and the desktop multi-column view.

---

## 1. Non-Domain Driven Infrastructure Rules

### Rule N1: Explicit Positional Signatures & Execution Blueprints

#### Component 1: `ProfileHero`
* **Path Reference:** `src/components/ui/v2/ProfileHero.jsx`
```javascript
/**
 * ProfileHero component for displaying identity information, status, and actions on mobile.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.avatar - Avatar component node.
 * @param {string} props.title - Profile entity name or title.
 * @param {React.ReactNode} props.badge - Status badge component node.
 * @param {string} props.idText - Unique profile identifier text.
 * @param {Array<Object>} props.metaLines - Array of objects with format { text: string, icon?: string } representing description lines.
 * @param {React.ReactNode} [props.actions] - Action buttons stack node on the right.
 * @returns {React.ReactElement} Redesigned profile header element.
 */
export default function ProfileHero({ avatar, title, badge, idText, metaLines, actions }) {
  // Renders avatar, title, ID with copy button, descriptive metadata rows, and layout actions.
}
```

#### Component 2: `ScrollableRibbon`
* **Path Reference:** `src/components/ui/v2/ScrollableRibbon.jsx`
```javascript
/**
 * ScrollableRibbon component that provides horizontal touch-swipe layouts for mobile KPIs and tab groups.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Inner elements to display horizontally.
 * @param {string} [props.className] - Optional custom CSS container class overrides.
 * @returns {React.ReactElement} Horizontal scroll ribbon container.
 */
export function ScrollableRibbon({ children, className }) {
  // Wraps children in a flex overflow-x container that hides native scrollbars.
}
```

#### Component 3: `DescriptionSection`
* **Path Reference:** `src/components/ui/v2/DescriptionSection.jsx`
```javascript
/**
 * DescriptionSection component grouping KeyValuePair components into card-based read-only grids.
 * @param {Object} props - Component properties.
 * @param {string} props.title - Section title.
 * @param {string} [props.icon] - Optional Material symbol icon name.
 * @param {React.ReactNode} props.children - KeyValuePair elements.
 * @param {function} [props.onActionClick] - Optional callback triggered on action button click.
 * @param {string} [props.actionLabel] - Label for action button (e.g. "Edit").
 * @returns {React.ReactElement} Section container card with grid children.
 */
export default function DescriptionSection({ title, icon, children, onActionClick, actionLabel }) {
  // Renders form-section-style header and children in a responsive grid.
}
```

#### Component 4: `SlottedEntityCard`
* **Path Reference:** `src/components/ui/v2/cards/SlottedEntityCard.jsx`
```javascript
/**
 * SlottedEntityCard component displaying structured details of a sub-entity with navigational triggers.
 * @param {Object} props - Component properties.
 * @param {string} props.icon - Material Symbol icon name.
 * @param {string} [props.iconColor] - Custom icon color Tailwind classes.
 * @param {string} props.title - Primary card title.
 * @param {string} props.subtitle - Secondary detail text.
 * @param {string} [props.metaText] - Additional metadata description line.
 * @param {React.ReactNode} [props.badge] - Optional status badge element.
 * @param {function} props.onClick - Navigation callback action.
 * @returns {React.ReactElement} Navigational list-style card element.
 */
export default function SlottedEntityCard({ icon, iconColor, title, subtitle, metaText, badge, onClick }) {
  // Renders styled layout with prefix icon, text descriptors, suffix badge, and chevron arrow.
}
```

---

## 2. Absolute Background Base Knowledge Traceability

* **Referenced Design Runbooks:**
  * [profileView.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/temp/ProfileViews/profileView.md)
  * [components.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/memory/ui_component/components.md)
  * [useIsMobile.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useIsMobile.js)

---

## 3. Explicit Fact vs. Assumption Boundary Declaration

#### Actual Verified Facts:
1. `useIsMobile.js` hook exists and is currently used in `PackageDetails.jsx` and `CourseDetails.jsx`.
2. Standard UI primitives like `Avatar`, `Badge`, `Button`, `KpiCard`, `KeyValuePair`, `Timeline` exist and are ready for integration.

#### System Assumptions:
1. Redesigning for mobile layout will dynamically mount the corresponding mobile sub-layout when `isMobile` is true, keeping DOM footprint minimal.

---

## 4. GAS Execution Boundary & Round-Trip Round Up

> [!NOTE]
> This is a purely client-side React UI redesign. There are no backend calls, Apps Script bindings, or loop modifications affecting Google Sheets in this implementation.

---

## 5. Performance Regression & Benchmark Assertions

* **Metric Formula:** `T(n) = O(1) layout checks` (checking viewport changes in React runtime without causing unnecessary multi-render loops).
* **Harness Assertion:** Component conditional return prevents loading of the heavy desktop grid in mobile devices, improving memory overhead and frame transitions.

---

## 6. Legacy Maintenance Mitigation & Red Flag Isolation

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
> * **Technical Path Endpoint:** [StudentProfile.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/StudentProfile.jsx)
> * **Core Technical Debt Risk:** Desktop layouts are currently fixed columns. Transitioning requires conditional branching. 
> * **Remediation Option:** Split into explicit mobile layout container modules within `StudentProfile.jsx` to prevent css clutter and layout breaks on desktop.

---

## Proposed Changes

### UI Components

---

#### [NEW] [ProfileHero.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/ProfileHero.jsx)
* Build the core header container supporting avatar, badge, title, ID copy action, metadata lines, and quick action stack.

#### [NEW] [ScrollableRibbon.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/ScrollableRibbon.jsx)
* Build horizontal scrolling layout block to wrapper KPIs and tabs on mobile screens.

#### [NEW] [DescriptionSection.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/DescriptionSection.jsx)
* Build structured card container grouping title, section buttons, and Key-Value details.

#### [NEW] [SlottedEntityCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/cards/SlottedEntityCard.jsx)
* Build navigational chevron item cards containing entity records.

---

### Core Pages

---

#### [MODIFY] [StudentProfile.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/StudentProfile.jsx)
* Import `useIsMobile`, `ProfileHero`, `ScrollableRibbon`, `DescriptionSection`, `SlottedEntityCard`.
* Implement conditional layout division based on `isMobile`.

---

## Verification Plan

### Manual Verification
1. Open student profile page.
2. Toggle responsive mode in Chrome Developer Tools (iPhone 12/Pro).
3. Validate horizontal scroll ribbons swipe correctly.
4. Verify ID copy action copy icon and clipboard text.
5. Verify tabs Overview, Attendance, and Fees toggle correctly.
