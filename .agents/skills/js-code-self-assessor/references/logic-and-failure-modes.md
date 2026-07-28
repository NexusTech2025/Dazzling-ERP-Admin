# JavaScript Logic Invariants & Failure Modes Reference

This reference covers audit rules for verifying business logic invariants, detecting `NaN` propagation, enforcing exhaustive state-machine branching, and preventing partial state corruption.

---

## 1. Business Logic Invariants & Arithmetic Pitfalls

### `NaN` Propagation
- **Problem**: In JavaScript, any arithmetic operation involving `undefined` or invalid strings evaluates to `NaN`. `NaN` propagates silently through calculations and turns all downstream numbers into `NaN`.
- **Bug Pattern**:
  ```javascript
  const total = item.price * item.quantity; // If price is undefined, total becomes NaN!
  ```
- **Audit Checklist**: Verify that all values used in arithmetic operations are sanitized with `Number()` and checked with `Number.isNaN()`.
- **Fix**:
  ```javascript
  const price = Number(item?.price) || 0;
  const quantity = Number(item?.quantity) || 0;
  const total = price * quantity;
  ```

### Division by Zero & Floating Point Precision
- **Problem**: `1 / 0` in JS returns `Infinity` (does not throw an exception!), which ruins comparison logic. Floating point math (`0.1 + 0.2 !== 0.3`) causes precision errors in currency/finance logic.
- **Fix**: Check for zero denominator before division, and use integer cents or rounding functions (`Math.round(val * 100) / 100`) for currency.

---

## 2. Exhaustive Branching & State Machines

### Non-Exhaustive `switch` Statements
- **Problem**: Omitting a `default` case or failing to handle new status enums in a `switch` statement causes silent state execution drops.
- **Bug Pattern**:
  ```javascript
  switch (status) {
    case 'PENDING': return handlePending();
    case 'APPROVED': return handleApproved();
    // Missing 'REJECTED' or 'CANCELLED'! Returns undefined silently.
  }
  ```
- **Fix**: Always provide an explicit `default` fallback or throw an informative error:
  ```javascript
  switch (status) {
    case 'PENDING': return handlePending();
    case 'APPROVED': return handleApproved();
    default:
      console.warn(`[StatusHandler] Unhandled status: ${status}`);
      return handleUnknownStatus(status);
  }
  ```

---

## 3. Uncaught Synchronous Exceptions

### Uncaught `JSON.parse()`
- **Problem**: `JSON.parse()` throws a synchronous `SyntaxError` if passed invalid JSON, crashing the application.
- **Fix**: Wrap all `JSON.parse()` calls in a try-catch block with a default fallback:
  ```javascript
  function safeJsonParse(jsonString, fallback = null) {
    if (typeof jsonString !== 'string') return fallback;
    try {
      return JSON.parse(jsonString);
    } catch {
      return fallback;
    }
  }
  ```

### Unsafe RegEx Execution
- **Problem**: Instantiating `new RegExp(userInput)` without escaping special characters allows regular expression injection or crash from malformed syntax.
- **Fix**: Escape user input before passing into dynamic `RegExp` constructors.

---

## 4. Partial State Corruption

### Un-atomic Multi-Step State Updates
- **Problem**: If step 1 of a state update succeeds, but step 2 throws an exception, the system is left in a corrupted, half-updated state.
- **Bug Pattern**:
  ```javascript
  function processOrder(order) {
    inventory.deduct(order.items); // Step 1 succeeds
    payment.charge(order.total);    // Step 2 throws error! Inventory remains deducted!
  }
  ```
- **Fix**: Perform all validations and API charges **before** mutating local application state, or wrap in transaction/rollback blocks.
