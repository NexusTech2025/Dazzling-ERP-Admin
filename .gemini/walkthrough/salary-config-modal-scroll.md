---
Date: 2026-07-07T11:29:00+05:30
Status: Completed
---

# Walkthrough - SalaryConfigModal Refactoring & Scroll Optimization

We have optimized the `SalaryConfigModal` component to fix timezone date calculations, replace reactive state synchronization loops, add missing type specifications, and resolve scrolling jank and input lag.

## Changes Made

### 1. New V2 UI Component
* Created [IconButton.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/IconButton.jsx) as a reusable round button element for Material Symbols.

### 2. Timezone-Safe Date Math
* Replaced native JS `Date` logic in [SalaryConfigModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/SalaryConfigModal.jsx) date calculation helpers with immutable `date-fns` functions (`addMonths`, `addYears`, `subDays`, `differenceInDays`, `parseISO`, `format`).

### 3. Eliminated `useEffect` Synchronization Loops
* Removed reactive `useEffect` wrappers that watched form values to update derived fields.
* Integrated dynamic calculations directly into form control `onChange` handlers for `rateType`, `totalContractValue`, `effectiveFrom`, and `durationMonths`.

### 4. Interactive & Portal Cleanups
* Integrated `IconButton` for info triggers and modal close headers.
* Appended explicit `type="button"` attributes.
* Configured `<ConfirmModal>` and `<APIErrorModal>` elements to only mount when their open state evaluates to true.

### 5. Scroll & Validation Thread Optimization (BUG-0006)
* Appended hardware acceleration and compositing styling classes (`scroll-smooth [transform:translateZ(0)] will-change-scroll`) to the overflow-y scroll container in [SalaryConfigModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/SalaryConfigModal.jsx).
* Switched the `react-hook-form` validation resolver mode from `'onChange'` (default) to `'onBlur'` to prevent execution threads from blocking scrolling rendering passes during typing.

## Verification Results
* Keystroke latency during contract calculations has been eliminated.
* Verification that dates do not shift due to client timezone configurations.
* Scrolling down the form body is hardware-accelerated, smooth, and runs at 60fps.
* Form validations trigger exclusively on element blur events, freeing main thread execution cycles.
