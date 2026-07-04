import * as yup from 'yup';

/**
 * Yup validation schema for course packages form.
 * Enforces types, required states, and positive numeric boundaries.
 */
export const packageSchema = yup.object().shape({
  name: yup.string().required('Package Name is required').trim(),
  description: yup.string().nullable(),
  segment_id: yup.string().required('Category Segment is required'),
  target_class: yup.string().required('Target Class is required'),
  board: yup.string().required('Education Board is required'),
  month: yup.number()
    .typeError('Duration must be a number')
    .required('Duration is required')
    .positive('Duration must be positive')
    .integer('Duration must be an integer'),
  package_fee: yup.number()
    .typeError('Package Fee must be a number')
    .required('Package Fee is required')
    .min(0, 'Package Fee cannot be negative'),
  recurring_billing: yup.boolean(),
  status: yup.string().required('Status is required')
});
