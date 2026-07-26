---
Date: 2026-07-26T21:34:45+05:30
Status: Proposed
---

# Technical Implementation Plan: Async Sequential Linking & In-Flight Sync Feedback

Refactor the payment conversion submission workflow in [RecordTeacherPaymentModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/RecordTeacherPaymentModal.jsx) to use an `async / await` sequential execution pipeline (`submitting_tpt` $\rightarrow$ `linking_gl` $\rightarrow$ `complete`/`error`), showing spinning sync indicators during in-flight GL linking and delaying feedback modal rendering until **both** network dispatches resolve.

---

## Architectural Principles & Decrees

### Rule N1: Explicit Positional Signatures & Execution Blueprint

```javascript
const handleAsyncSubmitPipeline = async (formData) => {
  // 1. Submit TPT record via mutateAsync
  // 2. If converting GL outflow (initialData), await updateGlMutation.mutateAsync
  // 3. Dispatch onSuccess with verified glLinkSuccess flag
};
```

---

## Proposed Changes

1. **`RecordTeacherPaymentModal.jsx`**: Implement submit status state (`'idle'` | `'submitting_tpt'` | `'linking_gl'`), use `mutateAsync` for both mutations, render spinning sync indicators on the button.
2. **`TeacherSalaryPayroll.jsx`**: Handle verified `glLinkSuccess` in `ResponseModal`.
