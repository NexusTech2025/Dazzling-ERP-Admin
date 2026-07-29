---
Date: 2026-07-29T00:23:15+05:30
Status: Approved-Completed
---

# JavaScript Code Self-Assessor Skill Installation Plan

## Overview
Install a specialized, pure JavaScript & React codebase analyzer and bug detection skill (`js-code-self-assessor`) in `.agents/skills/js-code-self-assessor/`. 

This skill equips AI agents with a multi-pass evaluation framework for deep data-flow analysis, business logic verification, `null`/`undefined` edge-state stress testing, React state & render flow checks, and async/promise failure detection in modern JavaScript & React codebases.

---

## Skill Architecture & Roadmap

### Target Location
`e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/skills/js-code-self-assessor/`

### File Structure
```
.agents/skills/js-code-self-assessor/
├── SKILL.md
├── references/
│   ├── robustness.md                        (Adapted for General JS & React)
│   ├── bug-detection.md                     (Adapted for General JS & React)
│   ├── failure-analysis.md                  (Adapted for General JS & React)
│   ├── nullability-and-defensive-typing.md  (JS Nullability & Typing Pitfalls)
│   ├── data-flow-and-async.md               (Data Flow, State & Async Pitfalls)
│   └── logic-and-failure-modes.md           (Logic Invariants & State Machines)
└── assets/
    └── report-template.md
```

---

## Detailed Features

### 1. Main Skill Manifest (`SKILL.md`)
- **Metadata**: Frontmatter defining `name` (`js-code-self-assessor`) and clear usage scenarios across vanilla JS, Node.js, and React.
- **5-Step Execution Pipeline**:
  1. *Context & Signature Resolution*: Determine function/component signatures, props, state, and return shapes.
  2. *Data-Flow & React Render Traversal*: Trace argument mutability, hook dependencies, stale closures, array transformations, and promise flows.
  3. *Nullability & Edge-State Stress Test*: Mental execution against `null`, `undefined`, `0`, `""`, `NaN`, destructuring default traps, and empty prop/data shapes.
  4. *Business Logic & Invariant Audit*: Pre/post-condition verification, branch exhaustiveness, component lifecycle boundaries, and state corruption prevention.
  5. *RCA & Code Fix Generation*: Compile structured reports with production-grade code replacements.

### 2. Core Reference Modules (Adapted from Original for JS & React)
- **`robustness.md` (General JS & React)**:
  - 7 Evaluation Axes adapted for JS & React (Error Boundaries/Handling, Prop & Input Validation, Edge Cases, State Immutability & Concurrency, Render Scalability, Component Maintainability).
  - React-specific checks: Hook rules, unnecessary re-render triggers, memory leaks in `useEffect`, key prop stability.
- **`bug-detection.md` (General JS & React)**:
  - Categories: Critical Failures, Logical Bugs, React Lifecycle/State Bugs, Performance Bottlenecks, Security Risks, Code Smells.
  - Severity mapping (🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low).
  - Detection strategies: Static analysis, closure leak tracing, component render simulation.
- **`failure-analysis.md` (General JS & React)**:
  - Root Cause Analysis (RCA) protocol for JS exceptions and React boundary crashes.
  - Production-grade fix guidelines (preserving state invariants, defensive fallbacks).

### 3. Specialized JS Deep-Dive Modules
- **`nullability-and-defensive-typing.md`**:
  - Coercion traps (`if (val)` vs explicit `val != null`).
  - Destructuring default traps with explicit `null`.
  - Deep property access guards (`?.` vs manual chaining).
  - Array search nullability (`.find()`, missing `return` in `.map()`).
- **`data-flow-and-async.md`**:
  - Floating promises & unhandled rejections.
  - Argument mutation vs immutable state/prop updates.
  - Async return type drift (`try` returns value, `catch` returns `undefined`).
  - React stale closures in event handlers & hooks.
- **`logic-and-failure-modes.md`**:
  - `NaN` propagation & dynamic type coercion errors.
  - Non-exhaustive state machine branches (`switch` statements, `if-else` chains).
  - Uncaught synchronous exceptions (`JSON.parse`, invalid regex).
  - Partial state mutation recovery on failure.

### 4. Report Template (`assets/report-template.md`)
- Robustness scorecard across JS & React evaluation axes.
- Data-flow & vulnerability trace matrix.
- Severity mapping (🔴 Critical to 🟢 Low) with exact line references.
- Root Cause Analysis (RCA) and production-ready diffs.

---

## Proposed Changes

### [NEW] `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/skills/js-code-self-assessor/SKILL.md`
### [NEW] `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/skills/js-code-self-assessor/references/robustness.md`
### [NEW] `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/skills/js-code-self-assessor/references/bug-detection.md`
### [NEW] `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/skills/js-code-self-assessor/references/failure-analysis.md`
### [NEW] `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/skills/js-code-self-assessor/references/nullability-and-defensive-typing.md`
### [NEW] `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/skills/js-code-self-assessor/references/data-flow-and-async.md`
### [NEW] `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/skills/js-code-self-assessor/references/logic-and-failure-modes.md`
### [NEW] `e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/skills/js-code-self-assessor/assets/report-template.md`

---

## Verification Plan

### Manual Verification
1. Inspect installed skill directory structure under `.agents/skills/js-code-self-assessor/`.
2. Test running the skill against a JavaScript module or React component in `src/` to confirm prompt parsing and report generation.
