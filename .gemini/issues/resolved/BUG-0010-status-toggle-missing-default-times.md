---
issue_id: BUG-0010
title: "React: [StatusCell] - Toggling status from Absent to Present leaves punch times blank"
type: bug
priority: high
severity: major
status: open
created_at: "2026-07-28 23:42:00 +05:30"
updated_at: "2026-07-28 23:42:00 +05:30"
---

# 🐞 React Bug Report

## 📖 Description & Lifecycle
In `AttendanceRegisterView.jsx`, the `StatusCell` component renders `StateSelector` options (`P`, `A`, `L`). When an user toggles an individual student's status from `'A'` (Absent) or `'NR'` (Unmarked) to `'P'` (Present), `StatusCell` dispatches:
`updateStageField(studentId, 'status', 'P')`.

Because `updateStageField` is only passed the `'status'` key, `draftDeltas[studentId]` becomes `{ status: 'P' }`. For students previously marked `'A'`, `row.entry_time` in `serverRegistry` is `null`. When `transformServerToClientRoster` re-evaluates the roster item, `defaultEntryTime` resolves to `null`. 

Consequently, the UI renders the student with status `'P'` but check-in/check-out fields remain empty (`null`). When the user saves, `entry_time: null` and `exit_time: null` are sent to the backend API.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** AI Coding Assistant (Antigravity)
* **Assignee:** Lead Frontend Engineer
* **Branch:** `main`
* **Labels:** `react`, `state-management`, `ui-cell`, `time-picker`
* **Related Items:** PRs: `[]` | Commits: `[]` | Issues: `[BUG-0009]`

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
| **Problem Statement** | Changing an absent student to Present inline results in status `'P'` with `null` punch times. |
| **Steps to Reproduce** | 1. Open daily registry sheet for a batch with an absent (`A`) student.<br>2. Toggle status button from `A` to `P`.<br>3. Observe check-in/out inputs remaining empty. |
| **Current Behaviour** | Status turns `P`, check-in and check-out fields stay `null`. |
| **Expected Behaviour** | Status turns `P`, check-in/out inputs automatically populate with default times (`08:00` / `13:00`). |

---

## 🔬 React Root Cause Analysis (RCA)
`StatusCell` does not inspect current row state before updating. When transitioning from `A` (where punch times are `null`) to `P`, `updateStageField` should supply both `status` and appropriate default time values (`entry_time`, `exit_time`).

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `<StatusCell />`, `<AttendanceRegisterView />`, `useBaseAttendanceController`
* **Affected Users / Scope:** Faculty and admins updating individual student attendance.
* **Business Impact:** High (Incomplete punch logs saved to production database).

---

## 🛠️ Code Artifacts & Diagnostics

### 📄 Impacted React Files
| File Path | Component / Hook Role | State / Props Involved |
| :--- | :--- | :--- |
| `src/features/batch/components/profile/AttendanceRegisterView.jsx` | UI Presentational Component | `StatusCell`, `updateStageField` |
| `src/features/attendance/utils/attendanceUtils.js` | Domain Mappers & Mappings | `transformServerToClientRoster` |

---

## 🚀 Resolution Strategy

### Suggested Fix
Update `StatusCell` (or `stageUpdate` helper) to inject default punch times when toggling to Present/Leave from Absent:
```javascript
export const StatusCell = React.memo(({ studentId, status, student, updateStageField }) => {
  const handleChange = useCallback((newStatus) => {
    if ((newStatus === 'P' || newStatus === 'L') && (!student.entry_time || !student.exit_time)) {
      updateStageField(studentId, {
        status: newStatus,
        entry_time: student.entry_time || '08:00',
        exit_time: student.exit_time || '13:00'
      });
    } else if (newStatus === 'A') {
      updateStageField(studentId, {
        status: 'A',
        entry_time: null,
        exit_time: null
      });
    } else {
      updateStageField(studentId, 'status', newStatus);
    }
  }, [studentId, student, updateStageField]);
  ...
```

### 📋 Verification Criteria

* [ ] Toggling status from `A` to `P` populates check-in and check-out times immediately.
* [ ] Toggling status to `A` clears check-in and check-out inputs to `null`.
* [ ] UI state and payload remain synchronized across cell edits.

---

## 🏁 Resolution Log

* **Resolution Date:** Pending
* **Developer:** TBD
* **Fix Commit / PR:** TBD
* **Target Version:** v2.1.0
