---
Date: 2026-06-22T20:36:00+05:30
Status: Approved-Completed
---

# Technical Implementation Plan: Reusable DataTableV2 Component & Finance Dashboard Integration

This plan describes the implementation of a reusable `DataTableV2` component designed to handle variable layout densities, height constraints, sticky headers, and interactive row clicks, and details its integration inside the Student Finance Dashboard.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Schemas:**
  - `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Finance/StudentFeeAccount.json`
* **Referenced Core Modules:**
  - [table/index.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/table/index.jsx)
  - [FinanceDashboard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/FinanceDashboard.jsx)
* **Design Runbooks:**
  - [components.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/components.md)

---

## **2. Fact vs. Assumption Boundary (Rule N3)**

### **Actual Verified Facts:**
1. **Existing Primitives**: The file `src/components/ui/table/index.jsx` already exports structural wrappers (`TableContainer`, `TableHead`, `TableCell`, etc.) which define default padding sizes (`px-6 py-4`).
2. **Dashboard State Requirements**: The Student Finance Dashboard needs a scrollable viewport container for student listings, small row-heights (`py-2 px-3`), and clickable row actions to trigger detail views.

### **System Assumptions:**
1. **Scope Limit**: The new `DataTableV2` component should be created in the global shared UI folder (`src/components/ui/v2/`) or the common components directory to allow other pages (e.g. Enrollments, Courses) to consume it in subsequent work cycles.

---

## **3. Legacy Maintenance Mitigation (Rule N6)**

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [DataTable.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/DataTable.jsx)
> * **Core Technical Debt Risk:** The legacy `DataTable` component hardcodes `min-h-[400px]` and standard paddings, making it incompatible with high-density inline layouts.
> * **Remediation Option:** We will keep the legacy `DataTable` intact to prevent breaking existing feature pages (such as `Installments.jsx`) and introduce a new, decoupled `DataTableV2.jsx` containing layout controls.

---

## **4. Proposed Changes & Method Signatures (Rule N1)**

### **A. Shared UI Components**

#### [NEW] [DataTableV2.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/DataTableV2.jsx)
Create the flexible `DataTableV2` component:

```javascript
/**
 * A highly customizable presentation table component supporting sticky headers, 
 * multiple layout densities, fixed heights, row selection, and loading/error states.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {Array} props.data - The data array containing records to display.
 * @param {Array} props.columns - Configuration array mapping header tags and cell rendering callbacks.
 * @param {string} [props.density='medium'] - Sizing density: 'low' (comfortable), 'medium' (default), or 'high' (compact).
 * @param {string} [props.maxHeight] - Optional maximum viewport height (e.g., '220px') to enable inner scrolling.
 * @param {boolean} [props.stickyHeader=false] - Locks headers at the top when scrolling.
 * @param {boolean} [props.isLoading=false] - Displays a spinning loading placeholder.
 * @param {Object|string} [props.error=null] - Renders the database error message wrapper.
 * @param {Function} [props.onRetry] - Reload trigger action when error state occurs.
 * @param {string} [props.selectedRowValue] - The matched column value of the currently selected record.
 * @param {string} [props.selectedRowKey] - Object property key used to match active selection (e.g. 'student_id').
 * @param {Function} [props.onRowClick] - Trigger callback when a row is clicked: `(row) => { ... }`.
 * @returns {React.ReactElement} The rendered data table component.
 */
export default function DataTableV2({
  data = [],
  columns = [],
  density = 'medium',
  maxHeight,
  stickyHeader = false,
  isLoading = false,
  error = null,
  onRetry,
  selectedRowValue,
  selectedRowKey,
  onRowClick
}) {
  // Logical parsing and styling assignments...
}
```

**Execution Workflow:**
1. Checks `isLoading` and `error` parameters to render status templates.
2. Formulates custom spacing styles for headers and cells based on the selected `density` parameter.
3. Renders the table container. If a `maxHeight` value is supplied, maps inline height and overflow CSS to enable scrollbars.
4. Iterates through column configs and data rows. Applies highlights if `selectedRowValue === row[selectedRowKey]`.

---

## **5. Performance Regression & Benchmark Assertions (Rule N5)**

* **Performance Target**:
  - Benchmarks are monitored on mount. Initial data hydration must keep rendering cycles under `30ms` post-API resolve.
* **Timing Harness**:
  - The dashboard retains `console.time('[FinanceDashboard] Load Data')` trackers.

---

## **6. Verification Plan**

### **Manual Verification**
1. Load `/admin/finance` in the browser.
2. Confirm all tables render correctly. Check that row click selection updates detail panels smoothly and applies correct highlights.
3. Inspect height constraints on the Student Directory. Ensure scrollbars appear and headers remain sticky at `top-0` when scrolling.
