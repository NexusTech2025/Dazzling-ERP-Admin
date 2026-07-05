---
Date: 2026-06-20T19:00:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Sheet Batch Read Hydration Refactoring

This plan outlines the refactoring of initial ERP hydration logic by replacing the legacy `init_erp` action with the high-performance `sheet_batch_read` consolidated API.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Documentation:**
  * `E:/NAST/Dazzling/GAS/docs/client/sheet_batch_read_quick_start.md`
* **Referenced Core Modules:**
  * `src/services/apiRegistry.js`
  * `src/services/apiClient.js`
  * `src/hooks/useErpHydration.js`

---

## **2. Fact vs. Assumption Boundary (Rule N3)**

### **Actual Verified Facts:**
1. **Action Endpoint:** The new `sheet_batch_read` backend action accepts a workbook/sheet whitelist query payload and returns datasets keyed by Category and Sheet name when `responseKey: "NAME"` is configured.
2. **Payload Structure:** Unlike `init_erp` which returned objects containing nested `{ data: [...] }` envelopes, `sheet_batch_read` returns arrays directly under each sheet key (e.g. `data.Students.Student` is `[]`).
3. **Registry Location:** `init_erp` is currently registered as `API_REGISTRY.ADMIN.INIT_ERP`.

### **System Assumptions:**
1. **Backend Availability:** The Google Apps Script deployment hosting the database tables already supports the `"sheet_batch_read"` action and handles the consolidated workbook queries.

---

## **3. Proposed Changes (Rule N1)**

### **API Registry**

#### [MODIFY] `src/services/apiRegistry.js`
- Replace the legacy `INIT_ERP: 'init_erp'` action constant in `API_REGISTRY.ADMIN` with `SHEET_BATCH_READ: 'sheet_batch_read'`.

---

### **API Client**

#### [MODIFY] `src/services/apiClient.js`
Modify `executeAction` to accept optional action-level configuration parameters (e.g. root-level `options`) for endpoints requiring custom envelopes like `sheet_batch_read`.

```javascript
/**
 * Executes a backend database transaction action.
 * Supports passing action-specific options to the root request envelope.
 * 
 * @async
 * @function executeAction
 * @param {string} actionPath - Logical namespace or action mapping key.
 * @param {any} [payload={}] - Transmitted payload object or array.
 * @param {string|null} [token=null] - Active session token.
 * @param {object} [options={}] - Request parameters (e.g. abort signals, actionOptions).
 * @param {object} [options.actionOptions] - Optional configurations merged into root JSON envelope.
 * @returns {Promise<any>} Response envelope from backend macro.
 * @throws {ApiError} Request validation or execution failure.
 */
export const executeAction = async (actionPath, payload = {}, token = null, options = {}) => {
  // Modified block: merge actionOptions if present
  const requestBody = {
    action: backendActionString,
    payload: payload
  };
  if (token) requestBody.token = token;
  if (options.actionOptions) {
    requestBody.options = options.actionOptions;
  }
}
```

---

### **ERP Hydration Hook**

#### [MODIFY] `src/hooks/useErpHydration.js`
Refactor the hydration hook to dispatch a consolidated workbook query array and parse direct array responses.

```javascript
/**
 * useErpHydration: Strategy 1 - App Initialization Guard
 * Fetches initial ERP data and populates the React Query cache using sheet_batch_read.
 * 
 * @function useErpHydration
 * @returns {object} React Query state object.
 */
export const useErpHydration = () => {
  // Execution breakdown:
  // 1. Dispatch sheet_batch_read query payload specifying spreadsheet categories and sheets.
  // 2. Access returned data keyed dynamically by spreadsheet Category and Sheet names.
  // 3. Normalize records and seed list query keys in QueryClient cache.
}
```

##### **Step-by-Step Technical Execution Workflow:**
1. **Refactor Hydration Mapping Configuration:**
   Update `HYDRATION_CONFIG` to map each cache target to its spreadsheet `category` and `sheet` key name:
   ```javascript
   const HYDRATION_CONFIG = {
     'Course': { query_key: queryKeys.course, category: 'Academic', sheet: 'Course' },
     'Teacher': { query_key: queryKeys.teacher, category: 'Staff', sheet: 'Teacher' },
     'Student': { query_key: queryKeys.student, category: 'Students', sheet: 'Student' },
     'Batch': { query_key: queryKeys.batch, category: 'Academic', sheet: 'Batch' },
     'Branch': { query_key: queryKeys.branch, category: 'Core', sheet: 'Branch' },
     'Package': { query_key: queryKeys.course.package, category: 'Academic', sheet: 'Package' },
     'PackageItem': { query_key: queryKeys.course.packageItem, category: 'Academic', sheet: 'PackageItem' },
     'PackagePerk': { query_key: queryKeys.course.packagePerk, category: 'Academic', sheet: 'PackagePerk' },
   };
   ```
2. **Dispatch Payload Structure:**
   Call `apiClient.executeAction` passing:
   - Action: `API_REGISTRY.ADMIN.SHEET_BATCH_READ`
   - Payload: Array grouping required sheets under their category:
     ```javascript
     [
       { spreadsheetId: 'Students', sheets: ['Student'] },
       { spreadsheetId: 'Academic', sheets: ['Course', 'Batch', 'Package', 'PackageItem', 'PackagePerk'] },
       { spreadsheetId: 'Staff', sheets: ['Teacher'] },
       { spreadsheetId: 'Core', sheets: ['Branch'] }
     ]
     ```
   - Request Options (4th argument):
     ```javascript
     {
       actionOptions: {
         responseKey: 'NAME',
         driverType: 'ADVANCED'
       }
     }
     ```
3. **Parse Direct Array Payload:**
   Update the loop extracting data to read `const result = data[category]?.[sheet]` and perform cache seeding if `Array.isArray(result)` directly.

---

## **4. Legacy Maintenance Mitigation (Rule N6)**

> [!CAUTION]
> **NO LEGACY MAINTENANCE:**
> 
> * **Technical Path Endpoint:** `src/hooks/useErpHydration.js`
> * **Core Technical Debt Risk:** Bypasses `init_erp` action completely. The old response format (requiring nested `.data` array lookups) is discarded.

---

## **5. Performance Regression & Benchmark Assertions (Rule N5)**

* **Metric Formula:** `T(n) = O(1) API call` (consolidated execution of all initial spreadsheet queries in a single Apps Script endpoint invoke).
* **Assertion:** Hydration data retrieval duration is optimized to complete significantly faster than running multiple individual table fetches.

---

## **6. Verification Plan**

### **Manual Verification**
1. Clear browser cache and local storage, reload the ERP dashboard.
2. Verify that all initial records (Courses, Batches, Teachers, Students, Branches) are loaded successfully without network retry triggers.
3. Confirm console log statements indicate cache hydration succeeded.
