# Anti-Pattern: React Query Destructuring & Infinite Render Loops

* **Category**: React / State Management
* **Impact**: Critical (Thread Blocking, Tab Crash, Maximum Update Depth Exceeded)
* **Status**: Resolved & Documented

---

## 1. The Symptoms
When navigating to a dashboard page, the browser console prints the following red error, the CPU usage spikes to 100%, and the tab freezes:

```text
TeacherAttendanceManager.jsx:86 Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

---

## 2. The Bad Code (The Trap)

Consider this daily punch register component which fetches list records and stages them locally in a state sheet to allow batch commits:

```jsx
const TeacherAttendanceManager = () => {
  const [selectedDate, setSelectedDate] = useState('2026-06-11');
  const [stagedRecords, setStagedRecords] = useState({});

  // ❌ BAD: Destructuring with inline fallback array literals
  const { data: teachers = [] } = useTeachersQuery();
  const { data: dailyLogs = [] } = useTeacherAttendanceListQuery(selectedDate);

  // ❌ BAD: Dependency array tracking references created during destructuring
  useEffect(() => {
    if (teachers && dailyLogs) {
      const initial = {};
      teachers.forEach(t => {
        initial[t.teacher_id] = { ...t, status: 'P' };
      });
      setStagedRecords(initial); // Updates state -> triggers re-render
    }
  }, [teachers, dailyLogs]); 

  return (
    // ... layout
  );
};
```

---

## 3. The Root Cause Breakdown

The infinite recursion loop is caused by **ES6 Destructuring Default Values** combined with **Reference Inequality** during loading states:

1. **Initial Mount**: The queries `useTeachersQuery` and `useTeacherAttendanceListQuery` are fired. Because network requests take time, their `data` properties are initially `undefined`.
2. **Fallback Reference Creation**: Since `data` is `undefined`, the ES6 destructuring fallback defaults to `[]`. In JavaScript, `[] === []` is `false` because a brand new array reference is allocated in memory on every single render cycle.
3. **Effect Trigger**: The `useEffect` hook runs after the mount render. It inspects its dependency array `[teachers, dailyLogs]`. Since both are newly allocated array references, it executes the effect function.
4. **State Update Scheduled**: The effect runs `setStagedRecords(initial)`, scheduling a component state update.
5. **Re-render Cycle**: React triggers a re-render. Since the network requests are still fetching, `data` is still `undefined` for both hooks. 
6. **New References Allocated**: The destructuring allocates *another* set of brand new empty arrays `[]` in memory.
7. **Recursive Execution**: React compares the dependencies `[teachers, dailyLogs]` of the `useEffect`. Because the references from this render differ from the references in the previous render, it executes the effect again.
8. **Loop Lockup**: `setStagedRecords` is called again, scheduling another render, starting the cycle over infinitely and blocking the JavaScript execution thread before the network request ever has a chance to resolve.

---

## 4. The Fix (Stable References)

To break the loop, we must supply a **stable, immutable reference** as the default fallback. We define this reference outside the component so it is never recreated during renders:

```jsx
// ✅ GOOD: Stable, frozen fallback reference defined outside the component lifecycle
const EMPTY_ARRAY = Object.freeze([]);

const TeacherAttendanceManager = () => {
  const [selectedDate, setSelectedDate] = useState('2026-06-11');
  const [stagedRecords, setStagedRecords] = useState({});

  // ✅ GOOD: Using stable fallback instead of inline []
  const { data: teachers = EMPTY_ARRAY } = useTeachersQuery();
  const { data: dailyLogs = EMPTY_ARRAY } = useTeacherAttendanceListQuery(selectedDate);

  useEffect(() => {
    if (teachers && dailyLogs) {
      const initial = {};
      teachers.forEach(t => {
        initial[t.teacher_id] = { ...t, status: 'P' };
      });
      setStagedRecords(initial); // Safe! Dependency references remain identical on re-renders
    }
  }, [teachers, dailyLogs]); 

  return (
    // ... layout
  );
};
```

### Why this works:
Because `EMPTY_ARRAY` points to the exact same memory address across all render cycles, `teachers` and `dailyLogs` will have strict reference equality (`teachers === prevTeachers`) while loading. React's dependency array check evaluates to `true` (no change), skipping the `useEffect` on subsequent loading renders and allowing the query to complete successfully.

---

## 5. Lessons Learned & Best Practices

1. **Never destructure query results to inline literals `[]` or `{}`** if the destructured variable is listed in any `useEffect`, `useMemo`, or `useCallback` dependency array.
2. **Declare static fallbacks globally:** Always define `EMPTY_ARRAY = Object.freeze([])` or `EMPTY_OBJ = Object.freeze({})` at the top of the file to guarantee reference stability.
3. **Optional Guarding:** Alternatively, perform conditional checks in the effect block (e.g. `if (!isLoading && teachers.length > 0)`) to ensure state is only initialized once query records are fully hydrated.
