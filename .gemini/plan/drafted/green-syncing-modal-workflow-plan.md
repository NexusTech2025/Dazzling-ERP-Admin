---
Date: 2026-07-26T21:43:00+05:30
Status: Proposed
---

# Technical Implementation Plan: ResponseModal In-Flight Green Syncing Workflow

Refactor the payment conversion workflow so that `RecordTeacherPaymentModal` closes immediately upon recording the payment, and `TeacherSalaryPayroll` opens `ResponseModal` in an active **Syncing In-Progress State** with a **spinning green sync button**. Once the background GL link completes, the modal dynamically updates to a static `100% RECONCILED & LINKED` state.

---

## 4-Step UI Workflow Blueprint

1. **Step 1**: User fills form and clicks **Submit Payment**. `RecordTeacherPaymentModal` submits TPT record and closes immediately on success.
2. **Step 2**: `ResponseModal` opens instantly in `syncStatus: 'linking'` state with a **spinning green sync button**: `"Syncing GL..."`.
3. **Step 3**: Background `updateGlMutation` executes while `ResponseModal` is open.
4. **Step 4**: Upon completion, `ResponseModal` updates state to `syncStatus: 'success'` (`100% RECONCILED & LINKED` with `"Done"` button) or `syncStatus: 'error'` (`variant="warning"` with `"Retry Sync"` button).
