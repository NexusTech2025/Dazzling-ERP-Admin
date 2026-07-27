---
Date: 2026-07-27T13:30:00+05:30
Status: Proposed
---

# Implementation Plan: Fix React Key Warning, Shared Input State Bug & Memoize MarksEntryRow

This document outlines the technical plan to fix the React `unique key prop` warning and the shared input state bug in [MarksEntryTable.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/MarksEntryTable.jsx) while optimizing row rendering performance using `React.memo`.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Core Modules:**
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\batch\hooks\useBatchQueries.js` (`useBatchStudentsQuery` allocation mapping)
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\batch\components\profile\tests\components\MarksEntryTable.jsx`
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\batch\components\profile\tests\components\MarksEntryRow.jsx`
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\batch\components\profile\BatchTestsTab.jsx`
* **Design Guidelines:**
  * `.agents/rules/plan-drafting-rule.md`
  * `.agents/rules/react_design_pattern.md`

---

## **2. Fact vs. Assumption Boundary Declaration (Rule N3)**

### Actual Verified Facts
1. `useBatchStudentsQuery` stitches batch allocation records with student profiles, outputting array items with `student_id` (e.g. `"STU-1001"`), **NOT `id`**.
2. In `MarksEntryTable.jsx:55`, `<MarksEntryRow key={student.id} ...>` evaluated `key` to `undefined` for every student row.
3. Because `student.id` was `undefined`, `marksState[student.id]` resolved to `marksState[undefined]` for all rows, causing every row to bind to the exact same shared object in `marksState`.
4. `MarksEntryRow.jsx` was not wrapped in `React.memo`, causing all table rows to re-render on every single keystroke during mark entry.

### System Assumptions
1. Every student object passed to `MarksEntryTable` contains a valid `student_id` string or `allocation_id` string fallback.

---

