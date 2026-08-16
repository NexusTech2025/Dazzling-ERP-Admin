# Enrollment Withdrawal Financial Settlement Policies — Implementation Plan

---
Date: 2026-08-16T09:08:00+05:30
Status: Proposed
---

When an admin changes the Enrollment Status dropdown to `"withdrawn"` (or `"discarded"`), a new **Withdrawal & Financial Settlement Policy** card section must appear dynamically inside the existing form. The section is driven entirely by a declarative **Settlement Policy Config Map** — a static object registry that defines each policy's label, description, required input fields, dynamic impact simulator formula, and alert variants. The form reads this registry at runtime to render the correct input group, validation rules, and live accounting simulation without any conditional JSX branching per-policy.

---

## 1. Traceability & Architectural Axioms

* **Referenced Schemas**:
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Academic/Enrollment.json`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Finance/StudentFeeAccount.json`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Finance/Installment.json`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Finance/Payment.json`
* **API Documentation**:
  * `E:/NAST/Dazzling/GAS/docs/api_docs/academic_update_enrollment_api_doc.md` (v2.3.0)
* **UI Component Registry**:
  * `E:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/ui_component/components.index.json`
* **Existing Enrollment Update Feature**:
  * [StudentUpdateEnrollmentForm.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/profile/StudentUpdateEnrollmentForm.jsx)
  * [EditEnrollment.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/EditEnrollment.jsx)
  * [enrollmentUpdateSchema.js](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/schemas/enrollmentUpdateSchema.js)
  * [enrollmentAlertStrategies.js](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/enrollmentAlertStrategies.js)
  * [useEnrollmentQueries.js](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useEnrollmentQueries.js)
  * [enrollmentCacheHelper.js](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/enrollmentCacheHelper.js)

---

## 2. Fact vs. Assumption Boundaries

### Verified Facts
1. **Backend v2.3.0 Contract**: The `academic_update_enrollment` action accepts `payload.financial_settlement` with 5 policy keys: `waive_unpaid`, `settle_liability`, `refund`, `prorated_refund`, `retain_ledger`.
2. **Conditional Required Fields**:
   * `settle_liability` → `required_amount` (number ≥ 0, **required**), `due_date` (optional `YYYY-MM-DD`).
   * `refund` → `refund_amount` (number > 0 ∧ ≤ `amount_paid`, **required**), `payment_method` (optional enum).
   * `prorated_refund` → `refund_amount` (number > 0 ∧ ≤ `amount_paid`, **required**), `payment_method` (optional enum).
   * `waive_unpaid` / `retain_ledger` → No mandatory numeric fields; only `remarks` (optional, max 255 chars).
3. **Default Policy**: If no `financial_settlement` is provided on withdrawal, backend defaults to `waive_unpaid`.
4. **Seating Cascade**: Backend automatically cascades all un-modified allocations to `"dropped"` upon withdrawal/discard.
5. **Existing Form Architecture**: `StudentUpdateEnrollmentForm` already watches `status` via `react-hook-form` `watch('status')` and renders a cascade warning banner. No `financial_settlement` fields exist yet.
6. **Current Schema Gap**: `enrollmentUpdateSchema.js` does not include `discarded` in the `status` enum and has no `financial_settlement` validation.

### Inferred System Assumptions
1. The hydrated enrollment entity already includes embedded `studentfeeaccounts` array via `hydrateRecord`, providing `amount_paid`, `balance_due`, `total_fee`, `final_fee`, and nested `installments[]` for real-time impact simulation.
2. The existing `AlertCard` component (`src/components/ui/v2/AlertCard.jsx`) supports `variant`, `title`, and `description` props compatible with strategy-pattern outputs.

---

## 3. UI Component Mapping & Styling Compliance Matrix

All layout elements map to existing catalog primitives — **zero new UI components** required:

