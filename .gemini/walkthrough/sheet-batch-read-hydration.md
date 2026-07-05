---
Date: 2026-06-20T19:00:00+05:30
Status: Completed
---

# Walkthrough - Sheet Batch Read Hydration Refactoring

We refactored the initial ERP hydration logic by replacing the legacy `init_erp` action with the new high-performance batch read consolidated API (`sheet_batch_read`).

## **Changes Made**

### **API Registry**

#### [src/services/apiRegistry.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/services/apiRegistry.js)
- Replaced `INIT_ERP: 'init_erp'` with `SHEET_BATCH_READ: 'sheet_batch_read'` under `API_REGISTRY.ADMIN`.

### **API Client**

#### [src/services/apiClient.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/services/apiClient.js)
- Enhanced the `executeAction` method to read `options.actionOptions` and append it directly to `requestBody.options`, allowing root-level configurations to be transmitted to the backend macro.

### **ERP Hydration Hook**

#### [src/hooks/useErpHydration.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/hooks/useErpHydration.js)
- Reconfigured `HYDRATION_CONFIG` to map each cache target namespace directly to its respective spreadsheet `category` and `sheet` name.
- Refactored `useErpHydration`'s `queryFn` to:
  - Generate a structured payload mapping required sheets (Student, Course, Batch, Package, PackageItem, PackagePerk, Teacher, Branch) to their target workbook spreadsheet IDs.
  - Dispatch the query payload using the new `SHEET_BATCH_READ` action with advanced driver options (`responseKey: 'NAME'` and `driverType: 'ADVANCED'`).
  - Extract datasets directly as arrays under each category and sheet namespace, normalizing and seeding them dynamically into the React Query Client cache.

---

## **Verification Results**
- Ensured all request payloads are correct and mapped schema names align with the spreadsheet categories in `docs/client/sheet_batch_read_quick_start.md`.
