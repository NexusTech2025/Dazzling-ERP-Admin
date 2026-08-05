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
    .oneOf(['active', 'completed', 'withdrawn'], 'Invalid enrollment status')
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
