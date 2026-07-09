---
issue_id: BUG-0007
title: "React: AttendanceHistoryMatrix - TypeError on .map() due to query/component data-shape contract mismatch"
type: bug
priority: high
severity: blocker
status: open
created_at: "2026-07-07 22:09:00 +0530"
updated_at: "2026-07-07 22:09:00 +0530"
---

# 🐞 React Bug Report

## 📖 Description & Lifecycle

`AttendanceHistoryMatrix` crashes at mount with a `TypeError: Cannot read properties of undefined (reading 'map')` at `AttendanceHistoryMatrix.jsx:124`.

The root cause is a **data-shape contract mismatch** between what the query hook `useBatchAttendanceMatrixQuery` returns and what the component destructures.

**The component assumes:**
```js
const { dateHeaders, matrix } = data;
// Expects: { dateHeaders: string[], matrix: MatrixRow[] }
```

**The query hook actually returns:**
```js
// Line 39 in useAttendanceQueries.js:
return Array.isArray(response.data) ? response.data : (response.data?.data || []);
```

This means the query's `queryFn` always resolves to a **flat array** (`[]`), never an object with `dateHeaders` and `matrix` keys. When the component destructures `data`, both `dateHeaders` and `matrix` resolve to `undefined`. The `if (!data) return null` guard on line 16 does not protect against this because `data` **is** defined — it is an empty array `[]`, which is truthy. React then proceeds to render the JSX, hits `dateHeaders.map(...)`, and throws.

The lifecycle sequence:
1. Component mounts → `useBatchAttendanceMatrixQuery(batchId, 15)` fires.
2. `isLoading` is `true` → loading spinner renders (safe).
3. Query resolves → `data = []` (a flat array, truthy).
4. `if (!data) return null` is **skipped** (`[]` is truthy).
5. `const { dateHeaders, matrix } = data` → both are `undefined`.
6. JSX renders → `dateHeaders.map(...)` → **💥 TypeError**.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** `Antigravity Agent (Agent)`
* **Assignee:** `—`
* **Branch:** `main`
* **Labels:** `react`, `data-contract`, `query-hook`, `attendance`, `crash`
* **Related Items:** PRs: `[]` | Commits: `[]` | Issues: `[]`

### 💻 Environment Checklist
* **App Context:** Development
* **React Version:** `^18.x` (Concurrent Rendering active: Yes)
* **OS / Browser:** Windows 11 / Chrome
* **Node/Pkg:** Node v22.x / npm

</details>

---

## ⚡ Technical Breakdown

| Aspect | Behavior / Steps |
| :--- | :--- |
| **Problem Statement** | `useBatchAttendanceMatrixQuery` resolves to a flat array (`[]` or raw `Array`), but `AttendanceHistoryMatrix` destructures `data` as `{ dateHeaders, matrix }`. Both fields are `undefined`, causing `.map()` to throw on the first render after data loads. |
| **Steps to Reproduce** | 1. Navigate to any Batch Profile page.<br>2. Switch to the **Attendance** tab (which mounts `AttendanceHistoryMatrix`).<br>3. Wait ~1–2s for the query to resolve from loading state.<br>4. Observe crash: `TypeError: Cannot read properties of undefined (reading 'map')` |
| **Current Behaviour** | • Query resolves to a flat `[]` (or raw array from API).<br>• The `!data` null guard is bypassed because `[]` is truthy.<br>• Destructuring yields `undefined` for both `dateHeaders` and `matrix`.<br>• Component crashes during render — Error Boundary is tripped. |
| **Expected Behaviour** | • `data` returned by the hook should be shaped as `{ dateHeaders: string[], matrix: MatrixRow[] }`.<br>• OR the component must safely guard against non-object `data` and flat array inputs before destructuring. |

---

## 🔬 React Root Cause Analysis (RCA)

**Primary Cause — Query hook shape mismatch (Layer: Data / Hook)**

`useBatchAttendanceMatrixQuery` in `useAttendanceQueries.js` (line 39) normalizes the API response into a flat array:
```js
return Array.isArray(response.data) ? response.data : (response.data?.data || []);
```
This was copied from the pattern used by `useBatchAttendanceQuery` (which correctly expects a flat array of attendance records). However, `STUDENT_GET_MATRIX` returns a structured object `{ dateHeaders, matrix }` — not a flat array. The generic fallback `(response.data?.data || [])` collapses the response to an array instead of preserving the object shape.

