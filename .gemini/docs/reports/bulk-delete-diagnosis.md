# Code Self-Assessor Report: Bulk Deletion Architecture

## 📊 Robustness Score: 9/10 (Strong)

### 📝 Executive Summary
This report analyzes the proposed bulk deletion architecture across Teachers, Batches, Student Leads, and Courses. By utilizing a decorator/adapter hook pattern (`useSelectableTable`), the design adheres to SOLID principles and keeps individual column schemas clean and modular. A critical API constraint was identified during the review: non-generic tables (like `Teacher` and `Package`) are ineligible for the generic `data_delete_many` endpoint and must target specialized endpoints (`staff_delete_many_teachers` and `academic_delete_many_packages`).

---

## 🔴 Critical Issues

- **[Ineligible Tables for Generic data_delete_many Endpoint]**
  - **Cause**: The generic bulk delete action `data_delete_many` is restricted to generic tables in the `GLOBAL_CRUD_WHITELIST`.
  - **Scenario**: Executing a bulk delete request on non-generic tables (`Teacher`, `Package`) using `data_delete_many`.
  - **Impact**: Server throws a `ValidationError` and blocks the deletion.
  - **Fix**: Register specialized action keys in `apiRegistry.js` and inject them as custom action paths into `useDeleteManyMutation`:
    - **Teachers**: Call `staff_delete_many_teachers`.
    - **Packages**: Call `academic_delete_many_packages`.

---

## 🟠 High Priority Issues

- **[Reference Instability & Infinite Render Loops]**
  - **Cause**: Dynamically generating a columns array within the component or hooks without stable dependencies causes React to re-allocate new array references on every render, triggering infinite re-render loops in components that track dependencies.
  - **Impact**: CPU spikes, browser tab freezes, or table performance degradation.
  - **Fix**: Memoize output columns in `useSelectableTable.js` using a serialized representation of visible row IDs (`rowIds.join(',')`) as a stable dependency.

- **[Partial Deletion Manifest Parsing]**
  - **Cause**: Batch deletions can succeed on some items but fail on others due to referential constraints (e.g. `onDelete: "protect"` in relations).
  - **Impact**: Cache desynchronization and misleading success notifications.
  - **Fix**: Parse the returned success `manifest.deleted` array, only clearing selection for successfully removed items, and display a partial failure summary in the confirm modal.

---

## 🟡 Medium & 🟢 Low Priority Issues

- **[Cross-Tab Selection State Leaks]**
  - **Cause**: Share of selection state across active tabs in multi-tab views (e.g. Courses vs. Packages in `Courses.jsx`).
  - **Impact**: Selection lists leaking from one tab to another.
  - **Fix**: Force clear selection (`clearSelection()`) on active tab transitions or category filter changes.

---

## 💪 Strengths
- **Decoupled Column Generation**: Columns are kept clean and generic; selection checkboxes are injected at runtime.
- **DIP-Compliant**: Bulk delete hooks depend on backend abstractions rather than hardcoded client endpoints.

---

## 🚀 Strategic Recommendations
1. Deploy `useSelectableTable` as a global hook under `src/hooks/`.
2. Standardize all list views to use `<SelectionActionBar>` and coordinate selection resets on filters or tab transitions.

---

## 📋 API Action & Payload Mapping Reference

Based on the official DazzlingDB API specifications, bulk deletions must be structured as follows:

### 1. Generic Bulk Deletions (`data_delete_many`)
For tables whitelisted in the `GLOBAL_CRUD_WHITELIST`. The payload must contain the `table` name, `ids` array, and `dryRun: false`.

- **Batch Directory**
  - **Action**: `data_delete_many`
  - **Table**: `Batch`
  - **Payload**: `{ "table": "Batch", "ids": [...], "dryRun": false }`
- **Course Directory**
  - **Action**: `data_delete_many`
  - **Table**: `Course`
  - **Payload**: `{ "table": "Course", "ids": [...], "dryRun": false }`
- **Student Lead Directory**
  - **Action**: `data_delete_many`
  - **Table**: `StudentLead`
  - **Payload**: `{ "table": "StudentLead", "ids": [...], "dryRun": false }`

### 2. Specialized Bulk Deletions
For tables requiring cascaded deletes or custom business validations.

- **Teacher Directory**
  - **Action**: `staff_delete_many_teachers`
  - **Table**: `Teacher`
  - **Payload**: `{ "table": "Teacher", "ids": [...], "dryRun": false }`
- **Package Directory**
  - **Action**: `academic_delete_many_packages`
  - **Table**: `Package`
  - **Payload**: `{ "table": "Package", "ids": [...], "dryRun": false }`
- **Student Directory**
  - **Action**: `student_delete_many_students`
  - **Table**: `Student`
  - **Payload**: `{ "table": "Student", "ids": [...], "dryRun": false }`

