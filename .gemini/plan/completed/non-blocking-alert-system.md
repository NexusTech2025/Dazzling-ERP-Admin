---
Date: 2026-06-21T15:35:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Non-Blocking Toast/Alert System for Validation Mismatch (Revised)

This plan outlines the design and implementation of a non-blocking floating Toast/Alert system to display schema validation warnings, database errors, and system status updates on the right side of the screen without interrupting the user layout or causing whole-page crashes.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Schemas:**
  * All schemas registered under `src/lib/react-query/schemaRegistry.js` (including `batch.schema.js`, `course.schema.js`, etc.)
* **Referenced Core Modules:**
  * `src/lib/react-query/validationEngine.js`
  * `src/lib/react-query/hydrate.js`
  * `src/App.jsx`
  * `src/lib/react-query/cacheHelper.js`

---

## **2. Fact vs. Assumption Boundary (Rule N3)**

### **Actual Verified Facts:**
1. **Render Crashes:** `hydrateRecord` in `hydrate.js` runs during read-time React rendering. Currently, it triggers `validateRecordSchema` in `"fast"` failMode, throwing exceptions that crash the component render loop when unknown columns or metadata mismatches occur.
2. **Global Integration:** The validation engine is shared globally. Modifying `validateRecordSchema` to push warnings to the Alert system automatically covers all models including Courses, Packages, and Batches (`/admin/batches`) resolving from cache or hydration.
3. **Bootstrap Styling:** The application uses Tailwind CSS.

### **System Assumptions:**
1. **Notification Volume:** Schema validation errors are developer-centric warnings or data-integrity logs. They do not block core operations, so they can be gracefully downgraded to floating warnings.

---

## **3. Proposed Changes (Rule N1)**

### **Core Alert/Toast State Store**

#### [NEW] [alertStore.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/alertStore.js)
A lightweight vanilla JavaScript pub-sub observer store. This allows non-React files (like `validationEngine.js`) to trigger notifications while React UI components subscribe to update rendering state.

```javascript
/**
 * Global lightweight observer store for toast/alert notifications.
 */
export const alertStore = {
  getAlerts() { ... },
  addAlert(alert) { ... },
  removeAlert(id) { ... },
  subscribe(listener) { ... }
};

/**
 * Hook subscribing to alert state updates in React.
 */
export function useAlerts() { ... }
```

---

### **Schema Validation Engine Integration**

#### [MODIFY] [validationEngine.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/validationEngine.js)
- Import `alertStore` from `./alertStore.js`.
- In `validateRecordSchema`, when a schema validation violation occurs, format the error metadata and push a non-blocking toast warning via `alertStore.addAlert`.
- Since `validateRecordSchema` is called across all entities (Student, Teacher, Batch, Course, etc.), this single integration provides instant out-of-the-box coverage for `/admin/batches` and all other views.

---

### **Hydration Engine Adjustment**

#### [MODIFY] [hydrate.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/hydrate.js)
- Change validation failMode in read-time hydration `hydrateRecord` from `'fast'` to `'lazy'`. This prevents throwing rendering-blocking exceptions while still pushing warnings to the Alert system.

---

### **UI Alert Components**

#### [NEW] [AlertItem.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/AlertItem.jsx)
A reusable Bootstrap-like alert card featuring:
- Curated glassmorphic colors for `info`, `warning`, `error`/`danger`, and `success`.
- Compact header displaying title, variant icon, collapsible arrow trigger, and close button.
- Slide-in animation (`animate-in slide-in-from-right-10`).
- Collapsible detailed description section showing technical details or JSON records.

#### [NEW] [AlertContainer.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/AlertContainer.jsx)
A floating overlay container fixed to the top-right section of the screen containing the active stack of alert cards.

---

### **Global Layout Integration**

#### [MODIFY] [App.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/App.jsx)
- Import and render `<AlertContainer />` inside the root providers to make the toast overlay available globally across all routes.

---

## **4. Legacy Maintenance Mitigation (Rule N6)**

> [!CAUTION]
> **NO LEGACY MAINTENANCE:**
> 
> * **Technical Path Endpoint:** `src/lib/react-query/hydrate.js`
> * **Core Technical Debt Risk:** Converting read-time hydration validation from throwing errors to logging non-blocking alerts removes the possibility of a hard crash on old or modified schemas.

---

## **5. Performance Regression & Benchmark Assertions (Rule N5)**

* **Metric Formula:** `T(n) = O(1) rendering time` (efficient state subscription and content-visibility optimizations).
* **Assertion:** Pushing a new toast/alert processes in `< 2ms` and uses standard CSS animation pipelines.

---

## **6. Verification Plan**

### **Manual Verification**
1. Trigger a validation error manually (e.g. by passing an unknown property in student record or batch record).
2. Confirm the toast alerts slide in on the top-right.
3. Confirm clicking the right arrow toggles detailed description view.
4. Confirm clicking close removes the alert.