| Wireframe Element | Catalog Component | Source Location | Props / Features |
| :--- | :--- | :--- | :--- |
| Outer Section Container | `Card` | `src/components/ui/Card.jsx` | `<Card.Header border>`, `<Card.Body>` with `transition-all duration-300` reveal animation |
| Financial Ledger Snapshot (4 metrics) | `KpiCard` | `src/components/ui/v2/KpiCard.jsx` | `size="sm"`, `variant="success"` for paid, `"warning"` for balance, `"info"` for installments, `"neutral"` for allocations |
| KPI Grid Container | `KpiGrid` | `src/components/ui/v2/KpiGrid.jsx` | `columns={4}` responsive layout wrapper |
| Settlement Policy Selector | `RadioGroup` | `src/components/ui/v2/RadioGroup.jsx` | `layout="list"`, 5 options with `label`, `description`, `icon` |
| Policy Field Labels & Errors | `FormField` | `src/components/ui/v2/FormField.jsx` | `label`, `required`, `error` |
| Numeric Amounts (`required_amount`, `refund_amount`) | `TextInput` | `src/components/ui/v2/TextInput.jsx` | `type="number"`, `startIcon="currency_rupee"` |
| Date Input (`due_date`) | `TextInput` | `src/components/ui/v2/TextInput.jsx` | `type="date"`, `startIcon="calendar_today"` |
| Payment Method Dropdown | `SelectInput` | `src/components/ui/v2/SelectInput.jsx` | Options: Cash, UPI, Bank Transfer, Cheque |
| Settlement Remarks | `TextInput` | `src/components/ui/v2/TextInput.jsx` | `placeholder`, `startIcon="edit_note"` |
| Dynamic Impact Simulation Box | `AlertCard` | `src/components/ui/v2/AlertCard.jsx` | `variant="info"`, `title`, `description` (computed dynamically) |
| Seating Cascade Warning | `AlertCard` | `src/components/ui/v2/AlertCard.jsx` | `variant="warning"`, static cascade message |

---

## 4. Core Design Pattern: Settlement Policy Config Map

> [!IMPORTANT]
> **Design Decision**: The entire withdrawal input group is **config-driven**, not hardcoded. A single static `SETTLEMENT_POLICY_CONFIG` object map defines all 5 policies. The rendering layer iterates this config to build the `RadioGroup` options, conditionally show/hide input fields, compute impact simulation text, and validate the form — all without per-policy `if/else` or `switch` branching in JSX.

### 4.1 Config Map Schema & Contract

File: `src/features/student/config/withdrawalSettlementConfig.js` **[NEW]**

