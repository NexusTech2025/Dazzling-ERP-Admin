---
Date: 2026-06-16T03:46:00+05:30
Status: Approved-Completed
---

# SWR Caching & Localized Skeleton Loading for Batches

Implement a 2.5-minute windowed Stale-While-Revalidate (SWR) caching strategy for the Batches feature module to prevent screen freezing or flashing full-screen spinners on navigation and mount.

## Proposed Changes

### Batch Feature

#### [MODIFY] [useBatchQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js)
- Update `useBatchesQuery` options:
  - Change `staleTime: Infinity` to `staleTime: 1000 * 60 * 2.5` (2.5 minutes).
  - Change `refetchOnMount: false` to `refetchOnMount: true` so stale data revalidates quietly in the background.

#### [MODIFY] [Batches.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/Batches.jsx)
- Remove the full-screen blocking `isLoading` check: `if (isLoading) return <LoadingState ... />`.
- Pass `isLoading={isLoading}` prop to `DataTable` component.
- Display a background updating indicator badge in the header when `isFetching` is true (non-blocking).

---

## Verification Plan

### Manual Verification
- Verify that navigating to Batches renders cached data instantly, and shows a localized spinner only during initial load or background updates.