## **3. Technical Legacy Caution Isolation (Rule N6)**

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [MarksEntryTable.jsx:L53-L63](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/MarksEntryTable.jsx#L53-L63)
> * **Core Technical Debt Risk:** Accessing `student.id` instead of `student.student_id` breaks React DOM reconciliation, forces shared state binding across inputs, and causes severe input lag.
> * **Remediation Option:** Standardize `getStudentId(student)` helper (`student.student_id || student.id || student.allocation_id`) across `MarksEntryTable`, `MarksEntryRow`, and `BatchTestsTab`, and wrap `MarksEntryRow` in `React.memo`.

---

## **4. GAS Execution Boundary & Round-Trip Safeguards (Rule N4)**

* **Client-Side State Isolation:** All mark input updates occur strictly in local React state (`marksState`). No network requests are fired per keystroke.
* **Batch Submit:** Saving marks submits all updated records in **1 single API payload**.

---

## **5. Performance Benchmarks & Assertions (Rule N5)**

* **Render Performance Goal:** $O(1)$ row re-render per keystroke.
* **Keystroke Latency Target:** $< 5\text{ ms}$ input response time (eliminating full-table re-renders via `React.memo`).

---

## **6. Positional Signatures & Execution Blueprints (Rule N1)**

### A. Memoized `MarksEntryRow.jsx` ([MarksEntryRow.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/MarksEntryRow.jsx))

```javascript
import React from 'react';
import TextInput from '../../../../../../components/ui/v2/TextInput';

/**
 * Memoized single student row for bulk marks entry table.
 * @param {Object} props
 * @param {number} props.index - Row sequence index (0-indexed).
 * @param {Object} props.student - Enrolled student allocation record.
 * @param {Object} props.markData - Student mark record { student_id, obtained_marks, is_absent, remarks }.
 * @param {number} props.totalMarks - Maximum test marks allowed.
 * @param {Function} props.onChange - Callback (studentId, updatedMarkData) => void.
 */
const MarksEntryRow = React.memo(function MarksEntryRow({
  index,
  student,
  markData,
  totalMarks,
  onChange
}) {
  const studentId = student?.student_id || student?.id || student?.allocation_id;
  const studentName = student?.student?.student_name || student?.student_name || 'Unnamed Student';

  const isAbsent = Boolean(markData?.is_absent);
  const obtainedMarks = markData?.obtained_marks ?? '';
  const remarks = markData?.remarks || '';

  const isInvalid = !isAbsent && obtainedMarks !== '' && (Number(obtainedMarks) > Number(totalMarks) || Number(obtainedMarks) < 0);

  const handleMarksChange = (val) => {
    onChange(studentId, {
      ...markData,
      student_id: studentId,
      obtained_marks: val,
      is_absent: false
    });
  };

  const handleAbsentToggle = (e) => {
    const checked = e.target.checked;
    onChange(studentId, {
      ...markData,
      student_id: studentId,
      is_absent: checked,
      obtained_marks: checked ? 0 : ''
    });
  };

  const handleRemarksChange = (val) => {
    onChange(studentId, {
      ...markData,
      student_id: studentId,
      remarks: val
    });
  };

  return (
    <tr className="border-b border-border-light dark:border-border-dark hover:bg-surface-light/50 dark:hover:bg-surface-dark/50 transition-colors">
      <td className="px-4 py-3 text-xs font-semibold text-text-secondary">
        {index + 1}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-sm font-semibold text-text-main dark:text-white block">
              {studentName}
            </span>
            <span className="text-xs text-text-secondary">
              ID: {studentId}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 w-32">
        <TextInput
          type="number"
          value={isAbsent ? '' : obtainedMarks}
          onChange={(e) => handleMarksChange(e.target.value)}
          disabled={isAbsent}
          placeholder="0"
          min={0}
          max={totalMarks}
          className={isInvalid ? 'border-red-500 focus:ring-red-500' : ''}
        />
        {isInvalid && (
          <span className="text-[10px] text-red-500 mt-0.5 block">
            Max: {totalMarks}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-center w-24">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAbsent}
            onChange={handleAbsentToggle}
            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary dark:border-border-dark dark:bg-surface-dark"
          />
          <span className={`text-xs font-medium ${isAbsent ? 'text-red-500 font-bold' : 'text-text-secondary'}`}>
            Absent
          </span>
        </label>
      </td>
      <td className="px-4 py-3">
        <TextInput
          value={remarks}
          onChange={(e) => handleRemarksChange(e.target.value)}
          placeholder="Optional remarks..."
        />
      </td>
    </tr>
  );
});

MarksEntryRow.displayName = 'MarksEntryRow';
export default MarksEntryRow;
```

### B. Standardized `MarksEntryTable.jsx` ([MarksEntryTable.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/MarksEntryTable.jsx))

```javascript
export default function MarksEntryTable({
  students = [],
  marksState = {},
  totalMarks = 100,
  onMarkChange
}) {
  const [filterQuery, setFilterQuery] = useState('');

  const getStudentId = (student) => student?.student_id || student?.id || student?.allocation_id;
  const getStudentName = (student) => student?.student?.student_name || student?.student_name || '';

  const filteredStudents = students.filter(s =>
    getStudentName(s).toLowerCase().includes(filterQuery.toLowerCase()) ||
    getStudentId(s).toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    // ... layout
    <tbody>
      {filteredStudents.map((student, idx) => {
        const studentId = getStudentId(student);
        return (
          <MarksEntryRow
            key={studentId}
            index={idx}
            student={student}
            markData={marksState[studentId] || { student_id: studentId, obtained_marks: '', is_absent: false, remarks: '' }}
            totalMarks={totalMarks}
            onChange={onMarkChange}
          />
        );
      })}
    </tbody>
  );
}
```

### C. Standardized `BatchTestsTab.jsx` Initial Map ([BatchTestsTab.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchTestsTab.jsx))

```javascript
useEffect(() => {
  if (activeStage === 'marks_entry' && students.length > 0) {
    const initialMap = {};
    
    students.forEach(s => {
      const sId = s.student_id || s.id || s.allocation_id;
      initialMap[sId] = {
        student_id: sId,
        obtained_marks: '',
        is_absent: false,
        remarks: ''
      };
    });

    if (testMarksRecords && testMarksRecords.length > 0) {
      testMarksRecords.forEach(m => {
        const sId = m.student_id;
        if (sId && initialMap[sId]) {
          initialMap[sId] = {
            student_id: sId,
            obtained_marks: m.is_absent ? '' : (m.obtained_marks ?? ''),
            is_absent: Boolean(m.is_absent),
            remarks: m.remarks || ''
          };
        }
      });
    }

    setMarksState(initialMap);
  }
}, [activeStage, students, testMarksRecords]);
```

---

## 7. Mandatory UI Component Catalog Mapping

| UI Feature | Target Primitive Component | Source Location |
| :--- | :--- | :--- |
| Mark Entry Input | `TextInput` | `src/components/ui/v2/TextInput.jsx` |
| Filter Search Input | `TextInput` | `src/components/ui/v2/TextInput.jsx` |

---

## User Review Required

> [!NOTE]
> Please review the proposed fix for the key prop warning, shared input state bug, and `React.memo` row optimization.

---

## Open Questions

None at this time.

---

## Proposed Changes

#### [MODIFY] [MarksEntryRow.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/MarksEntryRow.jsx)
- Wrap component in `React.memo`.
- Standardize `studentId` and `studentName` resolution.

#### [MODIFY] [MarksEntryTable.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/MarksEntryTable.jsx)
- Update `key` prop to `getStudentId(student)`.
- Key `marksState` lookups by `studentId`.

#### [MODIFY] [BatchTestsTab.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchTestsTab.jsx)
- Standardize `s.student_id || s.id` when populating initial `marksState` and `studentsMap`.

---

## Verification Plan

### Manual Verification
1. Open Batch Details -> **Tests** tab.
2. Click **Enter Marks** on any test.
3. Open Developer Tools Console — verify no `key` warnings appear.
4. Type in student #1's marks input — verify only row #1 updates (rows #2, #3, etc. remain untouched and un-rendered).
