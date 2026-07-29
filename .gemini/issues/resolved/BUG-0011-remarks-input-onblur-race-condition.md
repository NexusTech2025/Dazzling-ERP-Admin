---
issue_id: BUG-0011
title: "React: [RemarksInput] - onBlur event race condition loses typed remarks on instant save"
type: bug
priority: medium
severity: major
status: open
created_at: "2026-07-28 23:42:00 +05:30"
updated_at: "2026-07-28 23:42:00 +05:30"
---

# 🐞 React Bug Report

## 📖 Description & Lifecycle
In `AttendanceRegisterView.jsx`, `RemarksInput` uses local state (`localRemarks`) to prevent re-rendering the parent `DataTable` on every keystroke. It dispatches changes to `draftDeltas` via `onChange` inside `handleBlur`:

```javascript
const handleBlur = () => {
  if (localRemarks !== student.remarks) {
    onChange(student.student_id, localRemarks);
  }
};
```

When a user types a remark in the text box and directly clicks a action trigger (such as **Save Changes (Delta)** in the sticky footer or the **ActionCell** save button on the row), the click handler executes `commitDeltaChanges` or `commitIndividualRow` immediately. Because `handleBlur` has either not yet completed or `draftDeltas` state update hasn't re-rendered before the handler reads `draftDeltas`, the freshly typed remarks are omitted from the payload sent to the backend.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** AI Coding Assistant (Antigravity)
* **Assignee:** Lead Frontend Engineer
* **Branch:** `main`
* **Labels:** `react`, `event-handling`, `form-input`, `race-condition`
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
| **Problem Statement** | Direct save button clicks after typing remarks omit the updated remarks string. |
| **Steps to Reproduce** | 1. Focus remarks input field for any student record.<br>2. Type remark text (e.g., "On medical leave").<br>3. Without pressing Tab or clicking outside, click **Save Changes (Delta)** directly. |
| **Current Behaviour** | The API payload is dispatched without the typed remark string. |
| **Expected Behaviour** | Typed remarks are synchronized immediately so the payload includes updated remarks. |

---

## 🔬 React Root Cause Analysis (RCA)
Deferred state updates reliant solely on `onBlur` create event timing dependencies. Synchronous click handlers capture the current `draftDeltas` object in closure state before `onBlur`'s asynchronous React `setState` dispatch completes.

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `<RemarksInput />`, `<AttendanceRegisterView />`, `useBaseAttendanceController`
* **Affected Users / Scope:** Faculty entering student notes or absence reasons.
* **Business Impact:** Medium (Loss of attendance notes & audit trail remarks).

---

## 🛠️ Code Artifacts & Diagnostics

### 📄 Impacted React Files
| File Path | Component / Hook Role | State / Props Involved |
| :--- | :--- | :--- |
| `src/features/batch/components/profile/AttendanceRegisterView.jsx` | UI Presentational Component | `RemarksInput`, `handleBlur`, `onChange` |

---

## 🚀 Resolution Strategy

### Suggested Fix
Propagate `onChange` updates on every input keystroke (or debounced) while retaining local state for smooth rendering:
```javascript
const RemarksInput = React.memo(({ student, onChange }) => {
  const [localRemarks, setLocalRemarks] = useState(student.remarks || '');

  React.useEffect(() => {
    setLocalRemarks(student.remarks || '');
  }, [student.remarks]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalRemarks(val);
    onChange(student.student_id, val);
  };

  return (
    <input
      type="text"
      value={localRemarks}
      onChange={handleChange}
      placeholder="e.g. Doctor appointment, late check-in"
      className="..."
    />
  );
});
```

### 📋 Verification Criteria

* [ ] Direct click on Save button immediately after typing captures updated remarks.
* [ ] Input remains responsive without noticeable keystroke delay.
* [ ] Payload sent to API contains full remarks text.

---

## 🏁 Resolution Log

* **Resolution Date:** Pending
* **Developer:** TBD
* **Fix Commit / PR:** TBD
* **Target Version:** v2.1.0
