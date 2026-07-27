---
Date: 2026-07-27T12:12:00+05:30
Status: Completed
---

# Walkthrough - Batch Test Management Module Implementation

We have successfully built and integrated the **Batch/Class Test Management** module into both the **Desktop** (`DesktopBatchProfile.jsx`) and **Mobile** (`MobileBatchProfile.jsx`) Batch Details views.

---

## 1. Summary of Changes

### Key Features Implemented:
- **Two-Stage Test Workflow**:
  - **Stage 1 (Tests List)**: Allows searching by test title, filtering by status (`Draft`, `Published`, `Completed`), creating new tests via `TestFormModal`, editing test details, and deleting tests.
  - **Stage 2 (Bulk Marks Entry)**: Dense spreadsheet-style mark entry table supporting bulk save operations, auto-zeroing and row disabling on `is_absent` checkbox toggle, and live score validation ($\le \text{Total Marks}$).
  - **Stage 3 (Analytics & Report)**: Renders test KPI cards (`Total Students`, `Present`, `Absent`, `Class Average`, `Pass Rate %`, `Fail Rate %`), top 3 rankers leaderboard (`TopPerformersCard`), and full student breakdown matrix (`StudentResultTable`) with grade badges (`A+`, `A`, `B`, `C`, `D`, `F`) and calculated class ranks.

### Components & Utilities Created:

1. **`src/lib/react-query/queryKeys.js`**: Extended factory with `queryKeys.test` domain.
2. **`src/features/batch/hooks/useBatchTestQueries.js`**: React Query hooks layer connecting live GAS backend endpoints for `Test` and `TestMarks` CRUD & bulk operations.
3. **`src/features/batch/components/profile/tests/utils/testCalculators.js`**: QueryEngine (`aq`, `op`) powered helper for computing averages, pass rates, grades, and student rankings.
4. **`src/features/batch/components/profile/tests/components/TestsToolbar.jsx`**: Header filter bar with search, status dropdown, and "+ Create New Test" trigger.
5. **`src/features/batch/components/profile/tests/components/TestCard.jsx`**: Summary card displaying test parameters, status badge, and action triggers.
6. **`src/features/batch/components/profile/tests/components/TestsList.jsx`**: Card list container with loading skeletons and empty states.
7. **`src/features/batch/components/profile/tests/components/TestFormModal.jsx`**: Unified creation and edit dialog.
8. **`src/features/batch/components/profile/tests/components/MarksEntryHeader.jsx`**: Bulk mark entry action bar.
9. **`src/features/batch/components/profile/tests/components/MarksEntryRow.jsx`**: Mark input row with live score validation and absent toggle.
10. **`src/features/batch/components/profile/tests/components/MarksEntryTable.jsx`**: Class-wide bulk marks sheet container.
11. **`src/features/batch/components/profile/tests/components/TestReportKPIs.jsx`**: Analytics KPI summary grid using `KpiCard`.
12. **`src/features/batch/components/profile/tests/components/TopPerformersCard.jsx`**: Leaderboard for top 3 rankers.
13. **`src/features/batch/components/profile/tests/components/StudentResultTable.jsx`**: Comprehensive student result table.
14. **`src/features/batch/components/profile/BatchTestsTab.jsx`**: Main tab container mounting all sub-components and managing state transitions.
15. **`src/pages/admin/components/DesktopBatchProfile.jsx` & `MobileBatchProfile.jsx`**: Mounted `BatchTestsTab` under the **Tests** tab key.

---

## 2. Verification & Walkthrough Instructions

1. **Navigate to Batch Profile**:
   - Open `/admin/batches` and select any active batch (e.g. Batch Details).
2. **Access Tests Tab**:
   - Click on the **Tests** tab in the header.
3. **Create a Test**:
   - Click **+ Create New Test**. Fill in *Title*, *Test Date*, *Total Marks*, *Passing Marks*, select *Status*, and submit.
4. **Enter Marks**:
   - Click **Enter Marks** on any test card.
   - Enter student marks, toggle **Absent** for a student (verifying inputs disable automatically).
   - Click **Save All Marks**.
5. **View Report**:
   - Click **View Report** on the test card.
   - Inspect the summary KPI metrics, Top Performers leaderboard, and class ranking breakdown matrix.
