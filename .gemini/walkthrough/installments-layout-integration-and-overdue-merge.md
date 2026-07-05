---
Date: 2026-06-22T23:45:00+05:30
Status: Completed, Verified
---

# Walkthrough: Installments Layout Integration & Overdue Merge

We have successfully wrapped the Global Installments tracker view in the `MainLayout` container, integrated the overdue installments list as a sub-navigation tab, incorporated small KPI cards, implemented high-density rendering using `DataTableV2`, and cleaned up the standalone overdue views and routing configurations.

## Changes Made

### UI & Layout Consolidation
* Modified [Installments.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/Installments.jsx):
  - Wrapped page in the standard `MainLayout` container with local scrolling locks.
  - Added a toggle state (`activeTab`) to switch between **All Installments** and **Overdue Accounts** lists.
  - Added a scroll listener `onBodyScroll` and a sticky header configuration.
  - Integrated `KpiGrid` and small `KpiCard` (size `sm`) metrics (Total Overdue amount and total overdue count) which render when the **Overdue Accounts** tab is active.
  - Replaced the legacy `DataTable` component with `DataTableV2` for higher padding density and sticky header support.
  - Mapped specific columns showing the student's name joined with the course/package title and their class badge pill.
  - Added columns to show the installment due amount, paid amount, discount amount, and remaining balance. (Replaced "Overdue" column with "Remaining" in the "All Installments" tab).

### Deprecations & Cleanups
* Deprecated [OverdueAccounts.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/OverdueAccounts.jsx) via JSDoc notice.
* Removed the `/admin/finance/overdue` path from [AppRoutes.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/routes/AppRoutes.jsx).
* Removed the 'OverDue' sidebar link from [Sidebar.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/layout/Sidebar.jsx).
