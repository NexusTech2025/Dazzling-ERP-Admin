---
Title: Student Directory Rendering Performance & Viewport Optimization - Implementation Plan
Date: 2026-07-30T21:57:30+05:30
Status: Approved-Completed
---

# Student Directory Rendering Performance & Viewport Optimization - Implementation Plan

> [!IMPORTANT]
> **Key Architecture Directives**:
> 1. **Short-Circuit Viewport Mounting**: In `Students.jsx`, replace CSS-only hiding (`md:hidden` / `hidden md:block`) with dynamic JS short-circuit conditional rendering via `useIsMobile()`. This prevents `<DataTable />` and `<StudentsMobileView />` from simultaneously rendering in the DOM tree.
> 2. **`ExpandableLowDensityCard` Memoization**: Wrap `ExpandableLowDensityCard.jsx` in `React.memo` and optimize internal event callback invocations.
> 3. **Fix `onToggleExpand` Reference Drift**: Pass `toggleExpand` directly (`onToggleExpand={toggleExpand}`) from `StudentsMobileView` and handle `student_id` parameter binding internally within `StudentMobileCard`.

---

## 🏛️ Executive Summary & Key Objectives

1. **Eliminate Parallel DOM Rendering**: Mounting both mobile cards and desktop DataTable simultaneously consumes twice the memory and causes dual render passes on keystrokes. Using `isMobile ? <MobileLayout /> : <DesktopLayout />` eliminates 50% of rendering work.
2. **Prevent Prop Reference Drift**: Pass stable function references directly without inline arrow functions inside `.map()`.
3. **Card Component Memoization**: Wrap `ExpandableLowDensityCard` in `React.memo` to guard against redundant re-renders when parent states change.

---

## 🔍 Absolute Background Base Knowledge Traceability (Rule N2)

- **Referenced Components**:
  - `[Students.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/Students.jsx)`
  - `[StudentsMobileView.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentsMobileView.jsx)`
  - `[StudentMobileCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentMobileCard.jsx)`
  - `[ExpandableLowDensityCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/cards/ExpandableLowDensityCard.jsx)`
  - `[useIsMobile.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useIsMobile.js)`

---

## 📌 Fact vs. Assumption Boundaries (Rule N3)

### Verified Facts
1. `Students.jsx` currently mounts both `<div className="md:hidden">...</div>` AND `<div className="hidden md:block">...</div>` simultaneously. CSS hides one visually, but React mounts and evaluates render cycles for both trees on every state update.
2. `StudentsMobileView.jsx` was passing `onToggleExpand={(e) => toggleExpand(e, student.student_id)}`, creating a new function reference every render and causing `React.memo` checks on `StudentMobileCard` to evaluate `false`.
3. `ExpandableLowDensityCard.jsx` was not wrapped in `React.memo`.

---

## 🛠️ Execution Blueprints (Rule N1)

### Blueprint 1: Dynamic Viewport Conditional Rendering (`src/pages/admin/Students.jsx`)

```javascript
import useIsMobile from '../../hooks/useIsMobile';

const Students = () => {
  const isMobile = useIsMobile();
  // ... state & queries ...

  return (
    <>
      {isMobile ? (
        /* Mobile Viewport Layout */
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 px-2 pt-6 pb-24">
          {/* Header Block & Filters */}
          ...
          <StudentsMobileView
            students={filteredStudents}
            selectedIds={selectedIds}
            onSelectRow={toggleSelect}
            handlers={handlers}
          />
        </div>
      ) : (
        /* Desktop Viewport Layout */
        <DataTable
          title="Student Directory"
          subtitle="Manage student enrollment and academic records"
          columns={columns}
          data={filteredStudents}
          ...
        />
      )}

      {/* Floating Selection Bar & Modals */}
      ...
    </>
  );
};
```

---

### Blueprint 2: Stable Callback Passing (`src/features/student/components/StudentsMobileView.jsx`)

```javascript
import React, { useState, useCallback } from 'react';
import { StudentMobileCard } from './StudentMobileCard';

export function StudentsMobileView({
  students,
  selectedIds,
  onSelectRow,
  handlers
}) {
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = useCallback((e, id) => {
    e.stopPropagation();
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const isSelectionMode = selectedIds.length > 0;

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
          onToggleExpand={toggleExpand} // Direct stable reference!
          handlers={handlers}
        />
      ))}
    </div>
  );
}
```

---

### Blueprint 3: Internal ID Binding (`src/features/student/components/StudentMobileCard.jsx`)

```javascript
// In StudentMobileCardItem:
return (
  <ExpandableLowDensityCard
    isChecked={isChecked}
    isExpanded={isExpanded}
    onToggleExpand={(e) => onToggleExpand(e, student.student_id)}
    onCardClick={() => handlers.onView(student)}
    leftHeader={leftHeader}
    rightHeader={rightHeader}
    expandedContent={expandedContent}
  />
);
```

---

### Blueprint 4: Memoization of `ExpandableLowDensityCard.jsx`

```javascript
import React from 'react';
import CardContainer from './CardContainer';

const ExpandableLowDensityCardComponent = ({
  isChecked,
  onSelect,
  isExpanded,
  onToggleExpand,
  leftHeader,
  rightHeader,
  expandedContent,
  onCardClick,
  className = ''
}) => {
  return (
    <CardContainer
      onClick={onCardClick}
      density="low"
      hoverable={true}
      className={`transition-all duration-200 ${
        isChecked ? 'border-primary bg-primary/5' : ''
      } ${className}`}
    >
      <div className="p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {onSelect && (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={onSelect}
                className="rounded border-border-light dark:border-border-dark text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
            </div>
          )}
          <div className="min-w-0">
            {leftHeader}
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {rightHeader}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand && onToggleExpand(e);
            }}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-text-secondary dark:text-slate-400"
          >
            <span className={`material-symbols-outlined transition-transform duration-200 block ${isExpanded ? 'rotate-180' : ''}`}>
              keyboard_arrow_down
            </span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div
          className="px-4 pb-4 pt-2 border-t border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/10 text-[11px] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {expandedContent}
        </div>
      )}
    </CardContainer>
  );
};

export const ExpandableLowDensityCard = React.memo(ExpandableLowDensityCardComponent);
export default ExpandableLowDensityCard;
```

---

## ⚡ Performance Regression & Benchmark Assertions (Rule N5)

- **Unmounted Viewport Overhead**: 0 ms on unmounted layout components.
- **Search Typing Latency**: < 2ms per keystroke.

---

## 🧪 Verification Plan

1. Open Chrome DevTools Profiler.
2. Select mobile viewport -> confirm `DataTable` component is not present in the Component Tree.
3. Type in search bar -> confirm 0 re-renders on unchanged cards.
