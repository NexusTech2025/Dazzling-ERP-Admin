---
issue_id: BUG-0014
title: "React: [useBaseAttendanceController] - stageUpdate argument signature mismatch causes status toggle clicks to be silently deleted"
type: bug
priority: critical
severity: blocker
status: open
created_at: "2026-07-28 23:46:00 +05:30"
updated_at: "2026-07-28 23:46:00 +05:30"
---

# 🐞 React Bug Report

## 📖 Description & Lifecycle
In `AttendanceRegisterView.jsx`, components invoke `updateStageField` using a 3-argument signature `(id, key, value)`:
* `StatusCell`: `updateStageField(studentId, 'status', val)`
* `TimeCell`: `updateStageField(studentId, field, val)`
* `RemarksInput`: `updateStageField(id, 'remarks', val)`
* `handleMarkAllPresent`: `updateStageField(rec.student_id, 'status', 'P')`

However, `stageUpdate` inside `useBaseAttendanceController` (`useAttendance.js`) was declared with a 2-argument signature:
`stageUpdate(id, updatedFields)`.

When `updateStageField(id, 'status', 'P')` is called:
1. `id` receives `"STU-F120AE5D"`.
2. `updatedFields` receives the string `"status"`.
3. The 3rd parameter (`"P"`) is ignored.
4. `mergedFields = { ...prev[id], ...'status' }` results in `{ 0: 's', 1: 't', ... }`, where `mergedFields.status` is `undefined`.
5. In the baseline auto-reversion check, `isStatusReverted` evaluates `mergedFields.status === undefined` to `true`.
6. All 4 revert flags (`isStatusReverted`, `isRemarksReverted`, `isEntryTimeReverted`, `isExitTimeReverted`) evaluate to `true`, causing `stageUpdate` to delete the delta from `draftDeltas` immediately.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** AI Coding Assistant (Antigravity)
* **Assignee:** Lead Frontend Engineer
* **Branch:** `main`
* **Labels:** `react`, `state-management`, `hook-signature`, `blocker`
* **Related Items:** PRs: `[]` | Commits: `[]` | Issues: `[BUG-0009, BUG-0010]`

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
| **Problem Statement** | Clicking status buttons `P`, `A`, or `L` on unmarked attendance records has zero effect. |
| **Steps to Reproduce** | 1. Open daily registry sheet for a batch with unmarked students (`NR`).<br>2. Click `P`, `A`, or `L` on any row.<br>3. Observe console log showing `stageUpdate called for id: ... fields: status` followed by instant delta deletion. |
| **Current Behaviour** | Delta is deleted instantly on click because `fields` receives string `"status"`. UI does not update. |
| **Expected Behaviour** | Staged status updates to `P`/`A`/`L`, `isDirty` turns true, and UI highlights selected status. |

---

## 🔬 React Root Cause Analysis (RCA)
Signature mismatch between presentation cells and state controller:
* Presentation calls: `updateStageField(id, fieldName, fieldValue)`
* Controller expects: `stageUpdate(id, updatedFieldsObject)`

`updatedFields` string coercion breaks object spread and resolves `mergedFields.status` to `undefined`.

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `useBaseAttendanceController` (`useAttendance.js`), `<StatusCell />`, `<TimeCell />`, `<RemarksInput />`, `<AttendanceRegisterView />`
* **Affected Users / Scope:** All users attempting to mark student attendance.
* **Business Impact:** Blocker (Completely breaks attendance marking functionality).

---

## 🛠️ Code Artifacts & Diagnostics

### 🪵 Console Error Log Trace
```javascript
useAttendance.js:79 [BaseAttendanceController] stageUpdate called for id: STU-F120AE5D fields: status
useAttendance.js:89 [BaseAttendanceController] serverMatch found: {attendance_id: null, student_id: 'STU-F120AE5D', status: 'NR', ...}
useAttendance.js:104 [BaseAttendanceController] revert check: {isStatusReverted: true, isRemarksReverted: true, isEntryTimeReverted: true, isExitTimeReverted: true}
useAttendance.js:114 [BaseAttendanceController] changes reverted, delta deleted for: STU-F120AE5D
```

---

## 🚀 Resolution Strategy

### Suggested Fix
Update `stageUpdate` in `useBaseAttendanceController` to support both signatures dynamically:

```javascript
const stageUpdate = useCallback((id, updatedFields, value) => {
    if (!id) return;

    // Support both object signature stageUpdate(id, { status: 'P' })
    // and positional signature stageUpdate(id, 'status', 'P')
    const fieldsToMerge = typeof updatedFields === 'string'
        ? { [updatedFields]: value }
        : updatedFields;

    setDraftDeltas((prev) => {
        const currentEntityDraft = prev[id] || {};
        const mergedFields = { ...currentEntityDraft, ...fieldsToMerge };
        ...
```

### 📋 Verification Criteria

* [ ] Clicking `P`, `A`, or `L` on unmarked (`NR`) student updates `draftDeltas` correctly.
* [ ] Console log shows `fieldsToMerge: { status: 'P' }` instead of string `"status"`.
* [ ] UI updates status badge, sets `isDirty: true`, and sticky action tray appears.

---

## 🏁 Resolution Log

* **Resolution Date:** 2026-07-28
* **Developer:** Antigravity AI
* **Fix Commit / PR:** Pending
* **Target Version:** v2.1.0
