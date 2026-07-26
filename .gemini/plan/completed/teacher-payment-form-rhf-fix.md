---
Date: 2026-07-26T18:50:00+05:30
Status: Approved-Completed
---

# Technical Implementation Plan: Standardize `RecordTeacherPaymentModal` with `react-hook-form` + `Yup`

Fix the `TypeError: Cannot read properties of undefined (reading 'substring')` exception in [RecordTeacherPaymentModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/RecordTeacherPaymentModal.jsx) by standardizing form input bindings according to established project patterns (`UserRegistration.jsx`, `BatchForm.jsx`) and [.agents/react-hook-form-yup.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/react-hook-form-yup.md).

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture Corrections**:
> 1. **Direct String Registration (`{...register('name')}`) for Standard Inputs**: Switch `salary_month`, `amount`, `transaction_date`, `reference_number`, and `notes` from `<Controller>` wrappers to direct `{...register('fieldName')}` bindings.
> 2. **Scoped `<Controller />` Usage for Custom Primitives Only**: Reserve `<Controller />` strictly for `SelectInput` (`payment_method`) and `RadioGroup` (`payment_type`).
> 3. **Clean Explicit Controlled Props**: Remove `{...field}` object spreading inside `<Controller />` render callbacks, passing `value={field.value}` and `onChange={field.onChange}` explicitly.
> 4. **Form-Scoped Yup Validation Schema**: Remove non-interactive ambient props (`teacher_id`) from the form validation schema to prevent React Hook Form DOM node lookup mismatches.

---

## Proposed Changes

---

### 1. Form Component Refactoring (`dazzling-erp-admin`)

#### [MODIFY] [RecordTeacherPaymentModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/RecordTeacherPaymentModal.jsx)

- **Refined Validation Schema (`teacherPaymentSchema`)**:
  ```javascript
  import * as yup from 'yup';

  export const teacherPaymentSchema = yup.object({
    payment_type: yup
      .string()
      .oneOf(['salary', 'advance', 'bonus', 'deduction'], 'Invalid payment type choice.')
      .required('Payment type is required.'),
    salary_month: yup
      .string()
      .matches(/^\d{4}-\d{2}$/, 'Salary month must follow YYYY-MM format.')
      .required('Salary month is required.'),
    amount: yup
      .number()
      .transform((value, originalValue) => (originalValue === '' || originalValue === null ? NaN : value))
      .typeError('Amount must be a valid number.')
      .min(0.01, 'Payment amount must be at least ₹0.01.')
      .required('Payment amount is required.'),
    payment_method: yup
      .string()
      .oneOf(['cash', 'paytm', 'phonepe', 'bank', 'other'], 'Invalid payment method choice.')
      .required('Payment method is required.'),
    transaction_date: yup
      .string()
      .matches(/^\d{4}-\d{2}-\d{2}$/, 'Transaction date must follow YYYY-MM-DD format.')
      .required('Transaction date is required.'),
    reference_number: yup
      .string()
      .max(255, 'Reference number cannot exceed 255 characters.')
      .nullable()
      .transform(val => (val ? val.trim() : null)),
    notes: yup
      .string()
      .max(255, 'Notes cannot exceed 255 characters.')
      .nullable()
      .transform(val => (val ? val.trim() : null))
  }).required();
  ```

- **Clean Input Bindings**:
  ```jsx
  {/* Standard Inputs (Direct register) */}
  <FormField name="salary_month" label="Salary Month" required error={errors.salary_month?.message}>
    <TextInput
      {...register('salary_month')}
      type="month"
      hasError={!!errors.salary_month}
    />
  </FormField>

  <FormField name="amount" label="Amount (₹)" required error={errors.amount?.message}>
    <TextInput
      {...register('amount', { valueAsNumber: true })}
      type="number"
      leftIcon="currency_rupee"
      placeholder="50000"
      hasError={!!errors.amount}
    />
  </FormField>

  <FormField name="transaction_date" label="Transaction Date" required error={errors.transaction_date?.message}>
    <TextInput
      {...register('transaction_date')}
      type="date"
      hasError={!!errors.transaction_date}
    />
  </FormField>

  <FormField name="reference_number" label="Reference Number (Bank / UTR / Check #)" error={errors.reference_number?.message}>
    <TextInput
      {...register('reference_number')}
      placeholder="e.g. TXN12345678"
      hasError={!!errors.reference_number}
    />
  </FormField>

  <FormField name="notes" label="Notes / Remarks" error={errors.notes?.message}>
    <TextInput
      {...register('notes')}
      placeholder="e.g. July salary payment"
      hasError={!!errors.notes}
    />
  </FormField>

  {/* Custom Primitives (Clean Controller) */}
  <FormField name="payment_type" label="Payment Type" required error={errors.payment_type?.message}>
    <Controller
      name="payment_type"
      control={control}
      render={({ field }) => (
        <RadioGroup
          name={field.name}
          options={PAYMENT_TYPE_OPTIONS}
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  </FormField>

  <FormField name="payment_method" label="Payment Method" required error={errors.payment_method?.message}>
    <Controller
      name="payment_method"
      control={control}
      render={({ field }) => (
        <SelectInput
          options={PAYMENT_METHOD_OPTIONS}
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  </FormField>
  ```
