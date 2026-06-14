# Report: Student Fee Overview Diagnostic Analysis

This report documents the architectural, React Query, and schema field analysis of the Student Fee Overview page (`StudentFeeOverview.jsx`) and its sub-component `RecordPaymentModal.jsx`.

---

## 1. React Query Cache Usage
- **Hook Used**: `useStudentFeeOverviewQuery(id)`
- **Diagnosis**: 
  - **Missing Cache Lookup**: The hook `useStudentFeeOverviewQuery` (defined in `useFinanceQueries.js` line 74) does not implement an `initialData` function.
  - It does not try to pre-populate student installments from the general installments query cache (`queryKeys.finance.installment.all`), leading to redundant network fetches when entering the page.

---

## 2. Refetch on Mount
- **Diagnosis**:
  - `useStudentFeeOverviewQuery` does not specify `staleTime`, `refetchOnMount`, or `refetchOnWindowFocus`.
  - Therefore, it defaults to `staleTime: 0` and always triggers a refetch request when the component mounts.

---

## 3. Form Submission Alignment
- **Diagnosis**:
  - The form inside `RecordPaymentModal.jsx` calls `useRecordPaymentMutation()`.
  - On success, it calls `queryClient.invalidateQueries({ queryKey: queryKeys.finance.all })` which invalidates the parent key `['finance']`.
  - Since `['finance']` is the parent prefix of `['finance', 'installment', 'student', studentId]`, this correctly marks the query stale and triggers a refetch of the student's installments list.

---

## 4. Schema Field Alignment
- **Target Schema**: `StudentFeeAccount`, `Installment`, and `Payment` tables.
- **Diagnosis & Field Gaps**:
  - **Installment Table Column Mismatches**:
    - **`inst.amount`** (used in `StudentFeeOverview.jsx` lines 24, 129, 137): The schema defines the column as **`due_amount`**.
    - **Case Sensitivity Case Checks**: The UI code checks `inst.status === 'Paid'` and `inst.status === 'Overdue'` (lines 127-128). However, the schema specifies lowercase choices: `["pending", "partially_paid", "paid", "overdue"]`. This case-sensitive check will fail.
  - **Payment Table Payload Mismatches**:
    - **`payment_mode`** (used in `RecordPaymentModal.jsx` lines 13, 130, 131) vs **`payment_method`**: The schema defines the column as `payment_method`.
    - **Invalid Choice Option**: The payment form includes a **`card`** option (line 137), but the schema choices are limited to `["cash", "upi", "bank_transfer", "cheque"]`.
    - **`transaction_ref`** (used in lines 14, 148, 149) vs **`transaction_reference`**: The schema defines this column as `transaction_reference`.
    - **`payment_date` type**: The form sends a date-only string (e.g. `2026-05-22`), whereas the schema defines it as **`datetime`** (which expects an ISO datetime timestamp string).
    - **`student_fee_id`**: The payment record payload is missing the required `student_fee_id` column (only `installment_id` is supplied in line 40).
