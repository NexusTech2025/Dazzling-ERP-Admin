---
Date: 2026-06-17T01:00:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Add Student Page Layout Protocol Alignment

This plan outlines the integration of standard page layouts, scroll locks, and spacing conventions on the Add Student page view using `MainLayout` and `Breadcrumbs`.

## Proposed Changes

### Admin Pages Component

#### [MODIFY] [AddStudent.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/AddStudent.jsx)

##### 1. Import Layout Components
- Import `MainLayout` from `src/components/layout/MainLayout`.
- Import `Breadcrumbs` from `src/components/ui/Breadcrumbs`.

##### 2. Integrate Scroll State & Compact Header
- Add state `isSticky` to track when the scrollable container is scrolled past 80px.
- Create a `handleBodyScroll` event listener.
- Define a fixed compact header slot inside `MainLayout`'s `header` prop.

##### 3. Structure Body and Spacing
- Wrap the main toggle and form wizard inside the `body` slot of `MainLayout`.
- Apply top margin `pt-6 lg:pt-10 pb-6 space-y-6` on the scrollable container.
- Embed standard `Breadcrumbs` with links: `Dashboard` -> `Students` -> `Add Student`.
