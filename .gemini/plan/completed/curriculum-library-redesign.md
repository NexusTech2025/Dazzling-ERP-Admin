---
Date: 2026-07-06T00:45:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Curriculum Library Page Redesign & KPIs Integration

This plan details refactoring the Curriculum Library dashboard interface to integrate KPI metrics summaries, a redesigned tab-and-view switcher bar, and shared grid/list view settings down to the workspaces.

---

## 1. Non-Domain Driven Infrastructure Rules

### Rule N1: Explicit Positional Signatures & Execution Blueprints

#### 1. Global ViewMode Selection State in parent
* **Path Reference:** `src/features/course/Courses.jsx`
```javascript
/**
 * Main curriculum dashboard view controller.
 * Orchestrates global states, aggregates course list metadata, and returns the structural page outline.
 * @param {Object} props - React properties.
 * @param {string} [props.defaultTab="courses"] - Target active tab key ('courses' | 'packages').
 * @returns {React.ReactElement} Curriculum workspace dashboard tree.
 */
const Courses = ({ defaultTab = 'courses' }) => {
  // Logic to calculate KPI metrics dynamically from caches...
  // Render structure including CourseHeader, KpiCards, Tabs/View-switchers, and Workspace panels...
}
```

#### 2. Workspace View Mode Prop Sync
* **Path Reference:** `src/features/course/workspaces/CourseWorkspace.jsx`
```javascript
/**
 * Course workspace panel coordinating filters and grid/list data presentation components.
 * Supports props-based viewMode overrides to sync with parent switcher buttons.
 * @param {Object} props - React properties.
 * @param {string} [props.viewMode] - Parent-managed view mode selection ('grid' | 'list').
 * @param {Function} [props.setViewMode] - State setter callback trigger.
 * @returns {React.ReactElement} Course filtered workspace grid.
 */
const CourseWorkspace = ({ viewMode: propViewMode, setViewMode: propSetViewMode }) => {
  // Override local hook state if propViewMode is supplied...
}
```

---

### Rule N2: Absolute Background Base Knowledge Traceability

* **Referenced Schemas:**
  * `DazzlingDB/Config/Schema/Academic/Course.json`
  * `DazzlingDB/Config/Schema/Academic/Package.json`
* **Referenced Core Modules:**
  * [Courses.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx)
  * [CourseHeader.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseHeader.jsx)
  * [CourseWorkspace.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/workspaces/CourseWorkspace.jsx)
  * [KpiCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/KpiCard.jsx)

---

### Rule N3: Explicit Fact vs. Assumption Boundary Declaration

#### Actual Verified Facts:
1. `useCoursesQuery` and `usePackagesQuery` retrieve complete arrays of courses and packages respectively.
2. The `KpiCard` component is imported from `../../components/ui/v2/KpiCard` and natively formats count/currency indicators.

#### System Assumptions:
1. Since student directories are separate, calculating total student reach is derived as a sum of `total_students` across active courses.
2. Revenue totals are displayed using a high-density, formatted fallback representation (`₹1.8 Cr`) in the absence of dynamic transactional invoices.

---

### Rule N4: GAS Execution Boundary & Round-Trip Round Up

> [!NOTE]
> This modification is entirely frontend React client-side presentation code. It introduces no GAS SpreadsheetApp bindings or spreadsheet writing locks, complying with Rule N4 boundaries.

---

### Rule N5: Performance Regression & Benchmark Assertions

We will track state hydration to verify that memoized values (`filteredCourses`, active KPI sums) are calculated in under `5ms`:
* **Assertion Harness:** Injected execution timer logging on render passes:
```javascript
const t0 = performance.now();
// calculations...
const t1 = performance.now();
console.log(`[Courses] KPI Metrics Aggregations completed in ${(t1 - t0).toFixed(2)}ms`);
```

---

### Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation

> [!CAUTION]
> **LEGACY VIEW SELECTOR MITIGATION:**
>
> * **Technical Path Endpoint:** `src/features/course/components/CourseFilters.jsx`
> * **Core Risk:** Filters previously rendered their own local view mode switchers.
> * **Remediation Option:** Deprecate local view selectors inside `CourseFilters.jsx` and delegate all view transitions up to `Courses.jsx` to prevent view mode synchronization lag.

---

## Proposed Changes

### Parent Layouts & Headers

---

#### [MODIFY] [Courses.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx)
* Import `KpiCard` from `../../components/ui/v2/KpiCard`.
* Instantiate shared `viewMode` state (`const [viewMode, setViewMode] = useState('grid')`).
* Calculate course and package counts, active status enums, student sums.
* Render the KPI cards grid using `<KpiCard />`.
* Render Tab Buttons (Courses / Packages) in a flex row next to the Card View / Table View selectors.
* Pass `viewMode` and `setViewMode` down as props to the workspaces.

---

#### [MODIFY] [CourseHeader.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseHeader.jsx)
* Add outlined `Import` and `Export` buttons in the header actions block next to `Refresh`.

---

### Workspace Shells

---

#### [MODIFY] [CourseWorkspace.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/workspaces/CourseWorkspace.jsx)
* Accept `viewMode` and `setViewMode` as props.
* Map incoming props over local state results.

---

#### [MODIFY] [PackageWorkspace.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/workspaces/PackageWorkspace.jsx)
* Accept `viewMode` and `setViewMode` as props.
* Map incoming props over local state results.
