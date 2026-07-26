---
Date: 2026-07-26T21:44:00+05:30
Status: Completed
---

# Walkthrough: ResponseModal In-Flight Green Syncing Workflow

We have completed the implementation of the **4-Step ResponseModal Green Spinning Sync Workflow** for converting General Ledger outflows into Teacher Payroll sub-ledger payments.

---

## 1. Step-by-Step UI Execution Flow

1. **Step 1**: Form submits `TPT-xxx` receipt and closes `RecordTeacherPaymentModal` immediately upon success.
2. **Step 2**: `ResponseModal` opens instantly in `syncStatus: 'linking'` state with a **spinning green sync button**: `"Syncing GL..."`.
3. **Step 3**: Background `updateGlMutation` runs while `ResponseModal` is open.
4. **Step 4**: Modal state automatically updates to `syncStatus: 'success'` (`100% RECONCILED & LINKED` with `"Done"` button) or `syncStatus: 'error'` (`variant="warning"` with `"Retry Sync"` button).
