---
Title: Conditional Single-Refetch Guard in `useStudentById`
Date: 2026-07-31T12:54:00+05:30
Status: Approved-Completed
---

# Conditional Single-Refetch Guard in `useStudentById`

Adds intelligent hydration completeness detection to `useStudentById`. When the hydrated profile data is missing critical child tables (e.g. `BatchAllocation`, `Enrollment`), the hook triggers **exactly one** forced refetch of the student list via `useStudentsQuery({ forceRefetch: true })` to populate the RAM store with full `include` payloads.

## Incompleteness Detection Heuristic

Checks `allocations` and `enrollments` — not `address` or `contact`, since those are user-optional fields. The signal `!Array.isArray(pd.allocations) || (pd.allocations.length === 0 && pd.enrollments.length === 0)` reliably detects whether the cached student record came from the flat ERP `sheet_batch_read` (no child tables) vs the full `fetchStudents` include payload.
