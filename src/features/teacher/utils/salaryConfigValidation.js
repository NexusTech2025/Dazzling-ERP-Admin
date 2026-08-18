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
    .when(['rateType', 'scopeType'], {
      is: (rateType, scopeType) => rateType === 'revenue_percentage' && scopeType === 'batch_group',
      then: (schema) => schema.nullable().transform((value, originalValue) => (originalValue === '' || originalValue === null || originalValue === undefined ? 0 : value)).min(0, 'Base Value cannot be negative'),
      otherwise: (schema) => schema.when('rateType', {
        is: 'revenue_percentage',
        then: (innerSchema) => innerSchema.required('Revenue Percentage is required').positive('Percentage must be greater than zero').max(100, 'Percentage cannot exceed 100%'),
        otherwise: (innerSchema) => innerSchema.required('Base Value is required').positive('Base Value must be greater than zero')
      })
    }),
  scopeType: yup.string()
    .required('Scope Type is required')
    .when('rateType', {
      is: 'revenue_percentage',
      then: (schema) => schema.oneOf(['single_batch', 'batch_group'], 'Revenue percentage requires Single Batch or Batch Group scope'),
      otherwise: (schema) => schema.oneOf(['global', 'batch_group', 'single_batch'])
    }),
  scopeId: yup.string()
    .nullable()
    .when('scopeType', {
      is: (val) => val === 'single_batch' || val === 'batch_group',
      then: (schema) => schema.required('Scope ID / Batch Config is required').test(
        'batch-group-rates-check',
        'Invalid batch allocations',
        function(value) {
          const { scopeType, rateType } = this.parent;
          if (scopeType !== 'batch_group') return true;
          if (!value) return false;
          try {
            const weights = JSON.parse(value);
            const keys = Object.keys(weights);
            if (keys.length === 0) return false;

            if (rateType === 'revenue_percentage') {
              for (const k of keys) {
                const rate = Number(weights[k]);
                if (isNaN(rate) || rate < 0 || rate > 100) {
                  return this.createError({ message: `Batch ${k} percentage must be between 0% and 100%` });
                }
              }
              return true;
            }

            const sum = Object.values(weights).reduce((acc, val) => acc + Number(val), 0);
            const isValid = Math.abs(sum - 1.0) < 0.001; // Allow minor floating inaccuracies
            if (!isValid) {
              return this.createError({ message: 'The sum of all weight allocations in a batch group must equal exactly 1.0 (100%)' });
            }
            return true;
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
      is: (salaryConfigType, rateType) => rateType !== 'revenue_percentage' && (salaryConfigType === 'fixed_duration_pool' || rateType === 'yearly'),
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
