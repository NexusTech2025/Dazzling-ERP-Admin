import * as yup from 'yup';

// Step 1: Profile Validation Schema
export const profileSchema = yup.object({
  fullName: yup.string().trim().required('Full name is required'),
  gender: yup.string().required('Gender is required'),
  dob: yup.string().required('Date of birth is required'),
  mobile: yup.string()
    .required('Mobile number is required')
    .test('phone-valid', 'Mobile must be a valid 10-digit number', value => {
      const digits = String(value || '').replace(/\D/g, '');
      return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
    }),
  email: yup.string()
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .email('Invalid email address'),
  address1: yup.string().trim().nullable(),
  city: yup.string().trim().nullable(),
  state: yup.string().trim().nullable(),
  pincode: yup.string()
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('pincode-valid', 'Pin code must be a 6-digit number', value => {
      if (!value) return true;
      const digits = String(value || '').replace(/\D/g, '');
      return digits.length === 6;
    }),
  emergencyContactName: yup.string().trim().nullable(),
  emergencyContactRelationship: yup.string().nullable(),
  emergencyContactPhone: yup.string()
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('phone-valid', 'Emergency contact phone must be a valid 10-digit number',
      value => {
        if (!value) return true;
        const digits = String(value || '').replace(/\D/g, '');
        return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
      })
});

// Step 2: Academic Enrollment & Fees Schema
export const enrollmentSchema = yup.object({
  enrollmentBasket: yup.array()
    .min(1, 'At least one program/course must be selected')
    .required('At least one program/course must be selected'),
  selectedBatches: yup.object().test('batches-selected', 'Each course must have a batch assigned', function (value) {
    const { enrollmentBasket } = this.parent || {};
    if (!enrollmentBasket || enrollmentBasket.length === 0) return true;

    for (const item of enrollmentBasket) {
      if (item.type === 'package') {
        for (const c of (item.courses || [])) {
          const batchId = (value || {})[c.id || c.course_id];
          if (!batchId) return false;
        }
      } else {
        const batchId = (value || {})[item.id || item.course_id];
        if (!batchId) return false;
      }
    }
    return true;
  }),
  installments: yup.array().test('checksum-valid', 'Installments sum does not match total amount', function (value) {
    const { isManualPlan, baseFee, discountVal } = this.parent || {};
    if (!isManualPlan) return true;
    const totalAmount = Math.max(0, (baseFee || 0) - (Number(discountVal) || 0));
    const installmentChecksumSum = (value || []).reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
    return installmentChecksumSum === totalAmount;
  })
});

// Step 3: Activation & Payments Schema
export const activationSchema = yup.object({
  initialPaymentAmount: yup.number()
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('payment-amount-valid', 'Initial payment amount must be greater than 0', function (value) {
      const { immediatePayment } = this.parent || {};
      if (!immediatePayment) return true;
      return value !== null && value !== undefined && value > 0;
    })
    .test('payment-amount-limit', 'Initial payment amount cannot exceed final fee', function (value) {
      const { immediatePayment, finalFee } = this.parent || {};
      if (!immediatePayment) return true;
      return value !== null && value !== undefined && value <= (finalFee || 0);
    }),
  paymentDate: yup.string().test('payment-date-required', 'Receipt date is required', function (value) {
    const { immediatePayment } = this.parent || {};
    if (!immediatePayment) return true;
    return !!value;
  }),
  transactionRef: yup.string().test('txn-ref-required', 'Transaction reference is required', function (value) {
    const { immediatePayment, paymentMethod } = this.parent || {};
    if (!immediatePayment || paymentMethod === 'cash') return true;
    return !!value && value.trim().length > 0;
  })
});
