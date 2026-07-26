import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';
import Modal from '../../../../../components/ui/Modal';
import FormField from '../../../../../components/ui/v2/FormField';
import TextInput from '../../../../../components/ui/v2/TextInput';
import SelectInput from '../../../../../components/ui/v2/SelectInput';
import RadioGroup from '../../../../../components/ui/v2/RadioGroup';
import Button from '../../../../../components/ui/v2/Button';
import { useRecordTeacherPaymentMutation } from '../../../hooks/useTeacherQueries';
import { useUpdateMoneyTransactionMutation } from '../../../../finance/hooks/useFinanceQueries';

// 1. Declarative Yup Validation Schema for user-editable form fields
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
})
  .test(
    'matching-salary-month',
    'Transaction date must fall within the selected salary month.',
    function (values) {
      const { salary_month, transaction_date } = values || {};
      if (!salary_month || !transaction_date) return true;

      const txMonth = transaction_date.slice(0, 7);
      if (txMonth !== salary_month) {
        return this.createError({
          path: 'transaction_date',
          message: `Transaction date (${transaction_date}) must fall within the selected salary month (${salary_month}).`
        });
      }
      return true;
    }
  )
  .required();

const PAYMENT_TYPE_OPTIONS = [
  { label: 'Salary', value: 'salary' },
  { label: 'Advance', value: 'advance' },
  { label: 'Bonus', value: 'bonus' },
  { label: 'Deduction', value: 'deduction' }
];

const PAYMENT_METHOD_OPTIONS = [
  { label: 'Bank Transfer (🏦)', value: 'bank' },
  { label: 'UPI / PhonePe (📱)', value: 'phonepe' },
  { label: 'Paytm (📱)', value: 'paytm' },
  { label: 'Cash (💵)', value: 'cash' },
  { label: 'Other (📄)', value: 'other' }
];

const RecordTeacherPaymentModal = ({
  isOpen,
  onClose,
  teacherId,
  teacherName = 'Faculty Member',
  initialPaymentType = 'salary',
  activeBaseRate = 0,
  pendingAmount = 0,
  initialData = null,
  onSuccess
}) => {
  const recordPaymentMutation = useRecordTeacherPaymentMutation();
  const updateGlMutation = useUpdateMoneyTransactionMutation();

  const getFormDefaults = () => {
    const defaultAmount = initialData?.amount ?? (activeBaseRate > 0 ? activeBaseRate : (pendingAmount > 0 ? pendingAmount : ''));
    const defaultTxDate = initialData?.transaction_date || format(new Date(), 'yyyy-MM-dd');
    const defaultMonth = initialData?.transaction_date ? initialData.transaction_date.slice(0, 7) : format(new Date(), 'yyyy-MM');
    const defaultMethod = initialData?.payment_method || 'bank';
    const glId = initialData?.gl_transaction_id || initialData?.transaction_id || '';
    const defaultNotes = glId ? `Created from GL entry ${glId}${initialData?.notes ? `: ${initialData.notes}` : ''}` : '';

    return {
      payment_type: initialPaymentType || 'salary',
      salary_month: defaultMonth,
      amount: defaultAmount,
      payment_method: defaultMethod,
      transaction_date: defaultTxDate,
      reference_number: glId || '',
      notes: defaultNotes
    };
  };

  // 2. Initialize useForm with yupResolver and defaultValues
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted, isValid }
  } = useForm({
    resolver: yupResolver(teacherPaymentSchema),
    mode: 'onSubmit',
    defaultValues: getFormDefaults()
  });

  // Re-hydrate form state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      reset(getFormDefaults());
    }
  }, [isOpen, initialPaymentType, activeBaseRate, pendingAmount, initialData, reset]);

  const onSubmit = (data) => {
    const payload = {
      teacher_id: teacherId,
      payment_type: data.payment_type,
      amount: Number(data.amount),
      payment_method: data.payment_method,
      transaction_date: data.transaction_date,
      salary_month: data.salary_month,
      reference_number: data.reference_number || null,
      notes: data.notes || null
    };

    recordPaymentMutation.mutate(payload, {
      onSuccess: (res) => {
        const isSuccessful = res?.success !== false && res?.status !== 'error';
        if (isSuccessful) {
          const recordData = res?.data || res?.record || res;
          if (onSuccess) {
            onSuccess(recordData, payload, {
              isGlConverted: !!initialData,
              glRecord: initialData
            });
          }
          onClose();
        }
      },
      onError: (err) => {
        console.error('Failed to record teacher payment:', err);
      }
    });
  };


  // Determine if top-level global generic error banner should be displayed
  const hasValidationErrors = isSubmitted && !isValid && Object.keys(errors).length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title="Record Faculty Payment"
        subtitle={`Teacher: ${teacherName} (${teacherId || 'N/A'})`}
        icon="payments"
      />

      <Modal.Body className="space-y-4">
        {/* Global Generic Error Banner */}
        {hasValidationErrors && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-lg leading-none shrink-0" aria-hidden="true">error</span>
            <span><strong>Submission Failed:</strong> Please review the highlighted fields below and re-submit.</span>
          </div>
        )}

        {/* KPI Banner Context */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Active Base Rate</span>
            <p className="text-base font-bold font-mono text-slate-800 dark:text-slate-100 mt-0.5">
              ₹{(activeBaseRate || 0).toLocaleString()}/mo
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Net Owed Balance</span>
            <p className="text-base font-bold font-mono text-indigo-500 dark:text-indigo-400 mt-0.5">
              ₹{(pendingAmount || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <form id="record-teacher-payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Row 1: Payment Type (Controlled Radio Group) */}
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

          {/* Row 2: Salary Month & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Row 3: Payment Method & Transaction Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <FormField name="transaction_date" label="Transaction Date" required error={errors.transaction_date?.message}>
              <TextInput
                {...register('transaction_date')}
                type="date"
                hasError={!!errors.transaction_date}
              />
            </FormField>
          </div>

          {/* Row 4: Reference Number */}
          <FormField name="reference_number" label="Reference Number (Bank / UTR / Check #)" error={errors.reference_number?.message}>
            <TextInput
              {...register('reference_number')}
              placeholder="e.g. TXN12345678"
              hasError={!!errors.reference_number}
            />
          </FormField>

          {/* Row 5: Notes / Remarks */}
          <FormField name="notes" label="Notes / Remarks" error={errors.notes?.message}>
            <TextInput
              {...register('notes')}
              placeholder="e.g. July salary payment"
              hasError={!!errors.notes}
            />
          </FormField>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outlined" onClick={onClose} disabled={recordPaymentMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          loading={recordPaymentMutation.isPending}
          onClick={handleSubmit(onSubmit)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Submit Payment
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecordTeacherPaymentModal;
