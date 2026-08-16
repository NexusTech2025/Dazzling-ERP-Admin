import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import RightDrawer from '../../../../../components/ui/v2/RightDrawer';
import FormField from '../../../../../components/ui/v2/FormField';
import TextInput from '../../../../../components/ui/v2/TextInput';
import SelectInput from '../../../../../components/ui/v2/SelectInput';
import DateInput from '../../../../../components/ui/v2/DateInput';
import ToggleSwitch from '../../../../../components/ui/v2/ToggleSwitch';
import SegmentedControl from '../../../../../components/ui/v2/SegmentedControl';
import Button from '../../../../../components/ui/v2/Button';
import Badge from '../../../../../components/ui/Badge';
import AlertCard from '../../../../../components/ui/v2/AlertCard';
import ConfirmModal from '../../../../../components/ui/ConfirmModal';

import CourseSelectionModal from '../../../../course/components/CourseSelectionModal';
import PackageSelectionModal from '../../../../course/components/PackageSelectionModal';

import { batchRepo } from '../../../../batch/utils/batchCacheHelper';
import {
  TargetSelectionAlertStrategy,
  PaymentRolloverAlertStrategy,
  BatchSeatingAlertStrategy,
  MigrationPolicy,
  ALERT_MESSAGE_REGISTRY
} from '../../../utils/enrollmentAlertStrategies';

/**
 * Safely extracts selected string value from either a raw string value (emitted by V2 SelectInput)
 * or a standard synthetic event object.
 * 
 * @param {string|object} valOrEvent - Event object or raw primitive value.
 * @returns {string} Target string value.
 */
function getEventValue(valOrEvent) {
  if (valOrEvent && typeof valOrEvent === 'object' && 'target' in valOrEvent) {
    return valOrEvent.target.value;
  }
  return valOrEvent || '';
}

/**
 * Migrate Enrollment Side Drawer component.
 * Allows migrating a student from an existing enrollment contract to a new Course or Package contract.
 * Uses specialized selection modals (PackageSelectionModal & CourseSelectionModal) for explicit selection.
 * Strategy pattern powers dynamic alert cards across target, payment, and seating states.
 * 
 * @component
 * @param {object} props
 * @param {boolean} props.isOpen - Controls drawer visibility.
 * @param {function} props.onClose - Callback function to close drawer.
 * @param {object} props.enrollment - Hydrated source enrollment contract.
 * @param {Array<object>} props.courses - Cached courses array from useCoursesQuery.
 * @param {Array<object>} props.packages - Cached packages array from usePackagesQuery.
 * @param {Array<object>} props.batches - Cached batches array from useBatchesQuery.
 * @param {boolean} props.isSubmitting - Pending state during API execution.
 * @param {function} props.onExecute - Callback function receiving payload.
 */
