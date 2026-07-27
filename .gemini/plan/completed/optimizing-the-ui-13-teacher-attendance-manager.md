---
Date: 2026-07-11T12:06:42+05:30
Status: Approved-Completed
---

# Resolve Default Punch In/Out Timings from Batch Schedule

This implementation plan details the steps to fix the bug where default punch-in and punch-out times are hardcoded to `08:00` and `16:00` in the teacher attendance staging registry, rather than inheriting the specific batch timings configured in the database.

## Architectural Background & Traceability (Rule N2)

*   **Referenced Schemas:** `DazzlingDB/Config/Schema/Academic/Batch.json` (Batch schedule structure: `days_of_week`, `start_time`, `end_time`, `room`).
*   **Referenced Core Modules:**
    - `src/features/teacher/utils/teacher_workspace.js` (Initial stages generator).
*   **Design Runbooks:** `plan-drafting-rule.md` (Design specifications decree).

## Fact vs. Assumption Boundaries (Rule N3)

### Verified Facts
1. The batch table includes a `schedule` column, normalized by the frontend hydrator layer into a structured object containing `start_time` and `end_time` strings.
2. `teacher_workspace.js` currently defaults to hardcoded strings `'08:00'` and `'16:00'` during list staging initialization.

### System Assumptions
1. We assume that if a batch schedule does not define `start_time` or `end_time`, falling back to `'08:00'` and `'16:00'` is the correct recovery behavior.

## GAS Execution Boundary & Transaction Rules (Rule N4)

*   **Boundary Execution Rule:** Staged default time adjustments occur during list compilation in React state.
*   **Design Compliance:** State computations are local. No REST API calls are made during value initialization.

## Performance Regression & Benchmark Assertions (Rule N5)

*   **Metric Formula:** $T(n) = O(n)$ where $n$ is the count of teacher-batch pairings. Retrieving properties from mapped batch references runs in constant time $O(1)$ per loop iteration.
*   **Harness Assertion:** List initialization should maintain a load time under 50ms benchmark.

## Legacy Maintenance Mitigation (Rule N6)

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
> *   **Technical Path Endpoint:** `initializeStagedRecords` time default settings.
> *   **Core Technical Debt Risk:** Standardizing on batch timings could cause UI displays to change for historic unmarked records. Since unmarked historic logs are read-only, this behavior is safe and correct.

---

## Proposed Changes

### 1. Staging Initialization Refactoring

#### [MODIFY] [teacher_workspace.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/utils/teacher_workspace.js)
Refactor `initializeStagedRecords` to look up `batch.schedule.start_time` and `batch.schedule.end_time` and map them as default values.

**Method Signatures & Blueprint (Rule N1):**

```javascript
/**
 * Builds the initial client-side staged attendance map using zero-refetch filtering.
 * @param {Array} teachers - List of all faculty profiles.
 * @param {Array} dailyLogs - Network attendance logs for the target date.
 * @param {Array} batches - Active academic cohorts.
 * @param {string} selectedDate - The currently selected register date string (YYYY-MM-DD).
 * @returns {Object} Constant-time O(1) staged record lookup map.
 */
export const initializeStagedRecords = (teachers, dailyLogs, batches, selectedDate) => {
  // Pull default check-in and check-out values dynamically from batch schedule...
};
```

---

## Verification Plan

### Automated Tests
*   Ensure compilation is successful and code builds cleanly without errors.

### Manual Verification
*   Simulate loading teacher attendance with batches configured to different schedule times (e.g. `09:30 AM` to `05:30 PM`) and verify the initial time pickers display these custom defaults rather than `08:00 AM` and `04:00 PM`.
