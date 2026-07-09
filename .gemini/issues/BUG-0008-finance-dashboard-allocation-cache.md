---
issue_id: BUG-0008
title: "React: [State/Query] - Cache fragmentation and state divergence for BatchAllocation in FinanceDashboard"
type: bug
priority: medium
severity: major
status: open
created_at: "2026-07-10 00:15:35 +05:30"
updated_at: "2026-07-10 00:15:35 +05:30"
---

# 🐞 React Bug Report

## 📖 Description & Lifecycle
With the migration of the Student Attendance Manager module to the centralized `useBatchAllocationsQuery()` hook under the canonical query key `['batch_allocation', 'list', { filter: {} }]`, the `FinanceDashboard` remains decoupled and relies on a hard-coded inline fetch using query key `['finance', 'dashboard-allocations']`. 

This leads to cache fragmentation: the application maintains two parallel caches for the exact same database target (`BatchAllocation`). If a batch allocation record changes or is invalidated in one flow, the other cache is not synchronized, resulting in stale data presentation or rendering divergence between the Finance Dashboard and the Attendance Manager.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** Antigravity (Agent)
* **Assignee:** `<Developer Name>`
* **Branch:** `feature/attendance-orchestration-refactor` (Base: `main`)
* **Labels:** `react`, `state-management`, `react-query`, `finance`, `cache-fragmentation`
* **Related Items:** PRs: `[]` | Commits: `[]` | Issues: `[]`

### 💻 Environment Checklist
* **App Context:** Development | Production
* **React Version:** `^18.x / ^19.x` (Concurrent Rendering active: Yes)
* **OS / Browser:** Windows 11 / Chrome 138
* **Node/Pkg:** Node v22.x / npm

</details>

---

## ⚡ Technical Breakdown

| Aspect | Behavior / Steps |
| :--- | :--- |
| **Problem Statement** | The query cache holds two separate copies of `BatchAllocation` data under key `['finance', 'dashboard-allocations']` and `['batch_allocation', 'list', { filter: {} }]`. If updates occur (e.g. adding allocations), cache invalidations targeting `batch_allocation` will not invalidate the finance dashboard allocations, leaving the user with a stale view of student enrollment sizes and billing allocations. |
| **Steps to Reproduce** | 1. Navigate to Finance Dashboard; allocations load under key `['finance', 'dashboard-allocations']`. <br>2. Navigate to Attendance Manager; allocations load/query under key `['batch_allocation', 'list']`. <br>3. Perform allocation mutations (or clear the main allocations cache). <br>4. Re-visit Finance Dashboard; observe stale allocation matrix due to isolated cache keys. |
| **Current Behaviour** | * Duplicate requests for identical tables. <br>* Cache invalidation mismatch (diverging state). <br>* Inconsistent representation of the same database records in different views. |
| **Expected Behaviour** | * A single cache entry under canonical key `['batch_allocation', 'list', { filter: {} }]` shared across all components. <br>* Clean unified cache invalidation triggering updates globally on mutation. |

---

## 🔬 React Root Cause Analysis (RCA)
The root cause is the lack of delegation to a centralized custom hook for the `BatchAllocation` dataset. Prior to the refactoring of `useAttendanceOrchestration.js`, there was no registered query key in `queryKeys.js` for allocations, leading features like `FinanceDashboard` to write ad-hoc, inline React Query keys (`['finance', 'dashboard-allocations']`) bypassing centralized schema validation (`cacheHelper.js` / `resolveList`).

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `FinanceDashboard.jsx`, `useBatchAllocationsQuery()`, `queryKeys.js`
* **Affected Users / Scope:** Admin and Finance users who view or manage batch enrollments and fee account statuses.
* **Business Impact:** Medium (Stale data risk in billing/accounting analysis).

---

## 🛠️ Code Artifacts & Diagnostics

### 📄 Impacted React Files
| File Path | Component / Hook Role | State / Props Involved |
| :--- | :--- | :--- |
| `src/features/finance/FinanceDashboard.jsx` | Dashboard Presentational Component | Performs inline query `['finance', 'dashboard-allocations']` |

---

## 🚀 Resolution Strategy

### Suggested Fix

1. Open `src/features/finance/FinanceDashboard.jsx`.
2. Replace the inline `useQuery` call for `batchAllocations` (L49–56) with the newly introduced `useBatchAllocationsQuery` hook:
   ```javascript
   import { useBatchAllocationsQuery } from '../batch/hooks/useBatchQueries';
   
   // In component:
   const { data: batchAllocations = [], isLoading: isAllocationsLoading } = useBatchAllocationsQuery();
   ```

### 📋 Verification Criteria

* [ ] DevTools demonstrates a single unified cache entry for `['batch_allocation', 'list']` after visiting both routes.
* [ ] Clearing query keys under the `batch_allocation` tree triggers refetching on the Finance Dashboard.
* [ ] No regressions in dashboard analytics or enrollment counts.