```javascript
/**
 * Declarative Settlement Policy Configuration Registry.
 * Drives the entire Withdrawal & Financial Settlement section:
 * - RadioGroup option generation
 * - Conditional input field rendering
 * - Dynamic accounting impact simulation
 * - Yup conditional schema validation
 *
 * @type {Record<string, SettlementPolicyConfig>}
 * 
 * @typedef {Object} SettlementPolicyConfig
 * @property {string} key - Unique policy identifier matching API enum.
 * @property {string} label - Human-readable policy title for RadioGroup.
 * @property {string} description - Short business description for RadioGroup subtext.
 * @property {string} icon - Material Symbols icon name for RadioGroup.
 * @property {Array<FieldConfig>} fields - Ordered list of input field definitions to render.
 * @property {function} computeImpact - Pure function computing impact simulation text.
 * @property {string} alertVariant - AlertCard variant for the impact simulation box.
 * 
 * @typedef {Object} FieldConfig
 * @property {string} name - Form field name (scoped under `financial_settlement.*`).
 * @property {string} label - Display label for FormField wrapper.
 * @property {string} type - Input type: 'number' | 'date' | 'select' | 'text'.
 * @property {boolean} required - Whether the field is required for this policy.
 * @property {string} [startIcon] - Material Symbols icon for TextInput.
 * @property {string} [placeholder] - Input placeholder text.
 * @property {number} [max] - Maximum value constraint (for number inputs).
 * @property {Array<{label: string, value: string}>} [options] - Options for SelectInput.
 * @property {number} [colSpan] - Grid column span (default 1, out of 2).
 */
export const SETTLEMENT_POLICY_CONFIG = {
  waive_unpaid: {
    key: 'waive_unpaid',
    label: 'Waive Unpaid Dues',
    description: 'Cancel all upcoming unpaid installments and close the fee account. Past paid receipts are preserved.',
    icon: 'money_off',
    fields: [
      { name: 'remarks', label: 'Settlement Remarks', type: 'text', required: false,
        startIcon: 'edit_note', placeholder: 'Unpaid balance waived upon course withdrawal', colSpan: 2 }
    ],
    computeImpact: (ctx) => ({
      title: 'Waive Unpaid — Impact Preview',
      bullets: [
        `Outstanding balance of ₹${ctx.balanceDue.toLocaleString()} will be WAIVED to ₹0.`,
        `Fee Account will be marked 'COMPLETED' with final fee = ₹${ctx.amountPaid.toLocaleString()}.`,
        `${ctx.pendingInstallments} pending installment(s) will be CANCELLED.`,
        `All ${ctx.allocationsCount} batch seat allocation(s) will be set to 'DROPPED'.`
      ]
    }),
    alertVariant: 'info'
  },

  settle_liability: {
    key: 'settle_liability',
    label: 'Settle Fixed Liability / Drop Penalty',
    description: 'Charge a fixed retention fee for classes attended. Reschedules Installment #1 and cancels remaining.',
    icon: 'gavel',
    fields: [
      { name: 'required_amount', label: 'Retention Liability (₹)', type: 'number', required: true,
        startIcon: 'currency_rupee', placeholder: '3000', colSpan: 1 },
      { name: 'due_date', label: 'Rescheduled Due Date', type: 'date', required: false,
        startIcon: 'calendar_today', colSpan: 1 },
      { name: 'remarks', label: 'Settlement Remarks', type: 'text', required: false,
        startIcon: 'edit_note', placeholder: 'Drop penalty for 30 days class attendance', colSpan: 2 }
    ],
    computeImpact: (ctx) => {
      const required = ctx.requiredAmount || 0;
      const overpaid = ctx.amountPaid > required;
      const refundDelta = overpaid ? ctx.amountPaid - required : 0;
      const newBalanceDue = Math.max(0, required - ctx.amountPaid);
      return {
        title: 'Settle Liability — Accounting Simulation',
        bullets: [
          `Required Liability: ₹${required.toLocaleString()}  |  Prior Paid: ₹${ctx.amountPaid.toLocaleString()}`,
          `Installment #1 will be rescheduled to ₹${required.toLocaleString()}.`,
          `Installments #2..${ctx.totalInstallments} will be CANCELLED.`,
          `SFA final_fee = ₹${required.toLocaleString()}, balance_due = ₹${newBalanceDue.toLocaleString()}.`,
          ...(overpaid
            ? [`⚡ Overpayment detected: Auto-refund of ₹${refundDelta.toLocaleString()} will be issued.`]
            : [])
        ]
      };
    },
    alertVariant: 'warning'
  },

  refund: {
    key: 'refund',
    label: 'Full / Direct Refund',
    description: 'Issue a direct money-back refund (up to total amount paid) and close the student fee account.',
    icon: 'payments',
    fields: [
      { name: 'refund_amount', label: 'Refund Amount (₹)', type: 'number', required: true,
        startIcon: 'currency_rupee', placeholder: '10000', colSpan: 1,
        maxFromContext: 'amountPaid' },
      { name: 'payment_method', label: 'Refund Payment Method', type: 'select', required: false,
        options: [
          { label: 'Cash', value: 'cash' },
          { label: 'UPI (GooglePay / PhonePe)', value: 'upi' },
          { label: 'Bank Transfer (NEFT/IMPS)', value: 'bank_transfer' },
          { label: 'Cheque', value: 'cheque' }
        ], colSpan: 1 },
      { name: 'remarks', label: 'Settlement Remarks / Transaction Ref', type: 'text', required: false,
        startIcon: 'edit_note', placeholder: '100% money-back guarantee refund', colSpan: 2 }
    ],
    computeImpact: (ctx) => {
      const refundAmt = ctx.refundAmount || 0;
      const netPaid = ctx.amountPaid - refundAmt;
      return {
        title: 'Direct Refund — Accounting Simulation',
        bullets: [
          `A negative Payment entry of -₹${refundAmt.toLocaleString()} will be recorded.`,
          `Net Amount Paid becomes ₹${netPaid.toLocaleString()}.`,
          `SFA status = ${netPaid === 0 ? '"REFUNDED"' : '"ACTIVE"'}, balance_due = ₹0.`,
          `All pending installments will be CANCELLED.`
        ]
      };
    },
    alertVariant: 'info'
  },

  prorated_refund: {
    key: 'prorated_refund',
    label: 'Prorated Syllabus Refund',
    description: 'Retain fee for consumed classes, refund the surplus unutilized balance to the student.',
    icon: 'calculate',
    fields: [
      { name: 'refund_amount', label: 'Surplus Refund Amount (₹)', type: 'number', required: true,
        startIcon: 'currency_rupee', placeholder: '6000', colSpan: 1,
        maxFromContext: 'amountPaid' },
      { name: 'payment_method', label: 'Refund Payment Method', type: 'select', required: false,
        options: [
          { label: 'Cash', value: 'cash' },
          { label: 'UPI (GooglePay / PhonePe)', value: 'upi' },
          { label: 'Bank Transfer (NEFT/IMPS)', value: 'bank_transfer' },
          { label: 'Cheque', value: 'cheque' }
        ], colSpan: 1 },
      { name: 'remarks', label: 'Settlement Remarks', type: 'text', required: false,
        startIcon: 'edit_note', placeholder: 'Prorated 40% syllabus consumption deduction', colSpan: 2 }
    ],
    computeImpact: (ctx) => {
      const refundAmt = ctx.refundAmount || 0;
      const retained = ctx.amountPaid - refundAmt;
      return {
        title: 'Prorated Refund — Accounting Simulation',
        bullets: [
          `Retained Contract Fee: ₹${retained.toLocaleString()}.`,
          `Surplus Refund: ₹${refundAmt.toLocaleString()} (Paid ₹${ctx.amountPaid.toLocaleString()} − Retained ₹${retained.toLocaleString()}).`,
          `A negative Payment entry of -₹${refundAmt.toLocaleString()} will be recorded.`,
          `SFA final_fee = ₹${retained.toLocaleString()}, status = 'COMPLETED'.`
        ]
      };
    },
    alertVariant: 'info'
  },

  retain_ledger: {
    key: 'retain_ledger',
    label: 'Retain Ledger (Audit Hold)',
    description: 'Mark enrollment withdrawn without modifying financial records. Deferred for external accounting.',
    icon: 'lock',
    fields: [
      { name: 'remarks', label: 'Audit Note / Remarks', type: 'text', required: false,
        startIcon: 'edit_note', placeholder: 'Pending external corporate audit', colSpan: 2 }
    ],
    computeImpact: () => ({
      title: 'Retain Ledger — No Financial Changes',
      bullets: [
        'No financial ledger adjustments will be made.',
        'SFA, Installments, and Payment records remain completely unaltered.',
        'Use this only if reconciliation is handled by the accounting department.'
      ]
    }),
    alertVariant: 'warning'
  }
};

