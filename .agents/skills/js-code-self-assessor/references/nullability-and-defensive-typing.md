# JavaScript Nullability & Defensive Typing Reference

This reference details common JavaScript `null`, `undefined`, dynamic coercion, and defensive typing traps, providing specific audit checks and remediation patterns.

---

## 1. Nullability & Type Coercion Traps

### Falsy Coercion Trap (`if (val)`)
- **Problem**: In JavaScript, `0`, `""`, `false`, `NaN`, `null`, and `undefined` all evaluate to `false` in boolean contexts.
- **Bug Scenario**: Using `if (count)` to validate input when `count = 0` is a valid business number causes the check to fail silently.
- **Audit Checklist**: Check every `if (val)` or ternary `val ? a : b` to ensure `0` or `""` are not valid values.
- **Fix**: Use strict comparisons or nullish checks:
  ```javascript
  // Bad
  if (!count) count = 10; // Overwrites valid count = 0
  
  // Good
  if (count === undefined || count === null) count = 10;
  // Or: const activeCount = count ?? 10;
  ```

### Destructuring Defaults Overridden by `null`
- **Problem**: ES6 default parameters trigger **only** when a value is `undefined`, **not** when a value is `null`.
- **Bug Scenario**:
  ```javascript
  const { status = 'ACTIVE' } = payload; // If payload is { status: null }, status becomes null!
  ```
- **Audit Checklist**: Inspect destructuring assignments from API payloads or database records where fields might be returned as `null`.
- **Fix**: Apply explicit nullish fallback after destructuring:
  ```javascript
  const status = payload?.status ?? 'ACTIVE';
  ```

### Unsafe Property Chaining
- **Problem**: Chaining properties on object structures without optional chaining (`?.`) causes `TypeError: Cannot read properties of undefined/null`.
- **Audit Checklist**: Look for 2+ level property chains (e.g. `res.data.user.profile.name`) on dynamic or external data.
- **Fix**: Guard with optional chaining and nullish coalescing:
  ```javascript
  const userName = res?.data?.user?.profile?.name ?? 'Anonymous';
  ```

### Array Search Nullability
- **Problem**: Array methods like `.find()` return `undefined` when no element matches. Accessing properties directly on the result crashes.
- **Bug Scenario**:
  ```javascript
  const activeStudent = students.find(s => s.id === targetId).name; // Crashes if targetId not found!
  ```
- **Fix**: Optional chain the result of search methods:
  ```javascript
  const activeStudentName = students.find(s => s.id === targetId)?.name ?? 'Unknown';
  ```

### Missing Return in `.map()` Calls
- **Problem**: Omitting an explicit `return` in a branch of `.map()` inserts `undefined` into the resulting array, causing crashes in subsequent operations.
- **Fix**: Ensure all code paths in `.map()` callbacks return a valid object, or use `.flatMap()` / `.filter()` first.

---

## 2. Dynamic Typing Guard Checklist

| Pattern | Unsafe Code | Safe Code |
| :--- | :--- | :--- |
| **Object Key Presence** | `if (obj.key)` | `if (Object.prototype.hasOwnProperty.call(obj, 'key'))` or `'key' in obj` |
| **Array Check** | `if (arr.length)` | `if (Array.isArray(arr) && arr.length > 0)` |
| **Function Invocation** | `cb()` | `if (typeof cb === 'function') cb()` or `cb?.()` |
| **Number Parsing** | `parseInt(val)` | `const num = Number(val); if (!Number.isNaN(num)) { ... }` |
