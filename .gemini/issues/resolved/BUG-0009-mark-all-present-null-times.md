---
issue_id: BUG-0009
title: "React: [AttendanceRegisterView] - Mark All Present leaves check-in and check-out times null"
type: bug
priority: high
severity: major
status: open
created_at: "2026-07-28 23:42:00 +05:30"
updated_at: "2026-07-28 23:42:00 +05:30"
---

# 🐞 React Bug Report

## 📖 Description & Lifecycle
In `AttendanceRegisterView.jsx`, the `handleMarkAllPresent` callback iterates over the `studentsList` array and invokes `updateStageField(rec.student_id, 'status', 'P')` for every student whose status is not currently `'P'`.

However, for students whose status was previously `'NR'` (Unmarked) or `'A'` (Absent), their `entry_time` and `exit_time` values in `serverRegistry` are `null` (or default fallback values). Because `handleMarkAllPresent` passes only the `'status'` field key to `updateStageField`, `draftDeltas[student_id]` receives `{ status: 'P' }` without `entry_time` or `exit_time`. 

When `transformServerToClientRoster` normalizes the roster for rendering, `delta.entry_time` is `undefined`, so it falls back to `row.entry_time` (`null`). Consequently, students marked "Present" via **Mark All Present** end up with `null` check-in and check-out times in both the UI matrix and the mutation payload sent to the backend.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** AI Coding Assistant (Antigravity)
* **Assignee:** Lead Frontend Engineer
* **Branch:** `main`
* **Labels:** `react`, `state-management`, `attendance`, `staging-workspace`
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
| **Problem Statement** | Executing `handleMarkAllPresent` sets status to `'P'` but leaves punch times `null` for unrecorded/absent students. |
| **Steps to Reproduce** | 1. Navigate to `/admin/batches/:id` and select the **Attendance** tab.<br>2. Click **Mark All Present** on an unmarked or absent register.<br>3. Inspect the check-in/check-out fields and the outgoing mutation payload. |
| **Current Behaviour** | Status turns `P`, but `entry_time` and `exit_time` remain `null`. |
| **Expected Behaviour** | Status turns `P`, and `entry_time`/`exit_time` are populated with default schedule bounds (e.g., `08:00` / `13:00`). |

---

## 🔬 React Root Cause Analysis (RCA)
The root cause stems from partial object merging in `updateStageField`. `handleMarkAllPresent` dispatches `{ status: 'P' }` without providing `entry_time` or `exit_time`. In `useBaseAttendanceController`, `transformServerToClientRoster` evaluates `delta.entry_time` (which is `undefined`), falling back to `row.entry_time` (`null` for absent records).

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `<AttendanceRegisterView />`, `useBaseAttendanceController`, `useStudentAttendance`
* **Affected Users / Scope:** Teachers and Admins marking daily student attendance.
* **Business Impact:** High (Corrupts attendance logs by recording Present students with empty punch times).

---

## 🛠️ Code Artifacts & Diagnostics

### 📄 Impacted React Files
| File Path | Component / Hook Role | State / Props Involved |
| :--- | :--- | :--- |
| `src/features/batch/components/profile/AttendanceRegisterView.jsx` | UI Presentational Component | `handleMarkAllPresent`, `updateStageField` |
| `src/features/attendance/hooks/useAttendance.js` | Custom Strategy & Controller Hook | `stageUpdate`, `draftDeltas` |

---

## 🚀 Resolution Strategy

### Suggested Fix
Update `handleMarkAllPresent` to pass default schedule times when setting status to `'P'`:
```javascript
const handleMarkAllPresent = useCallback(() => {
  studentsList.forEach(rec => {
    if (rec.status !== 'P') {
      updateStageField(rec.student_id, {
        status: 'P',
        entry_time: rec.entry_time || '08:00',
        exit_time: rec.exit_time || '13:00'
      });
    }
  });
}, [studentsList, updateStageField]);
```

### 📋 Verification Criteria

* [ ] Clicking **Mark All Present** populates `P` status and non-null check-in/out times.
* [ ] Mutation payload sent on save contains valid `HH:MM` time structures for all students.
* [ ] Unit/integration tests for batch attendance staging pass cleanly.

---

## 🏁 Resolution Log

* **Resolution Date:** Pending
* **Developer:** TBD
* **Fix Commit / PR:** TBD
* **Target Version:** v2.1.0
