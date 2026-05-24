# Anti-Patterns & Lessons Learned

This file documents approaches that failed, caused bugs, or were deprecated in favor of better patterns. Reference this before implementing new logic.

## 1. Variable Initialization Dependency (ReferenceError)

### The Problem
Declaring a `useMemo` or `useEffect` hook that references a state variable *before* the state variable itself is defined.

**❌ BAD (Causes `ReferenceError`):**
```jsx
const selectedData = useMemo(() => {
  return allData.filter(item => formData.ids.includes(item.id));
}, [allData, formData.ids]); // formData is used here...

const [formData, setFormData] = useState({ ids: [] }); // ...but defined here.
```

### The Fix
Always declare state hooks (`useState`) at the very top of the component, before any derivative hooks (`useMemo`, `useCallback`) or side-effect hooks (`useEffect`).

**✅ GOOD:**
```jsx
const [formData, setFormData] = useState({ ids: [] });

const selectedData = useMemo(() => {
  return allData.filter(item => formData.ids.includes(item.id));
}, [allData, formData.ids]);
```

> **Rationale:** JavaScript `const` declarations are not hoisted. `useMemo` executes its function during the initial render phase; if the dependency variable hasn't been initialized yet, the engine throws a `ReferenceError`.

---

## 2. Hardcoded UI Options for Centralized Entities

### The Problem
Using hardcoded arrays for selection options (e.g., Branches, Courses, Departments) instead of fetching them from the API.

**❌ BAD:**
```jsx
<SelectInput 
  options={[
    { label: 'Downtown', value: 'Downtown' },
    { label: 'West Side', value: 'West Side' }
  ]}
/>
```

### The Fix
Use React Query hooks to fetch live data and map it to the selection format.

**✅ GOOD:**
```jsx
const { data: branches } = useBranchesQuery();
const options = branches?.map(b => ({ label: b.name, value: b.id })) || [];

<SelectInput options={options} isLoading={!branches} />
```

> **Rationale:** Hardcoding options causes "Source of Truth" drift. If a branch name changes in the database, the UI remains outdated and submissions will fail validation.

---

## 3. UI-Centric Schema Names

### The Problem
Using semantic names in the UI state that don't match the database schema (e.g., `dob` vs `date_of_birth`).

**❌ BAD:**
```jsx
const [formData, setFormData] = useState({ dob: '' });
// Requires manual mapping before API call
const payload = { date_of_birth: formData.dob };
```

### The Fix
UI state names **MUST** perfectly mirror the database entity field names.

**✅ GOOD:**
```jsx
const [formData, setFormData] = useState({ date_of_birth: '' });
// Payload can be sent directly
api.submit(formData);
```

> **Rationale:** Reduces boilerplate mapping code and prevents "hydration mismatch" where fetched data fails to populate the form because the field names don't match.

---

## 4. Exact Cache Key Lookups for Parameterized/Filtered Queries

### The Problem
Using `queryClient.getQueryData` with a base query key (e.g., `['course', 'list']`) when the cache actually stores the data under a parameterized key (e.g., `['course', 'list', { filter: {} }]`). Because React Query performs strict exact matches for `getQueryData`, this returns `undefined` and fails silently.

**❌ BAD:**
```jsx
// Fails if the query was cached with filters/options
const courses = queryClient.getQueryData(['course', 'list']); 
```

### The Fix
Use prefix-matching lookup strategies like `queryClient.getQueriesData` (with an object filter) or ensure lookups use the exact prefix structure via query key helpers.

**✅ GOOD:**
```jsx
const queriesData = queryClient.getQueriesData({ queryKey: queryKeys.course.lists() });
const courses = queriesData?.[0]?.[1] || []; // Extract from matching prefix queries
```

---

## 5. Unbounded Refetches on Mount (Missing staleTime)

### The Problem
Leaving `staleTime` undefined (which defaults to `0`) on sub-panel, tabbed-view, or profile-details queries. Each time a user clicks between tabs or sub-panels, the components mount/remount and trigger redundant backend network requests.

**❌ BAD:**
```jsx
// Triggers a network request on every tab mount/remount
const { data } = useQuery({
  queryKey: ['teacher', teacherId, 'attendance'],
  queryFn: () => fetchAttendance(teacherId)
});
```

### The Fix
Explicitly configure appropriate `staleTime` settings (e.g., 5 minutes) or set `refetchOnMount: false` for data that does not change frequently.

**✅ GOOD:**
```jsx
const { data } = useQuery({
  queryKey: ['teacher', teacherId, 'attendance'],
  queryFn: () => fetchAttendance(teacherId),
  staleTime: 1000 * 60 * 5, // 5 minutes cache validity
  refetchOnMount: false     // Disable mount refetching if data is fresh
});
```

---

## 6. Case-Sensitivity Incompatibility with Database Enums

### The Problem
Performing status checks or rendering logic using hardcoded uppercase/capitalized string constants (e.g., `'Paid'`, `'Overdue'`) when the database schema defines, validates, and returns lowercase strings (e.g., `'paid'`, `'overdue'`).

**❌ BAD:**
```jsx
const isPaid = inst.status === 'Paid'; // Will always be false if DB returns 'paid'
```

### The Fix
Always align status casing precisely with the schema definitions (`full_schema.json`), which standardizes on lowercase for statuses and enums.

**✅ GOOD:**
```jsx
const isPaid = inst.status === 'paid';
```