**Secondary Cause — Insufficient null/type guard in component (Layer: Presentational)**

The component's only guard (`if (!data) return null`) only checks for falsy `data`. It does not validate that `data` is a non-array object with the required `dateHeaders` and `matrix` keys. A type-safe guard would have prevented the crash:
```js
if (!data || !data.dateHeaders || !data.matrix) return null;
```

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `AttendanceHistoryMatrix`, `useBatchAttendanceMatrixQuery`
* **Affected Users / Scope:** All admin users viewing the **Attendance** tab on any Batch Profile page.
* **Business Impact:** **Blocker** — The entire Attendance History tab is completely non-functional and crashes to a blank/error state on every load.

---

## 🛠️ Code Artifacts & Diagnostics

### 📄 Impacted React Files
| File Path | Component / Hook Role | State / Props Involved |
| :--- | :--- | :--- |
| `src/features/batch/components/profile/AttendanceHistoryMatrix.jsx` | Presentational Matrix View | Consumes `data` from `useBatchAttendanceMatrixQuery`; destructures `{ dateHeaders, matrix }` |
| `src/features/batch/hooks/useAttendanceQueries.js` | TanStack Query hook | `queryFn` returns flat array instead of `{ dateHeaders, matrix }` object |

### 🔍 Exact Fault Lines

**Hook (root cause) — `useAttendanceQueries.js` line 39:**
```js
// ❌ WRONG: Forces structured matrix response into a flat array
return Array.isArray(response.data) ? response.data : (response.data?.data || []);
```

**Component (crash site) — `AttendanceHistoryMatrix.jsx` lines 16–18:**
```js
if (!data) return null; // ❌ Does NOT catch data = [] (truthy empty array)

const { dateHeaders, matrix } = data; // 💥 Both are undefined when data = []
```

### 🪵 Console Errors & Stack Trace
```
TypeError: Cannot read properties of undefined (reading 'map')
    at AttendanceHistoryMatrix (http://localhost:5173/Dazzling-ERP-Admin/src/features/batch/components/profile/AttendanceHistoryMatrix.jsx:124:21)
    at renderWithHooks (react-dom_client.js:5654:24)
    at updateFunctionComponent (react-dom_client.js:7475:21)
    at beginWork (react-dom_client.js:8525:20)
```

---

## 🚀 Resolution Strategy

### Suggested Fix

**Fix A — Correct the `queryFn` return in `useAttendanceQueries.js` (PRIMARY — required):**

The `queryFn` must return the structured `{ dateHeaders, matrix }` object directly, not collapse it into a flat array:

```js
// ✅ CORRECT — preserve the structured matrix object
export const useBatchAttendanceMatrixQuery = (batchId, days = 15) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.attendance.matrix(batchId, days),
    queryFn: async ({ signal }) => {
      const response = await apiClient.executeAction(
        API_REGISTRY.ATTENDANCE.STUDENT_GET_MATRIX,
        { where: { batch_id: batchId } },
        token,
        { signal }
      );
      // API returns { dateHeaders: [], matrix: [] } — return the object as-is
      return response.data?.data || response.data || { dateHeaders: [], matrix: [] };
    },
    enabled: !!token && !!batchId,
  });
};
```

**Fix B — Add type-safe guard in `AttendanceHistoryMatrix.jsx` (SECONDARY — defensive):**

```js
// Replace the existing single guard on line 16 with a type-safe check:
if (!data || !Array.isArray(data.dateHeaders) || !Array.isArray(data.matrix)) return null;
```

This ensures the component never crashes even if the hook returns an unexpected shape.

### 📋 Verification Criteria

* [ ] Navigating to Batch Profile → Attendance tab renders the matrix table without crashing.
* [ ] `dateHeaders` renders the correct date column headers in the `<thead>`.
* [ ] `matrix` rows render per-student attendance chips correctly.
* [ ] Empty state (`dateHeaders: [], matrix: []`) renders gracefully without `.map()` errors.
* [ ] No `TypeError` in the browser console on mount or re-mount.
* [ ] React StrictMode double-mount does not cause a crash on the second mount cycle.

---

## 🏁 Resolution Log

> *To be completed by the resolving engineer.*

* **Resolution Date:**
* **Developer:**
* **Fix Commit / PR:**
* **Target Version:**
