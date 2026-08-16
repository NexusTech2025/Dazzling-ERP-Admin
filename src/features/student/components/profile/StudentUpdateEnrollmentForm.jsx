import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import MainLayout from '../../../../components/layout/MainLayout';
import FormField from '../../../../components/ui/v2/FormField';
import TextInput from '../../../../components/ui/v2/TextInput';
import SelectInput from '../../../../components/ui/v2/SelectInput';
import Button from '../../../../components/ui/v2/Button';
import Badge from '../../../../components/ui/Badge';
import Card from '../../../../components/ui/Card';
import { enrollmentUpdateSchema } from '../../schemas/enrollmentUpdateSchema';
import { batchRepo } from '../../../batch/utils/batchCacheHelper';
import WithdrawalSettlementSection from './WithdrawalSettlementSection';

// Static dropdown options
const ENROLLMENT_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Withdrawn', value: 'withdrawn' },
  { label: 'Discarded', value: 'discarded' }
];

const ACADEMIC_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Completed', value: 'completed' },
  { label: 'Withdrawn', value: 'withdrawn' }
];

const ALLOCATION_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Completed', value: 'completed' },
  { label: 'Dropped', value: 'dropped' }
];

const SHIFT_PREFERENCE_OPTIONS = [
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Evening', value: 'evening' },
  { label: 'Flexible', value: 'flexible' }
];

/**
 * Decoupled helper function to resolve available batch options for a specific allocation item.
 * Utilizes batchRepo for O(1) batchMap lookups and course filtering.
 *
 * @param {string} courseId - Target allocation course identifier.
 * @param {Map<string, Array<{label: string, value: string}>>} batchesByCourse - Map of courseId -> batch options.
 * @param {Array<object>} batches - Raw batches list from query.
 * @param {object} fieldItem - Current allocation field item.
 * @returns {Array<{label: string, value: string}>} Array of batch option objects.
 */
export function resolveAvailableBatchOptions(courseId, batchesByCourse, batches, fieldItem) {
  const normalizedCId = String(courseId || '').trim();
  const mapBatches = batchesByCourse?.get(normalizedCId);
  if (Array.isArray(mapBatches) && mapBatches.length > 0) {
    return mapBatches;
  }

  if (Array.isArray(batches) && batches.length > 0) {
    batchRepo.prime(batches);
  }

  const matchedFilter = Array.from(batchRepo.batchMap.values())
    .filter(b => {
      const bCourseId = b.course_id || b.course?.course_id;
      return bCourseId && String(bCourseId).toLowerCase() === normalizedCId.toLowerCase();
    })
    .map(b => ({
      label: `${b.batch_name || b.name || 'Batch'} (${b.batch_id || b.id})`,
      value: b.batch_id || b.id
    }));

  if (matchedFilter.length > 0) {
    return matchedFilter;
  }

  const allFallbackOptions = Array.from(batchRepo.batchMap.values())
    .map(b => ({ label: `${b.batch_name || b.name || 'Batch'} (${b.batch_id || b.id})`, value: b.batch_id || b.id }));

  if (allFallbackOptions.length > 0) {
    return allFallbackOptions;
  }

  return [{ label: `${fieldItem.current_batch_name} (${fieldItem.current_batch_id})`, value: fieldItem.current_batch_id }];
}

/**
 * Responsive presentation component for editing Student Enrollment contracts and Batch allocations.
 * Wrapped in MainLayout with wide desktop layout support and full light/dark theme alignment.
 *
 * @component
 * @param {object} props
 * @param {object} props.enrollment - Hydrated enrollment entity.
 * @param {object} [props.student] - Student entity record.
 * @param {Array<object>} [props.batches=[]] - List of available active batch records from useBatchesQuery.
 * @param {boolean} [props.isSubmitting=false] - Submission pending state.
 * @param {function} props.onSave - Callback function invoked on valid form submission.
 * @param {function} props.onCancel - Callback function invoked when user clicks cancel.
 */
