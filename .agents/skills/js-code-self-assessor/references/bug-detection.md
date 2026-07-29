# Issue Detection & Severity Mapping (JavaScript & React)

This reference guides the identification, categorization, and severity classification of bugs, design flaws, and runtime risks in JavaScript and React codebases.

---

## 1. Issue Categories

- **Critical Runtime Failures**: Uncaught exceptions (`TypeError: Cannot read properties of undefined`), broken rendering trees without Error Boundaries, or white-screen-of-death errors.
- **State & Data Flow Bugs**: State mutation side-effects, stale closure references, out-of-order async state updates, or parameter corruption.
- **React Lifecycle & Rendering Flaws**: Infinite re-render loops (`setState` called unconditionally inside render), missing dependency keys in hooks, memory leaks from missing cleanup functions.
- **Logical Bugs**: Incorrect business calculations, missing `break`/`default` in `switch` statements, incorrect boolean conditions due to JS implicit coercion (`0`, `""`, `null`).
- **Performance Bottlenecks**: Heavy compute inside render passes, missing memoization on high-frequency components, un-virtualized large lists, memory leaks.
- **Security Vulnerabilities**: XSS (e.g. unsafe `dangerouslySetInnerHTML`), un-sanitized user input injected into DOM or eval, credential exposure.

---

## 2. Severity Classification

Every detected issue must be tagged with one of four severity levels:

### 🔴 Critical
- **Impact**: Uncaught runtime crash, white-screen-of-death, data corruption, infinite re-render loop freezing the browser UI, or high-risk XSS vulnerability.
- **Action**: Must be fixed immediately before deployment or merge.

### 🟠 High
- **Impact**: Core user flow broken, stale state causing wrong data to render, floating promise causing silent data save failure, or significant memory leak.
- **Action**: Must be resolved before production release.

### 🟡 Medium
- **Impact**: Edge-case failure (e.g. when an optional field is `null` or array is empty), missing loading/error UI state, missing hook dependencies causing subtle update lags.
- **Action**: Should be scheduled and addressed in the current or next iteration.

### 🟢 Low
- **Impact**: Non-breaking code smell, redundant re-render of small sub-tree, missing default props/parameters, or minor optimization opportunity.
- **Action**: Recommended polish item.

---

## 3. Detection Strategy

- **Static Analysis**: Inspect variable scopes, parameter contracts, and syntax structures.
- **Mental Execution & Stress Testing**:
  - Pass `undefined`, `null`, `0`, `""`, `NaN`, `[]`, `{}` into inputs.
  - Trace React component state transitions across mount, update, and unmount cycles.
- **Closure & Dependency Audit**:
  - Trace variables inside callbacks/effects back to their declaration scopes to detect stale closures.
- **Async Trace**:
  - Trace every `async` / `Promise` execution path to ensure errors are caught and state is left consistent.
