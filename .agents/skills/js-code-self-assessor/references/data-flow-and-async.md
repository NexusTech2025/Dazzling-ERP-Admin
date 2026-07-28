# JavaScript Data Flow, State Immutability & Async Reference

This reference details audit strategies for tracking data flow, preventing object/parameter mutation, identifying async/promise anti-patterns, and catching React stale closures.

---

## 1. Data Flow & Immutability Traversal

### Parameter & State Mutation
- **Problem**: Direct mutation of arguments or shared objects leads to unpredictable side-effects across components and functions.
- **Bug Patterns**:
  - `function updateList(list, item) { list.push(item); return list; }` (Mutates input array).
  - `function setConfig(config) { config.active = true; }` (Mutates config reference).
- **Fix**: Use spread syntax or structured cloning for immutable updates:
  ```javascript
  const updateList = (list, item) => [...list, item];
  const setConfig = (config) => ({ ...config, active: true });
  ```

### Nesting Mutation Trap
- **Problem**: Shallow cloning (`{ ...state }`) does **not** make nested objects immutable.
- **Example**:
  ```javascript
  const newState = { ...state };
  newState.user.profile.name = 'John'; // Still mutates state.user.profile!
  ```
- **Fix**: Deep clone or update nested fields immutably:
  ```javascript
  const newState = {
    ...state,
    user: {
      ...state.user,
      profile: {
        ...state.user?.profile,
        name: 'John'
      }
    }
  };
  ```

---

## 2. Asynchronous & Promise Flow Anti-Patterns

### Floating Promises (Unhandled Async Operations)
- **Problem**: Calling an `async` function without `await`, `.then()`, or `.catch()` allows exceptions to escape silently and leads to race conditions.
- **Bug Pattern**:
  ```javascript
  function handleSubmit() {
    saveData(formData); // Async function call left floating! Errors swallowed!
    setStep(2);         // Moves step before save completes!
  }
  ```
- **Fix**: Explicitly `await` async functions inside `async` handlers or chain `.catch()`:
  ```javascript
  async function handleSubmit() {
    try {
      await saveData(formData);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  }
  ```

### Async Return Type Drift
- **Problem**: A function returns a resolved data value in `try`, but returns `undefined` (or nothing) in `catch`, causing downstream caller code to fail.
- **Bug Pattern**:
  ```javascript
  async function fetchUser(id) {
    try {
      const res = await api.get(`/users/${id}`);
      return res.data;
    } catch (err) {
      console.error(err);
      // Missing return statement! Returns undefined implicitly!
    }
  }
  ```
- **Fix**: Re-throw the error or return an explicit structured error fallback:
  ```javascript
  async function fetchUser(id) {
    try {
      const res = await api.get(`/users/${id}`);
      return { data: res.data, error: null };
    } catch (err) {
      console.error('[fetchUser] Failed:', err);
      return { data: null, error: err.message };
    }
  }
  ```

---

## 3. React Stale Closures & Hook Traversal

### Stale Closure in Callbacks & Effects
- **Problem**: Event handlers, `setInterval` callbacks, or `useEffect` hooks capturing state/props without listing them in dependency arrays operate on stale snapshot values.
- **Bug Pattern**:
  ```javascript
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Current count:', count); // Stale count! Always logs initial value.
    }, 1000);
    return () => clearInterval(timer);
  }, []); // Missing count dependency!
  ```
- **Fix**: Use functional state updates (`setCount(prev => prev + 1)`) or include dependencies in the hook array.

### Async State Race Conditions
- **Problem**: Triggering rapid async updates (e.g. search autocomplete) can cause responses to return out of order, overwriting newer search results with older ones.
- **Fix**: Use cleanup flags or `AbortController`:
  ```javascript
  useEffect(() => {
    let isCancelled = false;
    async function search() {
      const results = await fetchResults(query);
      if (!isCancelled) setList(results);
    }
    search();
    return () => { isCancelled = true; };
  }, [query]);
  ```