/**
 * Ordered array for RadioGroup option generation.
 * @type {Array<{label: string, value: string, description: string, icon: string}>}
 */
export const SETTLEMENT_POLICY_OPTIONS = Object.values(SETTLEMENT_POLICY_CONFIG).map(p => ({
  label: p.label,
  value: p.key,
  description: p.description,
  icon: p.icon
}));

/**
 * Payment method options for refund/prorated_refund policies.
 * @type {Array<{label: string, value: string}>}
 */
export const PAYMENT_METHOD_OPTIONS = [
  { label: 'Cash', value: 'cash' },
  { label: 'UPI (GooglePay / PhonePe)', value: 'upi' },
  { label: 'Bank Transfer (NEFT/IMPS)', value: 'bank_transfer' },
  { label: 'Cheque', value: 'cheque' }
];
```

#### Execution Blueprint

1. Component reads `SETTLEMENT_POLICY_CONFIG[selectedPolicy]` to get the active policy config.
2. `config.fields` array is iterated to render `<FormField>` + `<TextInput>` / `<SelectInput>` dynamically — no policy-specific JSX branching.
3. `config.computeImpact(ctx)` is called with the live financial context (`amountPaid`, `balanceDue`, `requiredAmount`, `refundAmount`, etc.) to produce the dynamic impact simulation text.
4. The simulation output is rendered inside an `<AlertCard variant={config.alertVariant}>` with a bullet list.

---

## 5. Proposed Changes

### Component 1: Settlement Policy Config Module

#### [NEW] [withdrawalSettlementConfig.js](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/config/withdrawalSettlementConfig.js)

Declarative registry defining all 5 settlement policies with their field schemas, impact simulators, and RadioGroup option generation. Full contract shown in Section 4.1 above.

---

### Component 2: Withdrawal Settlement Alert Strategy

#### [MODIFY] [enrollmentAlertStrategies.js](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/enrollmentAlertStrategies.js)

**Changes:**
* Add a new `WithdrawalSettlementAlertStrategy` class that reads the `SETTLEMENT_POLICY_CONFIG` and delegates impact computation to the config's `computeImpact()` function.
* Add new `ALERT_MESSAGE_REGISTRY` keys for withdrawal settlement impact:
  * `WITHDRAWAL_IMPACT_SIMULATION` — dynamic simulation via config's `computeImpact`.
  * `WITHDRAWAL_SEATING_CASCADE` — static cascade notice for all allocations transitioning to `"dropped"`.

```javascript
/**
 * Strategy for Withdrawal Financial Settlement Impact Alert.
 * Delegates computation to the declarative SETTLEMENT_POLICY_CONFIG.
 *
 * @param {Object} context
 * @param {string} context.policy - Selected settlement policy key.
 * @param {number} context.amountPaid - Total amount paid on fee account.
 * @param {number} context.balanceDue - Outstanding balance due.
 * @param {number} context.pendingInstallments - Count of pending/unpaid installments.
 * @param {number} context.totalInstallments - Total installment count.
 * @param {number} context.allocationsCount - Number of batch allocations.
 * @param {number} [context.requiredAmount] - settle_liability required_amount input value.
 * @param {number} [context.refundAmount] - refund/prorated_refund refund_amount input value.
 * @returns {{ variant: string, title: string, bullets: string[] }}
 */
