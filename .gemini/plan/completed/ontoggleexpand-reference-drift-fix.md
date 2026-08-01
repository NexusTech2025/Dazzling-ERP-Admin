---
Title: Fix `onToggleExpand` Prop Drift & DevTools Re-rendering Profiler - Implementation Plan
Date: 2026-07-30T21:54:30+05:30
Status: Approved-Completed
---

# Fix `onToggleExpand` Prop Drift & DevTools Re-rendering Profiler - Implementation Plan

> [!IMPORTANT]
> **Profiler Diagnostic Breakdown**: The React DevTools Profiler screenshot confirms that `StudentMobileCard` re-renders because `onToggleExpand prop changed`. In `StudentsMobileView.jsx`, line 191 was passing an **inline anonymous arrow function**: `onToggleExpand={(e) => toggleExpand(e, student.student_id)}`. Even though `toggleExpand` was memoized, creating a new arrow function on every iteration generated a brand new function reference on every render, causing `prev.onToggleExpand === next.onToggleExpand` to evaluate to `false`.

---

## 🏛️ Executive Summary & Key Objectives

1. **Eliminate Inline Function Instantiation in `.map()`**: Pass the stable `toggleExpand` reference directly as `onToggleExpand={toggleExpand}` without inline parameter binding.
2. **Move Parameter Binding into `StudentMobileCard`**: Update `StudentMobileCardItem` to invoke `onToggleExpand(e, student.student_id)` inside its own click handler.
3. **Guarantee Reference Equality**: Ensure all function props (`onToggleExpand`, `onSelectRow`, `handlers`) hold 100% stable references across re-renders.

---

## 🔍 Absolute Background Base Knowledge Traceability (Rule N2)

- **Referenced Components**:
  - `[StudentsMobileView.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentsMobileView.jsx)`
  - `[StudentMobileCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentMobileCard.jsx)`

---

## 📌 Fact vs. Assumption Boundaries (Rule N3)

### Verified Facts
1. React DevTools Profiler explicitly states: `Why did this render? onToggleExpand prop changed.`
2. Passing `(e) => toggleExpand(e, student.student_id)` inside `.map()` creates a new closure object `Function#123` on render #1, `Function#124` on render #2, etc.
3. Strict shallow or custom memo comparator `prev.onToggleExpand === next.onToggleExpand` compares function references (`Function#123 === Function#124`), which returns `false`.

### System Assumptions
1. `onToggleExpand` passed to `StudentMobileCard` should accept `(e, studentId)` as its signature.

---

## 🛠️ Execution Blueprints (Rule N1)

### Blueprint 1: Update `StudentMobileCard.jsx` to Bind ID Internally

```javascript
// In StudentMobileCardItem:
<ExpandableLowDensityCard
  isChecked={isChecked}
  isExpanded={isExpanded}
  onToggleExpand={(e) => onToggleExpand(e, student.student_id)}
  onCardClick={() => handlers.onView(student)}
  leftHeader={leftHeader}
  rightHeader={rightHeader}
  expandedContent={expandedContent}
/>
```

---

### Blueprint 2: Direct Callback Pass in `StudentsMobileView.jsx`

```javascript
// In StudentsMobileView.jsx:
return (
  <div className="space-y-4">
    {students.map((student) => (
      <StudentMobileCard
        key={student.student_id}
        student={student}
        isChecked={selectedIds.includes(student.student_id)}
        isExpanded={!!expandedIds[student.student_id]}
        isSelectionMode={isSelectionMode}
        onSelectRow={onSelectRow}
        onToggleExpand={toggleExpand} // Stable reference passed directly!
        handlers={handlers}
      />
    ))}
  </div>
);
```

---

## ⚡ Performance Regression & Benchmark Assertions (Rule N5)

- **Target Benchmark**: `React.memo` comparator on `StudentMobileCard` evaluates to `true` for all unchanged cards during search input keystrokes.
- **Profiler Verification**: Profiler shows **0 ms render time** for unchanged cards.

---

## 🧪 Verification Plan

### Empirical Performance Verification
1. Open React DevTools Profiler in Chrome.
2. Type in search bar.
3. Verify Profiler log for `StudentMobileCardItem` displays: **"Did not render"**.
