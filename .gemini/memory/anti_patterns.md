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
