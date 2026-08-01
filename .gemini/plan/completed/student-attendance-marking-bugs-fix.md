---
Title: **Student Attendance Marking Pipeline - Zero Core Dependency Refactoring Plan**
Date: 2026-07-28T23:51:00+05:30
Status: Approved-Completed
---

# **Student Attendance Marking Pipeline - Zero Core Dependency Refactoring Plan**

This document details the refined, non-breaking implementation plan to resolve all attendance register bugs **WITHOUT modifying top-level architecture dependencies** (`useAttendance.js` or `useBaseAttendanceController`).

---

## **User Review Required**

> [!IMPORTANT]
> **ZERO TOP-LEVEL DEPENDENCY CHANGES:**
> 1. `useAttendance.js` and `useBaseAttendanceController` will remain **100% UNTOUCHED**.
> 2. `AttendanceRegisterView.jsx` will be updated to conform to the exact object staging pattern used by [`TeacherAttendanceManager.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/TeacherAttendanceManager.jsx#L106-L108):
>    * `handleStatusChange`: `(id, status) => stageUpdate(id, { status })`
>    * `handleTimeChange`: `(id, field, val) => stageUpdate(id, { [field]: val })`
>    * `handleRemarksChange`: `(id, val) => stageUpdate(id, { remarks: val })`
> 3. `ATTENDANCE_DOMAINS.BATCH_STUDENTS.transformPayload` in `attendanceUtils.js` will be updated to filter out unrecorded (`NR`) students from mutation payload records, preventing `status: null` schema validation violations on Google Apps Script (`BUG-0013`).

---

## **Open Questions**

> [!NOTE]
> No unresolved open questions. All patterns have been validated against the working `TeacherAttendanceManager.jsx` implementation.

---

## **Non-Domain Driven Infrastructure Rules (N1–N6)**

### **Rule N1: Explicit Positional Signatures & Execution Blueprints**

#### 1. `StatusCell` Object Staging Handler ([`AttendanceRegisterView.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/AttendanceRegisterView.jsx#L57))

```javascript
/**
 * StatusCell: Memoized cell wrapper for StateSelector using object payload staging.
 * Auto-injects schedule default punch times when transitioning from Absent/NR to Present/Leave.
 * 
 * @param {Object} props
 * @param {string} props.studentId - Student identifier key
 * @param {string} props.status - Current active status code ('P', 'A', 'L', 'NR')
 * @param {Object} props.student - Complete student roster item
 * @param {Function} props.updateStageField - Abstract stageUpdate handler from controller
 */
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
      updateStageField(studentId, { status: newStatus });
    }
  }, [studentId, student, updateStageField]);

  return (
    <StateSelector
      options={ATTENDANCE_CONFIG}
      value={status}
      onChange={handleChange}
    />
  );
});
```

**Execution Workflow:**
1. Receives status selection (`newStatus`).
2. Checks if transitioning to `'P'` or `'L'`. If punch times are `null`, packages an object containing `status`, `entry_time`, and `exit_time`.
3. If transitioning to `'A'`, packages `status: 'A'`, `entry_time: null`, `exit_time: null`.
4. Otherwise packages `{ status: newStatus }`.
5. Passes the clean Object as parameter 2 to `updateStageField(studentId, object)`.

---

#### 2. `TimeCell` Object Staging Handler ([`AttendanceRegisterView.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/AttendanceRegisterView.jsx#L82))

```javascript
/**
 * TimeCell: Memoized cell wrapper for TimeFieldInput using object payload staging.
 * 
 * @param {Object} props
 * @param {string} props.studentId - Student identifier key
 * @param {string} props.field - Target time field key ('entry_time' | 'exit_time')
 * @param {string} props.value - Time value string in HH:MM format
 * @param {boolean} props.disabled - State flag indicating if cell is editable
 * @param {Function} props.updateStageField - Abstract stageUpdate handler from controller
 */
const TimeCell = React.memo(({ studentId, field, value, disabled, updateStageField }) => {
  const handleChange = useCallback((val) => {
    updateStageField(studentId, { [field]: val });
  }, [studentId, field, updateStageField]);

  return (
    <TimeFieldInput
      value={value}
      disabled={disabled}
      onChange={handleChange}
      is24Hour={false}
    />
  );
});
```

---

#### 3. `ATTENDANCE_DOMAINS.BATCH_STUDENTS.transformPayload` ([`attendanceUtils.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/attendance/utils/attendanceUtils.js#L34))

```javascript
/**
 * Transforms client staging updates into REST API payload structure for student attendance mutations.
 * Excludes unrecorded ('NR') students to comply with StudentAttendance.json database schema.
 * 
 * @param {Array<Object>} rawUpdates - Staged updates list from controller
 * @param {Object} filterState - Active filter parameters ({ selectedBatchId, selectedDate, commitMode })
 * @param {Array<Object>} roster - Active roster items
 * @returns {Object} REST API payload envelope ready for POST dispatch
 */
transformPayload: (rawUpdates, filterState, roster) => {
    const { selectedBatchId, selectedDate, commitMode = 'delta' } = filterState;
    const records = rawUpdates
        .map(update => {
            const consolidatedRow = roster.find(r => r.id === update.id) || {};
            const status = consolidatedRow.status;
            
            // Omit unmarked ('NR') students from payload records
            if (!status || status === 'NR') return null;

            const isAbsent = status === 'A';
            return {
                student_id: update.id,
                status: status,
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

---

### **Rule N2: Absolute Background Base Knowledge Traceability**

* **Reference Manual:** [`teacher_attendance_architecture.md`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/docs/Attendance/teacher_attendance_architecture.md)
* **Working Implementation Reference:** [`TeacherAttendanceManager.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/TeacherAttendanceManager.jsx#L106-L108)
* **Referenced Database Schema:** `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Attendance/StudentAttendance.json`

---

### **Rule N3: Explicit Fact vs. Assumption Boundary Declaration**

1. **Actual Verified Facts:**
   * `TeacherAttendanceManager.jsx` calls `stageUpdate(id, { status })` and `stageUpdate(id, { [field]: val })`, passing an Object as argument 2.
   * `useBaseAttendanceController` in `useAttendance.js` requires no modifications when components pass clean object payloads `{ key: val }`.
   * `AttendanceRegisterView.jsx` previously passed 3 positional arguments `(id, key, val)`, causing `stageUpdate` to treat argument 2 as a string.

2. **System Assumptions:**
   * Aligning `AttendanceRegisterView.jsx` to match `TeacherAttendanceManager.jsx`'s object payload pattern resolves `BUG-0009`, `BUG-0010`, `BUG-0011`, `BUG-0012`, `BUG-0013`, and `BUG-0014` cleanly without modifying core hooks.

---

### **Rule N4: GAS Execution Boundary & Round-Trip Round Up**

* **Execution Constraints:** Staging updates remain in RAM ($O(1)$ complexity). Exactly `1` HTTP request is dispatched on commit.

---

### **Rule N5: Performance Regression & Benchmark Assertions**

* **Target Test Harness:** `src/test/attendanceQueries.test.js`
* **Performance Metric Constraint:** $T(n) = O(1)$ API calls for $n$ roster records.

---

### **Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation**

> [!CAUTION]
> **LEGACY MAINTENANCE ISOLATED:**
> * `useAttendance.js` and `useBaseAttendanceController` are preserved completely untouched as top-level shared abstractions.

---

## **Proposed Changes**

---

### **Component 1: Presentation UI Components (`AttendanceRegisterView.jsx`)**

#### [MODIFY] [AttendanceRegisterView.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/AttendanceRegisterView.jsx)

* **`StatusCell`**: Update to pass `{ status: val }` object to `updateStageField`. Inject default punch times when toggling to Present/Leave from Absent (`BUG-0014` & `BUG-0010`).
* **`TimeCell`**: Update to pass `{ [field]: val }` object to `updateStageField` (`BUG-0014`).
* **`RemarksInput`**: Update `draftDeltas` on input change so instant save clicks capture typed notes (`BUG-0011`).
* **`handleMarkAllPresent`**: Pass `{ status: 'P', entry_time: defaultIn, exit_time: defaultOut }` for absent/unmarked students (`BUG-0009`).
* **`handleDateChange`**: Prompt user confirmation if `isDirty` is `true` before clearing workspace drafts (`BUG-0012`).

---

### **Component 2: Domain Utilities (`attendanceUtils.js`)**

#### [MODIFY] [attendanceUtils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/attendance/utils/attendanceUtils.js)

* Update `ATTENDANCE_DOMAINS.BATCH_STUDENTS.transformPayload` to filter out unrecorded (`NR`) students from mutation payload records, preventing `status: null` schema violations on GAS (`BUG-0013`).

---

## **Verification Plan**

### **Automated Tests**
* Run `npm test` or `node --test src/test/attendanceQueries.test.js`.

### **Manual Verification**
1. **Status Toggle Verification**:
   - Click `P`, `A`, or `L` on unmarked student row. Verify button highlights, `isDirty` turns `true`, and check-in/out times populate with `08:00` / `13:00`.
2. **Mark All Present Verification**:
   - Click **Mark All Present**. Verify all unmarked/absent students turn `P` and receive default check-in/out times.
3. **Remarks Sync Verification**:
   - Type a remark in a student's row. Immediately click **Save Changes (Delta)** without blurring the field. Verify the payload includes the typed remark.
4. **Unsaved Date Guard Verification**:
   - Stage changes, then change the date picker. Verify a confirmation prompt appears before wiping workspace drafts.
5. **Payload Schema Verification**:
   - Perform a save operation and check outgoing payload in dev console. Verify all records have valid `status` (`P`, `A`, `L`) and no `status: null` items are transmitted.
