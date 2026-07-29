# Robustness Evaluation Guidelines (JavaScript & React)

This reference defines the framework for scoring JavaScript and React code quality and robustness across seven key axes.

---

## 1. Evaluation Axes

### Error Boundaries & Handling
- **Weak**: Swallows errors silently in `catch` blocks, lacks Error Boundaries in React component trees, or misses error handling around dynamic imports and async calls.
- **Moderate**: Logs errors to `console.error` but lacks user fallback UI or recovery state.
- **Strong**: Explicit try/catch boundaries, structured error logging, graceful degradation, and React Error Boundaries surrounding unstable sub-trees.
- **Production-Grade**: Centralized telemetry, localized error boundary fallbacks with retry capabilities, atomic state rollback on failure, and complete observability.

### Input, Prop & State Validation
- **Weak**: Assumes all function arguments, API responses, or React props are strictly non-null and correctly typed without validation.
- **Moderate**: Basic `typeof` or basic truthy checks (`if (prop)`), missing checks for `NaN`, `null`, or empty collections.
- **Strong**: Explicit contract enforcement (TypeScript/PropTypes/Zod/Joi or strict runtime checks), optional chaining (`?.`), and default values.
- **Production-Grade**: Strict boundary sanitization at API/UI borders, defense-in-depth parameter validation, and immutability guarantees.

### Edge Case Handling
- **Weak**: Crashes on empty arrays `[]`, null/undefined values, falsy valid values (`0`, `""`, `false`), or unhandled promise rejections.
- **Moderate**: Handles standard empty states but fails on boundary numeric values, boundary dates, or concurrent event updates.
- **Strong**: Exhaustive handling for empty states, loading/error states, boundary conditions, and race conditions.
- **Production-Grade**: Total edge-case resilience, graceful fallback for missing payload fields, and zero uncaught runtime exceptions under any input state.

### State Immutability & Concurrency
- **Weak**: Mutates parameters or state objects directly (`state.list.push(item)`), causes stale closures in callbacks, or creates race conditions in async operations.
- **Moderate**: Uses shallow copies (`{ ...obj }`) but accidentally mutates nested references; basic `useEffect` cleanup.
- **Strong**: Strict immutability patterns, correct `useEffect`/`useCallback` dependency arrays, and explicit race condition cancellation (e.g. `AbortController`).
- **Production-Grade**: Guaranteed pure functions, deep immutability protection, race-free async state pipelines, and leak-free event listener cleanups.

### Render & Execution Scalability
- **Weak**: Unnecessary full-tree React re-renders, O(n^2) array operations inside render passes, or blocking synchronous loops on the main UI thread.
- **Moderate**: Memoizes occasionally (`useMemo`/`useCallback`) but uses inline object/array creation in render props, breaking memoization.
- **Strong**: Optimized component re-render boundaries, virtualized lists for large datasets, and efficient memoization keys.
- **Production-Grade**: Sub-millisecond render cycles, web worker delegation for heavy compute, zero redundant re-renders, and optimized bundle splitting.

### Component & Code Maintainability
- **Weak**: Monolithic functions/components (>500 lines), mixed concerns (UI + business logic + API fetching in single block), no comments on complex logic.
- **Moderate**: Modularized components but tightly coupled via prop-drilling or global state leaks.
- **Strong**: Clean architecture, clear separation of presentation vs container logic, reusable custom hooks, and predictable data flow.
- **Production-Grade**: Highly decoupled atomic components, self-documenting code, comprehensive unit & integration test coverage, and modular hook architecture.

---

## 2. Robustness Scoring Rubric

Assign a aggregate score from 0 to 10:

- **0–3 → Weak**: Vulnerable to frequent runtime crashes (`Cannot read properties of undefined`, unhandled promise rejections, state corruption). Not production-ready.
- **4–6 → Moderate**: Functional under happy-path conditions, but fragile under unexpected edge cases or rapid user interactions. Requires hardening.
- **7–8 → Strong**: Resilient and well-structured. Handles unexpected inputs gracefully and maintains clean render performance. Staging/UAT ready.
- **9–10 → Production-Grade**: Outstanding quality. Flawless error handling, zero state mutation leaks, sub-millisecond render metrics, and bulletproof maintainability.

---

## 3. JavaScript & React Specific Quality Checks

- **React Hooks Compliance**: Verify `useEffect`, `useCallback`, and `useMemo` dependency arrays contain all referenced reactive variables.
- **Key Prop Stability**: Ensure list items use stable unique IDs (never array index if list can be reordered/filtered).
- **Asynchronous Cleanup**: Verify subscriptions, timers, or network fetches in `useEffect` return proper teardown functions (`AbortController.abort()`, `clearInterval`).
- **State Batching & Race Conditions**: Check that async updates do not set state on unmounted components or overwrite newer state with stale responses.
