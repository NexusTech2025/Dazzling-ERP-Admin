---
Date: 2026-07-27T12:32:00+05:30
Status: Completed
---

# Walkthrough - Batch Test Management & Refresh Capabilities

We have completed the implementation of the **Batch/Class Test Management** module, integrated progressive caching via `cacheHelper.js`, and added the standardized **RefreshButton** across all views.

---

## 1. Summary of Changes

### A. Refresh Button Integration (`RefreshButton.jsx`)
- Utilized the pre-existing primitive `RefreshButton` (`src/components/ui/btn/RefreshButton.jsx`).
- Connected `refetch: refetchTests` and `refetch: refetchMarks` from TanStack Query hooks.
- Implemented `handleRefresh` which refetches test records and active test marks simultaneously using `Promise.all`.
- Integrated `RefreshButton` into:
  1. **`TestsToolbar.jsx`** (Tests List View)
  2. **`MarksEntryHeader.jsx`** (Bulk Marks Entry View)
  3. **Report Header View** (Test Analytics & Report View)

---

### B. Architecture & Component Summary
1. **`src/lib/react-query/queryKeys.js`**: Extended factory with `queryKeys.test` domain.
2. **`src/features/batch/hooks/useBatchTestQueries.js`**: Progressive caching hooks layer with `resolveList` and `getCachedList`.
3. **`src/features/batch/components/profile/tests/utils/testCalculators.js`**: QueryEngine (`aq`, `op`) powered helper for computing averages, pass rates, grades, and student rankings.
4. **`src/features/batch/components/profile/tests/components/`**:
   - `TestsToolbar.jsx`: Search, status filter, "+ Create New Test", and `RefreshButton`.
   - `TestCard.jsx`: Card displaying parameters, status badge, action triggers.
   - `TestsList.jsx`: Card list container with loading skeletons and empty states.
   - `TestFormModal.jsx`: Unified creation & edit dialog.
   - `MarksEntryHeader.jsx` & `MarksEntryTable.jsx` & `MarksEntryRow.jsx`: Bulk marks entry sheet with `RefreshButton`, live score validation, and absent toggle.
   - `TestReportKPIs.jsx`, `TopPerformersCard.jsx`, `StudentResultTable.jsx`: Analytics & report dashboard.
5. **`src/features/batch/components/profile/BatchTestsTab.jsx`**: Main tab container mounted in `DesktopBatchProfile.jsx` and `MobileBatchProfile.jsx`.

---

## 2. Verification & Walkthrough Instructions

1. **Navigate to Batch Profile**:
   - Open `/admin/batches` and select any active batch.
2. **Access Tests Tab & Test Refresh**:
   - Click on the **Tests** tab.
   - Click the **Refresh** button on the toolbar — verify the spinning animation and network refetch for tests.
3. **Marks Entry Refresh**:
   - Click **Enter Marks** on a test card.
   - Click **Refresh** in the header — verify marks refetch dynamically.
4. **Report Refresh**:
   - Click **Refresh** in the report header — verify analytics and student rankings update dynamically.
