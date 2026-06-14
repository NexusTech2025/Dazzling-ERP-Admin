---
Date: 2026-05-25T20:20:00+05:30
Status: Approved-Completed
---

# Plan: Fix Broken Cache Invalidation (Plural vs Singular Query Keys)

## Goal Description
Align query key invalidation on retry and manual refresh in `Teachers.jsx`. The page currently attempts to invalidate query key `['teachers']` (plural), whereas the cached queries use the prefix `['teacher']` (singular), causing the retry and refresh actions to fail silently.

## Proposed Changes

### Pages (Admin)

#### [MODIFY] [Teachers.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/Teachers.jsx)
- Import `queryKeys` from `../../lib/react-query/queryKeys`.
- Update `onRetry` within `DataTable`:
  - Change `queryClient.invalidateQueries({ queryKey: ['teachers'] })` to `queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all })`.
- Update `onRefresh` within the `RefreshButton` component:
  - Change `queryClient.invalidateQueries({ queryKey: ['teachers'] })` to `queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all })`.

## Verification Plan

### Manual Verification
1. Load the **Faculty Directory** page and monitor the browser network tab.
2. Click the refresh button and verify that a network fetch to retrieve the teacher list is triggered.
3. Simulate an API timeout or query error to display the retry banner.
4. Click the retry button and verify that a query refetch is triggered.
