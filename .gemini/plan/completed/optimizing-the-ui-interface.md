---
Date: 2026-06-10T11:04:00+05:30
Status: Approved-Completed
---

# Optimizing the UI Interface

This plan outlines the changes to make the sidebar responsive on small/mobile devices, adding a hamburger menu button to show/hide it, and setting the system-wide base font size to 12px (a 4px reduction from 16px) so that all typography scales down proportionally.

## User Review Required
> [!IMPORTANT]
> The base font size of the entire system (HTML root element) will be set to `12px` (reduced from `16px`). This will scale all standard font sizes (using `rem`) down by 25% across the entire application, achieving a consistent 4px reduction.
>
> The sidebar elements will be reverted to standard relative classes (`text-sm` and `text-xs`) and standard icon sizes (`text-xl` or equivalent) to allow them to benefit from this automatic proportional scaling.

## Proposed Changes

### Global Styling

#### [MODIFY] [index.css](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/index.css)
- Set `html { font-size: 12px; }` in the base layer to scale down all font sizes by 4px globally.

### UI Layout Components

#### [MODIFY] [AdminLayout.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/layout/AdminLayout.jsx)
- Introduce a state variable `isSidebarOpen` to track sidebar visibility on mobile.
- Add `toggleSidebar` and `closeSidebar` functions.
- Pass `isSidebarOpen` and `closeSidebar` as props to `Sidebar`.
- Pass `toggleSidebar` as a prop to `Header`.

#### [MODIFY] [Header.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/layout/Header.jsx)
- Accept `onMenuClick` prop.
- Render a Hamburger menu button (`☰` using the `menu` Material Symbols icon) on small devices (`lg:hidden`).
- Position it to the left of the logo/title.

#### [MODIFY] [Sidebar.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/layout/Sidebar.jsx)
- Accept `isOpen` and `onClose` props.
- Modify the `aside` container classes to be fixed/absolute on mobile (`fixed inset-y-0 left-0 z-50 lg:static lg:translate-x-0`) with a transition-transform style based on `isOpen` state (`translate-x-0` when open, `-translate-x-full` when closed).
- Render a semi-transparent backdrop when `isOpen` is true (visible only on `lg:hidden`) that triggers `onClose` when clicked.
- Automatically trigger `onClose` when a link/menu item is clicked on mobile.
- Add a close 'x' button inside the sidebar drawer on mobile to allow explicit closing.
- Revert text size overrides to standard Tailwind relative classes (`text-sm` for main items, `text-xs` for headers) so they scale proportionally to the root `12px` font size.

## Verification Plan

### Manual Verification
- Resize the browser window to mobile viewports (e.g. 375px, 768px).
- Verify that the Hamburger icon appears in the header.
- Click the Hamburger icon and verify that the sidebar drawer slides in from the left with a backdrop.
- Click a menu item or click the backdrop, and verify that the sidebar closes.
- Check that the entire application text sizes have scaled down proportionally.
- Switch to desktop view and verify that the sidebar remains static and no hamburger button is displayed.
