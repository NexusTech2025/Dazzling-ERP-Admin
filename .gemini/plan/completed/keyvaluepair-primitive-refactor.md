---
Date: 2026-07-05T20:10:00+05:30
Status: Approved-Completed
---

# Implementation Plan - KeyValuePair Component Refactoring

This plan details replacing the `KeyValuePair` component with the redesigned layout, ensuring backward compatibility for existing callers passing standard `size` props.

---

## 1. Non-Domain Driven Infrastructure Rules

### Rule N1: Explicit Positional Signatures & Execution Blueprints

#### Component: `KeyValuePair`
* **Path Reference:** `src/components/ui/v2/KeyValuePair.jsx`
```javascript
/**
 * KeyValuePair: Foundational primitive component for displaying read-only metadata pairs.
 * @param {string} props.label - Descriptive title of the parameter.
 * @param {string|number} props.value - Data amount/value.
 * @param {string} [props.icon] - Icon name.
 * @param {string} [props.fallback="—"] - Default fallback text.
 * @param {string} [props.layout="horizontal"] - Alignment configuration ('horizontal' | 'vertical').
 * @param {string} [props.size="md"] - Fallback standard size ('sm' | 'md' | 'lg').
 * @param {string} [props.sizeProp] - Custom font size string (e.g., '12px').
 */
```

---

### Rule N2: Absolute Background Base Knowledge Traceability

* **Referenced Design Runbooks:**
  * [KeyValuePair.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/KeyValuePair.jsx)
  * [HorizontalStatMetrics.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/cards/HorizontalStatMetrics.jsx)

---

### Rule N3: Explicit Fact vs. Assumption Boundary Declaration

#### Actual Verified Facts:
1. `HorizontalStatMetrics.jsx` was modified to call `KeyValuePair` with `size="sm"`.
2. Existing code bases and view layouts rely on `KeyValuePair` having `size` props.

#### System Assumptions:
1. Supporting both `size` mapping and custom `sizeProp` is necessary to prevent layout breakage in caller files.

---

## Proposed Changes

### UI Components

---

#### [MODIFY] [KeyValuePair.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/KeyValuePair.jsx)
* Replace existing content with the proposed component structure.
* Support both `size` mapping fallback and custom `sizeProp` parameters to guarantee compatibility.
