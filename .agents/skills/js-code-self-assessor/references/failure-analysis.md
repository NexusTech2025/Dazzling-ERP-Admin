# Failure Analysis & Root Cause Protocol (JavaScript & React)

This reference outlines the systematic protocol for conducting Root Cause Analysis (RCA) and generating production-grade fixes for identified JavaScript and React failures.

---

## 1. Root Cause Analysis (RCA) Protocol

For every identified bug or potential failure mode, perform the following 4-step breakdown:

### 1. Trigger Scenario
Document the exact execution path or state combination that triggers the failure.
- *Example*: User submits form when `address` field is `null`, or component unmounts while an async API call is still pending.

### 2. Failure Mechanism
Explain the exact JavaScript runtime or React reconciliation behavior that leads to the crash or bug.
- *Example*: Accessing `user.address.street` when `user.address` evaluates to `null` throws an uncaught `TypeError: Cannot read properties of null (reading 'street')`.

### 3. Impact Assessment
Quantify the user-facing and system impact.
- *Example*: Causes the entire component tree to unmount, leaving the user with a blank white screen and losing un-saved form inputs.

### 4. Underlying Anti-Pattern
Identify the root architectural or code pattern flaw.
- *Example*: Absence of optional chaining (`?.`), missing defensive prop validation, or missing Error Boundary wrapper.

---

## 2. Production-Grade Fix Standards

Every suggested code fix MUST satisfy the following rules:

1. **Complete Drop-In Diff**: Provide git-style diffs (`-` for deleted, `+` for added lines) or exact replacement code blocks with surrounding context.
2. **Preserve Intended Invariants**: Fix the bug without altering the intended functional business requirements or breaking existing test contracts.
3. **Defensive Guarantees**: Use modern JavaScript idioms (Optional Chaining `?.`, Nullish Coalescing `??`, Default Parameters, Immutable updates) rather than messy nested `if/else` checks.
4. **State Cleanup Integrity**: Ensure async operations check for cancellation (`AbortController` or `isMounted` flags) and return teardown cleanup functions where required.

---

## 3. Standard RCA Output Template

When documenting a failure in reports, format the RCA using this structure:

```markdown
#### Issue #[ID]: [Short Title]
- **Severity**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
- **File**: `[path/to/file.js](file:///path/to/file.js#L12-L24)`
- **Trigger**: [Exact conditions under which the failure occurs]
- **Mechanism**: [Why JS/React fails under this condition]
- **Impact**: [User and system consequence]
- **Root Cause**: [Anti-pattern or missing defensive check]

**Code Fix**:
```diff
-  const street = user.address.street;
+  const street = user?.address?.street ?? 'N/A';
```
```
