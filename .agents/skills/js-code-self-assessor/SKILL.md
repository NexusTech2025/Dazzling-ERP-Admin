---
name: js-code-self-assessor
description: Performs structured self-assessment of pure JavaScript and React codebases to evaluate robustness, data flow, state immutability, async promise flows, and implicit null/undefined edge-case risks. Use when reviewing JS/React code, auditing data flows, diagnosing bugs, or evaluating production readiness.
---

# JavaScript & React Code Self-Assessor Skill

## Purpose
This skill provides a multi-pass evaluation pipeline to assess the quality, correctness, and robustness of JavaScript and React codebases. It identifies dynamic type coercion traps, unhandled `null`/`undefined` states, state mutation side-effects, async/promise failures, and React rendering flaws, producing actionable root cause analyses and production-grade code fixes.

---

## Execution Pipeline

### Step 1: Context & Signature Resolution
Determine the target environment (e.g. React UI component, Node.js module, vanilla JS utility).
- Identify function or component signatures, accepted props/parameters, expected shapes, and return contracts.
- Determine if the scope is a single function, a hook, a component, or an entire module.

### Step 2: Data-Flow & State Immutability Traversal
Trace data from entry inputs to return outputs/effects across execution boundaries:
- Audit argument and state immutability (detect parameter mutations like `arr.push()` or `obj.key = val`).
- Trace async promise flows (detect floating promises without `await`/`.catch()`, return type drift between `try` and `catch`).
- For React components: audit hook dependencies, state updates, and stale closure risks in callbacks/effects.
- **Reference**: Refer to [data-flow-and-async.md](references/data-flow-and-async.md) for data flow and async rules.

### Step 3: Nullability & Defensive Typing Stress Test
Mentally execute the code with edge-case payloads and poison inputs:
- Test behavior against `null`, `undefined`, empty string `""`, zero `0`, `NaN`, empty array `[]`, and empty object `{}`.
- Audit optional chaining (`?.`), nullish coalescing (`??`), and destructuring default parameter traps (e.g. `{ key = 'default' }` when `key` is `null`).
- **Reference**: Refer to [nullability-and-defensive-typing.md](references/nullability-and-defensive-typing.md) for nullability checks.

### Step 4: Robustness & Failure Mode Audit
Evaluate code across seven key axes (Error Boundaries, Input Validation, Edge Cases, State Immutability, Concurrency/Async, Scalability, Maintainability).
- Check for uncaught synchronous exceptions (e.g. `JSON.parse()`, invalid regex, string methods on non-strings).
- Evaluate business logic exhaustiveness (e.g. missing `default` cases in `switch` statements or unhandled enum values).
- **Reference**: Refer to [robustness.md](references/robustness.md) for the 7-axis rubric and [logic-and-failure-modes.md](references/logic-and-failure-modes.md) for logic invariants.

### Step 5: Bug Classification & Report Generation
Classify all detected issues using the standard severity scale (🔴 Critical to 🟢 Low) and compile a structured report.
- **Reference**: Refer to [bug-detection.md](references/bug-detection.md) for severity mapping and [failure-analysis.md](references/failure-analysis.md) for the Root Cause Analysis (RCA) protocol.
- **Template**: Use [report-template.md](assets/report-template.md) for the final output structure.

---

## Behavior Rules

1. **Be Brutally Honest**: Do not soften findings. If code contains unsafe `null` handling or hidden mutation bugs, state it clearly.
2. **Prioritize Runtime Correctness**: Focus on data flow, type safety, and logic correctness over cosmetic code style preferences.
3. **Actionable Fixes Only**: Every reported issue MUST include a trigger scenario, root cause analysis, and a complete drop-in code diff fix.
4. **Environment-Aware**: Adapt checks based on execution context (e.g. React hook rules vs Node.js async handler rules).

---

## Example Usage

- *"Run js-code-self-assessor on `src/lib/react-query/cacheHelper.js`"*
- *"Perform a data-flow and nullability audit on `src/features/student/components/StudentForm.jsx`"*
- *"Audit `src/lib/queryEngine.js` for floating promises and unhandled edge cases"*