export default function StudentUpdateEnrollmentForm({
  enrollment,
  student,
  batches = [],
  isSubmitting = false,
  onSave,
  onCancel,
  onDiscard,
  onMigrate
}) {
  const [showActionsMenu, setShowActionsMenu] = React.useState(false);

  // Extract initial values from hydrated enrollment object using batchRepo
  const initialValues = useMemo(() => {
    if (!enrollment) return {};

    if (Array.isArray(batches) && batches.length > 0) {
      batchRepo.prime(batches);
    }

    const rawAllocations = Array.isArray(enrollment.allocations) ? enrollment.allocations : [];
    const meta = enrollment.metadata || {};

    return {
      enrollment_id: enrollment.enrollment_id || enrollment.id || '',
      roll_number: enrollment.roll_number ?? '',
      enrollment_date: enrollment.enrollment_date
        ? String(enrollment.enrollment_date).split('T')[0]
        : new Date().toISOString().split('T')[0],
      status: enrollment.status || 'active',
      academic_status: enrollment.academic_status || 'active',
      shift_preference: meta.shift_preference || 'evening',
      notes: meta.notes || '',
      financial_settlement: {
        policy: 'waive_unpaid',
        required_amount: '',
        refund_amount: '',
        due_date: '',
        payment_method: 'upi',
        remarks: ''
      },
      allocations: rawAllocations.map(alloc => {
        const res = batchRepo.resolveAllocation(alloc) || {};
        return {
          allocation_id: res.allocationId || alloc.allocation_id || alloc.id,
          course_id: res.courseId,
          course_name: res.courseName,
          course_code: alloc.course?.course_code || res.courseId,
          current_batch_id: res.batchId,
          current_batch_name: res.batchName,
          batch_id: res.batchId,
          status: res.status,
          remarks: res.remarks || ''
        };
      })
    };
  }, [enrollment, batches]);

  // Extract financial accounting metrics for live settlement simulations
  const financialContext = useMemo(() => {
    const accounts = Array.isArray(enrollment?.studentfeeaccounts)
      ? enrollment.studentfeeaccounts
      : (Array.isArray(enrollment?.StudentFeeAccount) ? enrollment.StudentFeeAccount : []);
    const sfa = accounts[0] || {};
    const installments = Array.isArray(sfa.installments) ? sfa.installments : [];
    return {
      amountPaid: Number(sfa.amount_paid || sfa.paid_amount || 0),
      balanceDue: Number(sfa.balance_due || sfa.balance_amount || 0),
      totalFee: Number(sfa.total_fee || 0),
      pendingInstallments: installments.filter(i => ['pending', 'partially_paid'].includes((i.status || '').toLowerCase())).length,
      totalInstallments: installments.length,
      allocationsCount: Array.isArray(enrollment?.allocations) ? enrollment.allocations.length : 0
    };
  }, [enrollment]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(enrollmentUpdateSchema),
    defaultValues: initialValues
  });

  const { fields: allocationFields } = useFieldArray({
    control,
    name: 'allocations'
  });

  const currentStatus = watch('status');
  const currentAcademicStatus = watch('academic_status');

  const showStatusCascadeBanner = ['withdrawn', 'completed', 'suspended'].includes(currentStatus) ||
    ['withdrawn', 'completed', 'suspended'].includes(currentAcademicStatus);

  // Group batches fetched via useBatchesQuery by course_id using batchRepo
  const batchesByCourse = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(batches) || batches.length === 0) return map;

    batchRepo.prime(batches);

    for (const b of batchRepo.batchMap.values()) {
      const cId = b.course_id || b.course?.course_id;
      if (!cId) continue;
      const normalizedCId = String(cId).trim();
      if (!map.has(normalizedCId)) map.set(normalizedCId, []);
      map.get(normalizedCId).push({
        label: `${b.batch_name || b.name || 'Batch'} (${b.batch_id || b.id})`,
        value: b.batch_id || b.id
      });
    }
    return map;
  }, [batches]);

  // Decoupled & Memoized Map of allocationId -> resolved available batch options
  const allocationBatchOptionsMap = useMemo(() => {
    const map = new Map();
    allocationFields.forEach((fieldItem) => {
      const key = fieldItem.id || fieldItem.allocation_id;
      const opts = resolveAvailableBatchOptions(fieldItem.course_id, batchesByCourse, batches, fieldItem);
      map.set(key, opts);
    });
    return map;
  }, [allocationFields, batchesByCourse, batches]);

  const onSubmit = (formData) => {
    const isWithdrawnOrDiscarded = ['withdrawn', 'discarded'].includes(formData.status);
    const payload = {
      enrollment_id: initialValues.enrollment_id,
      roll_number: formData.roll_number ? Number(formData.roll_number) : null,
      enrollment_date: formData.enrollment_date,
      status: formData.status,
      academic_status: formData.academic_status,
      metadata: {
        shift_preference: formData.shift_preference,
        notes: formData.notes
      },
      allocations: formData.allocations.map(a => ({
        allocation_id: a.allocation_id,
        batch_id: a.batch_id,
        status: a.status,
        remarks: a.remarks || null
      })),
      ...(isWithdrawnOrDiscarded ? {
        financial_settlement: {
          policy: formData.financial_settlement?.policy || 'waive_unpaid',
          ...(formData.financial_settlement?.required_amount !== '' && formData.financial_settlement?.required_amount != null
            ? { required_amount: Number(formData.financial_settlement.required_amount) }
            : {}),
          ...(formData.financial_settlement?.refund_amount !== '' && formData.financial_settlement?.refund_amount != null
            ? { refund_amount: Number(formData.financial_settlement.refund_amount) }
            : {}),
          ...(formData.financial_settlement?.due_date ? { due_date: formData.financial_settlement.due_date } : {}),
          ...(formData.financial_settlement?.payment_method ? { payment_method: formData.financial_settlement.payment_method } : {}),
          ...(formData.financial_settlement?.remarks ? { remarks: formData.financial_settlement.remarks.trim() } : {})
        }
      } : {})
    };
    console.log('[StudentUpdateEnrollmentForm] Submitting Request:', payload);
    onSave(payload);
  };

  // Helper metadata display values
  const studentName = student?.profile?.student_name || student?.student_name || enrollment?.student?.student_name || 'Student';
  const studentId = student?.student_id || enrollment?.student_id || '';
  const enrollmentType = (enrollment?.enrollment_type || 'course').toUpperCase();
  const itemName = enrollment?.item_name || enrollment?.package?.name || enrollment?.course?.name || 'Academic Program';
  const itemId = enrollment?.item_id || enrollment?.package_id || enrollment?.course_id || '';

  // MainLayout Segment 1: Header
  const headerSegment = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shrink-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-text-main dark:hover:text-white transition-colors"
          title="Go Back"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-main dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">school</span>
            Update Enrollment
          </h1>
          <p className="text-xs text-text-secondary">Modify enrollment contract details and batch seating allocations</p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* More Actions Dropdown */}
        <div className="relative">
          <Button
            type="button"
            variant="outlined"
            endIcon="expand_more"
            onClick={() => setShowActionsMenu(prev => !prev)}
            disabled={isSubmitting}
          >
            More Actions
          </Button>

          {showActionsMenu && (
            <>
              {/* Backdrop listener to close menu on outside click */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowActionsMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-2 divide-y divide-slate-100 dark:divide-slate-800/60 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Lifecycle Operations
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowActionsMenu(false);
                    onMigrate?.();
                  }}
                  className="w-full px-4 py-2.5 flex items-start gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5 group-hover:scale-110 transition-transform">
                    published_with_changes
                  </span>
                  <div>
                    <div className="text-xs font-bold text-text-main dark:text-white">Migrate Enrollment</div>
                    <div className="text-[11px] text-text-secondary">Migrate to another course or package</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowActionsMenu(false);
                    onDiscard?.();
                  }}
                  className="w-full px-4 py-2.5 flex items-start gap-3 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors group"
                >
                  <span className="material-symbols-outlined text-rose-500 text-lg mt-0.5 group-hover:scale-110 transition-transform">
                    delete_forever
                  </span>
                  <div>
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400">Discard Enrollment</div>
                    <div className="text-[11px] text-text-secondary">Discard enrollment (refund / no refund)</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        <Button type="button" variant="outlined" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={isSubmitting} startIcon="save">
          Save Changes
        </Button>
      </div>
    </div>
  );

  // MainLayout Segment 2: Body (4-Card Workspace)
  const bodySegment = (
    <div className="w-full max-w-[1440px] mx-auto space-y-6 px-4 md:px-6 py-2">
      {/* Card 1: Enrollment Summary (Read Only) */}
      <Card className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <Card.Header border={true} className="flex items-center gap-2 font-semibold text-text-main dark:text-white">
          <span className="material-symbols-outlined text-primary">assignment</span>
          <span>Enrollment Summary</span>
          <span className="text-xs font-normal text-text-secondary ml-1">(Read Only)</span>
        </Card.Header>
        <Card.Body className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Student Info */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                {studentName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-text-secondary">Student</div>
                <div className="text-sm font-bold text-text-main dark:text-white truncate">{studentName}</div>
                <div className="text-xs text-text-secondary">{studentId}</div>
              </div>
            </div>

            {/* Enrollment ID */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Enrollment ID</div>
                <div className="text-sm font-bold text-text-main dark:text-white">{initialValues.enrollment_id}</div>
              </div>
            </div>

            {/* Enrollment Type */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <span className="material-symbols-outlined">package_2</span>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Enrollment Type</div>
                <Badge variant={enrollmentType === 'PACKAGE' ? 'info' : 'primary'} className="mt-0.5">
                  {enrollmentType}
                </Badge>
              </div>
            </div>

            {/* Package / Course */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                <span className="material-symbols-outlined">local_library</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-text-secondary">Package / Course</div>
                <div className="text-sm font-bold text-text-main dark:text-white truncate">{itemName}</div>
                <div className="text-xs text-text-secondary">{itemId}</div>
              </div>
            </div>

            {/* Enrollment Date */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Enrollment Date</div>
                <div className="text-sm font-bold text-text-main dark:text-white">{initialValues.enrollment_date}</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-base">info</span>
            <span>Student, package/course and enrollment type are system controlled and cannot be changed.</span>
          </div>
        </Card.Body>
      </Card>

      {/* Card 2: Enrollment Details */}
      <Card className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <Card.Header border={true} className="flex items-center gap-2 font-semibold text-text-main dark:text-white">
          <span className="material-symbols-outlined text-primary">edit_note</span>
          <span>Enrollment Details</span>
        </Card.Header>
        <Card.Body className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Roll Number" error={errors.roll_number?.message}>
              <Controller
                name="roll_number"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    type="number"
                    placeholder="# Roll Number"
                    startIcon="numbers"
                  />
                )}
              />
            </FormField>

            <FormField label="Enrollment Date" required error={errors.enrollment_date?.message}>
              <Controller
                name="enrollment_date"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    type="date"
                    startIcon="calendar_today"
                  />
                )}
              />
            </FormField>

            <FormField label="Enrollment Status" required error={errors.status?.message}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    {...field}
                    options={ENROLLMENT_STATUS_OPTIONS}
                  />
                )}
              />
            </FormField>

            <FormField label="Academic Status" required error={errors.academic_status?.message}>
              <Controller
                name="academic_status"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    {...field}
                    options={ACADEMIC_STATUS_OPTIONS}
                  />
                )}
              />
            </FormField>
          </div>

          {showStatusCascadeBanner && !['withdrawn', 'discarded'].includes(currentStatus) && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 transition-all duration-300">
              <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-base">warning</span>
              <span>
                Changing status to Withdrawn, Completed or Suspended will automatically update the status of all unmodified batch allocations.
              </span>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Dynamic Withdrawal & Financial Settlement Policy Section */}
      {['withdrawn', 'discarded'].includes(currentStatus) && (
        <WithdrawalSettlementSection
          control={control}
          errors={errors}
          watch={watch}
          financialContext={financialContext}
        />
      )}

      {/* Card 3: Batch Allocations Manager */}
      <Card className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <Card.Header border={true} className="flex items-center justify-between font-semibold text-text-main dark:text-white">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400">account_tree</span>
            <span>Batch Allocations</span>
          </div>
          <Badge variant="default" className="text-xs bg-slate-100 dark:bg-slate-800 text-text-secondary border-slate-200 dark:border-slate-700">
            {allocationFields.length} {allocationFields.length === 1 ? 'Allocation' : 'Allocations'}
          </Badge>
        </Card.Header>
        <Card.Body className="p-6 space-y-6">
          {allocationFields.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-sm border border-dashed border-border-light dark:border-border-dark rounded-xl">
              No batch seating allocations found for this enrollment.
            </div>
          ) : (
            allocationFields.map((fieldItem, index) => {
              const courseName = fieldItem.course_name;
              const courseCode = fieldItem.course_code;
              const allocKey = fieldItem.id || fieldItem.allocation_id;
              const availableCourseBatches = allocationBatchOptionsMap.get(allocKey) || [];

              return (
                <div
                  key={fieldItem.id}
                  className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4 hover:border-slate-300 dark:hover:border-slate-600/80 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/50 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-500 dark:text-purple-400">menu_book</span>
                      <span className="font-bold text-text-main dark:text-white text-base">{courseName}</span>
                      {courseCode && <span className="text-xs text-text-secondary">({courseCode})</span>}
                    </div>
                    <Badge variant="info" className="text-xs">
                      Allocation #{index + 1}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* Current Batch (Read Only) */}
                    <div className="lg:col-span-3">
                      <FormField label="Current Batch (Read Only)">
                        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-text-main dark:text-slate-300 text-sm">
                          <div className="font-bold text-text-main dark:text-slate-200">{fieldItem.current_batch_name}</div>
                          <div className="text-xs text-text-secondary">{fieldItem.current_batch_id}</div>
                        </div>
                      </FormField>
                    </div>

                    {/* Arrow Indicator */}
                    <div className="hidden lg:flex lg:col-span-1 items-center justify-center pt-8 text-text-secondary">
                      <span className="material-symbols-outlined">east</span>
                    </div>

                    {/* New Batch Select */}
                    <div className="lg:col-span-3">
                      <FormField
                        label="New Batch"
                        required
                        error={errors.allocations?.[index]?.batch_id?.message}
                      >
                        <Controller
                          name={`allocations.${index}.batch_id`}
                          control={control}
                          render={({ field }) => (
                            <SelectInput
                              {...field}
                              options={availableCourseBatches}
                            />
                          )}
                        />
                      </FormField>
                    </div>

                    {/* Allocation Status */}
                    <div className="lg:col-span-2">
                      <FormField
                        label="Allocation Status"
                        required
                        error={errors.allocations?.[index]?.status?.message}
                      >
                        <Controller
                          name={`allocations.${index}.status`}
                          control={control}
                          render={({ field }) => (
                            <SelectInput
                              {...field}
                              options={ALLOCATION_STATUS_OPTIONS}
                            />
                          )}
                        />
                      </FormField>
                    </div>

                    {/* Remarks */}
                    <div className="lg:col-span-3">
                      <FormField
                        label="Remarks"
                        error={errors.allocations?.[index]?.remarks?.message}
                      >
                        <Controller
                          name={`allocations.${index}.remarks`}
                          control={control}
                          render={({ field }) => (
                            <TextInput
                              {...field}
                              placeholder="Transfer reason or remarks"
                            />
                          )}
                        />
                      </FormField>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 dark:text-emerald-400 text-base">check_circle</span>
                    <span>Only batches belonging to the same course ({courseName}) are listed.</span>
                  </div>
                </div>
              );
            })
          )}
        </Card.Body>
      </Card>

      {/* Card 4: Operational Metadata */}
      <Card className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <Card.Header border={true} className="flex items-center gap-2 font-semibold text-text-main dark:text-white">
          <span className="material-symbols-outlined text-amber-500 dark:text-amber-400">label</span>
          <span>Operational Metadata</span>
        </Card.Header>
        <Card.Body className="p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <FormField label="Shift Preference" error={errors.shift_preference?.message}>
                <Controller
                  name="shift_preference"
                  control={control}
                  render={({ field }) => (
                    <SelectInput
                      {...field}
                      options={SHIFT_PREFERENCE_OPTIONS}
                    />
                  )}
                />
              </FormField>
            </div>

            <div className="lg:col-span-8">
              <FormField label="Internal Notes" error={errors.notes?.message}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      placeholder="Enter internal operational notes..."
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          <div className="text-xs text-text-secondary italic">
            Metadata is used internally for operational purposes and is not visible to students or parents.
          </div>
        </Card.Body>
      </Card>

      {/* Card 5: Enrollment Activity Snapshot */}
      <Card className="border border-border-light dark:border-border-dark bg-slate-50/60 dark:bg-slate-800/40">
        <Card.Header border={true} className="flex items-center justify-between font-semibold text-text-main dark:text-white">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            <span>Enrollment Activity Snapshot</span>
          </div>
          <span className="text-xs font-normal text-text-secondary">Live Financial & Seating Metrics</span>
        </Card.Header>
        <Card.Body className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Total Paid */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
                <span className="material-symbols-outlined text-emerald-500 text-sm">payments</span>
                <span>Total Paid</span>
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ₹{Number(enrollment?.studentfeeaccounts?.[0]?.amount_paid || enrollment?.studentfeeaccounts?.[0]?.paid_amount || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-text-secondary mt-0.5 truncate">
                From {enrollment?.studentfeeaccounts?.[0]?.student_fee_id || 'SFA'}
              </div>
            </div>

            {/* Balance Due */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
                <span className="material-symbols-outlined text-indigo-500 text-sm">account_balance_wallet</span>
                <span>Balance Due</span>
              </div>
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                ₹{Number(enrollment?.studentfeeaccounts?.[0]?.balance_due || enrollment?.studentfeeaccounts?.[0]?.balance_amount || 0).toLocaleString()}
              </div>
            </div>

            {/* Installments */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
                <span className="material-symbols-outlined text-blue-500 text-sm">calendar_month</span>
                <span>Installments</span>
              </div>
              <div className="text-lg font-bold text-text-main dark:text-white">
                {Array.isArray(enrollment?.studentfeeaccounts?.[0]?.installments) ? enrollment.studentfeeaccounts[0].installments.length : 0} Active
              </div>
            </div>

            {/* Batch Allocations */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
                <span className="material-symbols-outlined text-amber-500 text-sm">groups</span>
                <span>Allocations</span>
              </div>
              <div className="text-lg font-bold text-text-main dark:text-white">
                {Array.isArray(enrollment?.allocations) ? enrollment.allocations.length : 0} Assigned
              </div>
            </div>

            {/* Contract Status */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
                <span className="material-symbols-outlined text-cyan-500 text-sm">verified</span>
                <span>Contract Status</span>
              </div>
              <div className="mt-1">
                <Badge variant={(enrollment?.status || '').toLowerCase() === 'active' ? 'success' : 'warning'}>
                  {(enrollment?.status || 'ACTIVE').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  // MainLayout Segment 3: Footer Bar
  const footerSegment = (
    <div className="px-6 py-3.5 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/90 dark:bg-slate-800/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3 text-xs text-text-secondary">
        <span className="font-bold text-text-main dark:text-white font-mono">ID: {initialValues.enrollment_id}</span>
        <span>•</span>
        <span>Created: {initialValues.enrollment_date}</span>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <Button type="button" variant="outlined" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={isSubmitting} startIcon="save">
          Save Changes
        </Button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full w-full">
      <MainLayout
        header={headerSegment}
        body={bodySegment}
        footer={footerSegment}
      />
    </form>
  );
}

StudentUpdateEnrollmentForm.propTypes = {
  enrollment: PropTypes.object.isRequired,
  student: PropTypes.object,
  batches: PropTypes.array,
  isSubmitting: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDiscard: PropTypes.func,
  onMigrate: PropTypes.func
};
