/**
 * Declarative Settlement Policy Configuration Registry.
 * Drives the entire Withdrawal & Financial Settlement section:
 * - RadioGroup option generation
 * - Dynamic input field rendering
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
 * @property {string} [helperText] - Helper text below input.
 * @property {Array<{label: string, value: string}>} [options] - Options for SelectInput.
 * @property {number} [colSpan] - Grid column span (1 or 2).
 */
export const SETTLEMENT_POLICY_CONFIG = {
  waive_unpaid: {
    key: 'waive_unpaid',
    label: 'Waive Unpaid Dues',
    description: 'Cancel all upcoming unpaid installments and close the fee account. Past paid receipts are preserved.',
    icon: 'money_off',
    fields: [
      {
        name: 'remarks',
        label: 'Settlement Remarks',
        type: 'text',
        required: false,
        startIcon: 'edit_note',
        placeholder: 'Unpaid balance waived upon course withdrawal',
        colSpan: 2
      }
    ],
    computeImpact: (ctx) => ({
      title: 'Waive Unpaid — Impact Preview',
      bullets: [
        `Outstanding balance of ₹${(ctx.balanceDue || 0).toLocaleString()} will be WAIVED to ₹0.`,
        `Fee Account will be marked 'COMPLETED' with final fee = ₹${(ctx.amountPaid || 0).toLocaleString()}.`,
        `${ctx.pendingInstallments || 0} pending installment(s) will be CANCELLED.`,
        `All ${ctx.allocationsCount || 0} batch seat allocation(s) will be set to 'DROPPED'.`
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
      {
        name: 'required_amount',
        label: 'Retention Liability (₹)',
        type: 'number',
        required: true,
        startIcon: 'currency_rupee',
        placeholder: '3000',
        helperText: 'Fixed amount student must pay for attended period',
        colSpan: 1
      },
      {
        name: 'due_date',
        label: 'Rescheduled Due Date',
        type: 'date',
        required: false,
        startIcon: 'calendar_today',
        colSpan: 1
      },
      {
        name: 'remarks',
        label: 'Settlement Remarks',
        type: 'text',
        required: false,
        startIcon: 'edit_note',
        placeholder: 'Drop penalty for 30 days class attendance',
        colSpan: 2
      }
    ],
    computeImpact: (ctx) => {
      const required = Number(ctx.requiredAmount) || 0;
      const paid = ctx.amountPaid || 0;
      const overpaid = paid > required;
      const refundDelta = overpaid ? paid - required : 0;
      const newBalanceDue = Math.max(0, required - paid);
      return {
        title: 'Settle Liability — Accounting Simulation',
        bullets: [
          `Required Liability: ₹${required.toLocaleString()}  |  Prior Paid: ₹${paid.toLocaleString()}`,
          `Installment #1 will be rescheduled to ₹${required.toLocaleString()}.`,
          `Installments #2..${ctx.totalInstallments || 1} will be CANCELLED.`,
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
      {
        name: 'refund_amount',
        label: 'Refund Amount (₹)',
        type: 'number',
        required: true,
        startIcon: 'currency_rupee',
        placeholder: '10000',
        helperText: (ctx) => `Max refundable: ₹${(ctx.amountPaid || 0).toLocaleString()}`,
        colSpan: 1
      },
      {
        name: 'payment_method',
        label: 'Refund Payment Method',
        type: 'select',
        required: false,
        options: [
          { label: 'Cash', value: 'cash' },
          { label: 'UPI (GooglePay / PhonePe)', value: 'upi' },
          { label: 'Bank Transfer (NEFT/IMPS)', value: 'bank_transfer' },
          { label: 'Cheque', value: 'cheque' }
        ],
        colSpan: 1
      },
      {
        name: 'remarks',
        label: 'Settlement Remarks / Transaction Ref',
        type: 'text',
        required: false,
        startIcon: 'edit_note',
        placeholder: '100% money-back guarantee refund',
        colSpan: 2
      }
    ],
    computeImpact: (ctx) => {
      const refundAmt = Number(ctx.refundAmount) || 0;
      const netPaid = (ctx.amountPaid || 0) - refundAmt;
      return {
        title: 'Direct Refund — Accounting Simulation',
        bullets: [
          `A negative Payment entry of -₹${refundAmt.toLocaleString()} will be recorded.`,
          `Net Amount Paid becomes ₹${Math.max(0, netPaid).toLocaleString()}.`,
          `SFA status = ${netPaid <= 0 ? '"REFUNDED"' : '"ACTIVE"'}, balance_due = ₹0.`,
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
      {
        name: 'refund_amount',
        label: 'Surplus Refund Amount (₹)',
        type: 'number',
        required: true,
        startIcon: 'currency_rupee',
        placeholder: '6000',
        helperText: (ctx) => `Max refundable: ₹${(ctx.amountPaid || 0).toLocaleString()}`,
        colSpan: 1
      },
      {
        name: 'payment_method',
        label: 'Refund Payment Method',
        type: 'select',
        required: false,
        options: [
          { label: 'Cash', value: 'cash' },
          { label: 'UPI (GooglePay / PhonePe)', value: 'upi' },
          { label: 'Bank Transfer (NEFT/IMPS)', value: 'bank_transfer' },
          { label: 'Cheque', value: 'cheque' }
        ],
        colSpan: 1
      },
      {
        name: 'remarks',
        label: 'Settlement Remarks',
        type: 'text',
        required: false,
        startIcon: 'edit_note',
        placeholder: 'Prorated syllabus consumption deduction',
        colSpan: 2
      }
    ],
    computeImpact: (ctx) => {
      const refundAmt = Number(ctx.refundAmount) || 0;
      const paid = ctx.amountPaid || 0;
      const retained = Math.max(0, paid - refundAmt);
      return {
        title: 'Prorated Refund — Accounting Simulation',
        bullets: [
          `Retained Contract Fee: ₹${retained.toLocaleString()}.`,
          `Surplus Refund: ₹${refundAmt.toLocaleString()} (Paid ₹${paid.toLocaleString()} − Retained ₹${retained.toLocaleString()}).`,
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
      {
        name: 'remarks',
        label: 'Audit Note / Remarks',
        type: 'text',
        required: false,
        startIcon: 'edit_note',
        placeholder: 'Pending external corporate audit',
        colSpan: 2
      }
    ],
    computeImpact: () => ({
      title: 'Retain Ledger — No Financial Changes',
      bullets: [
        'No financial ledger adjustments will be made.',
        'SFA, Installments, and Payment records remain completely unaltered.',
        'Use this only if reconciliation is handled separately by the accounting department.'
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
