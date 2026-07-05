---
Date: 2026-06-24T16:56:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Enriched Schema Error Aggregation for Validation Alerts

This plan outlines the updates to dynamically collect, track, and aggregate field-level violations and types within validation alerts, solving the validation "information blackout" while preserving loop safety, frame debouncing, and signature-based grouping.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Schemas:**
  * Schemas are dynamically resolved at runtime from [schemaRegistry.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/schemaRegistry.js) which correspond to definitions in `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/`.
* **Referenced Core Modules:**
  * [alertStore.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/alertStore.js)
  * [validationEngine.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/validationEngine.js)
  * [cacheHelper.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)

---

## **2. Fact vs. Assumption Boundary (Rule N3)**

### **Actual Verified Facts:**
1. **Aggregated Count Blackout**: Grouped warnings tell developers the total count of records that failed validation, but they do not list the specific fields (e.g. `phone`, `email`) or violation types (e.g. `type_mismatch`, `required`) that were violated.
2. **Alert Grouping Contract**: The current deduplication contract is based on signature fingerprinting. We can extend the metadata payload of `addAlert` without breaking this contract.

### **System Assumptions:**
1. **In-Memory Accumulation**: Aggregating errors into a `violationsRegistry` object within `alertStore` will have negligible memory overhead for active notification limits (< 50 alerts).

---

## **3. Proposed Changes (Rule N1)**

### **Centralized State Layer**

#### [MODIFY] [alertStore.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/alertStore.js)

**Method Signatures & Code Blocks:**
```javascript
/**
 * Compiles a structured markdown bulleted summary from an accumulated violations registry.
 * 
 * @private
 * @param {Object} registry - Dictionary mapping field names to validation metadata: { [field]: { type, count } }
 * @returns {string} Markdown summary detailing occurrences per field.
 */
function compileEnrichedDescription(registry) {
  let summary = `The following distinct field validation failures were captured across records:\n`;
  Object.entries(registry).forEach(([field, meta]) => {
    summary += `\n• Field [${field}]: Found ${meta.count} occurrence(s) of [${meta.type}].`;
  });
  return summary;
}

/**
 * Adds or updates an alert with structured validation error metadata.
 * 
 * @param {Object} alert - Alert configuration payload.
 * @param {string} [alert.metaField] - The field that failed validation.
 * @param {string} [alert.metaType] - The violation type code.
 * @returns {string} Group signature key.
 */
alertStore.addAlert = function(alert) {
  const signature = alert.signature || `${alert.title}:${alert.variant}`;
  const existingIndex = alerts.findIndex(a => a.signature === signature);

  const targetField = alert.metaField || 'unknown_field';
  const targetType = alert.metaType || 'generic_error';

  if (existingIndex !== -1) {
    const existing = alerts[existingIndex];
    
    // Update structural tracking dictionary
    const updatedRegistry = { ...(existing.violationsRegistry || {}) };
    if (!updatedRegistry[targetField]) {
      updatedRegistry[targetField] = { type: targetType, count: 0 };
    }
    updatedRegistry[targetField].count += 1;

    alerts = [...alerts];
    const nextCount = (existing.count || 1) + 1;

    alerts[existingIndex] = {
      ...existing,
      count: nextCount,
      violationsRegistry: updatedRegistry,
      description: compileEnrichedDescription(updatedRegistry)
    };
  } else {
    // First time seeing this policy fingerprint signature
    const id = Math.random().toString(36).substring(2, 9);
    const initialRegistry = {
      [targetField]: { type: targetType, count: 1 }
    };

    alerts = [...alerts, { 
      ...alert, 
      id, 
      signature, 
      count: 1,
      violationsRegistry: initialRegistry,
      description: compileEnrichedDescription(initialRegistry)
    }];
  }

  if (alerts.length > 50) {
    alerts = alerts.slice(alerts.length - 50);
  }

  // Frame-rate throttle re-renders (Strategy A)
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    listeners.forEach(listener => listener(alerts));
  }, 16);

  return signature;
};
```

---

### **Validation Engine Layer**

#### [MODIFY] [validationEngine.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/validationEngine.js)

**Method Signature & Code Block:**
```javascript
/**
 * Processes schema validation errors, feeding granular metadata to the alertStore.
 * 
 * @private
 */
function handleValidationFailures(entityName, record, errors, failMode, suppressAlert = false) {
  const summaryMessage = `Validation failed for entity "${entityName}" (${errors.length} violations).`;

  // Always retain detailed developer console traces
  console.group(`⚠️ [ValidationEngine:SchemaViolation] ${summaryMessage}`);
  console.log('Violated Record:', record);
  errors.forEach(err => {
    console.warn(`- [${err.field}]: ${err.message}`);
  });
  console.groupEnd();

  if (!suppressAlert) {
    // Loop through all accumulated errors in this record to feed the registry accurately
    errors.forEach(err => {
      // Group signature broadly by entity type and policy code category
      const signature = `${entityName}:${err.type}`; 
      
      alertStore.addAlert({
        variant: 'warning',
        title: `Schema Violation: ${entityName.toUpperCase()}`,
        signature,
        metaField: err.field, // Passed up to map the structured tracking map
        metaType: err.type
      });
    });
  }

  if (failMode === 'fast') {
    throw new SchemaValidationError(summaryMessage, entityName, errors, record);
  }

  return false;
}
```

---

### **Centralized Cache Ingestion Layer**

#### [MODIFY] [cacheHelper.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)

**Ingestion Loop Refactoring:**
- Import `getSchema` from `./schemaRegistry.js`.
- Scan all list items for violations (unknown fields, missing required fields, type mismatches, invalid choices) and push violations to `failedViolationsList`.
- For each violation, call `alertStore.addAlert(...)` using the signature `${entity}:bulk_list_failure`.

---

## **4. Performance Regression & Benchmark Assertions (Rule N5)**

* **Metric Formula**: $T(n) = O(1)$ rendering updates dispatched to React per frame cycle, independent of record loop size $n$.
* **Harness Assertion**: We will profile validation execution inside `resolveList` to verify that scanning 1,000 records aggregates all violations without triggering multiple listener dispatches or dropping visual frames.

---

## **5. Legacy Maintenance Mitigation & Red Flag Isolation (Rule N6)**

There are no backwards-compatibility risks. Legacy alert dispatch styles are fully replaced.