export class WithdrawalSettlementAlertStrategy extends BaseAlertStrategy {
  evaluate(context) {
    const config = SETTLEMENT_POLICY_CONFIG[context.policy];
    if (!config) return null;
    const impact = config.computeImpact(context);
    return {
      variant: config.alertVariant,
      ...impact
    };
  }
}
```

---

### Component 3: Withdrawal Settlement Input Section (Presentational)

#### [NEW] [WithdrawalSettlementSection.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/profile/WithdrawalSettlementSection.jsx)

A self-contained, config-driven presentational component that renders the entire Withdrawal & Financial Settlement card. It consumes `SETTLEMENT_POLICY_CONFIG` and dynamically renders:

1. **Financial Ledger Snapshot** — 4 `KpiCard`s showing `Total Paid`, `Balance Due`, `Pending Installments`, `Allocations`.
2. **Policy Selector** — `RadioGroup` with `layout="list"` and 5 options from `SETTLEMENT_POLICY_OPTIONS`.
3. **Dynamic Input Fields** — Iterates `config.fields[]` to render `TextInput` / `SelectInput` wrapped in `FormField` inside a responsive grid.
4. **Live Impact Simulation** — `AlertCard` showing computed `computeImpact()` output with bullet list.
5. **Seating Cascade Warning** — Static `AlertCard` (variant `warning`) about automatic allocation drops.

**Props Contract:**
```javascript
/**
 * @component WithdrawalSettlementSection
 * @param {Object} props
 * @param {Object} props.control - react-hook-form control instance.
 * @param {Object} props.errors - react-hook-form formState.errors.
 * @param {function} props.watch - react-hook-form watch function.
 * @param {Object} props.financialContext - Pre-computed financial snapshot.
 * @param {number} props.financialContext.amountPaid - Total amount paid.
 * @param {number} props.financialContext.balanceDue - Outstanding balance.
 * @param {number} props.financialContext.totalFee - Contract total fee.
 * @param {number} props.financialContext.pendingInstallments - Pending installment count.
 * @param {number} props.financialContext.totalInstallments - Total installment count.
 * @param {number} props.financialContext.allocationsCount - Batch allocation count.
 */
