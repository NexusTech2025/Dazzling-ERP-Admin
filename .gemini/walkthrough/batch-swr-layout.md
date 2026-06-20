---
Date: 2026-06-16T03:46:00+05:30
Status: Completed
---

# Walkthrough - Batch SWR & Localized Skeleton Loading

We have optimized the layout behavior of the Batch feature module by implementing the windowed Stale-While-Revalidate (SWR) layout pattern. This eliminates full-screen blocking loading states, replacing them with localized table loader skeletons and a pulsing top-bar updating indicator.

## Changes Made

### Query settings
- Updated `useBatchesQuery` in [useBatchQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js):
  - Changed `staleTime` to `1000 * 60 * 2.5` (2.5 minutes).
  - Set `refetchOnMount` to `true`.

### Layout refactoring
- Modified [Batches.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/Batches.jsx):
  - Removed full-screen loader (`if (isLoading) return <LoadingState ... />`).
  - Configured `DataTable` to handle loading locally by passing the `isLoading` prop.
  - Added a pulsing `Updating...` badge inside the header when `isFetching` is true, providing smooth, non-blocking visual feedback for background revalidation.

---

## Verification Results

### Manual Verification
- Navigating to the Batches module loads from cache instantly when fresh data is present.
- Skeletons render inline only in the `DataTable` during cold loads, preserving full interactability of the surrounding header and layout.
- The `Updating...` top-bar badge pulses when background synchronization is active.
