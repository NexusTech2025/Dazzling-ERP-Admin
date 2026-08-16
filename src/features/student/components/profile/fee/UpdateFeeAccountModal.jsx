import React, { useState, useMemo } from 'react';
import Button from '../../../../../components/ui/v2/Button';
import TextInput from '../../../../../components/ui/v2/TextInput';
import Badge from '../../../../../components/ui/Badge';
import { useUpdateFeeAccountMutation } from '../../../../finance/hooks/useFinanceQueries';

/**
 * Light theme responsive modal for updating a Student Fee Account.
 * Implements real-time live impact calculation, cash floor protection assertion,
 * and O(1) RAM cache sync via EnrollmentRepo.
 *
 * @param {object} props - Component properties.
 * @param {boolean} props.isOpen - Whether modal is visible.
 * @param {function} props.onClose - Modal close handler callback.
 * @param {object} props.enrollment - Parent hydrated enrollment record.
 * @param {object} props.feeAccount - Target Student Fee Account entity.
 * @returns {JSX.Element|null} Light theme modal portal.
 */
export const UpdateFeeAccountModal = ({ isOpen, onClose, enrollment, feeAccount }) => {
  const updateFeeAccountMutation = useUpdateFeeAccountMutation();

  const studentFeeId = feeAccount?.student_fee_id || 'N/A';
  const enrollmentId = enrollment?.enrollment_id || enrollment?.id || 'N/A';
  const programName = enrollment?.item_name || enrollment?.package_name || enrollment?.course_name || 'Academic Program';

  // Base state prefilled from feeAccount
  const initialTotalFee = Number(feeAccount?.total_fee ?? feeAccount?.final_fee ?? 0);
  const initialDiscount = Number(feeAccount?.discount ?? 0);
  const collectedCash = Number(feeAccount?.amount_paid ?? 0);
  const installments = feeAccount?.installments || [];
  const unpaidInstallments = useMemo(
    () => installments.filter(i => (i.status || '').toLowerCase() !== 'paid'),
    [installments]
  );

  const [totalFeeInput, setTotalFeeInput] = useState(String(initialTotalFee));
  const [discountInput, setDiscountInput] = useState(String(initialDiscount));
  const [adjustmentType, setAdjustmentType] = useState(feeAccount?.adjustment_type || 'none');
  const [couponCode, setCouponCode] = useState(feeAccount?.coupon_code || '');
  const [remarks, setRemarks] = useState(feeAccount?.remarks || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Live Calculated Properties
  const parsedTotalFee = Math.max(0, parseFloat(totalFeeInput) || 0);
  const parsedDiscount = Math.max(0, parseFloat(discountInput) || 0);
  const newFinalFee = Math.max(0, parsedTotalFee - parsedDiscount);
  const newBalanceDue = Math.max(0, newFinalFee - collectedCash);
  const isCashFloorValid = newFinalFee >= collectedCash;

  const perInstallmentShare = useMemo(() => {
    if (unpaidInstallments.length === 0) return 0;
    return Math.round(newBalanceDue / unpaidInstallments.length);
  }, [newBalanceDue, unpaidInstallments.length]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isCashFloorValid) {
      setErrorMsg(`Collected cash floor violation: Proposed final fee (₹${newFinalFee.toLocaleString()}) cannot be lower than collected payments (₹${collectedCash.toLocaleString()}).`);
      return;
    }

    if (!remarks.trim()) {
      setErrorMsg('Administrative justification / remarks is required.');
      return;
    }

    try {
      const payload = {
        student_fee_id: studentFeeId,
        total_fee: parsedTotalFee,
        discount: parsedDiscount,
        adjustment_type: adjustmentType,
        coupon_code: couponCode.trim() || undefined,
        remarks: remarks.trim()
      };

      const result = await updateFeeAccountMutation.mutateAsync(payload);
      if (result.success) {
        onClose();
      } else {
        setErrorMsg(result.error?.message || result.message || 'Failed to update student fee account.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred during fee account update.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl xl:max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Update Student Fee Account
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Target Account: <span className="font-bold text-slate-700 dark:text-slate-300">{studentFeeId}</span>
              {' • '}
              <span className="font-semibold">{enrollmentId}</span> ({programName})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 sm:size-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
            {/* Error Alert Box */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-start gap-2.5">
                <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                <div className="space-y-0.5">
                  <span className="font-bold block">Validation Check Failed</span>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Row 1: Top 3 Metric Tiles (Compact KPI Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">description</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Base Fee</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">₹{initialTotalFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">sell</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Discount</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">₹{initialDiscount.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Collected Cash</span>
                  <span className="text-base font-extrabold text-purple-600 dark:text-purple-400">₹{collectedCash.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Row 2: Main Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Controls (~7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Gross Tuition Base Fee (total_fee) <span className="text-rose-500">*</span>
                  </label>
                  <TextInput
                    type="number"
                    value={totalFeeInput}
                    onChange={(e) => setTotalFeeInput(e.target.value)}
                    placeholder="0.00"
                    leftIcon="currency_rupee"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Baseline Discount Amount (discount)
                  </label>
                  <TextInput
                    type="number"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    placeholder="0.00"
                    leftIcon="currency_rupee"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                    Fee Account Category / Discount Type (adjustment_type)
                  </label>
                  <div className="flex items-center gap-3 flex-wrap text-xs font-medium text-slate-700 dark:text-slate-300">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'scholarship', label: 'Scholarship' },
                      { id: 'coupon', label: 'Coupon' },
                      { id: 'referral', label: 'Referral' },
                      { id: 'manual', label: 'Manual' }
                    ].map((opt) => (
                      <label key={opt.id} className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="adjustment_type"
                          value={opt.id}
                          checked={adjustmentType === opt.id}
                          onChange={(e) => setAdjustmentType(e.target.value)}
                          className="size-4 text-primary focus:ring-primary border-slate-300"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Coupon Code (Optional)
                  </label>
                  <TextInput
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. SUMMER2026"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Administrative Justification / Remarks <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter reason for updating fee structure..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                    required
                  />
                </div>
              </div>

              {/* Right Column: Live Impact Calculation & Invariant Safeguard Panel (~5 cols) */}
              <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3.5">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  <span className="material-symbols-outlined text-base">insights</span>
                  <span>Live Impact Calculation & Invariant Safeguard</span>
                </div>

                {/* Card 1: New Final Fee */}
                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                      ₹
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">New Final Fee</span>
                      <span className="text-[10px] text-slate-500">(₹{parsedTotalFee.toLocaleString()} - ₹{parsedDiscount.toLocaleString()})</span>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{newFinalFee.toLocaleString()}
                  </span>
                </div>

                {/* Card 2: New Balance Due */}
                <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-white dark:bg-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                      <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">New Balance Due</span>
                      <span className="text-[10px] text-slate-500">(New Final Fee - ₹{collectedCash.toLocaleString()} Paid)</span>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                    ₹{newBalanceDue.toLocaleString()}
                  </span>
                </div>

                {/* Card 3: Cash Floor Protection Status Badge */}
                <div className={`p-3 rounded-xl border bg-white dark:bg-slate-800 space-y-1.5 ${
                  isCashFloorValid ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-rose-200 dark:border-rose-900/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-base ${isCashFloorValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isCashFloorValid ? 'verified_user' : 'gpp_bad'}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Cash Floor Protection</span>
                    </div>
                    <Badge variant={isCashFloorValid ? 'success' : 'danger'} className="text-[9px] uppercase font-black px-2 py-0.5">
                      {isCashFloorValid ? 'PASSED' : 'VIOLATION'}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    (New Final Fee ≥ Collected Cash)
                  </p>
                  <div className="text-[10px] font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className={isCashFloorValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      New Final Fee ₹{newFinalFee.toLocaleString()} {isCashFloorValid ? '≥' : '<'} Collected Cash ₹{collectedCash.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card 4: Installment Rebalance Info Note */}
                <div className="p-3 rounded-xl border border-blue-200/70 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-blue-600 shrink-0 mt-0.5">info</span>
                  <p className="leading-snug text-[11px]">
                    <span className="font-bold">Note:</span> {unpaidInstallments.length} remaining unpaid installments will be rebalanced evenly to <span className="font-bold">₹{perInstallmentShare.toLocaleString()}</span> each.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Tray */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outlined"
              onClick={onClose}
              disabled={updateFeeAccountMutation.isPending}
              className="rounded-xl text-xs font-bold px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!isCashFloorValid || updateFeeAccountMutation.isPending}
              loading={updateFeeAccountMutation.isPending}
              startIcon="save"
              className="rounded-xl text-xs font-bold px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            >
              Save Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateFeeAccountModal;
