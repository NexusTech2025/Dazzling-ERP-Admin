---
Date: 2026-07-07T11:27:00+05:30
Status: Approved-Completed
---

# Implementation Plan - SalaryConfigModal Scroll Optimization

Optimize scrolling performance and reduce rendering latency inside `SalaryConfigModal` by introducing hardware accelerated scrolling CSS properties and setting the form validation triggers to `onBlur`.

## Traceability & References (Rule N2)
* **Referenced Core Modules:**
  * [SalaryConfigModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/SalaryConfigModal.jsx)
* **Design Runbooks:**
  * [BUG-0006-salary-config-modal-scroll.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/issues/BUG-0006-salary-config-modal-scroll.md)

## Boundary Declaration: Facts vs. Assumptions (Rule N3)
* **Actual Verified Facts:**
  * The form container uses an overflow style with custom scrollbar utilities but lacks hardware acceleration declarations.
  * Form validations trigger on every change, causing Yup schema execution to block the main layout/scrolling thread.
* **System Assumptions:**
  * Validating fields on `onBlur` provides a standard user experience while resolving keystroke/scroll thread collisions.

## Proposed Changes

### Feature: Teacher Profile Salary Configurations

#### [MODIFY] [SalaryConfigModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/SalaryConfigModal.jsx)

##### Execution Blueprint (Rule N1)

1. Modify `useForm` call to include `mode: 'onBlur'`:
```javascript
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(salaryConfigSchema),
    defaultValues: initialFormState,
    mode: 'onBlur'
  });
```

2. Modify the wrapper div class list for the scrollable form body to:
```html
className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent scroll-smooth [transform:translateZ(0)] will-change-scroll"
```

##### Step-by-Step Technical Execution Workflow:
1. Open [SalaryConfigModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/SalaryConfigModal.jsx).
2. Locate `useForm` initialization (line 182) and append the `mode: 'onBlur'` config property.
3. Locate the form wrapper body div (around line 445) and append scroll hardware-acceleration style rules.

---

## Performance Regression & Benchmark Assertions (Rule N5)
* **Compositor Thread Benchmark**: Verify that scrolling frame rates remain close to 60fps and Yup validations do not trigger during keystrokes/scroll events.

## Legacy Maintenance Mitigation (Rule N6)
No legacy paths or technical debt risks are introduced by this refactoring.

---

## Verification Plan

### Automated Checks
* Run `npm run build` to confirm compiler validations.

### Manual Verification
1. Open the Salary Configuration Modal.
2. Verify scrolling is smooth.
3. Verify validations only trigger when focus leaves a field (`onBlur`).
