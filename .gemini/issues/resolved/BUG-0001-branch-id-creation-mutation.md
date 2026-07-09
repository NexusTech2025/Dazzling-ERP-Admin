---
issue_id: BUG-0001
title: "React: [BranchFormModal] - Client-side primary key generation conflict with backend auto-ID policy"
type: bug
priority: high
severity: major
status: open
created_at: "2026-07-06 23:38:00 +05:30"
updated_at: "2026-07-06 23:38:00 +05:30"
---

# 🐞 React Bug Report

## 📖 Description & Lifecycle
During physical branch registration, form submissions contain or validate a client-supplied or empty `branch_id` parameter. The backend core database schema specifies `branch_id` as an auto-generated primary key (`"type": "auto"`, prefixed with `"BRN"`) that is non-editable. Consequently, sending any predefined, empty, or custom generated `branch_id` value during a `data_create` request violates database referential/write constraints, causing the server to reject the transaction.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** Antigravity (Agent)
* **Assignee:** Developer
* **Branch:** `main`
* **Labels:** `react`, `state-management`, `ui`, `core-branch`
* **Related Items:** Commits: [`b3feebb9f3851a2269c10ce371f608bbf71823d7`]

### 💻 Environment Checklist
* **App Context:** Development / Production
* **React Version:** `^18.x`
* **OS / Browser:** Windows 11 / Chrome 138
* **Node/Pkg:** Node v22.x / npm

</details>

---

## ⚡ Technical Breakdown

| Aspect | Behavior / Steps |
| :--- | :--- |
| **Problem Statement** | The database schema `Branch.json` defines `branch_id` as an auto-generated identifier (`type: "auto"` with prefix `BRN`). Submitting a create mutation with a preset or placeholder key (e.g. empty string or generated token) triggers a write rejection on the backend. |
| **Steps to Reproduce** | 1. Navigate to `/admin/branches` page.<br>2. Click **Add Branch** to trigger `<BranchFormModal />`.<br>3. Fill out the Branch Name and click **Create Branch**.<br>4. Observe the backend API rejection response. |
| **Current Behaviour** | The frontend includes `branch_id` or default key properties inside the payload sent to `data_create`, or the backend database encounters an invalid primary key conflict. |
| **Expected Behaviour** | The frontend submits only the editable fields (`branch_name`, `location`, `status`) to the creation endpoint, letting the backend assign the `branch_id` automatically. |

---

## 🔬 React Root Cause Analysis (RCA)
According to the primary source of truth schema `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Core/Branch.json`, the primary key `branch_id` is defined as:
```json
"branch_id": {
  "type": "auto",
  "idPrefix": "BRN",
  "editable": false,
  "unique": true,
  "required": false
}
```
If the frontend passes a value for `branch_id` (even a blank string `""`) in the `data` block of `DATA.CREATE` ('data_create'), the spreadsheet gateway attempts to write it directly rather than generating one, violating the `editable: false` database policy.

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `BranchFormModal.jsx`, `useCreateBranchMutation`
* **Affected Users / Scope:** System administrators attempting to add new branches.
* **Business Impact:** High (Blocks institution branch management and routing setup).

---

## 🛠️ Code Artifacts & Diagnostics

### 📄 Impacted React Files
| File Path | Component / Hook Role | State / Props Involved |
| :--- | :--- | :--- |
| `src/features/core/components/BranchFormModal.jsx` | Form modal handling data entry | Manages local `formData` state |
| `src/pages/admin/Branches.jsx` | Branch directory controller page | Invokes mutations and processes state |

---

## 🚀 Resolution Strategy

### Suggested Fix

1. **Verify State Purity:** Ensure `BranchFormModal.jsx` does not include `branch_id` in its payload when calling `onSubmit`.
2. **Filter Out PK in Mutations:** Update the submit handler in `Branches.jsx` or the mutation function in `useBranchQueries.js` to strip `branch_id` from the payload before transmitting it to `data_create`.

```javascript
// Example sanitation in handleFormSubmit:
const { branch_id, ...cleanData } = formData;
createMutation.mutate(cleanData, mutationOptions);
```

### 📋 Verification Criteria

* [ ] Verification that create payloads contain only `branch_name`, `location`, and `status`.
* [ ] Successful creation of a branch without API errors.
* [ ] Correct auto-generation of ID prefixed with `BRN-` in the directory list.

---

## 🏁 Resolution Log

> *To be completed by the resolving engineer.*

* **Resolution Date:** 
* **Developer:** 
* **Fix Commit / PR:** 
* **Target Version:** 