```

**Rendering Logic (Config-Driven, Zero Policy Branching):**
```jsx
const activePolicy = watch('financial_settlement.policy') || 'waive_unpaid';
const config = SETTLEMENT_POLICY_CONFIG[activePolicy];

// Dynamic field rendering from config.fields[]
{config.fields.map(fieldDef => (
  <div key={fieldDef.name} className={`${fieldDef.colSpan === 2 ? 'md:col-span-2' : ''}`}>
    <FormField label={fieldDef.label} required={fieldDef.required}
               error={errors?.financial_settlement?.[fieldDef.name]?.message}>
      <Controller
        name={`financial_settlement.${fieldDef.name}`}
        control={control}
        render={({ field }) => {
          if (fieldDef.type === 'select') {
            return <SelectInput {...field} options={fieldDef.options} />;
          }
          return <TextInput {...field} type={fieldDef.type} startIcon={fieldDef.startIcon}
                            placeholder={fieldDef.placeholder} />;
        }}
      />
    </FormField>
  </div>
))}
```

---

### Component 4: Form Schema Updates

#### [MODIFY] [enrollmentUpdateSchema.js](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/schemas/enrollmentUpdateSchema.js)

**Changes:**
1. Add `'discarded'` to the `status` enum: `['active', 'completed', 'withdrawn', 'discarded']`.
2. Add conditional `financial_settlement` object schema that activates only when `status ∈ {'withdrawn', 'discarded'}`:

```javascript
/**
 * Conditional financial settlement sub-schema.
 * Activates when enrollment status is 'withdrawn' or 'discarded'.
 *
 * @param {string} status - Current enrollment status value from parent schema.
 * @returns {yup.ObjectSchema} Conditional schema for financial_settlement fields.
 */
