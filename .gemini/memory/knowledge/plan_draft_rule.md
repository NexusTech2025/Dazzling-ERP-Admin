# **Dynamic Implementation Plan Template & Architectural Guidelines**

This document serves as the authoritative, mandatory blueprint for generating any technical implementation plans or system refactoring proposals. When drafting an architectural change, the system must structure its response according to the rules and layouts defined below.

## **1. Non-Domain Driven Infrastructure Rules**

The following block defines the technical guidelines governing code blocks, positional signatures, platform-specific limitations, and legacy system mitigations.

---

# AIRA SYSTEM DESIGN DECREE: INFRASTRUCTURE & PLATFORM RULES (NON-DOMAIN)

When proposing a structural code update, you must adhere to these six strict technical constraints.

---

### Rule N1: Explicit Positional Signatures & Execution Blueprints

Every proposed method update or introduction must be detailed with its exact path reference, followed by a clean, commented JavaScript code block showcasing JSDoc parameters, return types, and explicit exception scenarios. You must accompany each block with a step-by-step technical breakdown of its logical execution workflow.

**Required Method Layout Format:**

```javascript
/**
 * Detailed description of the helper's algorithm and parsing safeguards.
 * @param {string|Object} input - Target payload data segment to analyze.
 * @param {Object} options - Structural configuration options.
 * @param {string} [options.delimiter="-"] - Target split token character.
 * @param {string} [options.format="YYYY-MM-DD"] - Positional template layout sequence.
 * @returns {Object|null} Hash mapping of {year, month, day} integers, or null if invalid.
 * @throws {SheetDB.ValidationError} Form validation or data configuration error.
 */
ClassName.methodName = function(input, options = {}) {
  // Positional parsing logic...
}
```

---

### **Rule N2: Absolute Background Base Knowledge Traceability**

You must explicitly declare the exact files, schema configurations, runtime documentation chapters, or knowledge graph nodes that you used as reference files to formulate your solution design.

* **Trace Pattern:**
  * **Referenced Schemas:** `DazzlingDB/Config/Schema/Category/Table.json`
  * **Referenced Core Modules:** `SheetDB/Core/DataSource.js`
  * **Design Runbooks:** Chapter 1: SheetDB Core Infrastructure

---

### **Rule N3: Explicit Fact vs. Assumption Boundary Declaration**

To eliminate ambiguity, organize your technical design findings into two distinct sections:

1. **Actual Verified Facts:** Directly confirmed by analyzing modular JSON schemas, functional codebase files, or runtime test suites.
2. **System Assumptions:** Inferred because of Google Apps Script container conditions, spreadsheet timezone mismatches, or platform multi-realm execution rules.

---

### **Rule N4: GAS Execution Boundary & Round-Trip Round Up**

Google Apps Script enforces strict wall-clock timeout constraints (`6 minutes` maximum execution time). You are strictly prohibited from nesting any native Google Sheets SpreadsheetApp API call (such as SpreadsheetApp operations, cell evaluations, `.setValue()`, `.getValues()`, or `.appendRow()`) inside loops.

* **The Mandate:** You must process all reads and modifications inside RAM using 2D arrays.
* **The Operation:** Execute exactly `1` single, locked in-memory batch write using `DataSource.deleteRowsBatch` or `updateRowsBatch` to synchronize state back to Sheets.

---

### **Rule N5: Performance Regression & Benchmark Assertions**

Every plan must contain explicit time performance constraints. You must state the target test-harness path under `DazzlingDB/Test/` and integrate console timing assertions tracking execution speeds.

* **Metric Formula:** `T(n) = O(1) API calls — independent of record count n`
* **Harness Assertion:** You must output a timing table to the Apps Script logging console upon execution.

---

### **Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation**

Whenever an implementation plan addresses or refactors older architecture, or relies on an implicit backwards-compatibility fallback path, you must encapsulate that detail inside a red-flag caution block. This gives the reviewer visibility to decide whether to maintain legacy behavior or prune the technical debt.

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [Specify legacy file/method e.g. `AttendanceUtil.js` line 112]
> * **Core Technical Debt Risk:** [Describe parsing drift, timezone shift, or O(n) execution overhead]
> * **Remediation Option:** [Provide alternative code path to completely decouple from legacy support if approved]