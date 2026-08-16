import * as yup from 'yup';

/**
 * Yup validation schema for Student Enrollment Update Form.
 * Enforces API constraints for Enrollment contract & child Batch allocations.
 */
export const enrollmentUpdateSchema = yup.object({
  roll_number: yup.number()
    .typeError('Roll number must be a number')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : Number(originalValue)))
    .positive('Roll number must be positive')
    .integer('Roll number must be an integer'),
  
  enrollment_date: yup.string()
    .required('Enrollment date is required'),
    
  status: yup.string()
    .oneOf(['active', 'completed', 'withdrawn', 'discarded'], 'Invalid enrollment status')
    .required('Enrollment status is required'),
    
  academic_status: yup.string()
    .oneOf(['active', 'suspended', 'completed', 'withdrawn'], 'Invalid academic status')
    .required('Academic status is required'),

  shift_preference: yup.string()
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),

  notes: yup.string()
    .nullable()
    .max(500, 'Internal notes cannot exceed 500 characters')
    .transform((value, originalValue) => originalValue === '' ? null : value),

  financial_settlement: yup.object().when('status', {
    is: (val) => ['withdrawn', 'discarded'].includes(val),
    then: (schema) => schema.shape({
      policy: yup.string()
        .oneOf(['waive_unpaid', 'settle_liability', 'refund', 'prorated_refund', 'retain_ledger'], 'Invalid settlement policy')
        .required('Settlement policy is required'),
      required_amount: yup.number()
        .typeError('Retention liability amount must be a valid number')
        .nullable()
        .transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : Number(originalValue)))
        .when('policy', {
          is: 'settle_liability',
          then: (s) => s.required('Retention liability amount is required').min(0, 'Amount must be greater than or equal to 0')
        }),
      refund_amount: yup.number()
        .typeError('Refund amount must be a valid number')
        .nullable()
        .transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : Number(originalValue)))
        .when('policy', {
          is: (val) => ['refund', 'prorated_refund'].includes(val),
          then: (s) => s.required('Refund amount is required').positive('Refund amount must be greater than 0')
        }),
      due_date: yup.string().nullable().transform((v, o) => o === '' ? null : v),
      payment_method: yup.string().nullable().transform((v, o) => o === '' ? null : v)
        .oneOf([null, '', 'cash', 'upi', 'bank_transfer', 'cheque'], 'Invalid payment method'),
      remarks: yup.string().nullable().max(255, 'Remarks cannot exceed 255 characters')
        .transform((v, o) => o === '' ? null : v)
    }),
    otherwise: (schema) => schema.nullable().default(null)
  }),

  allocations: yup.array().of(
    yup.object({
      allocation_id: yup.string().required('Allocation ID is required'),
      batch_id: yup.string().required('Batch selection is required'),
      status: yup.string()
        .oneOf(['active', 'suspended', 'completed', 'dropped'], 'Invalid allocation status')
        .required('Allocation status is required'),
      remarks: yup.string()
        .nullable()
        .max(500, 'Remarks cannot exceed 500 characters')
        .transform((value, originalValue) => originalValue === '' ? null : value)
    })
  )
});
