---
Date: 2026-07-06T01:59:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Course Details Overview Dashboard Redesign

This plan details redesigning the `OverviewTab.jsx` component inside Course Details into an executive control panel dashboard. It implements KPI cards, a custom SVG enrollment trend line chart, a read-only list of active batches and assigned faculty, package usage, financials, and quick insights, using cached store data synchronously.

---

## 1. Non-Domain Driven Infrastructure Rules

### Rule N1: Explicit Positional Signatures & Execution Blueprints

#### 1. OverviewTab Component Render Signature
* **Path Reference:** `src/features/course/tabs/OverviewTab.jsx`
```javascript
/**
 * OverviewTab: Executive control dashboard tab component for Course Details.
 * Renders KPIs, custom SVG charts, related listings, and financial snapshots.
 *
 * @param {Object} props - Component properties.
 * @param {Object} props.course - The active course details object.
 * @param {string} props.courseId - The unique course identifier.
 * @param {Function} props.setActiveTab - State setter to programmatically change active tabs.
 * @returns {React.ReactElement} Overview dashboard element.
 */
export const OverviewTab = ({ course = {}, courseId, setActiveTab }) => {
  // Synchronous extraction of caches...
  // Custom SVG line chart plotting math...
  // Filtering active batches (cap 3), package items (cap 3)...
  // Deriving insights and activities...
}
```

#### 2. Custom SVG Trend Chart Plotter
* **Path Reference:** `src/components/ui/v2/EnrollmentTrendChart.jsx`
```javascript
/**
 * Dynamic SVG trend line chart generator.
 * Computes coordinate paths from monthly enrollment counts.
 *
 * @param {Array<Object>} data - Month-wise enrollment records array.
 * @returns {React.ReactElement} Scalable SVG element.
 */
const EnrollmentTrendChart = ({ data }) => {
  // Coordinate calculations, smooth cubic curve commands, grid lines...
}
```

---

### Rule N2: Absolute Background Base Knowledge Traceability

* **Referenced Schemas:**
  * `DazzlingDB/Config/Schema/Academic/Course.json`
  * `DazzlingDB/Config/Schema/Academic/Batch.json`
  * `DazzlingDB/Config/Schema/Academic/PackageItem.json`
  * `DazzlingDB/Config/Schema/Students/Student.json`
* **Referenced RUNBOOKS & Guidelines:**
  * [zero-new-ui-components-policy.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/rules/zero-new-ui-components-policy.md)
  * [plan-drafting-rule.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/rules/plan-drafting-rule.md)

---

### Rule N3: Explicit Fact vs. Assumption Boundary Declaration

#### Actual Verified Facts:
1. `useErpHydration.js` caches all relevant collections (`Course`, `Batch`, `Package`, `PackageItem`, `Student`) at app initialization.
2. `CourseDetails.jsx` manages the active tab string state variable (`activeTab`).

#### System Assumptions:
1. Average attendance and revenue statistics can be simulated or calculated from cached student accounts without triggering slow database queries.

---

### Rule N4: GAS Execution Boundary & Round-Trip Round Up

> [!NOTE]
> All metrics, lists, and activity feeds are computed locally in RAM using cached query snapshots, avoiding any App Script calls or database round-trips.

---

### Rule N5: Performance Regression & Benchmark Assertions

We assert that extracting cache records, grouping monthly enrollments, and generating coordinate strings for the SVG chart completes in under `5ms`.
```javascript
const t0 = performance.now();
// SVG string math...
const t1 = performance.now();
console.log(`[OverviewTab] SVG Path generated in ${(t1 - t0).toFixed(2)}ms`);
```

---

### Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation

> [!CAUTION]
> **DYNAMIC STABILITY GRACE WINDOW:**
>
> * **Technical Path Endpoint:** `OverviewTab.jsx`
> * **Core Risk:** If the client cache is empty during initial render cycles, charts and metric counts will fall back to zero-states.
> * **Remediation Option:** Provide fallback value guards (`|| []`) to prevent undefined exceptions during initialization ticks.

---

## Proposed Changes

### Parent Details Integration

---

#### [MODIFY] [CourseDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/CourseDetails.jsx)
* Pass `courseId={id}` and `setActiveTab={setActiveTab}` props down to `<OverviewTab />` under the `tabRegistry` setup.
* Retrieve the `id` param from router wrapper.

---

### Tab Dashboard View

---

#### [MODIFY] [OverviewTab.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/tabs/OverviewTab.jsx)
* Cleanly replace file contents with the executive dashboard layout.
* Import standard components: `<KpiCard />`, `<Badge />`, `<Button />`, `<Card />` by enforcing the **ZERO-NEW-UI-COMPONENTS-POLICY**.
* Import `<EnrollmentTrendChart />` from `src/components/ui/v2/EnrollmentTrendChart.jsx`.
* Implement synchronous cache aggregations inside the component via `queryClient`:
  * Filter batches related to `course_id === course.course_id`.
  * Filter package items related to this course.
  * Extract student enrollments to compute monthly enrollment trend groups.
* Render a custom SVG Area/Line Chart visualizing monthly counts with gradient fills.
* Render sections:
  * Top KPI Grid (Students, Active Batches, Assigned Teachers, Connected Packages, Total Revenue, Avg Attendance).
  * Main Split Column:
    * Left Column: **Enrollment Trend Chart**, **Active Batches List** (cap 3 with view all link), **Financial Snapshot**.
    * Right Column: **Faculty Assigned**, **Package Usage** (cap 3 with view all link), **Recent Activities**, **Quick Insights**.
* Bind the "View All →" triggers to invoke `setActiveTab(targetTabId)`.
