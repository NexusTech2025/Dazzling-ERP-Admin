import * as yup from 'yup';

/**
 * Yup validation schema enforcing all constraints from TeacherSalaryConfig.json.
 * Matches required types, options, and validates that weight allocations equal exactly 1.0.
 */
export const salaryConfigSchema = yup.object().shape({
  salaryConfigType: yup.string()
    .required('Salary Config Type is required')
    .oneOf(['recurring_monthly', 'fixed_duration_pool']),
  rateType: yup.string()
    .required('Rate Type is required')
    .oneOf(['monthly', 'yearly', 'revenue_percentage']),
  baseValue: yup.number()
    .typeError('Base Value must be a number')
    .required('Base Value is required')
    .positive('Base Value must be greater than zero'),
  scopeType: yup.string()
    .required('Scope Type is required')
    .oneOf(['global', 'batch_group', 'single_batch']),
  scopeId: yup.string()
    .nullable()
    .when('scopeType', {
      is: (val) => val === 'single_batch' || val === 'batch_group',
      then: (schema) => schema.required('Scope ID / Batch Config is required').test(
        'weight-sum-check',
        'The sum of all weight allocations in a batch group must equal exactly 1.0 (100%)',
        function(value) {
          const { scopeType } = this.parent;
          if (scopeType !== 'batch_group') return true;
          if (!value) return false;
          try {
            const weights = JSON.parse(value);
            const sum = Object.values(weights).reduce((acc, val) => acc + Number(val), 0);
            return Math.abs(sum - 1.0) < 0.001; // Allow minor floating inaccuracies
          } catch (e) {
            return false;
          }
        }
      ),
      otherwise: (schema) => schema.nullable()
    }),
  totalContractValue: yup.number()
    .typeError('Total Contract Value must be a number')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .when(['salaryConfigType', 'rateType'], {
      is: (salaryConfigType, rateType) => salaryConfigType === 'fixed_duration_pool' || rateType === 'yearly',
      then: (schema) => schema.required('Total Contract Value is required for Fixed Duration Pools and Yearly rates').positive('Total Contract Value must be greater than zero'),
      otherwise: (schema) => schema.nullable()
    }),
  effectiveFrom: yup.string().required('Effective From date is required'),
  effectiveTo: yup.string().nullable(),
  remark: yup.string().nullable(),
  notes: yup.string().nullable(),
  contractStatus: yup.string()
    .required('Contract Status is required')
    .oneOf(['drafted', 'active', 'expired', 'terminated', 'voided']),
  settlementState: yup.string()
    .required('Settlement State is required')
    .oneOf(['unsettled', 'settled', 'arrears_due']),
  durationMonths: yup.number()
    .typeError('Duration must be a number')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
});