export default function MigrateEnrollmentDrawer({
  isOpen,
  onClose,
  enrollment,
  courses = [],
  packages = [],
  batches = [],
  isSubmitting,
  onExecute
}) {
  const [targetType, setTargetType] = useState('package');
  const [targetId, setTargetId] = useState('');
  const [rolloverPayments, setRolloverPayments] = useState(true);
  const [newFee, setNewFee] = useState('');
  const [batchAssignments, setBatchAssignments] = useState([]);
  const [installmentPlan, setInstallmentPlan] = useState([]);
  const [remarks, setRemarks] = useState('');

  // Modal Visibility States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Instantiate Alert Strategies via useMemo
  const targetStrategy = useMemo(() => new TargetSelectionAlertStrategy(), []);
  const paymentStrategy = useMemo(() => new PaymentRolloverAlertStrategy(), []);
  const seatingStrategy = useMemo(() => new BatchSeatingAlertStrategy(), []);

  // Extract old fee account data
  const oldFeeAccount = useMemo(() => {
    const accounts = Array.isArray(enrollment?.studentfeeaccounts)
      ? enrollment.studentfeeaccounts
      : (Array.isArray(enrollment?.StudentFeeAccount) ? enrollment.StudentFeeAccount : []);
    return accounts[0] || null;
  }, [enrollment]);

  const oldPaidAmount = Number(oldFeeAccount?.amount_paid || oldFeeAccount?.paid_amount || 0);

  // Selected Target Entity details
  const selectedTargetEntity = useMemo(() => {
    if (!targetId) return null;
    if (targetType === 'package') {
      return packages.find(pkg => (pkg.package_id || pkg.id) === targetId) || null;
    }
    return courses.find(crs => (crs.course_id || crs.id) === targetId) || null;
  }, [targetType, targetId, packages, courses]);

  // Auto-populate new fee when target changes
  useEffect(() => {
    if (selectedTargetEntity) {
      const defaultFee = Number(
        selectedTargetEntity.package_fee ||
        selectedTargetEntity.total_fee ||
        selectedTargetEntity.fee ||
        selectedTargetEntity.price ||
        0
      );
      setNewFee(String(defaultFee));

      // Resolve child courses for batch assignment setup
      let targetCourses = [];
      if (targetType === 'package') {
        if (Array.isArray(selectedTargetEntity.courses) && selectedTargetEntity.courses.length > 0) {
          targetCourses = selectedTargetEntity.courses;
        } else if (Array.isArray(selectedTargetEntity.packageitems) && selectedTargetEntity.packageitems.length > 0) {
          targetCourses = selectedTargetEntity.packageitems.map(pi => pi.course || pi);
        } else if (Array.isArray(selectedTargetEntity.package_items) && selectedTargetEntity.package_items.length > 0) {
          targetCourses = selectedTargetEntity.package_items.map(pi => pi.course || pi);
        }
      } else {
        targetCourses = [selectedTargetEntity];
      }

      const initialAssignments = targetCourses.map(crs => {
        const cId = crs.course_id || crs.id;
        const cName = crs.name || crs.course_name || 'Course';
        return {
          course_id: cId,
          course_name: cName,
          batch_id: ''
        };
      });
      setBatchAssignments(initialAssignments);
    } else {
      setNewFee('');
      setBatchAssignments([]);
    }
  }, [selectedTargetEntity, targetType]);

  // Group batches by course for dynamic batch selector options
  const batchesByCourseMap = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(batches) || batches.length === 0) return map;

    batchRepo.prime(batches);

    for (const b of batchRepo.batchMap.values()) {
      const cId = b.course_id || b.course?.course_id;
      if (!cId) continue;
      const normalizedCId = String(cId).trim();
      if (!map.has(normalizedCId)) map.set(normalizedCId, []);
      map.get(normalizedCId).push({
        label: `${b.batch_name || b.name} (${b.batch_id || b.id})`,
        value: b.batch_id || b.id
      });
    }
    return map;
  }, [batches]);

  // Financial calculations
  const parsedNewFee = Number(newFee || 0);
  const creditApplied = rolloverPayments ? oldPaidAmount : 0;
  const newBalanceDue = Math.max(0, parsedNewFee - creditApplied);

  // Dynamic Strategy Alert Evaluations
  const targetAlert = useMemo(
    () => targetStrategy.evaluate({ targetType, selectedTargetEntity }),
    [targetStrategy, targetType, selectedTargetEntity]
  );

  const paymentAlert = useMemo(
    () => paymentStrategy.evaluate({ rolloverPayments, oldPaidAmount, newFee: parsedNewFee, newBalanceDue }),
    [paymentStrategy, rolloverPayments, oldPaidAmount, parsedNewFee, newBalanceDue]
  );

  const seatingAlert = useMemo(
    () => seatingStrategy.evaluate({ batchAssignments }),
    [seatingStrategy, batchAssignments]
  );

  const oldProgramName = enrollment?.item_name || enrollment?.package?.name || enrollment?.course?.name || 'Current Program';
  const enrId = enrollment?.enrollment_id || enrollment?.id || 'ENR-000';

  const summaryNoticeAlert = useMemo(
    () => ALERT_MESSAGE_REGISTRY.MIGRATION_SUMMARY_NOTICE(enrId, creditApplied),
    [enrId, creditApplied]
  );

  // Installment handling
  const handleAddInstallment = () => {
    setInstallmentPlan(prev => [
      ...prev,
      { due_date: '', due_amount: '' }
    ]);
  };

  const handleRemoveInstallment = (index) => {
    setInstallmentPlan(prev => prev.filter((_, i) => i !== index));
  };

  const handleInstallmentChange = (index, field, value) => {
    setInstallmentPlan(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleBatchAssignmentChange = (courseId, batchId) => {
    setBatchAssignments(prev =>
      prev.map(ba => ba.course_id === courseId ? { ...ba, batch_id: batchId } : ba)
    );
  };

  // Open modal based on active targetType
  const handleOpenSelectionModal = () => {
    if (targetType === 'package') {
      setIsPackageModalOpen(true);
    } else {
      setIsCourseModalOpen(true);
    }
  };

  const handleExecuteClick = () => {
    // Policy Pattern Validation Check
    const policyResult = MigrationPolicy.validate({
      targetId,
      parsedNewFee,
      batchAssignments
    });

    if (!policyResult.isValid) {
      setValidationError(policyResult.violationReason);
      return;
    }

    setValidationError('');
    setShowConfirmModal(true);
  };

  const handleConfirmExecute = () => {
    setShowConfirmModal(false);
    onExecute({
      enrollment_id: enrollment?.enrollment_id || enrollment?.id,
      target_type: targetType,
      target_id: targetId,
      rollover_payments: rolloverPayments,
      new_fee: parsedNewFee,
      batch_assignments: batchAssignments
        .filter(ba => ba.batch_id)
        .map(ba => ({ course_id: ba.course_id, batch_id: ba.batch_id })),
      installment_plan: installmentPlan
        .filter(ip => ip.due_date && Number(ip.due_amount) > 0)
        .map(ip => ({ due_date: ip.due_date, due_amount: Number(ip.due_amount) })),
      remarks: remarks.trim() || null
    });
  };

  return (
    <>
      <RightDrawer
        isOpen={isOpen}
        onClose={onClose}
        title="Migrate Enrollment"
        subtitle="Migrate student to another course or package contract."
        icon="published_with_changes"
        iconColor="text-primary"
        width="max-w-5xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button type="button" variant="outlined" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="contained"
              loading={isSubmitting}
              onClick={handleExecuteClick}
              startIcon="swap_horiz"
            >
              Execute Migration →
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Left Section (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Dynamic Target Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-main dark:text-white uppercase tracking-wider block">
                  1. Select Target Program
                </label>

                {/* Target Type Selector Segmented Control */}
                <SegmentedControl
                  options={[
                    { label: 'Package', value: 'package', icon: 'inventory_2' },
                    { label: 'Course', value: 'course', icon: 'school' }
                  ]}
                  value={targetType}
                  onChange={(val) => {
                    setTargetType(val);
                    setTargetId('');
                    setValidationError('');
                  }}
                  className="w-fit"
                />
              </div>

              {validationError && (
                <AlertCard variant="error" title="Validation Error" message={validationError} />
              )}

              {/* Dynamic Target Selection Card OR Empty Selection Trigger */}
              {selectedTargetEntity ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                        <span className="material-symbols-outlined text-2xl">
                          {targetType === 'package' ? 'inventory_2' : 'school'}
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                          Selected Target {targetType === 'package' ? 'Package' : 'Course'}
                        </div>
                        <h4 className="text-base font-bold text-text-main dark:text-white leading-snug">
                          {selectedTargetEntity.name || selectedTargetEntity.package_name || selectedTargetEntity.course_name}
                        </h4>
                        <span className="text-xs font-mono text-text-secondary">
                          ID: {targetId}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outlined"
                      startIcon="swap_horiz"
                      onClick={handleOpenSelectionModal}
                    >
                      Change {targetType === 'package' ? 'Package' : 'Course'}
                    </Button>
                  </div>

                  {/* Target Details Badge Bar */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-xs">
                    {selectedTargetEntity.target_class && (
                      <Badge variant="info">Class {selectedTargetEntity.target_class}</Badge>
                    )}
                    {selectedTargetEntity.board && (
                      <Badge variant="default">{selectedTargetEntity.board}</Badge>
                    )}
                    {batchAssignments.length > 0 && (
                      <Badge variant="primary">{batchAssignments.length} Courses Linked</Badge>
                    )}
                    <span className="ml-auto font-bold text-primary text-sm">
                      Standard Fee: ₹{parsedNewFee.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleOpenSelectionModal}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary bg-slate-50/50 dark:bg-slate-900/50 hover:bg-primary/5 transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">
                      {targetType === 'package' ? 'inventory_2' : 'school'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-main dark:text-white">
                      Click to Browse & Select Target {targetType === 'package' ? 'Package' : 'Course'}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Opens the interactive {targetType === 'package' ? 'Package' : 'Course'} Selection Directory with full details & filters
                    </p>
                  </div>
                </div>
              )}

              {/* Stateful Strategy Target AlertCard */}
              {targetAlert && <AlertCard {...targetAlert} />}
            </div>

            {/* Section 2: Payment & Fee */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-text-main dark:text-white uppercase tracking-wider block">
                2. Payment & Fee
              </label>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div>
                  <ToggleSwitch
                    label="Carry Forward Payments"
                    checked={rolloverPayments}
                    onChange={(checked) => setRolloverPayments(checked)}
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Transfer paid amount (₹{oldPaidAmount.toLocaleString()}) from old fee account as credit.
                  </p>
                </div>

                <div className="w-full sm:w-44">
                  <FormField label="New Total Fee *">
                    <TextInput
                      type="number"
                      leftIcon="currency_rupee"
                      value={newFee}
                      onChange={(e) => setNewFee(e.target.value)}
                    />
                  </FormField>
                </div>
              </div>

              {/* Financial Calculation Summary Bar */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 text-xs">
                <div>
                  <span className="text-text-secondary block">Paid Amount (Old)</span>
                  <span className="font-bold text-text-main dark:text-white">₹{oldPaidAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-text-secondary block">Credit to Apply</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{creditApplied.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-text-secondary block">New Balance Due</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{newBalanceDue.toLocaleString()}</span>
                </div>
              </div>

              {/* Stateful Strategy Payment Rollover AlertCard */}
              {paymentAlert && <AlertCard {...paymentAlert} />}
            </div>

            {/* Section 3: Batch Assignments */}
            {batchAssignments.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-main dark:text-white uppercase tracking-wider block">
                    3. Batch Assignments
                  </label>
                  <span className="text-[10px] text-text-secondary">Course-wise seating</span>
                </div>

                <div className="space-y-2">
                  {batchAssignments.map((assignment, idx) => {
                    const availableBatches = batchesByCourseMap.get(String(assignment.course_id).trim()) || [];
                    return (
                      <div
                        key={assignment.course_id || idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-indigo-500">menu_book</span>
                          <span className="font-bold text-text-main dark:text-white truncate">
                            {assignment.course_name}
                          </span>
                        </div>

                        <div className="w-full sm:w-60">
                          <SelectInput
                            options={availableBatches}
                            value={assignment.batch_id}
                            onChange={(e) => handleBatchAssignmentChange(assignment.course_id, getEventValue(e))}
                            placeholder="Select New Batch..."
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stateful Strategy Batch Seating AlertCard */}
                {seatingAlert && <AlertCard {...seatingAlert} />}
              </div>
            )}

            {/* Section 4: Installment Plan */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-main dark:text-white uppercase tracking-wider block">
                  4. Installment Plan (Optional)
                </label>
                <Button type="button" variant="text" startIcon="add" onClick={handleAddInstallment}>
                  Add Installment
                </Button>
              </div>

              {installmentPlan.length > 0 ? (
                <div className="space-y-2">
                  {installmentPlan.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-text-secondary w-5">#{idx + 1}</span>
                      <div className="flex-1">
                        <DateInput
                          value={item.due_date}
                          onChange={(val) => handleInstallmentChange(idx, 'due_date', val)}
                        />
                      </div>
                      <div className="flex-1">
                        <TextInput
                          type="number"
                          placeholder="Amount (₹)"
                          leftIcon="currency_rupee"
                          value={item.due_amount}
                          onChange={(e) => handleInstallmentChange(idx, 'due_amount', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveInstallment(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-secondary italic">No installments configured. Default single payment schedule will apply.</p>
              )}
            </div>

            {/* Section 5: Remarks */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <FormField label="5. Remarks (Optional)">
                <TextInput
                  multiline
                  rows={2}
                  maxLength={500}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Student upgraded as per academic discussion..."
                />
              </FormField>
            </div>
          </div>

          {/* Sticky Migration Summary Sidebar Right (1 col) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-4 sticky top-0">
              <h3 className="text-xs font-bold text-text-main dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">analytics</span>
                <span>Migration Summary</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-text-secondary text-[11px]">Old Enrollment</div>
                  <div className="font-bold text-text-main dark:text-white">{enrId}</div>
                  <div className="text-amber-600 dark:text-amber-400 font-semibold mt-0.5">Status: Withdrawn</div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-text-secondary text-[11px]">New Enrollment</div>
                  <div className="font-bold text-text-main dark:text-white">
                    {selectedTargetEntity?.name || selectedTargetEntity?.package_name || 'Target Contract'}
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Status: Active</div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-text-secondary text-[11px]">Payment Credit</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">₹{creditApplied.toLocaleString()}</div>
                  <div className="text-text-secondary text-[10px]">Rolled over from old account</div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-text-secondary text-[11px]">New Balance Due</div>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">₹{newBalanceDue.toLocaleString()}</div>
                </div>
              </div>

              {/* Stateful Summary Notice AlertCard */}
              {summaryNoticeAlert && <AlertCard {...summaryNoticeAlert} />}
            </div>
          </div>
        </div>
      </RightDrawer>

      {/* Double Confirmation Modal rendered via createPortal at document.body level */}
      {showConfirmModal && createPortal(
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmExecute}
          title="Confirm Enrollment Migration"
          message={`Are you sure you want to migrate student from ${oldProgramName} (${enrId}) to ${selectedTargetEntity?.name || 'new contract'}? Old contract will be marked Withdrawn and new contract will be provisioned.`}
          confirmText="Confirm & Migrate"
          cancelText="Cancel"
          type="warning"
        />,
        document.body
      )}

      {/* Package Catalog Selection Modal */}
      <PackageSelectionModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        availablePackages={packages}
        selectedPackages={selectedTargetEntity && targetType === 'package' ? [selectedTargetEntity] : []}
        singleSelect={true}
        onSelect={(selectedPkg) => {
          if (selectedPkg) {
            const selectedId = selectedPkg.package_id || selectedPkg.id;
            setTargetType('package');
            setTargetId(selectedId);
            setValidationError('');
          }
          setIsPackageModalOpen(false);
        }}
      />

      {/* Course Catalog Selection Modal */}
      <CourseSelectionModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        availableCourses={courses}
        selectedCourses={selectedTargetEntity && targetType === 'course' ? [selectedTargetEntity] : []}
        singleSelect={true}
        onSelect={(selectedCourse) => {
          if (selectedCourse) {
            const selectedId = selectedCourse.course_id || selectedCourse.id;
            setTargetType('course');
            setTargetId(selectedId);
            setValidationError('');
          }
          setIsCourseModalOpen(false);
        }}
      />
    </>
  );
}

MigrateEnrollmentDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  enrollment: PropTypes.object,
  courses: PropTypes.array,
  packages: PropTypes.array,
  batches: PropTypes.array,
  isSubmitting: PropTypes.bool,
  onExecute: PropTypes.func.isRequired
};
