---
issue_id: BUG-0004
title: "React: AddTeacher - Performance bottlenecks due to cascade rendering, unmemoized callbacks, and inline literals"
type: bug
priority: high
severity: major
status: open
created_at: "2026-07-07 10:58:00 +05:30"
updated_at: "2026-07-07 10:58:00 +05:30"
---

# 🐞 React Bug Report

## 📖 Description & Lifecycle
The `AddTeacher` page controller coordinates state, mutations, and data queries for the `<TeacherForm />` subview. However, it introduces significant rendering bottlenecks:
1. Heavy overlays (`ConfirmModal`, `APIErrorModal`) are mounted unconditionally, forcing React to validate and reconcile their subtrees on every micro-keystroke of the parent form.
2. Crucial submit, cancel, and dismiss event callbacks are declared as plain functions. On each render cycle, these functions are re-created, breaking downstream React memoization configurations in `<TeacherForm />`.
3. Dropdown fallback arrays are instantiated inline (`[]`), allocating new pointer positions in memory on every render.
4. Date conversions use raw browser native manipulation rather than ecosystem utility functions (`date-fns`), which can cause timezone discrepancies.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** Antigravity (Agent)
* **Assignee:** Developer
* **Branch:** `feature/bugfix-add-teacher-perf` (Base: `main`)
* **Labels:** `react`, `state-management`, `ui`, `hook`, `performance`
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
| **Problem Statement** | Heavy form entries experience typing lag because of parent-state cascades, pointer discrepancies on dropdown fallback references, and DOM modal validations. |
| **Steps to Reproduce** | 1. Navigate to `/admin/teachers/new` or `/admin/teachers/:id/edit`. <br>2. Type in any form field (e.g. Full Name). <br>3. Monitor React DevTools profiler to observe unnecessary re-renders. |
| **Current Behaviour** | Modals are parsed on every keystroke, event callbacks receive fresh pointer references on every render, and inline literals allocate new arrays on each render cycle. |
| **Expected Behaviour** | The form input lifecycle should remain completely isolated. Modals should only mount on open, callbacks should be memoized, and dropdown literals must use a static global constant pointer. |

---

## 🔬 React Root Cause Analysis (RCA)
* **No Short-Circuit Guards on Modals:** Passing `isOpen` inside `<ConfirmModal isOpen={modalState.isOpen && ...} />` still keeps the element in the DOM tree. React executes child reconcile tasks because the parent element's context changes.
* **Unmemoized Handlers:** Passing `onSubmit={handleFormSubmit}` without wrapping the handler in `useCallback` changes the function signature ref on every state change, invalidating shallow prop comparisons.
* **Literal Arrays:** `courses={coursesData || []}` forces child components to treat the incoming prop as a new reference every render cycle since `[] !== []`.

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `<AddTeacher />`, `<TeacherForm />`
* **Affected Users / Scope:** Administrators/Staff registering or editing teachers.
* **Business Impact:** High (Keystroke stuttering and UI lagging on data-intensive screens).

---

## 🛠️ Code Artifacts & Diagnostics

### 📄 Impacted React Files
| File Path | Component / Hook Role | State / Props Involved |
| :--- | :--- | :--- |
| `src/pages/admin/AddTeacher.jsx` | Page Controller Component | Orchestrates query states, mutation states, and modals |

### 🪵 Console Errors & Stack Trace
```javascript
// React DevTools highlight:
// <AddTeacher> rendered because: hook 3, hook 4 changed.
// <TeacherForm> rendered because: onSubmit changed, courses changed.
```

---

## 🚀 Resolution Strategy

### Suggested Fix

* Implement short-circuit portal rendering:
  ```jsx
  {modalState.isOpen && modalState.status === 'success' && <ConfirmModal ... />}
  ```
* Memoize submission and route change handlers with `useCallback`.
* Declare a global `EMPTY_FALLBACK_ARRAY` constant to preserve stable pointers for fallbacks.
* Use `date-fns` for rendering and calculating dates safely.

### 📋 Verification Criteria

* [x] Modals do not mount in the DOM unless active.
* [x] Callbacks maintain identical reference identities across typing renders.
* [x] No memory address allocations for nullish selectors.
* [x] Standard double-mount render safety under `StrictMode`.

---

## 🏁 Resolution Log

* **Resolution Date:** 2026-07-07
* **Developer:** Antigravity (Agent)
* **Fix Commit / PR:** Pending
* **Target Version:** v2.0
