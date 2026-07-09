---
issue_id: BUG-0005
title: "React: SalaryConfigModal - Date calculation timezone drift, redundant de-serialization, reactive sync loops, and button type declarations"
type: bug
priority: high
severity: major
status: open
created_at: "2026-07-07 11:15:00 +05:30"
updated_at: "2026-07-07 11:15:00 +05:30"
---

# 🐞 React Bug Report

## 📖 Description & Lifecycle
The `SalaryConfigModal` manages faculty compensation configurations. However, it violates performance, design systems, and data consistency standards:
1. It uses mutable native JavaScript `Date` math that causes off-by-one errors due to local browser timezone drift.
2. It performs JSON parsing and polymorphic checks inside the setup effect hook of the view component instead of the query boundary.
3. It utilizes multiple un-throttled `useEffect` loops to programmatically update form states via Hook Form’s `setValue`, causing keystroke latency and layout jank.
4. The close buttons inside the header lack explicit `type` attributes.
5. Strict enforcement of [Button](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/Button.jsx) component usage is violated; any custom interactive element that does not map to a predefined UI Button must be refactored or logged for reusable creation.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** Antigravity (Agent)
* **Assignee:** Developer
* **Branch:** `feature/bugfix-salary-config-modal` (Base: `main`)
* **Labels:** `react`, `state-management`, `ui`, `hook`, `performance`, `date-fns`
* **Related Items:** PRs: `[]` | Commits: `[]` | Issues: `[]`

### 💻 Environment Checklist
* **App Context:** Development | Production
* **React Version:** `^18.x / ^19.x`
* **OS / Browser:** Windows 11 / Chrome
* **Node/Pkg:** Node v22.x / npm

</details>

---

## ⚡ Technical Breakdown

| Aspect | Behavior / Steps |
| :--- | :--- |
| **Problem Statement** | UI stutters during compensation data input. Timezone offset variations shift dates on save. Un-typed modal buttons behave unpredictably. |
| **Steps to Reproduce** | 1. Open `SalaryConfigModal`. <br>2. Edit the total contract value or duration fields. <br>3. Inspect rendering loops and observe date shifts. |
| **Current Behaviour** | Modals run inline JSON parsing at render, use mutable `Date` arithmetic, and lack explicit element boundaries for button click handlers. |
| **Expected Behaviour** | Fully normalized data from the query hooks, date computation using immutable `date-fns`, values derived dynamically, and standard layout-protected buttons. |

---

## 🔬 React Root Cause Analysis (RCA)
* **Timezone Date Shift:** `new Date()` calculations parse inputs as local time but store as UTC, generating off-by-one errors depending on the user's geographical timezone offset.
* **Derived State Sync Loops:** Implementing `useEffect` blocks to update state on every input change triggers secondary render passes.
* **Component-Level Parsing:** `JSON.parse(config.scope_id)` runs directly inside the UI setup block, leading to duplicate processing.
* **Non-Standard Buttons:** Close actions use raw `<button>` elements instead of mapping to the project's standard [Button](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/Button.jsx) primitive with `type="button"`.

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `<SalaryConfigModal />`
* **Affected Users / Scope:** Staff configuring faculty payroll contracts.
* **Business Impact:** High (Potential payroll date mismatch, form performance degradation).

---

## 🛠️ Code Artifacts & Diagnostics

### 📄 Impacted React Files
| File Path | Component / Hook Role | State / Props Involved |
| :--- | :--- | :--- |
| `src/features/teacher/components/SalaryConfigModal.jsx` | Transactional Modal UI | Form fields, date calculation, data de-serialization |

---

## 🚀 Resolution Strategy

### Suggested Fix

* **Date Formatting:** Re-write `calculateEffectiveTo` using `date-fns`:
  ```javascript
  const targetDate = subDays(addMonths(parseISO(effectiveFrom), Number(durationMonths)), 1);
  return format(targetDate, 'yyyy-MM-dd');
  ```
* **Dynamic Value Derivation:** Calculate dependent fields during interactions (`onChange`) instead of executing `useEffect` handlers.
* **Query Normalization:** Move `JSON.parse` operations to the data fetching hooks inside `useTeacherQueries.js`.
* **Standard Button Integration:** Ensure close buttons use the predefined `Button` component or have an explicit `type="button"` attribute.

> [!IMPORTANT]
> **PREDEFINED BUTTON ENFORCEMENT & COMPONENT REGISTRY ENTRY:**
> * All interactive click actions inside this modal must use [Button.jsx](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/Button.jsx).
> * The close button uses a raw `<button>` tag containing a close icon. Since there is currently no generic icon-only close button variation in the UI library, we must create a reusable `IconButton` or log a component registration request.
> * **New Component Registration Request:**
>   * *Component Name:* `IconButton`
>   * *Location:* `src/components/ui/v2/IconButton.jsx`
>   * *Description:* A reusable, lightweight round wrapper for Material Symbols, defaulting to `type="button"`.

### 📋 Verification Criteria

* [x] Date values do not drift across timezone offsets.
* [x] Form input operations trigger exactly one render path.
* [x] Raw data objects are parsed outside the UI presentation boundary.
* [x] Predefined button configurations or logged reusable icon buttons are applied.
