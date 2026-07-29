---
issue_id: BUG-0013
title: "React: [ATTENDANCE_DOMAINS] - Full snapshot commit converts unmarked student status 'NR' to null"
type: bug
priority: high
severity: major
status: open
created_at: "2026-07-28 23:42:00 +05:30"
updated_at: "2026-07-28 23:42:00 +05:30"
---

# 🐞 React Bug Report

## 📖 Description & Lifecycle
In `attendanceUtils.js`, `ATTENDANCE_DOMAINS.BATCH_STUDENTS` handles domain payload transformation via `transformPayload`:

```javascript
transformPayload: (rawUpdates, filterState, roster) => {
    const { selectedBatchId, selectedDate, commitMode = 'delta' } = filterState;
    const records = rawUpdates.map(update => {
        const consolidatedRow = roster.find(r => r.id === update.id) || {};
        const isAbsent = consolidatedRow.status === 'A' || consolidatedRow.status === 'NR';
        return {
            student_id: update.id,
            status: consolidatedRow.status === 'NR' ? null : consolidatedRow.status,
            entry_time: isAbsent ? null : parseTimeToStructured(consolidatedRow.entry_time),
            exit_time: isAbsent ? null : parseTimeToStructured(consolidatedRow.exit_time),
            remarks: consolidatedRow.remarks || null
        };
    });
    return {
        batch_id: selectedBatchId,
        attendance_date: selectedDate,
        commit_mode: commitMode,
        records
    };
}
```

When a user executes `commitFullRosterSnapshot` (`commitMode === 'all'`), the roster includes both marked (`P`, `A`, `L`) and unmarked (`NR`) students. `transformPayload` maps `consolidatedRow.status === 'NR'` to `status: null`.

According to `StudentAttendance.json` schema (`Config/Schema/Attendance/StudentAttendance.json`), `"status"` is marked `"required": true` with choices `["P", "A", "L"]`. Transmitting `status: null` inside full roster snapshot records can break backend validation rules or cause spreadsheet record insertions with empty status cells.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** AI Coding Assistant (Antigravity)
* **Assignee:** Lead Backend/Frontend Engineer
* **Branch:** `main`
* **Labels:** `react`, `payload-serialization`, `attendance`, `schema-validation`
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
| **Problem Statement** | Full roster snapshot commits convert virtual status `'NR'` into `null` status in backend payload. |
| **Steps to Reproduce** | 1. Open daily registry sheet for a batch with unrecorded students.<br>2. Edit 1 student and click **Overwrite Full Snapshot**.<br>3. Inspect the outgoing payload's `records` array. |
| **Current Behaviour** | Unmarked students are sent with `status: null`. |
| **Expected Behaviour** | Unmarked students are either omitted from `records` payload or explicitly filtered out during full roster snapshot commits if unrecorded. |

---

## 🔬 React Root Cause Analysis (RCA)
`transformPayload` assumes all roster entries are explicitly marked when `commitMode === 'all'`. Converting `'NR'` to `null` passes invalid status values to mandatory schema columns.

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `ATTENDANCE_DOMAINS.BATCH_STUDENTS`, `compileStrategyPayload`, `useBaseAttendanceController`
* **Affected Users / Scope:** Superadmins executing full snapshot roster reconciliation.
* **Business Impact:** High (Backend validation errors or database record corruption).

---

## 🛠️ Code Artifacts & Diagnostics

### 📄 Impacted React Files
| File Path | Component / Hook Role | State / Props Involved |
| :--- | :--- | :--- |
| `src/features/attendance/utils/attendanceUtils.js` | Domain Serialization Engine | `ATTENDANCE_DOMAINS`, `transformPayload` |
| `src/features/batch/hooks/useAttendanceQueries.js` | React Query Layer | `useOptimizedMarkAttendanceMutation` |

---

## 🚀 Resolution Strategy

### Suggested Fix
Filter out unrecorded (`NR`) students during payload packaging unless explicitly assigned a valid status (`P`, `A`, `L`):
```javascript
transformPayload: (rawUpdates, filterState, roster) => {
    const { selectedBatchId, selectedDate, commitMode = 'delta' } = filterState;
    const records = rawUpdates
        .map(update => {
            const consolidatedRow = roster.find(r => r.id === update.id) || {};
            if (consolidatedRow.status === 'NR') return null; // Omit unmarked rows from payload

            const isAbsent = consolidatedRow.status === 'A';
            return {
                student_id: update.id,
                status: consolidatedRow.status,
                entry_time: isAbsent ? null : parseTimeToStructured(consolidatedRow.entry_time),
                exit_time: isAbsent ? null : parseTimeToStructured(consolidatedRow.exit_time),
                remarks: consolidatedRow.remarks || null
            };
        })
        .filter(Boolean);

    return {
        batch_id: selectedBatchId,
        attendance_date: selectedDate,
        commit_mode: commitMode,
        records
    };
}
```

### 📋 Verification Criteria

* [ ] Full snapshot commits exclude `'NR'` (unmarked) students from payload records array.
* [ ] All transmitted records have non-null `status` values (`P`, `A`, or `L`).
* [ ] Schema validation tests pass against backend REST specification.

---

## 🏁 Resolution Log

* **Resolution Date:** Pending
* **Developer:** TBD
* **Fix Commit / PR:** TBD
* **Target Version:** v2.1.0