financial_settlement: yup.object().when('status', {
  is: (val) => ['withdrawn', 'discarded'].includes(val),
  then: (schema) => schema.shape({
    policy: yup.string()
      .oneOf(['waive_unpaid', 'settle_liability', 'refund', 'prorated_refund', 'retain_ledger'],
             'Invalid settlement policy')
      .required('Settlement policy is required'),
    required_amount: yup.number()
      .nullable()
      .transform((v, o) => (o === '' || o === null ? null : Number(o)))
      .when('policy', {
        is: 'settle_liability',
        then: (s) => s.required('Retention liability amount is required').min(0, 'Amount must be ≥ 0')
      }),
    refund_amount: yup.number()
      .nullable()
      .transform((v, o) => (o === '' || o === null ? null : Number(o)))
      .when('policy', {
        is: (val) => ['refund', 'prorated_refund'].includes(val),
        then: (s) => s.required('Refund amount is required').positive('Amount must be > 0')
      }),
    due_date: yup.string().nullable(),
    payment_method: yup.string().nullable()
      .oneOf([null, '', 'cash', 'upi', 'bank_transfer', 'cheque'], 'Invalid payment method'),
    remarks: yup.string().nullable().max(255, 'Remarks cannot exceed 255 characters')
  }),
  otherwise: (schema) => schema.nullable().default(null)
})
```

---

### Component 5: Form Integration

#### [MODIFY] [StudentUpdateEnrollmentForm.jsx](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/profile/StudentUpdateEnrollmentForm.jsx)

**Changes:**

1. **Import** the new `WithdrawalSettlementSection` component.
2. **Compute `financialContext`** from the hydrated enrollment's embedded `studentfeeaccounts[0]`:
   ```javascript
   const financialContext = useMemo(() => {
     const sfa = enrollment?.studentfeeaccounts?.[0] || {};
     const installments = Array.isArray(sfa.installments) ? sfa.installments : [];
     return {
       amountPaid: Number(sfa.amount_paid || sfa.paid_amount || 0),
       balanceDue: Number(sfa.balance_due || sfa.balance_amount || 0),
       totalFee: Number(sfa.total_fee || 0),
       pendingInstallments: installments.filter(i => ['pending', 'partially_paid'].includes(i.status)).length,
       totalInstallments: installments.length,
       allocationsCount: Array.isArray(enrollment?.allocations) ? enrollment.allocations.length : 0
     };
   }, [enrollment]);
   ```
3. **Conditional rendering**: Insert `<WithdrawalSettlementSection>` between Card 2 (Enrollment Details) and Card 3 (Batch Allocations), gated by:
   ```jsx
   {['withdrawn', 'discarded'].includes(currentStatus) && (
     <WithdrawalSettlementSection
       control={control}
       errors={errors}
       watch={watch}
       financialContext={financialContext}
     />
   )}
   ```
4. **Update `defaultValues`**: Add `financial_settlement: { policy: 'waive_unpaid', required_amount: null, refund_amount: null, due_date: null, payment_method: null, remarks: '' }`.
5. **Update `onSubmit` payload assembly**: Include `financial_settlement` only when `status ∈ {'withdrawn', 'discarded'}`:
   ```javascript
   const payload = {
     // ... existing fields ...
     ...(formData.status === 'withdrawn' || formData.status === 'discarded' ? {
       financial_settlement: {
         policy: formData.financial_settlement?.policy || 'waive_unpaid',
         ...(formData.financial_settlement?.required_amount != null && { required_amount: Number(formData.financial_settlement.required_amount) }),
         ...(formData.financial_settlement?.refund_amount != null && { refund_amount: Number(formData.financial_settlement.refund_amount) }),
         ...(formData.financial_settlement?.due_date && { due_date: formData.financial_settlement.due_date }),
         ...(formData.financial_settlement?.payment_method && { payment_method: formData.financial_settlement.payment_method }),
         ...(formData.financial_settlement?.remarks && { remarks: formData.financial_settlement.remarks.trim() })
       }
     } : {})
   };
   ```

---

### Component 6: Cache Helper Update

#### [MODIFY] [enrollmentCacheHelper.js](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/utils/enrollmentCacheHelper.js)

**Changes:**
* Extend `updateEnrollmentCache()` to also apply `fee_account` and `financial_settlement` data from the API response:

```javascript
/**
 * Extended cache update to include financial settlement response data.
 * Applies fee_account mutations (final_fee, balance_due, status, amount_paid) 
 * returned by the backend when a withdrawal settlement policy is executed.
 *
 * @param {Object} [feeAccountUpdate] - Response data.fee_account from API.
 */
