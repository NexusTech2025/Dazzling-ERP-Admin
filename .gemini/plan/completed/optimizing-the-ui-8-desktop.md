---
Date: 2026-07-05T17:42:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Redesigning Teacher Profile Desktop Layout

This plan outlines the refactoring of `TeacherProfile.jsx` and `TeacherProfileHeader.jsx` to implement a high-density, 12-column desktop dashboard matching the redesigned wireframe.

---

## 1. Non-Domain Driven Infrastructure Rules

### Rule N1: Explicit Positional Signatures & Execution Blueprints

#### Component: `TeacherProfile`
* **Path Reference:** `src/pages/admin/TeacherProfile.jsx`
```javascript
/**
 * TeacherProfile functional component representing the detailed view of a teacher.
 * Synchronizes tabs directly with search parameters for deep linking.
 * Branches between mobile layout and high-density multi-column desktop layout.
 * @returns {React.ReactElement} The responsive component tree.
 */
const TeacherProfile = () => {
  // Details in Proposed Changes below...
};
```

#### Component: `TeacherProfileHeader`
* **Path Reference:** `src/features/teacher/components/profile/TeacherProfileHeader.jsx`
```javascript
/**
 * TeacherProfileHeader component that renders the compact hero card and action buttons.
 * @param {Object} props - Component properties.
 * @param {Object} props.teacher - Teacher record details.
 * @param {string} props.activeTab - Active navigation tab key.
 * @param {function} props.onTabChange - Navigation tab transition handler.
 * @returns {React.ReactElement} Compact header card element.
 */
const TeacherProfileHeader = ({ teacher, activeTab, onTabChange }) => {
  // Details in Proposed Changes below...
};
```

---

## Proposed Changes

### UI Components

---

#### [MODIFY] [TeacherProfileHeader.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherProfileHeader.jsx)
* Enclose profile identity inside a clean `<Card>` wrapper.
* Render teacher name, departmental badge, alphanumeric ID with a clipboard copy trigger, and action buttons stacked horizontally/vertically.
* Maintain clean tab navigation anchors.

---

### Core Pages

---

#### [MODIFY] [TeacherProfile.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/TeacherProfile.jsx)
* Synchronize active tab directly with URL search parameters `?tab=overview` using `useSearchParams`.
* Refactor Overview tab workspace into a non-symmetric 12-column layout (`lg:grid-cols-3`):
  * **Main Content Column (`lg:col-span-2`)**: Personal details, professional details, contact records, and documents card.
  * **Sidebar Column (`lg:col-span-1`)**: Payroll summary snapshot, activity log, tags list with action trigger buttons, and quick actions.

---

## Verification Plan

### Manual Verification
1. Navigate to Teacher Profile on desktop.
2. Confirm the 2-column layout (Main details left, widgets sidebar right) matches the wireframe.
3. Test tab transitions and verify URL parameter changes.
4. Verify ID copy action correctly copies teacher ID.
