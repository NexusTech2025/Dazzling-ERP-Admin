---
issue_id: BUG-0012
title: "React: [AttendanceRegisterView] - Changing date picker silently wipes unsaved staging workspace"
type: bug
priority: medium
severity: minor
status: open
created_at: "2026-07-28 23:42:00 +05:30"
updated_at: "2026-07-28 23:42:00 +05:30"
---

# 🐞 React Bug Report

## 📖 Description & Lifecycle
In `AttendanceRegisterView.jsx`, `handleDateChange` handles date picker selections as follows:

```javascript
const handleDateChange = useCallback((newDateStr) => {
  handleReset();
  setSelectedDate(newDateStr);
}, [handleReset, setSelectedDate]);
```

When a user has active uncommitted staged changes (`isDirty === true`), changing the date picker immediately executes `handleReset()`, wiping `draftDeltas` without presenting a confirmation modal or notification to the user.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** AI Coding Assistant (Antigravity)
* **Assignee:** Lead Frontend Engineer
* **Branch:** `main`
* **Labels:** `react`, `ux`, `date-picker`, `staging-workspace`
* **Related Items:** PRs: `[]` | Commits: `[]` | Issues: `[]`

### 💻 Environment Checklist
* **App Context:** Development / Production
* **React Version:** `^18.x` (Concurrent Rendering active: Yes)
* **OS / Browser:** Windows 11 / Chrome
* **Node/Pkg:** Node v22.x / npm

</details>

---

## ⚡ Technical Breakdown

| Aspect | Behavior / Steps |
| :--- | :--- |
| **Problem Statement** | Changing target date in daily register sheet discards staged workspace edits without user warning. |
| **Steps to Reproduce** | 1. Open daily registry sheet for a batch.<br>2. Toggle several student status buttons (staging changes).<br>3. Change the date picker value to another day. |
| **Current Behaviour** | Workspace is reset silently (`draftDeltas` wiped). |
| **Expected Behaviour** | A confirmation dialog asks the user whether to discard unsaved edits before changing dates. |

---

## 🔬 React Root Cause Analysis (RCA)
`handleDateChange` unconditionally executes `handleReset()`. It fails to evaluate `isDirty` state or prompt user confirmation prior to updating `selectedDate`.

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `<AttendanceRegisterView />`, `useBaseAttendanceController`
* **Affected Users / Scope:** Faculty/admins filling out attendance registers.
* **Business Impact:** Medium (Accidental data loss of staged edits).

---

## 🛠️ Code Artifacts & Diagnostics

### 📄 Impacted React Files
| File Path | Component / Hook Role | State / Props Involved |
| :--- | :--- | :--- |
| `src/features/batch/components/profile/AttendanceRegisterView.jsx` | UI Presentational Component | `handleDateChange`, `isDirty`, `handleReset` |

---

## 🚀 Resolution Strategy

### Suggested Fix
Incorporate `ConfirmModal` or `isDirty` check before resetting workspace state on date changes:
```javascript
const handleDateChange = useCallback((newDateStr) => {
  if (isDirty) {
    if (!window.confirm("You have unsaved staged changes. Discard changes and switch date?")) {
      return;
    }
  }
  handleReset();
  setSelectedDate(newDateStr);
}, [isDirty, handleReset, setSelectedDate]);
```

### 📋 Verification Criteria

* [ ] Switching dates while `isDirty` is true prompts confirmation warning.
* [ ] Canceling the prompt preserves staged edits and current date selection.
* [ ] Confirming the prompt cleanly clears workspace and loads new date.

---

## 🏁 Resolution Log

* **Resolution Date:** Pending
* **Developer:** TBD
* **Fix Commit / PR:** TBD
* **Target Version:** v2.1.0