// Inside updateEnrollmentCache, after allocation updates:
if (feeAccountUpdate && Array.isArray(targetEnrollment.studentfeeaccounts)) {
  const sfa = targetEnrollment.studentfeeaccounts[0];
  if (sfa) {
    if (feeAccountUpdate.final_fee !== undefined) sfa.final_fee = Number(feeAccountUpdate.final_fee);
    if (feeAccountUpdate.amount_paid !== undefined) sfa.amount_paid = Number(feeAccountUpdate.amount_paid);
    if (feeAccountUpdate.balance_due !== undefined) sfa.balance_due = Number(feeAccountUpdate.balance_due);
    if (feeAccountUpdate.status !== undefined) sfa.status = feeAccountUpdate.status;
    if (feeAccountUpdate.remarks !== undefined) sfa.remarks = feeAccountUpdate.remarks;
  }
}
```

---

### Component 7: Mutation Hook Update

#### [MODIFY] [useEnrollmentQueries.js](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useEnrollmentQueries.js)

**Changes:**
* Update `useUpdateEnrollmentMutation` `onSuccess` callback to extract and forward `response.data.data.fee_account` to the extended `updateEnrollmentCache()`:

```javascript
onSuccess: (response, variables) => {
  const resData = response.data?.data || {};
  const updatedEnr = resData.enrollment || variables;
  const updatedAllocations = resData.allocations || variables.allocations;
  const feeAccountUpdate = resData.fee_account || null;

  if (variables?.enrollment_id) {
    enrollmentRepo.updateEnrollmentCache(
      queryClient, variables.enrollment_id, updatedEnr, updatedAllocations, feeAccountUpdate
    );
  }
  // ... existing invalidations ...
}
```

---

## 6. Open Questions

> [!IMPORTANT]
> **Q1: `discarded` Status in UI Dropdown?**
> The API supports `"discarded"` as a valid enrollment `status`. Should the `Enrollment Status` dropdown in the form include a `Discarded` option alongside `Active`, `Completed`, `Withdrawn`? Or should `Discarded` remain exclusively accessible through the existing `DiscardEnrollmentDrawer` workflow?

> [!IMPORTANT]
> **Q2: Refund Amount Upper Bound Validation**
> For `refund` and `prorated_refund` policies, the API enforces `refund_amount ≤ amount_paid`. Should the frontend enforce this constraint:
> (a) Only via Yup schema validation error message, or
> (b) Also dynamically set the `max` attribute on the `TextInput` and show a helper text like "Max refundable: ₹10,000"?

---

## 7. Verification Plan

### Manual Verification
1. Navigate to `/admin/students/STU-001001/enrollments/ENR-001001/edit`.
2. Change **Enrollment Status** to `Withdrawn` → Verify the Withdrawal Settlement card appears with smooth animation.
3. Verify **Financial Ledger Snapshot** shows correct `Total Paid`, `Balance Due`, `Pending Installments`, `Allocations` from the enrollment's hydrated SFA.
4. Select each of the 5 policies in the `RadioGroup` → Verify:
   * Correct input fields appear/disappear per policy config.
   * Impact simulation text dynamically updates with accurate math.
5. Test `settle_liability` with `required_amount = 3000` on an enrollment with `amount_paid = 10000` → Verify overpayment auto-refund message appears.
6. Test `refund` with `refund_amount > amount_paid` → Verify Yup validation error fires.
7. Click **Save Changes** → Verify payload envelope includes `financial_settlement` block.
8. Verify response correctly updates SFA cache (balance, status, final_fee).
9. Change status back to `Active` → Verify the Withdrawal Settlement card disappears.

### Automated Verification
* Console logging: `[StudentUpdateEnrollmentForm] Submitting Request:` shows correct payload structure with `financial_settlement`.
* Console logging: `[EditEnrollment] API Response:` confirms backend processed the settlement policy.
